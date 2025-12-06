import { motion } from "framer-motion";
import { Flame, Zap, Star, Heart, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationHeaderProps {
  streak?: number;
  xp?: number;
  level?: number;
  hearts?: number;
  gems?: number;
  className?: string;
}

export default function GamificationHeader({
  streak = 0,
  xp = 0,
  level = 1,
  hearts = 5,
  gems = 100,
  className,
}: GamificationHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Streak Counter */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all",
          streak > 0 
            ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30" 
            : "bg-muted"
        )}
      >
        {/* Fire particles */}
        {streak > 0 && (
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -15, opacity: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="absolute w-1 h-1 rounded-full bg-orange-400"
                style={{
                  left: `${45 + i * 10}%`,
                  bottom: '40%',
                }}
              />
            ))}
          </div>
        )}
        
        <motion.div
          animate={streak > 0 ? { 
            scale: [1, 1.1, 1],
            rotate: [-2, 2, -2]
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Flame className={cn(
            "w-5 h-5",
            streak > 0 ? "text-orange-500" : "text-muted-foreground"
          )} />
        </motion.div>
        
        <span className={cn(
          "font-bold text-sm",
          streak > 0 ? "text-orange-500" : "text-muted-foreground"
        )}>
          {streak}
        </span>
      </motion.div>

      {/* XP/Level Display */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 cursor-pointer"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-0.5 rounded-full border border-dashed border-yellow-400/40"
          />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">{level}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-sm text-yellow-600 dark:text-yellow-400">
            {xp.toLocaleString()}
          </span>
        </div>
      </motion.div>

      {/* Hearts (Lives) */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 cursor-pointer"
      >
        <Heart className={cn(
          "w-5 h-5",
          hearts > 0 ? "text-red-500 fill-red-500" : "text-muted-foreground"
        )} />
        <span className={cn(
          "font-bold text-sm",
          hearts > 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {hearts}
        </span>
      </motion.div>

      {/* Gems (Currency) */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 cursor-pointer"
      >
        <Gem className="w-5 h-5 text-blue-500" />
        <span className="font-bold text-sm text-blue-500">
          {gems.toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}
