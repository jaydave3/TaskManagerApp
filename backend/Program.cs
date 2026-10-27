using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (conditional)
var enableDatabase = builder.Configuration.GetValue<bool>("EnableDatabase");
if (enableDatabase)
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(connectionString))
    {
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
    }
}

// 2. CORS Configuration for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

// 3. Swagger / OpenAPI Configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Enable Swagger middleware in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
