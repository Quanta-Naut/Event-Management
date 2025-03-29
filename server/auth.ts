import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User } from "@shared/schema";

// For TypeScript integration with passport
declare global {
  namespace Express {
    // Use the User type from schema
    interface User extends Omit<import("@shared/schema").User, never> {}
  }
}

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const SESSION_SECRET = process.env.SESSION_SECRET || "your_session_secret";

// Password hashing function
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Password comparison function
export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  const [hashedPwd, salt] = hash.split(".");
  const hashedBuf = Buffer.from(hashedPwd, "hex");
  const suppliedBuf = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// JWT token generation
export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// JWT token verification
export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch (error) {
    return null;
  }
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }

  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (payload) {
      storage.getUser(payload.id)
        .then(user => {
          if (user) {
            req.user = user;
            return next();
          }
          res.status(401).json({ message: "Unauthorized" });
        })
        .catch(() => {
          res.status(401).json({ message: "Unauthorized" });
        });
      return;
    }
  }

  res.status(401).json({ message: "Unauthorized" });
}

// Setup Authentication
export function setupAuth(app: Express): void {
  // Configure session
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Return user without password
        const safeUser = { id: user.id, username: user.username };
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // Log user in
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Return user without password
        const safeUser = { id: user.id, username: user.username };
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      next(error);
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user route
  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id, username } = req.user;
    res.json({ id, username });
  });
}