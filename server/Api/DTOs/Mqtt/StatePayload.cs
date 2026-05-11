using System.Text.Json.Serialization;

namespace Api.DTOs.Mqtt;

public class StatePayload
{
    [JsonPropertyName("state")]
    public string State { get; set; } = null!;

    [JsonPropertyName("epoch")]
    public long Epoch { get; set; }

    [JsonPropertyName("who")]
    public string? Who { get; set; }

    [JsonPropertyName("source")]
    public string? Source { get; set; }
}
