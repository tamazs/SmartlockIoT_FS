using System.ComponentModel.DataAnnotations;

namespace Api;

public class AppOptions
{
    [Required] [MinLength(1)]public string DbConnectionString { get; set; }
    [Required] [MinLength(1)]public string MqttBroker { get; set; }
    [Required] public int MqttPort { get; set; }
    [Required] [MinLength(1)] public string RenderConnectionString { get; set; }
    [Required] [MinLength(1)] public string Token { get; set; }
    [Required] [MinLength(1)] public string Issuer { get; set; }
    [Required] [MinLength(1)] public string Audience { get; set; }
}