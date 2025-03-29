import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  // Close menu when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <motion.div
      className="fixed inset-0 z-[90]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        className="absolute top-0 right-0 w-64 h-full bg-card transform"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            EventForge
          </h1>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-3">
            <MobileMenuItem href="/" label="Home" onClick={onClose} />
            <MobileMenuItem href="/#portfolio" label="Portfolio" onClick={onClose} />
            <MobileMenuItem href="/#services" label="Services" onClick={onClose} />
            <MobileMenuItem href="/#testimonials" label="Testimonials" onClick={onClose} />
            <MobileMenuItem href="/#contact" label="Contact" onClick={onClose} />
          </ul>
          
          <div className="mt-6 pt-6 border-t border-border">
            <Button className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/20">
              Book an Event
            </Button>
          </div>
        </nav>
      </motion.div>
    </motion.div>
  );
};

interface MobileMenuItemProps {
  href: string;
  label: string;
  onClick: () => void;
}

const MobileMenuItem = ({ href, label, onClick }: MobileMenuItemProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.includes('#')) {
      e.preventDefault();
      onClick();
      
      setTimeout(() => {
        const targetId = href.replace(/\/#/, "");
        const element = document.getElementById(targetId);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }, 300); // Wait for the menu to close
    }
  };
  
  return (
    <li>
      <a
        href={href}
        onClick={handleClick}
        className="block py-2 text-gray-200 hover:text-white transition-colors"
      >
        {label}
      </a>
    </li>
  );
};

export default MobileMenu;
