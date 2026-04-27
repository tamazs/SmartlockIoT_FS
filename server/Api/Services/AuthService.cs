using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Api.DTOs;
using Api.DTOs.Requests;
using DataAccess;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Api.Services;

public class AuthService(AppDbContext dbContext, IConfiguration configuration) : IAuthService
{
    public async Task<UserDto> RegisterUser(RegisterRequestDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);
        
        var existingUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null) throw new InvalidOperationException("Email already exists");

        var user = new User
        {
            Username = dto.UserName,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);
        
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();
        return new UserDto(user);
    }

    public async Task<LoginUserDto> LoginUser(LoginRequestDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);
        
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == dto.UserName);
        if (user == null) throw new UnauthorizedAccessException("Invalid username or password");
        
        var verification = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verification ==  PasswordVerificationResult.Failed) throw new UnauthorizedAccessException("Invalid username or password");
        
        var token = CreateToken(user);

        return new LoginUserDto
        {
            Token = token,
            RefreshToken = await GenerateAndSaveRefreshToken(user),
            User = new UserDto(user)
        };
    }

    public async Task<LoginUserDto> RefreshTokens(RefreshTokenRequestDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);
        
        var user = await dbContext.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == dto.RefreshToken);

        if (user == null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid refresh token");
        
        var newAccessToken = CreateToken(user);
        var newRefreshToken = await GenerateAndSaveRefreshToken(user);

        return new LoginUserDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            User = new UserDto(user)
        };
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private async Task<string> GenerateAndSaveRefreshToken(User user)
    {
        var refreshToken = GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
        await dbContext.SaveChangesAsync();
        return refreshToken;
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppOptions:Token")!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: configuration.GetValue<string>("AppOptions:Issuer"),
            audience: configuration.GetValue<string>("AppOptions:Audience"),
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }
}