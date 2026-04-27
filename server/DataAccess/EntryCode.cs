namespace DataAccess;

public class EntryCode
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public Guid? CodeOwnerId { get; set; }
    public User? CodeOwner { get; set; }
    public Guid TypeId { get; set; }
    public EntryCodeType Type { get; set; } = null!;
    public DateTime Expiry { get; set; }
    public int UseCount { get; set; }

    public ICollection<Log> Logs { get; set; } = [];
}
