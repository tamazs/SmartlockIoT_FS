using System.Text.Json;
using Api.DTOs;
using Api.DTOs.Requests;
using DataAccess;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mqtt.Controllers;

namespace Api.Controllers;

[ApiController]
[Authorize]
public class ActionController(IMqttClientService mqtt, AppDbContext dbContext) : BaseController
{
    private static readonly Random Rng = new();
    private const string MqttTopic = "smartlock/codes";

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

        var payload = JsonSerializer.Serialize(new { @event = "add", code = entry.Code, expiry = entry.Expiry, typeId = entry.TypeId });
        await mqtt.PublishAsync(MqttTopic, payload);

        return Ok(new EntryCodeDto(entry));
    }

    [HttpDelete("codes/{id:guid}")]
    public async Task<IActionResult> DeleteCode(Guid id)
    {
        var entry = await dbContext.EntryCodes.FindAsync(id);
        if (entry is null)
            return NotFound();

        dbContext.EntryCodes.Remove(entry);
        await dbContext.SaveChangesAsync();

        var payload = JsonSerializer.Serialize(new { @event = "revoke", code = entry.Code });
        await mqtt.PublishAsync(MqttTopic, payload);

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
