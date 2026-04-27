using System.IdentityModel.Tokens.Jwt;
using Api.DTOs.Requests;
using Api.Services;
using Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Tests;

public class AuthServiceTests(DatabaseFixture fixture) : DatabaseTest(fixture)
{
    private AuthService CreateService() => new AuthService(DbContext, Configuration);

    // --- Register ---

    [Fact]
    public async Task RegisterUser_ValidDto_CreatesUser()
    {
        var result = await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "testuser",
            Email = "test@example.com",
            Password = "Password123!"
        });

        Assert.NotNull(result);
        Assert.Equal("testuser", result.UserName);
        Assert.Equal("test@example.com", result.Email);
    }

    [Fact]
    public async Task RegisterUser_DuplicateEmail_ThrowsInvalidOperationException()
    {
        var dto = new RegisterRequestDto
        {
            UserName = "testuser",
            Email = "duplicate@example.com",
            Password = "Password123!"
        };

        await CreateService().RegisterUser(dto);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateService().RegisterUser(dto));
    }

    [Fact]
    public async Task RegisterUser_SavesHashedPassword()
    {
        var dto = new RegisterRequestDto
        {
            UserName = "hashtest",
            Email = "hash@example.com",
            Password = "Password123!"
        };

        await CreateService().RegisterUser(dto);

        var user = await DbContext.Users.FirstAsync(u => u.Email == dto.Email);
        Assert.NotEqual(dto.Password, user.PasswordHash);
        Assert.NotEmpty(user.PasswordHash);
    }

    [Fact]
    public async Task RegisterUser_AssignsGuidAsUserId()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "guidtest",
            Email = "guid@example.com",
            Password = "Password123!"
        });

        var user = await DbContext.Users.FirstAsync(u => u.Email == "guid@example.com");
        Assert.True(Guid.TryParse(user.UserId, out _));
    }

    // --- Login ---

    [Fact]
    public async Task LoginUser_ValidCredentials_ReturnsTokenAndRefreshToken()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "loginuser",
            Email = "login@example.com",
            Password = "Password123!"
        });

        var result = await CreateService().LoginUser(new LoginRequestDto
        {
            UserName = "loginuser",
            Password = "Password123!"
        });

        Assert.NotNull(result.Token);
        Assert.NotNull(result.RefreshToken);
        Assert.NotNull(result.User);
    }

    [Fact]
    public async Task LoginUser_WrongPassword_ThrowsUnauthorizedAccessException()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "wrongpass",
            Email = "wrongpass@example.com",
            Password = "Password123!"
        });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            CreateService().LoginUser(new LoginRequestDto
            {
                UserName = "wrongpass",
                Password = "WrongPassword!"
            }));
    }

    [Fact]
    public async Task LoginUser_NonExistentUser_ThrowsUnauthorizedAccessException()
    {
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            CreateService().LoginUser(new LoginRequestDto
            {
                UserName = "nobody",
                Password = "Password123!"
            }));
    }

    [Fact]
    public async Task LoginUser_TokenContainsCorrectClaims()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "claimuser",
            Email = "claims@example.com",
            Password = "Password123!"
        });

        var result = await CreateService().LoginUser(new LoginRequestDto
        {
            UserName = "claimuser",
            Password = "Password123!"
        });

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(result.Token);
        Assert.Contains(jwt.Claims, c => c.Value == "claims@example.com");
    }

    [Fact]
    public async Task LoginUser_SavesRefreshTokenToDatabase()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "refreshsave",
            Email = "refreshsave@example.com",
            Password = "Password123!"
        });

        var result = await CreateService().LoginUser(new LoginRequestDto
        {
            UserName = "refreshsave",
            Password = "Password123!"
        });

        var user = await DbContext.Users.FirstAsync(u => u.Username == "refreshsave");
        Assert.Equal(result.RefreshToken, user.RefreshToken);
        Assert.True(user.RefreshTokenExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task LoginUser_TokenExpiresInThirtyMinutes()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "expiry",
            Email = "expiry@example.com",
            Password = "Password123!"
        });

        var result = await CreateService().LoginUser(new LoginRequestDto
        {
            UserName = "expiry",
            Password = "Password123!"
        });

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(result.Token);
        Assert.True(jwt.ValidTo <= DateTime.UtcNow.AddMinutes(31));
        Assert.True(jwt.ValidTo >= DateTime.UtcNow.AddMinutes(29));
    }

    // --- Refresh ---

    [Fact]
    public async Task RefreshTokens_ValidToken_ReturnsNewTokens()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "refreshuser",
            Email = "refresh@example.com",
            Password = "Password123!"
        });

        var login = await CreateService().LoginUser(new LoginRequestDto
        {
            UserName = "refreshuser",
            Password = "Password123!"
        });

        var result = await CreateService().RefreshTokens(new RefreshTokenRequestDto
        {
            RefreshToken = login.RefreshToken
        });

        Assert.NotNull(result.Token);
        Assert.NotNull(result.RefreshToken);
        Assert.NotEqual(login.RefreshToken, result.RefreshToken);
    }

    [Fact]
    public async Task RefreshTokens_InvalidToken_ThrowsUnauthorizedAccessException()
    {
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            CreateService().RefreshTokens(new RefreshTokenRequestDto
            {
                RefreshToken = "totally-invalid-token"
            }));
    }

    [Fact]
    public async Task RefreshTokens_ExpiredToken_ThrowsUnauthorizedAccessException()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "expireduser",
            Email = "expired@example.com",
            Password = "Password123!"
        });

        var login = await CreateService().LoginUser(new LoginRequestDto
        {
            UserName = "expireduser",
            Password = "Password123!"
        });

        var user = await DbContext.Users.FirstAsync(u => u.Username == "expireduser");
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(-1);
        await DbContext.SaveChangesAsync();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            CreateService().RefreshTokens(new RefreshTokenRequestDto
            {
                RefreshToken = login.RefreshToken
            }));
    }

    [Fact]
    public async Task RefreshTokens_RotatesRefreshToken_OldTokenNoLongerWorks()
    {
        await CreateService().RegisterUser(new RegisterRequestDto
        {
            UserName = "rotateuser",
            Email = "rotate@example.com",
            Password = "Password123!"
        });

        var login = await CreateService().LoginUser(new LoginRequestDto
        {
            UserName = "rotateuser",
            Password = "Password123!"
        });

        await CreateService().RefreshTokens(new RefreshTokenRequestDto
        {
            RefreshToken = login.RefreshToken
        });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            CreateService().RefreshTokens(new RefreshTokenRequestDto
            {
                RefreshToken = login.RefreshToken
            }));
    }
}