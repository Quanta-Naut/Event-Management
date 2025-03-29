import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertContactSubmissionSchema, 
  insertPortfolioItemSchema, 
  insertTestimonialSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Base API route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

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

  app.post("/api/portfolio", async (req, res) => {
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

  app.put("/api/portfolio/:id", async (req, res) => {
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

  app.delete("/api/portfolio/:id", async (req, res) => {
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

  app.post("/api/testimonials", async (req, res) => {
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

  app.put("/api/testimonials/:id", async (req, res) => {
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

  app.delete("/api/testimonials/:id", async (req, res) => {
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
  app.get("/api/contact", async (_req, res) => {
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

  app.patch("/api/contact/:id/read", async (req, res) => {
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

  app.delete("/api/contact/:id", async (req, res) => {
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
