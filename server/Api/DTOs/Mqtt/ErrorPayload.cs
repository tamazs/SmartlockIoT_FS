using System.Text.Json.Serialization;

namespace Api.DTOs.Mqtt;

public class ErrorPayload
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("who")]
    public string? Who { get; set; }

    [JsonPropertyName("codeId")]
    public string? CodeId { get; set; }

    [JsonPropertyName("epoch")]
    public long Epoch { get; set; }
}
