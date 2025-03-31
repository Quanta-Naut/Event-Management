import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// WebSocket configuration for Neon database
neonConfig.webSocketConstructor = ws;

// Function to get database connection with error handling
export function getDatabaseConnection() {
  try {
    // Check for DATABASE_URL environment variable
    if (!process.env.DATABASE_URL) {
      console.error('\x1b[31m%s\x1b[0m', '⚠️ ERROR: DATABASE_URL environment variable is missing');
      
      // In development, provide helpful feedback
      if (process.env.NODE_ENV !== 'production') {
        console.warn('\x1b[33m%s\x1b[0m',
          '\nTo fix DATABASE_URL, add it to your .env file:\n' +
          'DATABASE_URL=postgresql://username:password@localhost:5432/dbname\n' +
          'You can run PostgreSQL locally using Docker:\n' +
          'docker run --name event-db -e POSTGRES_PASSWORD=password -e POSTGRES_USER=admin -e POSTGRES_DB=eventforge -p 5432:5432 -d postgres\n'
        );
      }
      
      throw new Error("Database connection error: DATABASE_URL not configured");
    }
    
    // Create connection pool
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000, // 10 seconds timeout
      max: 10 // Maximum number of clients in the pool
    });
    
    // Add connection error handler
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
    
    return { pool, db: drizzle({ client: pool, schema }) };
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    
    // Return mock/fallback db implementation for non-critical paths
    // This allows the app to start even with DB connection issues
    const mockPool = {
      query: async () => {
        throw new Error('Database unavailable');
      },
      connect: async () => {
        throw new Error('Database unavailable');
      }
    } as unknown as Pool;
    
    return {
      pool: mockPool,
      db: drizzle({ client: mockPool, schema }),
      hasError: true
    };
  }
}

// Export database connection and client
const connection = getDatabaseConnection();
export const pool = connection.pool;
export const db = connection.db;
export const hasDbError = 'hasError' in connection && connection.hasError;
