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

## Getting Started

To use the API, you have two options:

1. **Sign Up:** Register a new account using the `/api/signup` endpoint (see below)
2. **Use Default User:** Log in with the seeded default credentials:
   - **Email:** `admin@example.com`
   - **Password:** `password123`

After successful authentication (sign up or login), you'll receive a JWT token for making authenticated requests.

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

### Sign Up

Register a new user account.

```bash
POST /api/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Request Body:**

- `name` (string, required): User's full name
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 6 characters

**Success Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

- `400`: Validation error (missing or invalid fields)
- `409`: Email already exists
- `500`: Server error

### Login

Authenticate an existing user.

```bash
POST /api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Request Body:**

- `email` (string, required): User's email address
- `password` (string, required): User's password

**Success Response (200 OK):**

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

**Error Responses:**

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
