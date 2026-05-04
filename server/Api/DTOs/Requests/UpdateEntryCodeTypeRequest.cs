using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Requests;

public class UpdateEntryCodeTypeRequest
{
    [Required, MinLength(1)]
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? MaxUses { get; set; }
}
