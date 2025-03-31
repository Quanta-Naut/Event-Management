import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertContactSubmissionSchema, 
  insertPortfolioItemSchema, 
  insertTestimonialSchema,
  insertUserSchema
} from "@shared/schema";
import { login, register, requireAuth } from "./auth";
import { hasDbError } from "./db";

// Helper function to handle database-related errors
const handleApiError = (res: Response, error: any, defaultMessage: string) => {
  console.error(`API Error: ${defaultMessage}`, error);
  
  // Check for specific error types
  if (error?.code === 'ECONNREFUSED' || error?.message?.includes('database') || 
      error?.message?.includes('DATABASE_URL') || hasDbError) {
    return res.status(503).json({ 
      message: "Database connection error. Please try again later.",
      error: "database_unavailable"
    });
  }
  
  if (error?.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({ 
      message: "This record already exists.",
      error: "duplicate_record" 
    });
  }
  
  return res.status(500).json({ 
    message: defaultMessage,
    error: "internal_server_error"
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Base API route
  app.get("/api/health", (_req, res) => {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: hasDbError ? "unavailable" : "connected",
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(health);
  });
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const result = await login(username, password);
      
      if (!result) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const { user, token } = result;
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      handleApiError(res, error, "Login failed");
    }
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }
      
      const { username, password } = result.data;
      
      const registerResult = await register(username, password);
      
      if (!registerResult) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const { user, token } = registerResult;
      
      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Auth verification endpoint
  app.get("/api/auth/verify", requireAuth, (req, res) => {
    // If we get here, the token is valid and req.user is set by the requireAuth middleware
    res.json({
      user: {
        id: (req as any).user.id,
        username: (req as any).user.username
      }
    });
  });

  // Apply auth middleware to admin-only operations
  const protectAdminRoutes = (req: Request, res: Response, next: NextFunction) => {
    // Skip auth for GET endpoints since they're publicly accessible
    if (req.method === 'GET') {
      return next();
    }
    
    // Apply requireAuth for all other methods (POST, PUT, PATCH, DELETE)
    return requireAuth(req, res, next);
  };
  
  // Portfolio routes
  app.get("/api/portfolio", async (_req, res) => {
    try {
      const items = await storage.getPortfolioItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.get("/api/portfolio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const item = await storage.getPortfolioItem(id);
      if (!item) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio item" });
    }
  });

  app.post("/api/portfolio", requireAuth, async (req, res) => {
    try {
      const result = insertPortfolioItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid portfolio item data", 
          errors: result.error.errors 
        });
      }
      
      const newItem = await storage.createPortfolioItem(result.data);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.put("/api/portfolio/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const result = insertPortfolioItemSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid portfolio item data", 
          errors: result.error.errors 
        });
      }
      
      const updatedItem = await storage.updatePortfolioItem(id, result.data);
      if (!updatedItem) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/portfolio/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Even if item is not found, we return 204 as the end result is the same
      await storage.deletePortfolioItem(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  // Testimonial routes
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/testimonials", requireAuth, async (req, res) => {
    try {
      const result = insertTestimonialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid testimonial data", 
          errors: result.error.errors 
        });
      }
      
      const newTestimonial = await storage.createTestimonial(result.data);
      res.status(201).json(newTestimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  app.put("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const result = insertTestimonialSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid testimonial data", 
          errors: result.error.errors 
        });
      }
      
      const updatedTestimonial = await storage.updateTestimonial(id, result.data);
      if (!updatedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      
      res.json(updatedTestimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });

  app.delete("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Even if item is not found, we return 204 as the end result is the same
      await storage.deleteTestimonial(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });

  // Contact submission routes
  app.get("/api/contact", requireAuth, async (_req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      handleApiError(res, error, "Failed to fetch contact submissions");
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      // First check if database is available
      if (hasDbError) {
        return res.status(503).json({
          message: "Our database is currently unavailable. Please try again later or contact us directly by phone.",
          error: "database_unavailable"
        });
      }
      
      const result = insertContactSubmissionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Please check the form for errors and try again.", 
          errors: result.error.format(),
          error: "validation_error"
        });
      }
      
      const newSubmission = await storage.createContactSubmission(result.data);
      
      // Return a meaningful success response
      res.status(201).json({
        message: "Your message has been received. We'll get back to you soon!",
        submission: newSubmission
      });
    } catch (error) {
      handleApiError(res, error, "Failed to submit your message. Please try again later.");
    }
  });

  app.patch("/api/contact/:id/read", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const updatedSubmission = await storage.markContactSubmissionAsRead(id);
      if (!updatedSubmission) {
        return res.status(404).json({ message: "Contact submission not found" });
      }
      
      res.json(updatedSubmission);
    } catch (error) {
      handleApiError(res, error, "Failed to mark contact submission as read");
    }
  });

  app.delete("/api/contact/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Even if item is not found, we return 204 as the end result is the same
      await storage.deleteContactSubmission(id);
      res.status(204).end();
    } catch (error) {
      handleApiError(res, error, "Failed to delete contact submission");
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", requireAuth, async (_req, res) => {
    try {
      const users = await storage.getUsers();
      // Do not send passwords to the client
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  app.post("/api/admin/users", requireAuth, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }
      
      const { username, password } = result.data;
      const registerResult = await register(username, password);
      
      if (!registerResult) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const { user } = registerResult;
      
      res.status(201).json({
        id: user.id,
        username: user.username
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Don't allow deleting own account
      if ((req as any).user.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete admin user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
