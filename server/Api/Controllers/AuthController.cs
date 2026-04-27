using Api.DTOs;
using Api.DTOs.Requests;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost(nameof(RegisterUser))]
    public async Task<UserDto> RegisterUser([FromBody] RegisterRequestDto dto)
    {
        return await _authService.RegisterUser(dto);
    }

    [HttpPost(nameof(LoginUser))]
    public async Task<LoginUserDto> LoginUser([FromBody] LoginRequestDto dto)
    {
        return await _authService.LoginUser(dto);
    }
    
    [HttpPost(nameof(RefreshTokens))]
    public async Task<LoginUserDto> RefreshTokens([FromBody] RefreshTokenRequestDto dto)
    {
        return await _authService.RefreshTokens(dto);
    }
}