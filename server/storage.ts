import { users, portfolioItems, testimonials, contactSubmissions } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { InsertContactSubmission, InsertPortfolioItem, InsertTestimonial, InsertUser, User, PortfolioItem, Testimonial, ContactSubmission } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  
  // Portfolio methods
  getPortfolioItems(): Promise<PortfolioItem[]>;
  getPortfolioItem(id: number): Promise<PortfolioItem | undefined>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  updatePortfolioItem(id: number, item: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined>;
  deletePortfolioItem(id: number): Promise<boolean>;
  
  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Contact submissions methods
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmission(id: number): Promise<ContactSubmission | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  markContactSubmissionAsRead(id: number): Promise<ContactSubmission | undefined>;
  deleteContactSubmission(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

// Set up PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getPortfolioItems(): Promise<PortfolioItem[]> {
    const items = await db.select().from(portfolioItems);
    // Ensure role is correctly typed for each item
    return items.map(item => ({
      ...item, 
      role: item.role as string[] | Record<string, string>
    }));
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    const [item] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id));
    if (!item) return undefined;
    
    // Ensure role is correctly typed
    return {
      ...item,
      role: item.role as string[] | Record<string, string>
    };
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [createdItem] = await db.insert(portfolioItems).values(item).returning();
    // Ensure role is correctly typed
    return {
      ...createdItem,
      role: createdItem.role as string[] | Record<string, string>
    };
  }

  async updatePortfolioItem(id: number, update: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const [updatedItem] = await db.update(portfolioItems).set(update).where(eq(portfolioItems.id, id)).returning();
    if (!updatedItem) return undefined;
    
    // Ensure role is correctly typed
    return {
      ...updatedItem,
      role: updatedItem.role as string[] | Record<string, string>
    };
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    const result = await db.delete(portfolioItems).where(eq(portfolioItems.id, id)).returning();
    return result.length > 0;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [createdTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return createdTestimonial;
  }

  async updateTestimonial(id: number, update: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [updatedTestimonial] = await db.update(testimonials).set(update).where(eq(testimonials.id, id)).returning();
    return updatedTestimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    return result.length > 0;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
    return submission;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [createdSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return createdSubmission;
  }

  async markContactSubmissionAsRead(id: number): Promise<ContactSubmission | undefined> {
    const [updatedSubmission] = await db.update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return updatedSubmission;
  }

  async deleteContactSubmission(id: number): Promise<boolean> {
    const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id)).returning();
    return result.length > 0;
  }
}

// Create and export a singleton instance
export const storage = new DatabaseStorage();