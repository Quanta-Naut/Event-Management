import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Portfolio items
export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  venue: text("venue"),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  overview: text("overview").notNull(),
  role: jsonb("role").notNull(),
  results: text("results").notNull(),
  tags: text("tags").array().notNull(),
  featured: boolean("featured").default(false),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({ 
  id: true 
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  position: text("position").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ 
  id: true 
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  eventType: text("event_type"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ 
  id: true,
  createdAt: true,
  read: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Custom extension with strongly typed 'role' field
export type PortfolioItem = typeof portfolioItems.$inferSelect & {
  role: string[] | Record<string, string>;
};
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;