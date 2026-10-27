using System.ComponentModel.DataAnnotations;

namespace TaskManager.Api.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [MaxLength(20)]
    public string Priority { get; set; } = "Medium";

    public DateTime? DueDate { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
