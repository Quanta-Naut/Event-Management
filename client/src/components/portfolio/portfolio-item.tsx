import { motion } from "framer-motion";
import { type PortfolioItem as PortfolioItemType } from "@shared/schema";

interface PortfolioItemProps {
  item: PortfolioItemType;
  onClick: (id: number) => void;
}

const PortfolioItem = ({ item, onClick }: PortfolioItemProps) => {
  return (
    <motion.div
      className="group relative bg-card rounded-xl overflow-hidden card-hover cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(item.id)}
    >
      <div className="relative aspect-[4/3]">
        <img
          src={item.imageUrl}
          alt={item.description}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.category}</p>
            <div className="mt-2">
              <span className="inline-block text-xs text-primary bg-primary/20 px-2 py-1 rounded">Click to view details</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PortfolioItem;
