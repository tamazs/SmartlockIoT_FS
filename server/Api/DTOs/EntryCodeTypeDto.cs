using DataAccess;

namespace Api.DTOs;

public class EntryCodeTypeDto
{
    public EntryCodeTypeDto() { }

    public EntryCodeTypeDto(EntryCodeType type)
    {
        Id = type.Id;
        Name = type.Name;
        Description = type.Description;
        MaxUses = type.MaxUses;
    }

    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? MaxUses { get; set; }
}
