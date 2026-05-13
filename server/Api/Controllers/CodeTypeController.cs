using Api.DTOs;
using Api.DTOs.Requests;
using Api.Services;
using DataAccess;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Authorize]
public class CodeTypeController(ICodeTypeService codeTypeService, AppDbContext dbContext) : BaseController
{
    [HttpGet(nameof(GetCodeTypes))]
    public async Task<List<EntryCodeTypeDto>> GetCodeTypes()
    {
        return await codeTypeService.GetAll();
    }

    [HttpPost(nameof(CreateCodeType))]
    public async Task<EntryCodeTypeDto> CreateCodeType([FromBody] CreateEntryCodeTypeRequest request)
    {
        var result = await codeTypeService.Create(request);

        var userId = CurrentUserId is not null ? Guid.Parse(CurrentUserId) : (Guid?)null;
        await dbContext.Logs.AddAsync(new Log
        {
            EventType = "SYSTEM",
            Event = "CODE TYPE CREATED",
            EventTime = DateTime.UtcNow,
            UserId = userId,
        });
        await dbContext.SaveChangesAsync();

        return result;
    }

    [HttpPut("{id:guid}")]
    public async Task<EntryCodeTypeDto> UpdateCodeType(Guid id, [FromBody] UpdateEntryCodeTypeRequest request)
    {
        var result = await codeTypeService.Update(id, request);

        var userId = CurrentUserId is not null ? Guid.Parse(CurrentUserId) : (Guid?)null;
        await dbContext.Logs.AddAsync(new Log
        {
            EventType = "SYSTEM",
            Event = "CODE TYPE UPDATED",
            EventTime = DateTime.UtcNow,
            UserId = userId,
        });
        await dbContext.SaveChangesAsync();

        return result;
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCodeType(Guid id)
    {
        await codeTypeService.Delete(id);

        var userId = CurrentUserId is not null ? Guid.Parse(CurrentUserId) : (Guid?)null;
        await dbContext.Logs.AddAsync(new Log
        {
            EventType = "SYSTEM",
            Event = "CODE TYPE DELETED",
            EventTime = DateTime.UtcNow,
            UserId = userId,
        });
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
