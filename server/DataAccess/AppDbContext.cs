using Microsoft.EntityFrameworkCore;

namespace DataAccess;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<EntryCodeType> EntryCodeTypes { get; set; }
    public DbSet<EntryCode> EntryCodes { get; set; }
    public DbSet<Log> Logs { get; set; }
    public DbSet<Alert> Alerts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(u => u.Username).HasMaxLength(20);
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<EntryCodeType>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<EntryCode>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(c => c.Code).HasMaxLength(8);
            e.HasIndex(c => c.Code).IsUnique();
            e.Property(c => c.UseCount).HasDefaultValue(0);
            e.HasOne(c => c.CodeOwner)
                .WithMany()
                .HasForeignKey(c => c.CodeOwnerId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(c => c.Type)
                .WithMany(t => t.EntryCodes)
                .HasForeignKey(c => c.TypeId);
        });

        modelBuilder.Entity<Log>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(l => l.EventTime).HasDefaultValueSql("NOW()");
            e.HasOne(l => l.User)
                .WithMany()
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(l => l.EntryCode)
                .WithMany(c => c.Logs)
                .HasForeignKey(l => l.EntryCodeId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Alert>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(a => a.CreatedAt).HasDefaultValueSql("NOW()");
            e.Property(a => a.IsResolved).HasDefaultValue(false);
        });
    }
}
