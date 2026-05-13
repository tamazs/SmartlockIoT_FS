using Api.DTOs;
using Api.DTOs.Requests;
using Api.Services;
using DataAccess;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
public class AuthController(IAuthService authService, AppDbContext dbContext) : BaseController
{
    [HttpPost(nameof(RegisterUser))]
    public async Task<UserDto> RegisterUser([FromBody] RegisterRequestDto dto)
    {
        return await authService.RegisterUser(dto);
    }

    [HttpPost(nameof(LoginUser))]
    public async Task<LoginUserDto> LoginUser([FromBody] LoginRequestDto dto)
    {
        return await authService.LoginUser(dto);
    }

    [HttpPost(nameof(RefreshTokens))]
    public async Task<LoginUserDto> RefreshTokens([FromBody] RefreshTokenRequestDto dto)
    {
        return await authService.RefreshTokens(dto);
    }

    [HttpGet("users")]
    [Authorize]
    public async Task<List<UserDto>> GetUsers()
    {
        return await dbContext.Users.Select(u => new UserDto(u)).ToListAsync();
    }
}
