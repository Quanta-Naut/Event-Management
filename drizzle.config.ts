import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', '⚠️ ERROR: DATABASE_URL environment variable is missing');
  console.error('\x1b[33m%s\x1b[0m', 
    '\nTo fix DATABASE_URL, add it to your .env file or set it as an environment variable.\n' +
    'Example .env entry: DATABASE_URL=postgresql://username:password@localhost:5432/dbname\n' +
    'You can also use a Docker container: docker run --name event-db -e POSTGRES_PASSWORD=password -e POSTGRES_USER=admin -e POSTGRES_DB=eventforge -p 5432:5432 -d postgres\n'
  );
  
  // Use a fake URL for drizzle-kit commands to avoid breaking completely
  // This allows commands like `pnpm drizzle:generate` to work without a real DB connection
  process.env.DATABASE_URL = 'postgresql://fake:fake@localhost:5432/fake';
  console.warn('\x1b[33m%s\x1b[0m', 'Using fake DATABASE_URL for drizzle-kit. This will not work for actual database operations.\n');
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
