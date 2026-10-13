# TaskManagerApp

A full-stack Task Manager starter application built with **.NET 8 Web API**, **MySQL**, and **standalone Angular**, designed for learning Azure deployment.

## Architecture

- **Backend**: .NET 8 Web API with Entity Framework Core & Pomelo MySQL (`backend/`)
- **Frontend**: Angular 19+ standalone components with Reactive forms and HttpClient (`frontend/`)
- **Database**: MySQL Server 8.0 (`taskmanagerdb`)

## Project Structure

```text
TaskManagerApp/
├── backend/                  # .NET 8 Web API project (TaskManager.Api)
│   ├── Controllers/          # TasksController (CRUD endpoints)
│   ├── Data/                 # AppDbContext (EF Core)
│   ├── Models/               # TaskItem model
│   ├── appsettings.json      # MySQL connection string
│   └── Program.cs            # CORS and service configuration
├── frontend/                 # Standalone Angular project
│   └── src/app/
│       ├── models/           # TaskItem interface
│       ├── services/         # TaskService (HttpClient)
│       ├── app.ts            # Standalone App component
│       ├── app.html          # Task Manager UI
│       └── app.css           # Styling
└── README.md
```

## Running Locally

### 1. Database Setup (MySQL)
Ensure MySQL is running on `localhost:3306`:
```sql
CREATE DATABASE taskmanagerdb;
USE taskmanagerdb;
CREATE TABLE Tasks (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    IsCompleted BOOLEAN NOT NULL DEFAULT FALSE
);
```

### 2. Backend (.NET 8 Web API)
```bash
cd backend
dotnet run
```
API runs at:
- HTTP: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

### 3. Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
Frontend runs at:
- Web App: `http://localhost:4200`

## Azure Deployment Guide

1. **Azure Database for MySQL**: Provision a Flexible Server in Azure.
2. **Azure App Service (Linux)**: Deploy `backend/`. Configure the `ConnectionStrings__DefaultConnection` environment variable.
3. **Azure Static Web Apps**: Deploy `frontend/`. Update the API URL to your Azure Web App endpoint.
