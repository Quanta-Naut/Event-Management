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

export async function registerRoutes(app: Express): Promise<Server> {
  // Base API route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
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
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
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
    // If we get here, the token is valid
    res.json({ 
      user: (req as any).user,
      message: "Token is valid" 
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
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const result = insertContactSubmissionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid contact submission data", 
          errors: result.error.errors 
        });
      }
      
      const newSubmission = await storage.createContactSubmission(result.data);
      res.status(201).json(newSubmission);
    } catch (error) {
      res.status(500).json({ message: "Failed to create contact submission" });
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
      res.status(500).json({ message: "Failed to mark contact submission as read" });
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
      res.status(500).json({ message: "Failed to delete contact submission" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
