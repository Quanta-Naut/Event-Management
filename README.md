# Event Management System

A modern event management platform built with React, Express, and PostgreSQL. This application allows event planners to showcase their portfolio, collect inquiries through a contact form, and manage their event bookings.

## Features

- Responsive single-page application design
- Interactive portfolio showcase with filtering
- Testimonials carousel
- Contact form for inquiries
- Admin dashboard for managing content
- JWT-based authentication
- PostgreSQL database integration

## Prerequisites

- Node.js 16+ and npm/pnpm
- PostgreSQL database (local or cloud-hosted)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Event-Management.git
cd Event-Management
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory based on the provided `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file to include your database connection string and JWT secret:

```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
JWT_SECRET=your-secure-secret-key
```

### 4. Set up the database

You have several options for setting up the PostgreSQL database:

#### Option 1: Docker (Recommended for development)

Run a PostgreSQL container:

```bash
docker run --name event-db -e POSTGRES_PASSWORD=password -e POSTGRES_USER=admin -e POSTGRES_DB=eventforge -p 5432:5432 -d postgres
```

Then update your `.env` file:

```
DATABASE_URL=postgresql://admin:password@localhost:5432/eventforge
```

#### Option 2: Cloud Database

You can use services like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) to provision a PostgreSQL database.

### 5. Generate and apply database migrations

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
```

### 6. Start the development server

```bash
pnpm dev
```

The application will be available at `http://localhost:5000`.

## Troubleshooting

### Database Connection Issues

If you see database connection errors in the contact form or admin panel:

1. Verify that your PostgreSQL server is running
2. Check that the `DATABASE_URL` in your `.env` file is correct
3. Make sure the database has been created and migrations applied
4. Check if there are any network issues or firewalls blocking the connection

The application has been designed to gracefully handle database connection issues, providing helpful error messages and fallbacks where possible.

### JWT Authentication Issues

If you experience login problems:

1. Ensure the `JWT_SECRET` is set in your `.env` file
2. Note that the JWT secret will be randomly generated if not provided, but this means all tokens will be invalidated on server restart

## Deployment

### Building for Production

```bash
pnpm build
```

### Running in Production

```bash
NODE_ENV=production pnpm start
```

Make sure to set a strong `JWT_SECRET` in your production environment.

## Project Structure

- `client/` - React frontend application
- `server/` - Express API server
- `shared/` - Shared types and schemas using Zod
- `migrations/` - Database migration files

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.