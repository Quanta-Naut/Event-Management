import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  const errorMessage = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
  console.error('\x1b[31m%s\x1b[0m', '⚠️ ERROR: ' + errorMessage);
  
  // Provide helpful message for DATABASE_URL specifically
  if (missingEnvVars.includes('DATABASE_URL')) {
    console.error('\x1b[33m%s\x1b[0m', 
      '\nTo fix DATABASE_URL, add it to your .env file or set it as an environment variable.\n' +
      'Example .env entry: DATABASE_URL=postgresql://username:password@localhost:5432/dbname\n' +
      'You can also use a Docker container: docker run --name event-db -e POSTGRES_PASSWORD=password -e POSTGRES_USER=admin -e POSTGRES_DB=eventforge -p 5432:5432 -d postgres\n'
    );
  }

  // Continue execution, but with warnings - the application will use fallbacks where possible
  // but DB-dependent features will fail gracefully
  console.warn('\x1b[33m%s\x1b[0m', 'Warning: Application starting with missing environment variables. Some features may not work correctly.');
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Enhance database-related error messages
    if (message.includes('DATABASE_URL') || (err.code && ['ECONNREFUSED', '28P01', '3D000'].includes(err.code))) {
      message = "Database connection error. Please try again later or contact support.";
      console.error('Database Error:', err);
    }

    res.status(status).json({ message });
    
    if (app.get("env") === "development") {
      console.error(err);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // const port = 3001;
  // server.listen({
  //   port,
  //   host: "localhost", // Change from "0.0.0.0"
  // }, () => {
  //   log(`serving on port ${port}`);
  // });
})();
