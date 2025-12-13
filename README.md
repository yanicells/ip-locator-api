# IP Geolocation API

A RESTful API handling user authentication and persistent search history using PostgreSQL. Built with Node.js, Express, and Drizzle ORM for production-grade data management and security.

## Prerequisites

- Node.js v20+ recommended
- PostgreSQL Database (Neon or local instance)
- npm or yarn package manager

## Installation & Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/yanicells/ip-locator-dashboard
cd geo-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-secret-key
PORT=8000
```

- `DATABASE_URL`: PostgreSQL connection string (obtain from Neon dashboard or local PostgreSQL instance)
- `JWT_SECRET`: Secret key for JWT token signing (generate using `openssl rand -base64 32`)
- `PORT`: Server port (defaults to 8000)

### 4. Database Migration

Push the database schema to your PostgreSQL instance:

```bash
npm run migrate
```

Alternatively, use the Drizzle Kit command directly:

```bash
npx drizzle-kit push:pg
```

### 5. Seed Database (Optional)

Seed a default user for testing:

```bash
npm run seed
```

Default credentials:

- Email: `admin@example.com`
- Password: `password123`

### 6. Run Server

Start the development server with hot reload:

```bash
npm run dev
```

The server will run on `http://localhost:8000`.

## Features Implemented

### Authentication

- JWT-based authentication system
- User registration (Sign Up) with password hashing using bcrypt
- User login with credential verification
- Token expiration (24-hour validity)

### Middleware

- Protected routes using Bearer token authentication
- Automatic token verification on authenticated endpoints
- Comprehensive error handling with appropriate HTTP status codes

### Search History

- Database-backed search history synchronized across devices
- Create new history entries with geolocation data
- Retrieve user-specific history with pagination support
- Delete individual or multiple history entries
- Automatic cleanup (maintains last 10 entries per user)
- Duplicate IP handling (updates timestamp instead of creating duplicates)

### Validation

- Input validation using Zod schema validation
- Email format verification
- Password strength requirements
- IP address and geolocation data validation

### CORS

- Configured to allow cross-origin requests from frontend applications
- Supports all HTTP methods required by the API

## API Endpoints

### Authentication

#### POST /api/signup

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure-password"
}
```

**Response (201):**

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/login

Authenticate an existing user.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "secure-password"
}
```

**Response (200):**

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Search History

All history endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

#### GET /api/history

Retrieve the authenticated user's search history.

**Query Parameters:**

- `limit` (optional): Number of records to return (default: 10)

**Response (200):**

```json
{
  "history": [
    {
      "id": 1,
      "ip": "8.8.8.8",
      "city": "Mountain View",
      "region": "California",
      "country": "US",
      "loc": "37.4056,-122.0775",
      "hostname": "dns.google",
      "org": "AS15169 Google LLC",
      "postal": "94043",
      "timezone": "America/Los_Angeles",
      "created_at": "2025-12-13T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/history

Save a new search result to history.

**Request Body:**

```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "loc": "37.4056,-122.0775",
  "hostname": "dns.google",
  "org": "AS15169 Google LLC",
  "postal": "94043",
  "timezone": "America/Los_Angeles"
}
```

**Response (201):**

```json
{
  "id": 1,
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "loc": "37.4056,-122.0775",
  "hostname": "dns.google",
  "org": "AS15169 Google LLC",
  "postal": "94043",
  "timezone": "America/Los_Angeles",
  "created_at": "2025-12-13T10:30:00.000Z"
}
```

#### DELETE /api/history

Delete specific history entries by IP addresses.

**Request Body:**

```json
{
  "ips": ["8.8.8.8", "1.1.1.1"]
}
```

**Response (204):**
No content.

#### DELETE /api/history/all

Delete all history entries for the authenticated user.

**Response (204):**
No content.

## Technology Stack

- **Runtime:** Node.js (ESM modules)
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **CORS:** cors middleware

## Project Structure

```
geo-api/
├── src/
│   ├── index.js          # Main application entry point
│   ├── db/
│   │   ├── index.js      # Database connection
│   │   └── schema.js     # Drizzle ORM schema definitions
│   └── scripts/
│       └── seed.js       # Database seeding script
├── api/
│   └── index.js          # Vercel serverless entry point
├── .env                  # Environment variables (not in repo)
├── drizzle.config.js     # Drizzle Kit configuration
├── package.json          # Dependencies and scripts
└── vercel.json           # Vercel deployment configuration
```

## Production Deployment

This API is configured for deployment on Vercel with serverless functions.

### Deployment Steps

1. Install Vercel CLI: `npm i -g vercel`
2. Link project: `vercel link`
3. Configure environment variables in Vercel dashboard
4. Deploy: `vercel --prod`
