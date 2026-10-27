using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TasksController> _logger;

    public TasksController(AppDbContext context, ILogger<TasksController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        try
        {
            var tasks = await _context.Tasks
                .AsNoTracking()
                .OrderBy(t => t.IsCompleted)
                .ThenBy(t => t.DueDate.HasValue ? 0 : 1)
                .ThenBy(t => t.DueDate)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks.");
            return StatusCode(500, new { message = "An error occurred while fetching tasks." });
        }
    }

    // GET: api/tasks/summary
    [HttpGet("summary")]
    public async Task<ActionResult<TaskSummaryDto>> GetSummary()
    {
        try
        {
            var nowUtc = DateTime.UtcNow;
            var todayUtc = nowUtc.Date;
            var tomorrowUtc = todayUtc.AddDays(1);

            var tasks = await _context.Tasks.AsNoTracking().ToListAsync();

            var summary = new TaskSummaryDto
            {
                Total = tasks.Count,
                Pending = tasks.Count(t => !t.IsCompleted),
                Completed = tasks.Count(t => t.IsCompleted),
                Overdue = tasks.Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value < nowUtc),
                DueToday = tasks.Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value >= todayUtc && t.DueDate.Value < tomorrowUtc),
                HighPriority = tasks.Count(t => !t.IsCompleted && string.Equals(t.Priority, "High", StringComparison.OrdinalIgnoreCase))
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error computing task summary.");
            return StatusCode(500, new { message = "An error occurred while computing summary." });
        }
    }

    // GET: api/tasks/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound(new { message = $"Task with ID {id} was not found." });
        }
        return Ok(task);
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var trimmedTitle = dto.Title?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedTitle))
        {
            return BadRequest(new { message = "Task title cannot be empty or whitespace." });
        }

        var task = new TaskItem
        {
            Title = trimmedTitle,
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "Medium" : dto.Priority,
            DueDate = dto.DueDate?.ToUniversalTime(),
            Category = string.IsNullOrWhiteSpace(dto.Category) ? null : dto.Category.Trim(),
            IsCompleted = dto.IsCompleted,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // PUT: api/tasks/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskItem>> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (id != dto.Id)
        {
            return BadRequest(new { message = "Route ID does not match payload ID." });
        }

        var trimmedTitle = dto.Title?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedTitle))
        {
            return BadRequest(new { message = "Task title cannot be empty or whitespace." });
        }

        var existing = await _context.Tasks.FindAsync(id);
        if (existing == null)
        {
            return NotFound(new { message = $"Task with ID {id} was not found." });
        }

        existing.Title = trimmedTitle;
        existing.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        existing.Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "Medium" : dto.Priority;
        existing.DueDate = dto.DueDate?.ToUniversalTime();
        existing.Category = string.IsNullOrWhiteSpace(dto.Category) ? null : dto.Category.Trim();
        existing.IsCompleted = dto.IsCompleted;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(existing);
    }

    // DELETE: api/tasks/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound(new { message = $"Task with ID {id} was not found." });
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
