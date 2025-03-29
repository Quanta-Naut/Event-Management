import { 
  users, type User, type InsertUser,
  portfolioItems, type PortfolioItem, type InsertPortfolioItem,
  testimonials, type Testimonial, type InsertTestimonial,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import { generatePasswordHash } from "./auth";

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
}

// Initialize the database with sample data

async function initializeSampleData() {
  // Check if we already have data
  const existingPortfolioItems = await db.select().from(portfolioItems);
  if (existingPortfolioItems.length > 0) {
    console.log("Sample data already exists, skipping initialization");
    
    // Check if we have a default admin user, create one if not
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log("Creating default admin user...");
      const hashedPassword = await generatePasswordHash("admin123");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword
      });
      console.log("Default admin user created");
    }
    
    return;
  }

  console.log("Initializing sample data in the database...");
  
  // Create default admin user
  const hashedPassword = await generatePasswordHash("admin123");
  await db.insert(users).values({
    username: "admin",
    password: hashedPassword
  });
  console.log("Default admin user created");
  
  // Sample portfolio items
  const portfolioSamples: InsertPortfolioItem[] = [
    {
      title: "Annual Tech Summit",
      category: "Corporate Conference",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000&q=80",
      description: "A premier tech industry gathering hosting over 1,500 professionals from leading companies.",
      overview: "A premier tech industry gathering hosting over 1,500 professionals from leading companies. The event featured keynote speakers, panel discussions, and interactive workshops across three days.",
      role: ["Full venue coordination and management", "Speaker and VIP logistics coordination", "Custom stage and multimedia production", "Catering and refreshment services", "Networking event facilitation", "Technical support throughout the conference"],
      results: "The summit received a 94% satisfaction rating from attendees, with 87% expressing intent to return for the next event. Speaker engagement metrics exceeded industry averages by 23%.",
      tags: ["Technology", "Corporate", "Conference"],
      featured: true
    },
    {
      title: "Johnson Wedding",
      category: "Luxury Wedding",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=450&q=80",
      description: "An elegant wedding with custom floral arrangements and live entertainment.",
      overview: "A luxury wedding celebration for 200 guests featuring bespoke decor, gourmet catering, and seamless coordination of all vendors and entertainment.",
      role: ["Complete wedding planning and coordination", "Custom decor and floral design", "Vendor selection and management", "Day-of coordination and timeline management", "Guest experience planning"],
      results: "Created a flawless celebration that exceeded the couple's expectations while managing all logistics and vendor coordination without a single issue.",
      tags: ["Wedding", "Luxury", "Celebration"],
      featured: true
    },
    {
      title: "SoundWave Festival",
      category: "Music Festival",
      imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=450&q=80",
      description: "A three-day music festival featuring over 40 artists across multiple stages.",
      overview: "A major music festival attracting over 25,000 attendees daily with multiple stages, food vendors, and interactive experiences.",
      role: ["Complete festival logistics and production", "Artist coordination and scheduling", "Security and crowd management", "Vendor management", "Stage production"],
      results: "Successfully managed one of the region's largest music festivals with zero safety incidents and 92% positive attendee feedback.",
      tags: ["Music", "Festival", "Entertainment"],
      featured: false
    },
    {
      title: "Nova Phone Launch",
      category: "Product Launch",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=450&q=80",
      description: "A high-profile product launch event with media coverage and interactive demos.",
      overview: "A high-profile product launch for a major tech company's flagship smartphone, featuring interactive demo stations, media presentations, and VIP reception.",
      role: ["Event concept development", "Media coordination", "Demo station setup", "Technical production", "Celebrity host management"],
      results: "Generated over 3 million social media impressions and secured coverage in 45+ major tech publications.",
      tags: ["Technology", "Product Launch", "Corporate"],
      featured: false
    },
    {
      title: "Hope Foundation Gala",
      category: "Charity Event",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=450&q=80",
      description: "An annual fundraising gala that raised over $1.2 million for youth education programs.",
      overview: "An elegant charity gala dinner for 500 guests with silent and live auctions, entertainment, and fundraising activities.",
      role: ["Full event planning and coordination", "Fundraising strategy", "Auction management", "Sponsor coordination", "Entertainment booking"],
      results: "Raised 40% more funds than the previous year, with a total of $1.2 million for youth education initiatives.",
      tags: ["Charity", "Fundraising", "Gala"],
      featured: false
    },
    {
      title: "Apex Team Retreat",
      category: "Corporate Retreat",
      imageUrl: "https://images.unsplash.com/photo-1560439514-4e9645039924?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=450&q=80",
      description: "A three-day corporate retreat focused on team building and strategic planning.",
      overview: "A comprehensive corporate retreat for 120 executives including workshops, team-building activities, and wellness sessions at a luxury resort.",
      role: ["Location scouting and selection", "Activity planning and facilitation", "Accommodation and travel coordination", "Meeting space setup", "Wellness program development"],
      results: "Post-event survey showed a 35% improvement in team cohesion metrics and 28% increase in strategic alignment scores.",
      tags: ["Corporate", "Retreat", "Team Building"],
      featured: false
    }
  ];

  // Sample testimonials
  const testimonialSamples: InsertTestimonial[] = [
    {
      rating: 5,
      content: "EventForge made our corporate anniversary event absolutely flawless. Their attention to detail and creativity exceeded our expectations.",
      author: "Sarah Bennett",
      position: "Marketing Director, TechCorp",
      avatarInitials: "SB"
    },
    {
      rating: 5,
      content: "Our wedding was a dream come true thanks to EventForge. They handled everything with such care and professionalism.",
      author: "Alex & Maya Rodriguez",
      position: "Wedding Clients",
      avatarInitials: "AM"
    },
    {
      rating: 5,
      content: "The SoundWave Festival was a massive undertaking, but EventForge managed it brilliantly. From logistics to artist coordination, they nailed every aspect.",
      author: "Jason Lee",
      position: "Event Director, Rhythm Productions",
      avatarInitials: "JL"
    },
    {
      rating: 5,
      content: "Our fundraising gala raised 40% more than last year, and I credit EventForge's strategic planning and execution. They understood our mission and delivered perfectly.",
      author: "Elena Martinez",
      position: "Director, Hope Foundation",
      avatarInitials: "EM"
    }
  ];

  // Insert sample data
  for (const item of portfolioSamples) {
    await db.insert(portfolioItems).values(item);
  }
  
  for (const item of testimonialSamples) {
    await db.insert(testimonials).values(item);
  }

  console.log("Sample data initialization complete");
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize sample data when the storage is created
    initializeSampleData().catch(err => {
      console.error("Failed to initialize sample data:", err);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(asc(users.id));
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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      return false;
    }
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Portfolio methods
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return db.select().from(portfolioItems).orderBy(asc(portfolioItems.id));
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    const [item] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id));
    return item;
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [portfolioItem] = await db.insert(portfolioItems).values(item).returning();
    return portfolioItem;
  }

  async updatePortfolioItem(id: number, update: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const [updatedItem] = await db
      .update(portfolioItems)
      .set(update)
      .where(eq(portfolioItems.id, id))
      .returning();
    
    return updatedItem;
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
    return true; // Always return true for consistent behavior
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return db.select().from(testimonials).orderBy(asc(testimonials.id));
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }

  async updateTestimonial(id: number, update: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [updatedTestimonial] = await db
      .update(testimonials)
      .set(update)
      .where(eq(testimonials.id, id))
      .returning();
    
    return updatedTestimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return true; // Always return true for consistent behavior
  }

  // Contact submissions methods
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(asc(contactSubmissions.id));
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
    return submission;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [contactSubmission] = await db
      .insert(contactSubmissions)
      .values({
        ...submission,
        read: false,
      })
      .returning();
    
    return contactSubmission;
  }

  async markContactSubmissionAsRead(id: number): Promise<ContactSubmission | undefined> {
    const [updatedSubmission] = await db
      .update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, id))
      .returning();
    
    return updatedSubmission;
  }

  async deleteContactSubmission(id: number): Promise<boolean> {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
    return true; // Always return true for consistent behavior
  }
}

// Use the DatabaseStorage implementation instead of MemStorage
export const storage = new DatabaseStorage();
