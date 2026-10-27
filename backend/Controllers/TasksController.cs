using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext? _context;

    // In-memory replica data source
    private static readonly List<TaskItem> InMemoryTasks = new()
    {
        new TaskItem { Id = 1, Title = "Set up Azure hosting environment", IsCompleted = true },
        new TaskItem { Id = 2, Title = "Configure CI/CD deployment pipeline", IsCompleted = false },
        new TaskItem { Id = 3, Title = "Test API endpoints and database connection", IsCompleted = false },
        new TaskItem { Id = 4, Title = "Integrate Angular frontend with backend API", IsCompleted = false }
    };

    public TasksController(IServiceProvider serviceProvider)
    {
        _context = serviceProvider.GetService<AppDbContext>();
    }

    // GET: api/tasks/in-memory
    [HttpGet("in-memory")]
    public ActionResult<IEnumerable<TaskItem>> GetInMemoryTasks()
    {
        return Ok(InMemoryTasks);
    }

    // GET: api/tasks/in-memory/5
    [HttpGet("in-memory/{id}")]
    public ActionResult<TaskItem> GetInMemoryTask(int id)
    {
        var task = InMemoryTasks.FirstOrDefault(t => t.Id == id);
        if (task == null)
        {
            return NotFound();
        }
        return Ok(task);
    }

    // GET: api/tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        if (_context == null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Database is disabled or not configured.");
        }
        return await _context.Tasks.ToListAsync();
    }

    // GET: api/tasks/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        if (_context == null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Database is disabled or not configured.");
        }
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }
        return task;
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
    {
        if (_context == null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Database is disabled or not configured.");
        }
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItem task)
    {
        if (_context == null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Database is disabled or not configured.");
        }
        if (id != task.Id)
        {
            return BadRequest();
        }

        var existing = await _context.Tasks.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Title = task.Title;
        existing.IsCompleted = task.IsCompleted;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        if (_context == null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Database is disabled or not configured.");
        }
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
