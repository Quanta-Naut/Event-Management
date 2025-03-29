import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useCommandBar } from "@/lib/hooks/use-command-bar";

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Command = {
  id: string;
  type: "page" | "action";
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
};

const CommandBar = ({ isOpen, onClose }: CommandBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { commands } = useCommandBar({ onClose });

  // Filter commands based on search query
  const filteredCommands = commands.filter((command) => {
    if (!searchQuery) return true;
    return (
      command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group commands by type
  const pageCommands = filteredCommands.filter((cmd) => cmd.type === "page");
  const actionCommands = filteredCommands.filter((cmd) => cmd.type === "action");

  // Close command bar when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent scrolling when command bar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-0 flex items-start justify-center pt-[15vh]">
        <motion.div
          className="relative bg-card rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl border border-border"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="p-4 border-b border-border flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-muted-foreground mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent border-none w-full focus:outline-none text-foreground"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">ESC</kbd>
            </button>
          </div>
          
          <div className="py-2 max-h-[60vh] overflow-y-auto">
            {pageCommands.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground uppercase">Pages</div>
                {pageCommands.map((command) => (
                  <CommandItem key={command.id} command={command} />
                ))}
              </>
            )}
            
            {actionCommands.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground uppercase mt-2">Actions</div>
                {actionCommands.map((command) => (
                  <CommandItem key={command.id} command={command} />
                ))}
              </>
            )}
            
            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface CommandItemProps {
  command: Command;
}

const CommandItem = ({ command }: CommandItemProps) => {
  return (
    <div
      className="px-4 py-3 hover:bg-muted/50 flex items-center cursor-pointer"
      onClick={() => command.action()}
    >
      <span className="text-muted-foreground mr-3">{command.icon}</span>
      <span>{command.title}</span>
      <span className="ml-auto text-xs text-muted-foreground">{command.description}</span>
    </div>
  );
};

export default CommandBar;
