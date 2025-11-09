# 🚀 Course Management System - Backend API

Backend RESTful API built with NestJS, TypeORM, PostgreSQL, and JWT Authentication.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Modules](#modules)

## 🛠️ Tech Stack

- **Framework:** NestJS 10.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 16
- **ORM:** TypeORM 0.3.x
- **Authentication:** JWT (Passport)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, CORS, Rate Limiting
- **Testing:** Jest
- **Code Quality:** ESLint, Prettier

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) with **Clean Architecture** principles:

```
backend/
├── src/
│   ├── modules/           # Business modules (bounded contexts)
│   │   ├── auth/         # Authentication & Authorization
│   │   ├── users/        # User management
│   │   ├── programs/     # Program/Course management
│   │   ├── enrollments/  # Enrollment management
│   │   └── health/       # Health checks
│   ├── common/           # Shared utilities
│   │   ├── decorators/   # Custom decorators
│   │   ├── dto/          # Shared DTOs
│   │   ├── filters/      # Exception filters
│   │   ├── guards/       # Auth guards
│   │   ├── interceptors/ # Request/Response interceptors
│   │   └── interfaces/   # Shared interfaces
│   ├── config/           # Configuration files
│   ├── main.ts           # Application entry point
│   └── app.module.ts     # Root module
├── test/                 # E2E tests
├── Dockerfile            # Multi-stage Docker build
├── package.json
└── tsconfig.json
```

## 📁 Project Structure

### Module Structure (Hexagonal Architecture)

Each module follows this structure:

```
module/
├── domain/              # Domain layer (entities, value objects)
│   └── *.entity.ts     # TypeORM entities
├── dto/                # Data Transfer Objects
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── filter-*.dto.ts
├── *.controller.ts     # Presentation layer (HTTP endpoints)
├── *.service.ts        # Application layer (business logic)
└── *.module.ts         # Module definition
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL 16
- Docker & Docker Compose (optional)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure database:**
   - Update `.env` with your PostgreSQL credentials
   - Run database migrations (if any)

4. **Start development server:**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3001/api`

### Using Docker

```bash
# From project root
docker-compose up -d backend
```

## 📚 API Documentation

### Swagger UI

When running in development mode, Swagger documentation is available at:

```
http://localhost:3001/api/docs
```

### GraphQL Playground

GraphQL playground is available at:

```
http://localhost:3001/graphql
```

### Health Check

```
http://localhost:3001/api/health
```

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=course_management
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📜 Available Scripts

```bash
# Development
npm run start:dev        # Start with hot-reload
npm run start:debug      # Start in debug mode

# Build
npm run build            # Build for production

# Production
npm run start:prod       # Start production server

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run E2E tests

# Code Quality
npm run lint             # Lint code
npm run format           # Format code with Prettier

# Database
npm run typeorm          # Run TypeORM CLI
npm run migration:generate  # Generate migration
npm run migration:run    # Run migrations
npm run migration:revert # Revert last migration
```

## 📦 Modules

### 🔐 Auth Module

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

**Features:**
- JWT-based authentication
- Refresh token rotation
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)

### 👥 Users Module

**Endpoints:**
- `GET /api/users` - List users (Admin/Instructor)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

**Roles:**
- `ADMIN` - Full system access
- `INSTRUCTOR` - Manage programs and enrollments
- `STUDENT` - Enroll in programs, view own data

### 📚 Programs Module

**Endpoints:**
- `GET /api/programs` - List programs
- `GET /api/programs/:id` - Get program by ID
- `POST /api/programs` - Create program (Admin/Instructor)
- `PATCH /api/programs/:id` - Update program (Admin/Instructor)
- `DELETE /api/programs/:id` - Delete program (Admin only)

**Program Status:**
- `DRAFT` - Not visible to students
- `PUBLISHED` - Visible but not accepting enrollments
- `ACTIVE` - Accepting enrollments
- `COMPLETED` - Finished
- `ARCHIVED` - Historical record

### 📝 Enrollments Module

**Endpoints:**
- `GET /api/enrollments` - List enrollments
- `GET /api/enrollments/:id` - Get enrollment by ID
- `POST /api/enrollments` - Create enrollment
- `PATCH /api/enrollments/:id` - Update enrollment
- `DELETE /api/enrollments/:id` - Delete enrollment

**Enrollment Status:**
- `PENDING` - Awaiting approval
- `ACTIVE` - Currently enrolled
- `COMPLETED` - Finished successfully
- `DROPPED` - Student dropped out

**Features:**
- Automatic capacity validation
- Progress tracking (0-100%)
- Auto-completion at 100% progress

### ❤️ Health Module

**Endpoints:**
- `GET /api/health` - Health check
- `GET /api/health/db` - Database health check

## 🔒 Security Features

- **Helmet:** Security headers
- **CORS:** Configurable cross-origin requests
- **Rate Limiting:** 100 requests per minute
- **JWT Authentication:** Secure token-based auth
- **Password Hashing:** bcrypt with 10 rounds
- **Input Validation:** class-validator on all DTOs
- **SQL Injection Protection:** TypeORM parameterized queries

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 📊 Database Schema

See `database/README.md` for complete schema documentation.

## 🐳 Docker Support

Multi-stage Dockerfile with:
- Development stage with hot-reload
- Production stage with optimized build
- Health checks
- Non-root user for security

## 🤝 Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation
4. Follow conventional commits

## 📄 License

MIT

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-09

