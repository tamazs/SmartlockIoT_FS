using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;

namespace Tests.Infrastructure;

[Collection("Database")]
public abstract class DatabaseTest : IAsyncLifetime
{
    private readonly DatabaseFixture _fixture;
    private IDbContextTransaction _transaction = null!;

    protected AppDbContext DbContext { get; private set; } = null!;
    protected IConfiguration Configuration => _fixture.Configuration;

    protected DatabaseTest(DatabaseFixture fixture)
    {
        _fixture = fixture;
    }

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;

        DbContext = new AppDbContext(options);
        _transaction = await DbContext.Database.BeginTransactionAsync();
    }

    public async Task DisposeAsync()
    {
        await _transaction.RollbackAsync();
        await DbContext.DisposeAsync();
    }
}