using Api.DTOs;
using Api.DTOs.Requests;

namespace Api.Services;

public interface IAuthService
{
    Task<UserDto> RegisterUser(RegisterRequestDto dto);
    Task<LoginUserDto> LoginUser(LoginRequestDto dto);
    Task<LoginUserDto> RefreshTokens(RefreshTokenRequestDto dto);
}