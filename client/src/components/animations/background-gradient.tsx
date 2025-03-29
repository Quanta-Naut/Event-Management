import { motion } from "framer-motion";

interface BackgroundGradientProps {
  className?: string;
}

const BackgroundGradient = ({ className }: BackgroundGradientProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div 
        className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30 bg-primary rounded-full blur-[100px]"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.2, 0.3]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
      />
    </div>
  );
};

export default BackgroundGradient;
