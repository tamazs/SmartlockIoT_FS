using Api.DTOs;
using Api.DTOs.Requests;
using DataAccess;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Authorize]
public class ActionController(AppDbContext dbContext, MqttPublisherService mqttPublisher) : BaseController
{
    private static readonly Random Rng = new();

    [HttpPost("codes")]
    public async Task<ActionResult<EntryCodeDto>> AddCode([FromBody] CreateEntryCodeRequest request)
    {
        var typeExists = await dbContext.EntryCodeTypes.AnyAsync(t => t.Id == request.TypeId);
        if (!typeExists)
            return NotFound("Entry code type not found.");

        string code;
        do { code = Rng.Next(0, 100_000_000).ToString("D8"); }
        while (await dbContext.EntryCodes.AnyAsync(c => c.Code == code));

        var entry = new EntryCode
        {
            Code = code,
            TypeId = request.TypeId,
            CodeOwnerId = request.CodeOwnerId,
            Expiry = request.Expiry,
        };

        await dbContext.EntryCodes.AddAsync(entry);
        await dbContext.SaveChangesAsync();

        await dbContext.Entry(entry).Reference(e => e.Type).LoadAsync();
        if (entry.CodeOwnerId is not null)
            await dbContext.Entry(entry).Reference(e => e.CodeOwner).LoadAsync();

        var userId = CurrentUserId is not null ? Guid.Parse(CurrentUserId) : (Guid?)null;
        await dbContext.Logs.AddAsync(new Log
        {
            EventType = "CODE",
            Event = "CREATED",
            EventTime = DateTime.UtcNow,
            UserId = userId,
            EntryCodeId = entry.Id,
        });
        await dbContext.SaveChangesAsync();

        await mqttPublisher.PublishAvailableCodes();

        return Ok(new EntryCodeDto(entry));
    }

    [HttpDelete("codes/{id:guid}")]
    public async Task<IActionResult> DeleteCode(Guid id)
    {
        var entry = await dbContext.EntryCodes.FindAsync(id);
        if (entry is null)
            return NotFound();

        var userId = CurrentUserId is not null ? Guid.Parse(CurrentUserId) : (Guid?)null;

        dbContext.EntryCodes.Remove(entry);
        await dbContext.Logs.AddAsync(new Log
        {
            EventType = "CODE",
            Event = "DELETED",
            EventTime = DateTime.UtcNow,
            UserId = userId,
        });
        await dbContext.SaveChangesAsync();

        await mqttPublisher.PublishAvailableCodes();

        return NoContent();
    }

    [HttpGet("codes")]
    public async Task<List<EntryCodeDto>> GetCodes()
    {
        var codes = await dbContext.EntryCodes
            .Include(c => c.Type)
            .Include(c => c.CodeOwner)
            .OrderByDescending(c => c.Expiry)
            .ToListAsync();

        return codes.Select(c => new EntryCodeDto(c)).ToList();
    }

}
