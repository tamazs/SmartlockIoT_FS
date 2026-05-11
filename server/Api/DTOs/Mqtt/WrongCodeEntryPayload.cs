using System.Text.Json.Serialization;

namespace Api.DTOs.Mqtt;

public class WrongCodeEntryPayload
{
    [JsonPropertyName("enteredCode")]
    public string EnteredCode { get; set; } = null!;

    [JsonPropertyName("attempt")]
    public int Attempt { get; set; }

    [JsonPropertyName("epoch")]
    public long Epoch { get; set; }
}
