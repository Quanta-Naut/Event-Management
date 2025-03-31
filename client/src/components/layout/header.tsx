import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { smoothScrollToElement } from "@/lib/utils";

interface HeaderProps {
  toggleMobileMenu: () => void;
  toggleCommandBar: () => void;
}

const Header = ({ toggleMobileMenu, toggleCommandBar }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  // Handle scroll event to update header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard shortcut for command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandBar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandBar]);

  // Function to scroll to contact section
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 backdrop-blur-lg ${
        isScrolled 
          ? "bg-background/80 border-border" 
          : "bg-transparent border-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 md:px-6 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="mr-8">
            <div className="flex items-center">
              <img src="/asiri/logo.svg" alt="Asiri Events" className="h-12 w-auto" />
            </div>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <ScrollLink
              href="/#portfolio"
              label="Portfolio"
              isActive={location === "/#portfolio"}
            />
            <ScrollLink
              href="/#services"
              label="Services"
              isActive={location === "/#services"}
            />
            <ScrollLink
              href="/#testimonials"
              label="Testimonials"
              isActive={location === "/#testimonials"}
            />
            <ScrollLink
              href="/#contact"
              label="Contact"
              isActive={location === "/#contact"}
            />
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center"
            onClick={toggleCommandBar}
          >
            <span>Search</span>
            <kbd className="ml-3 px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd>
          </Button>
          <Button 
            className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            onClick={scrollToContact}
          >
            Book an Event
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

interface ScrollLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

const ScrollLink = ({ href, label, isActive }: ScrollLinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace(/\/#/, "");
    smoothScrollToElement(targetId, { 
      offsetPx: 80,
      duration: 1000
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`text-sm transition-colors relative ${
        isActive 
          ? "bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500" 
          : "text-gray-300 hover:text-primary"
      }`}
    >
      {label}
      {isActive && (
        <motion.span
          className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-purple-500"
          layoutId="navbar-indicator"
        />
      )}
    </a>
  );
};

export default Header;
