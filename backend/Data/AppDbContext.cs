using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Models;

namespace TaskManager.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("tasks");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Title)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(e => e.Description)
                  .HasColumnType("TEXT")
                  .IsRequired(false);

            entity.Property(e => e.Priority)
                  .HasMaxLength(20)
                  .HasDefaultValue("Medium");

            entity.Property(e => e.DueDate)
                  .IsRequired(false);

            entity.Property(e => e.Category)
                  .HasMaxLength(50)
                  .IsRequired(false);

            entity.Property(e => e.IsCompleted)
                  .HasDefaultValue(false);

            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                  .IsRequired(false);
        });
    }
}
