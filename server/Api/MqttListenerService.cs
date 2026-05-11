using System.Text.Json;
using Api.DTOs.Mqtt;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Mqtt.Controllers;

namespace Api;

public class MqttListenerService(
    IMqttClientService mqtt,
    IServiceScopeFactory scopeFactory,
    AppOptions options,
    ILogger<MqttListenerService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var deviceId = options.MqttUsername;

        // Register handlers BEFORE subscribing so no message can arrive
        // while the dictionary is still being populated.
        mqtt.RegisterHandler($"smartlock/{deviceId}/state", HandleState);
        mqtt.RegisterHandler($"smartlock/{deviceId}/wrong-code-entry", HandleWrongCodeEntry);
        mqtt.RegisterHandler($"smartlock/{deviceId}/errors", HandleError);

        await mqtt.ConnectAsync(options.MqttBroker, options.MqttPort, options.MqttUsername, options.MqttPassword);

        await mqtt.SubscribeAsync($"smartlock/{deviceId}/state");
        await mqtt.SubscribeAsync($"smartlock/{deviceId}/wrong-code-entry");
        await mqtt.SubscribeAsync($"smartlock/{deviceId}/errors");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task HandleState(string topic, string payload)
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
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error handling state message: {Payload}", payload);
        }
    }

    private async Task HandleWrongCodeEntry(string topic, string payload)
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

    private async Task HandleError(string topic, string payload)
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

    private static DateTime EpochToDateTime(long epoch) =>
        epoch > 0
            ? DateTimeOffset.FromUnixTimeSeconds(epoch).UtcDateTime
            : DateTime.UtcNow;
}
