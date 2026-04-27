using DataAccess;

namespace Api.DTOs;

public class LogDto
{
    public LogDto() { }

    public LogDto(Log log)
    {
        Id = log.Id;
        EventType = log.EventType;
        Event = log.Event;
        EventTime = log.EventTime;
        UserId = log.UserId;
        Username = log.User?.Username;
        EntryCodeId = log.EntryCodeId;
        EntryCode = log.EntryCode?.Code;
    }

    public Guid Id { get; set; }
    public string EventType { get; set; } = null!;
    public string Event { get; set; } = null!;
    public DateTime EventTime { get; set; }
    public Guid? UserId { get; set; }
    public string? Username { get; set; }
    public Guid? EntryCodeId { get; set; }
    public string? EntryCode { get; set; }
}
