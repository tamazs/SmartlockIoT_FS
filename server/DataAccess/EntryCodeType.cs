namespace DataAccess;

public class EntryCodeType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? MaxUses { get; set; }

    public ICollection<EntryCode> EntryCodes { get; set; } = [];
}
