import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { type PortfolioItem } from "@shared/schema";

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: number;
}

const PortfolioModal = ({ isOpen, onClose, portfolioId }: PortfolioModalProps) => {
  // Fetch portfolio item data
  const { data: item, isLoading, error } = useQuery<PortfolioItem>({
    queryKey: ['/api/portfolio', portfolioId],
    enabled: portfolioId !== null,
  });

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent scrolling when modal is open
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
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          className="relative bg-card rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            className="absolute top-4 right-4 z-10 rounded-full w-8 h-8 p-0"
            variant="ghost"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {isLoading ? (
              <LoadingPortfolioModal />
            ) : error ? (
              <ErrorState onClose={onClose} />
            ) : item ? (
              <>
                <div className="md:w-1/2 h-64 md:h-auto">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-primary font-medium mb-4">{item.category}</p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Event Overview</h4>
                      <p className="text-muted-foreground">
                        {item.overview}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-2">Our Role</h4>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                        {item.role && Array.isArray(item.role) && item.role.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-2">Results</h4>
                      <p className="text-muted-foreground">
                        {item.results}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.tags && Array.isArray(item.tags) && item.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center w-full">
                <p>Portfolio item not found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const LoadingPortfolioModal = () => (
  <>
    <div className="md:w-1/2 h-64 md:h-auto">
      <Skeleton className="w-full h-full" />
    </div>

    <div className="md:w-1/2 p-6 md:p-8">
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/3 mb-6" />

      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  </>
);

const ErrorState = ({ onClose }: { onClose: () => void }) => (
  <div className="p-8 text-center w-full">
    <p className="text-lg text-red-500 mb-4">Error loading portfolio data</p>
    <Button onClick={onClose}>Close</Button>
  </div>
);

export default PortfolioModal;
