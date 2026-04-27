namespace DataAccess;

public class Alert
{
    public Guid Id { get; set; }
    public string Severity { get; set; } = null!;  // INFO, WARNING, ERROR, CRITICAL
    public string Message { get; set; } = null!;
    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
