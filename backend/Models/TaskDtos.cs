using System.ComponentModel.DataAnnotations;

namespace TaskManager.Api.Models;

public class CreateTaskDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(255, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 255 characters.")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string? Description { get; set; }

    [RegularExpression("^(Low|Medium|High)$", ErrorMessage = "Priority must be 'Low', 'Medium', or 'High'.")]
    public string Priority { get; set; } = "Medium";

    public DateTime? DueDate { get; set; }

    [MaxLength(50, ErrorMessage = "Category cannot exceed 50 characters.")]
    public string? Category { get; set; }

    public bool IsCompleted { get; set; } = false;
}

public class UpdateTaskDto
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(255, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 255 characters.")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string? Description { get; set; }

    [RegularExpression("^(Low|Medium|High)$", ErrorMessage = "Priority must be 'Low', 'Medium', or 'High'.")]
    public string Priority { get; set; } = "Medium";

    public DateTime? DueDate { get; set; }

    [MaxLength(50, ErrorMessage = "Category cannot exceed 50 characters.")]
    public string? Category { get; set; }

    public bool IsCompleted { get; set; }
}

public class TaskSummaryDto
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Completed { get; set; }
    public int Overdue { get; set; }
    public int DueToday { get; set; }
    public int HighPriority { get; set; }
}
