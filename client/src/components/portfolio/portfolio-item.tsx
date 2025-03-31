import { motion } from "framer-motion";
import { type PortfolioItem as PortfolioItemType } from "@shared/schema";
import { useState } from "react";

interface PortfolioItemProps {
  item: PortfolioItemType;
  onClick: (id: number) => void;
}

const PortfolioItem = ({ item, onClick }: PortfolioItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load image: ${item.imageUrl}`);
  };
  
  return (
    <motion.div
      className="group relative bg-card rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(item.id)}
      role="button"
      aria-label={`View details for ${item.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item.id);
        }
      }}
    >
      <div className="relative aspect-[4/3]">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <span className="sr-only">Loading image...</span>
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.description || `${item.title} event`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy" // Browser-level lazy loading
          />
        )}
        
        {/* Always show title on mobile, hover on desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.category}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PortfolioItem;
