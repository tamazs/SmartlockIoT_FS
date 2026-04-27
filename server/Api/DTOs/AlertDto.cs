using DataAccess;

namespace Api.DTOs;

public class AlertDto
{
    public AlertDto() { }

    public AlertDto(Alert alert)
    {
        Id = alert.Id;
        Severity = alert.Severity;
        Message = alert.Message;
        Source = alert.Source;
        CreatedAt = alert.CreatedAt;
        IsResolved = alert.IsResolved;
        ResolvedAt = alert.ResolvedAt;
    }

    public Guid Id { get; set; }
    public string Severity { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
