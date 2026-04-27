using DataAccess;

namespace Api.DTOs;

public class EntryCodeDto
{
    public EntryCodeDto() { }

    public EntryCodeDto(EntryCode code)
    {
        Id = code.Id;
        Code = code.Code;
        CodeOwner = code.CodeOwner is not null ? new UserDto(code.CodeOwner) : null;
        Type = new EntryCodeTypeDto(code.Type);
        Expiry = code.Expiry;
        UseCount = code.UseCount;
    }

    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public UserDto? CodeOwner { get; set; }
    public EntryCodeTypeDto Type { get; set; } = null!;
    public DateTime Expiry { get; set; }
    public int UseCount { get; set; }
}
