namespace DataAccess;

public class Log
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = null!;
    public string Event { get; set; } = null!;
    public DateTime EventTime { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public Guid? EntryCodeId { get; set; }
    public EntryCode? EntryCode { get; set; }
}
