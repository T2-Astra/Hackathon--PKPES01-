import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPProgressBarProps {
  currentXP: number;
  levelXP: number;
  level: number;
  showLevelUp?: boolean;
  className?: string;
}

export default function XPProgressBar({
  currentXP,
  levelXP,
  level,
  showLevelUp = false,
  className,
}: XPProgressBarProps) {
  const [displayXP, setDisplayXP] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const progress = Math.min((currentXP / levelXP) * 100, 100);

  // Animate XP counter
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = currentXP / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= currentXP) {
        setDisplayXP(currentXP);
        clearInterval(timer);
      } else {
        setDisplayXP(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentXP]);

  // Show celebration on level up
  useEffect(() => {
    if (showLevelUp) {
      setShowCelebration(true);
      setParticles(Array.from({ length: 20 }, (_, i) => i));
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [showLevelUp]);

  return (
    <div className={cn("relative", className)}>
      {/* Level Up Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            {/* Confetti particles */}
            {particles.map((i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  rotate: 0 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 1.5,
                  ease: "easeOut"
                }}
                className={cn(
                  "absolute w-3 h-3 rounded-full",
                  i % 4 === 0 && "bg-yellow-400",
                  i % 4 === 1 && "bg-primary",
                  i % 4 === 2 && "bg-green-400",
                  i % 4 === 3 && "bg-purple-400"
                )}
              />
            ))}
            
            {/* Level up text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 animate-spin" />
                LEVEL UP!
                <Star className="w-5 h-5 animate-spin" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Progress Container */}
      <div className="bg-card border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          {/* Level Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(234, 179, 8, 0)",
                    "0 0 0 8px rgba(234, 179, 8, 0.2)",
                    "0 0 0 0 rgba(234, 179, 8, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">{level}</span>
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1 rounded-full border-2 border-dashed border-yellow-400/30"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Level</p>
              <p className="font-semibold">
                {level < 5 ? "Beginner" : level < 10 ? "Learner" : level < 20 ? "Scholar" : "Master"}
              </p>
            </div>
          </motion.div>

          {/* XP Counter */}
          <motion.div 
            className="text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-1 text-primary">
              <Zap className="w-4 h-4" />
              <motion.span 
                key={displayXP}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-bold text-xl"
              >
                {displayXP.toLocaleString()}
              </motion.span>
              <span className="text-muted-foreground text-sm">/ {levelXP.toLocaleString()} XP</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {levelXP - currentXP} XP to next level
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          {/* Animated background shimmer */}
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          
          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary via-primary to-yellow-400 rounded-full relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-yellow-400 blur-sm opacity-50" />
            
            {/* Sparkle at the end */}
            {progress > 5 && (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>+150 XP today</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span>2x bonus active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
