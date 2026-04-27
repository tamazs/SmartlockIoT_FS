using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Requests;

public class CreateEntryCodeRequest
{
    [Required]
    public Guid TypeId { get; set; }
    public Guid? CodeOwnerId { get; set; }
    [Required]
    public DateTime Expiry { get; set; }
}
