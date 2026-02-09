# JOCstudio Backend

Production-ready backend for JOCstudio - Construction Takeoff & JOC Estimating Platform.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Documentation:** Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for local PostgreSQL)
- npm or pnpm

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd jocstudio-backend
   npm install
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run database migrations:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3001`

API documentation available at `http://localhost:3001/docs`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm test` | Run tests |
| `npm run typecheck` | Run TypeScript type checking |

## API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get JWT
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke refresh token)
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `GET /users/me/stats` - Get user statistics

### Projects
- `GET /projects` - List user's projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/duplicate` - Duplicate project

### Measurements
- `GET /projects/:projectId/measurements` - List measurements
- `POST /projects/:projectId/measurements` - Create measurement
- `POST /projects/:projectId/measurements/batch` - Create multiple measurements
- `GET /projects/:projectId/measurements/:id` - Get measurement
- `PATCH /projects/:projectId/measurements/:id` - Update measurement
- `DELETE /projects/:projectId/measurements/:id` - Delete measurement
- `DELETE /projects/:projectId/measurements/batch` - Delete multiple

### Layers
- `GET /projects/:projectId/layers` - List layers
- `POST /projects/:projectId/layers` - Create layer
- `PATCH /projects/:projectId/layers/:id` - Update layer
- `DELETE /projects/:projectId/layers/:id` - Delete layer
- `POST /projects/:projectId/layers/reorder` - Reorder layers

### Files
- `POST /files/upload` - Upload file (PDF, images)
- `GET /files/:id` - Get file info
- `DELETE /files/:id` - Delete file

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
src/
├── config/           # Environment, database config
├── lib/              # Utilities, errors, helpers
├── modules/
│   ├── auth/         # Authentication
│   ├── users/        # User profiles
│   ├── projects/     # Project CRUD
│   ├── measurements/ # Takeoff measurements
│   ├── layers/       # Drawing layers
│   └── files/        # File uploads
└── server.ts         # Entry point
```

## Test Credentials

After running `npm run db:seed`:

- **Admin:** admin@jocstudio.dev / Admin123!
- **Demo:** demo@jocstudio.dev / Demo1234!

## Environment Variables

See `.env.example` for all available options:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGIN` | Allowed CORS origins | localhost:3000 |
| `STORAGE_PROVIDER` | File storage (local/supabase/s3) | local |

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run migrations:
   ```bash
   npm run db:migrate:prod
   ```

4. Start the server:
   ```bash
   npm start
   ```

## License

Private - All rights reserved.
