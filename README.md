# TaskFlow — Team Task Manager

A full-stack web application for team task management with Role-Based Access Control (RBAC).

## Features

- **Authentication** — JWT-based Signup/Login
- **Role-Based Access Control** — Admin & Member roles
- **Project Management** — Create, update, delete projects; add members
- **Task Management** — Create tasks, assign to members, track status (TODO / IN_PROGRESS / DONE)
- **Dashboard** — Stats overview, overdue task tracking
- **Responsive UI** — Clean dark-themed interface

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Auth | JWT (jjwt 0.11.5) |
| Database | MySQL |
| Frontend | HTML5, CSS3, Vanilla JS |
| Deploy | Railway |

## Project Structure

```
src/main/java/com/taskmanager/
├── config/          # SecurityConfig, GlobalExceptionHandler
├── controller/      # AuthController, ProjectController, TaskController, DashboardController
├── dto/             # Request/Response DTOs
├── entity/          # User, Project, Task, Role, TaskStatus
├── repository/      # JPA Repositories
├── security/        # JwtUtil, JwtFilter, UserDetailsServiceImpl
└── service/         # AuthService, ProjectService, TaskService, DashboardService

src/main/resources/static/
├── css/style.css    # Dark theme stylesheet
├── js/app.js        # Frontend logic
├── login.html
├── register.html
└── dashboard.html
```

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |

### Projects
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/projects | Authenticated |
| POST | /api/projects | Authenticated |
| GET | /api/projects/{id} | Member/Admin |
| PUT | /api/projects/{id} | Creator/Admin |
| DELETE | /api/projects/{id} | Creator/Admin |
| GET | /api/projects/users | Authenticated |

### Tasks
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/tasks | Project Member |
| GET | /api/tasks/project/{id} | Project Member |
| GET | /api/tasks/my | Authenticated |
| PUT | /api/tasks/{id} | Project Member |
| PATCH | /api/tasks/{id}/status | Project Member |
| DELETE | /api/tasks/{id} | Creator/Admin |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/dashboard | Authenticated |

## RBAC Rules

| Action | Admin | Member |
|---|---|---|
| View all projects | ✅ | ❌ (own only) |
| Create project | ✅ | ✅ |
| Delete any project | ✅ | ❌ |
| Delete own project | ✅ | ✅ |
| Create task | ✅ | ✅ (if member) |
| Update task status | ✅ | ✅ (if member) |
| Delete any task | ✅ | ❌ |
| View all users | ✅ | ✅ |

## Local Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/team-task-manager
   cd team-task-manager
   ```

2. **Create MySQL database**
   ```sql
   CREATE DATABASE taskmanager;
   ```

3. **Configure application.properties** (or set env vars)
   ```
   DATABASE_URL=jdbc:mysql://localhost:3306/taskmanager?createDatabaseIfNotExist=true
   MYSQLUSER=root
   MYSQLPASSWORD=yourpassword
   JWT_SECRET=yourSecretKey
   ```

4. **Run**
   ```bash
   mvn spring-boot:run
   ```

5. Open `http://localhost:8080`

## Railway Deployment

1. Push code to GitHub
2. Create new Railway project → Deploy from GitHub repo
3. Add MySQL plugin in Railway
4. Railway auto-sets `DATABASE_URL`, `MYSQLUSER`, `MYSQLPASSWORD`
5. Set env var: `JWT_SECRET=yourRandomLongSecret`
6. Deploy! Railway runs `mvn package` then starts the JAR

## Live Demo

🚀 [Live URL here after deployment]

## Demo Video

📹 [2-5 min demo video link]

## Author

Dhawal Sharma — MCA 2026, NIET Greater Noida
