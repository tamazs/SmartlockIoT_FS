using System.ComponentModel.DataAnnotations;
using Api.DTOs;
using Api.DTOs.Requests;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class CodeTypeService(AppDbContext dbContext) : ICodeTypeService
{
    public async Task<List<EntryCodeTypeDto>> GetAll()
    {
        return await dbContext.EntryCodeTypes
            .Select(t => new EntryCodeTypeDto(t))
            .ToListAsync();
    }

    public async Task<EntryCodeTypeDto> Create(CreateEntryCodeTypeRequest request)
    {
        Validator.ValidateObject(request, new ValidationContext(request), true);

        var type = new EntryCodeType
        {
            Name = request.Name,
            Description = request.Description,
            MaxUses = request.MaxUses,
        };

        await dbContext.EntryCodeTypes.AddAsync(type);
        await dbContext.SaveChangesAsync();
        return new EntryCodeTypeDto(type);
    }

    public async Task<EntryCodeTypeDto> Update(Guid id, UpdateEntryCodeTypeRequest request)
    {
        Validator.ValidateObject(request, new ValidationContext(request), true);

        var type = await dbContext.EntryCodeTypes.FindAsync(id)
            ?? throw new KeyNotFoundException("Entry code type not found.");

        type.Name = request.Name;
        type.Description = request.Description;
        type.MaxUses = request.MaxUses;

        await dbContext.SaveChangesAsync();
        return new EntryCodeTypeDto(type);
    }

    public async Task Delete(Guid id)
    {
        var type = await dbContext.EntryCodeTypes
            .Include(t => t.EntryCodes)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new KeyNotFoundException("Entry code type not found.");

        if (type.EntryCodes.Count > 0)
            throw new InvalidOperationException("Cannot delete a code type that has associated codes.");

        dbContext.EntryCodeTypes.Remove(type);
        await dbContext.SaveChangesAsync();
    }
}