using Api.DTOs;
using Api.DTOs.Requests;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Authorize]
public class CodeTypeController(ICodeTypeService codeTypeService) : BaseController
{
    [HttpGet(nameof(GetCodeTypes))]
    public async Task<List<EntryCodeTypeDto>> GetCodeTypes()
    {
        return await codeTypeService.GetAll();
    }

    [HttpPost(nameof(CreateCodeType))]
    public async Task<EntryCodeTypeDto> CreateCodeType([FromBody] CreateEntryCodeTypeRequest request)
    {
        return await codeTypeService.Create(request);
    }

    [HttpPut("{id:guid}")]
    public async Task<EntryCodeTypeDto> UpdateCodeType(Guid id, [FromBody] UpdateEntryCodeTypeRequest request)
    {
        return await codeTypeService.Update(id, request);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCodeType(Guid id)
    {
        await codeTypeService.Delete(id);
        return NoContent();
    }
}
