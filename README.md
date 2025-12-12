# geo-api

Production-ready Node.js + Express API (ESM JavaScript) with PostgreSQL (Neon), Drizzle ORM, and JWT authentication.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Environment variables configured

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
PORT=8000
```

Obtain `DATABASE_URL` from your Neon dashboard. Generate a secure `JWT_SECRET` using:

```bash
openssl rand -base64 32
```

### 3. Database Initialization

Generate migrations:

```bash
npm run generate
```

Apply migrations:

```bash
npm run migrate
```

Seed the default user (`admin@example.com` / `password123`):

```bash
npm run seed
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The server starts on port 8000 by default.

### Production Start

```bash
npm start
```

## API Endpoints

### Health Check

```bash
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

### Login

```bash
POST /api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

Error responses use standard HTTP status codes:

- `400`: Validation error
- `401`: Invalid credentials
- `500`: Server error

## Deployment on Vercel

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`) in Vercel dashboard
4. Deploy automatically on push

The `vercel.json` configuration handles routing and build settings.

## Project Structure

```
src/
├── index.js           # Express app entry point
├── db/
│   ├── index.js       # Database connection
│   └── schema.js      # Drizzle schema definitions
└── scripts/
  └── seed.js        # Database seeding script
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (ESM)
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Auth:** bcrypt, JWT
- **Validation:** Zod
- **Deployment:** Vercel
