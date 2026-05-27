using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Api.DTOs.Mqtt;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using MQTTnet;
using MQTTnet.Client;

namespace Api;

public class MqttListenerService(
    IMqttClient mqtt,
    IServiceScopeFactory scopeFactory,
    AppOptions options,
    ILogger<MqttListenerService> logger) : IHostedService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            var deviceId = options.MqttDeviceId;
            logger.LogInformation("MQTT connecting to {Broker}:{Port} as {Username}",
                options.MqttBroker, options.MqttPort, options.MqttUsername);

            mqtt.ApplicationMessageReceivedAsync += OnMessageReceived;

            var mqttOptions = new MqttClientOptionsBuilder()
                .WithTcpServer(options.MqttBroker, options.MqttPort)
                .WithCredentials(options.MqttUsername, options.MqttPassword)
                .WithCleanSession()
                .Build();

            var result = await mqtt.ConnectAsync(mqttOptions, cancellationToken);
            logger.LogInformation("MQTT connected. ResultCode={ResultCode}", result.ResultCode);

            await mqtt.SubscribeAsync($"smartlock/{deviceId}/state", cancellationToken: cancellationToken);
            await mqtt.SubscribeAsync($"smartlock/{deviceId}/wrong-code-entry", cancellationToken: cancellationToken);
            await mqtt.SubscribeAsync($"smartlock/{deviceId}/errors", cancellationToken: cancellationToken);
            logger.LogInformation("MQTT subscriptions active for device {DeviceId}", deviceId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "MQTT startup failed");
            throw;
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (mqtt.IsConnected)
            await mqtt.DisconnectAsync(cancellationToken: cancellationToken);
    }

    private async Task OnMessageReceived(MqttApplicationMessageReceivedEventArgs e)
    {
        var topic = e.ApplicationMessage.Topic;
        var payload = Encoding.UTF8.GetString(e.ApplicationMessage.PayloadSegment);
        logger.LogInformation("MQTT message on {Topic}: {Payload}", topic, payload);

        var deviceId = options.MqttDeviceId;
        if (topic == $"smartlock/{deviceId}/state")
            await HandleState(payload);
        else if (topic == $"smartlock/{deviceId}/wrong-code-entry")
            await HandleWrongCodeEntry(payload);
        else if (topic == $"smartlock/{deviceId}/errors")
            await HandleError(payload);
    }

    private async Task HandleState(string payload)
    {
        try
        {
            var data = JsonSerializer.Deserialize<StatePayload>(payload)!;
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var user = data.Who is not null
                ? await db.Users.FirstOrDefaultAsync(u => u.Username == data.Who)
                : null;

            await db.Logs.AddAsync(new Log
            {
                EventType = "DOOR",
                Event = data.State.ToUpperInvariant(),
                EventTime = EpochToDateTime(data.Epoch),
                UserId = user?.Id,
            });
            await db.SaveChangesAsync();

            // Track code usage when the device reports which code was used
            if (data.Source is not null)
            {
                var usedCode = Guid.TryParse(data.Source, out var codeId)
                    ? await db.EntryCodes.Include(c => c.Type).FirstOrDefaultAsync(c => c.Id == codeId)
                    : await db.EntryCodes.Include(c => c.Type).FirstOrDefaultAsync(c => c.Code == data.Source);

                if (usedCode is not null)
                {
                    usedCode.UseCount++;
                    await db.SaveChangesAsync();

                    if (usedCode.Type.MaxUses is not null && usedCode.UseCount >= usedCode.Type.MaxUses)
                    {
                        await db.Logs.AddAsync(new Log
                        {
                            EventType = "CODE",
                            Event = "MAX USES REACHED",
                            EventTime = DateTime.UtcNow,
                            UserId = user?.Id,
                        });
                        db.EntryCodes.Remove(usedCode);
                        await db.SaveChangesAsync();

                        await PublishAvailableCodes(db);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error handling state message: {Payload}", payload);
        }
    }

    private async Task HandleWrongCodeEntry(string payload)
    {
        try
        {
            var data = JsonSerializer.Deserialize<WrongCodeEntryPayload>(payload)!;
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await db.Logs.AddAsync(new Log
            {
                EventType = "ACCESS",
                Event = "DENIED",
                EventTime = EpochToDateTime(data.Epoch),
            });
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error handling wrong-code-entry message: {Payload}", payload);
        }
    }

    private async Task HandleError(string payload)
    {
        try
        {
            var data = JsonSerializer.Deserialize<ErrorPayload>(payload)!;
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var message = data.Description is not null
                ? $"{data.Title}: {data.Description}"
                : data.Title;

            await db.Alerts.AddAsync(new Alert
            {
                Severity = "ERROR",
                Message = message,
                Source = data.Who ?? data.CodeId,
                CreatedAt = EpochToDateTime(data.Epoch),
            });
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error handling error message: {Payload}", payload);
        }
    }

    private async Task PublishAvailableCodes(AppDbContext db)
    {
        var codes = await db.EntryCodes
            .Include(c => c.Type)
            .Include(c => c.CodeOwner)
            .ToListAsync();

        var payload = new
        {
            codes = codes.Select(c => new
            {
                id = c.Id.ToString(),
                code = c.Code,
                codeOwner = c.CodeOwner?.Username,
                type = c.Type.Name.ToLowerInvariant(),
                expiry = new DateTimeOffset(c.Expiry, TimeSpan.Zero).ToUnixTimeSeconds(),
                usecount = c.UseCount,
            })
        };

        var topic = $"smartlock/{options.MqttDeviceId}/control/availableCodes";
        var message = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload, JsonOptions)))
            .WithRetainFlag(true)
            .Build();
        await mqtt.PublishAsync(message);
    }

    private static DateTime EpochToDateTime(long epoch) =>
        epoch > 0
            ? DateTimeOffset.FromUnixTimeSeconds(epoch).UtcDateTime
            : DateTime.UtcNow;
}
