import { useState } from "react";
import { motion } from "framer-motion";
import { type Testimonial } from "@shared/schema";

interface TestimonialCardProps {
  testimonial: Testimonial;
  isActive: boolean;
}

const TestimonialCard = ({ testimonial, isActive }: TestimonialCardProps) => {
  return (
    <motion.div
      className={`min-w-[325px] md:min-w-[400px] snap-center bg-card p-6 rounded-xl card-hover h-full flex flex-col ${
        isActive ? "ring-1 ring-primary/50 shadow-lg shadow-primary/10" : ""
      }`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-full">
        <RatingStars rating={testimonial.rating} />
        
        <blockquote className="mb-4 text-muted-foreground italic">
          "{testimonial.content}"
        </blockquote>
        
        <div className="flex items-center mt-auto">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
            {testimonial.avatarInitials}
          </div>
          <div className="ml-3">
            <p className="font-medium">{testimonial.author}</p>
            <p className="text-sm text-muted-foreground">{testimonial.position}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface RatingStarsProps {
  rating: number;
}

const RatingStars = ({ rating }: RatingStarsProps) => {
  // Ensure rating is between 0 and 5
  const safeRating = Math.min(5, Math.max(0, rating));
  
  return (
    <div className="flex items-center space-x-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} filled={i < safeRating} />
      ))}
    </div>
  );
};

interface StarProps {
  filled: boolean;
}

const Star = ({ filled }: StarProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${filled ? "text-yellow-400" : "text-gray-400"}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default TestimonialCard;
