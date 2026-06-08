using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using MQTTnet;
using MQTTnet.Client;

namespace Api;

public class MqttPublisherService(
    IMqttClient mqtt,
    IServiceScopeFactory scopeFactory,
    AppOptions options)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };

    public async Task PublishAvailableCodes()
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var codes = await db.EntryCodes
            .Include(c => c.Type)
            .Include(c => c.CodeOwner)
            .ToListAsync();

        var payload = new
        {
            codes = codes.Select(c => new DeviceCodeEntry
            {
                Id = c.Id.ToString(),
                Code = c.Code,
                CodeOwner = c.CodeOwner?.Username,
                Type = c.Type.Name.ToLowerInvariant(),
                Expiry = new DateTimeOffset(c.Expiry, TimeSpan.Zero).ToUnixTimeSeconds(),
                UseCount = c.UseCount,
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

    private class DeviceCodeEntry
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("code")]
        public string Code { get; set; } = null!;

        [JsonPropertyName("codeOwner")]
        public string? CodeOwner { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = null!;

        [JsonPropertyName("expiry")]
        public long Expiry { get; set; }

        [JsonPropertyName("usecount")]
        public int UseCount { get; set; }
    }
}
