using Api.DTOs;
using Api.DTOs.Requests;

namespace Api.Services;

public interface ICodeTypeService
{
    Task<List<EntryCodeTypeDto>> GetAll();
    Task<EntryCodeTypeDto> Create(CreateEntryCodeTypeRequest request);
    Task<EntryCodeTypeDto> Update(Guid id, UpdateEntryCodeTypeRequest request);
    Task Delete(Guid id);
}
