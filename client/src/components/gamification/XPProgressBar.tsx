import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Star, Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPProgressBarProps {
  currentXP: number;
  levelXP: number;
  level: number;
  showLevelUp?: boolean;
  className?: string;
  compact?: boolean;
  dailyXP?: number;
  dailyGoal?: number;
}

// Confetti particle component
const ConfettiParticle = ({ index, color }: { index: number; color: string }) => {
  const randomX = (Math.random() - 0.5) * 400;
  const randomY = Math.random() * -300 - 100;
  const randomRotate = Math.random() * 720;
  
  return (
    <motion.div
      initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
      animate={{ 
        x: randomX, 
        y: randomY,
        rotate: randomRotate,
        scale: 0,
        opacity: 0
      }}
      transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
      className={cn("absolute w-3 h-3 rounded-sm", color)}
      style={{ left: '50%', top: '50%' }}
    />
  );
};

export default function XPProgressBar({
  currentXP,
  levelXP,
  level,
  showLevelUp = false,
  className,
  compact = false,
  dailyXP = 150,
  dailyGoal = 50,
}: XPProgressBarProps) {
  const [displayXP, setDisplayXP] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const progress = Math.min((currentXP / levelXP) * 100, 100);
  const dailyProgress = Math.min((dailyXP / dailyGoal) * 100, 100);
  
  // Confetti colors
  const confettiColors = useMemo(() => [
    "bg-yellow-400", "bg-green-400", "bg-blue-400", 
    "bg-purple-400", "bg-pink-400", "bg-orange-400"
  ], []);

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
      setParticles(Array.from({ length: 30 }, (_, i) => i));
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [showLevelUp]);

  // Compact version for header display
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 cursor-pointer",
          className
        )}
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-0.5 rounded-full border border-dashed border-yellow-400/50"
          />
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">{level}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <motion.span 
              key={displayXP}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-bold text-sm gradient-text-gold"
            >
              {displayXP.toLocaleString()}
            </motion.span>
          </div>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Level Up Celebration - Enhanced */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            {/* Confetti particles */}
            {particles.map((i) => (
              <ConfettiParticle 
                key={i} 
                index={i} 
                color={confettiColors[i % confettiColors.length]} 
              />
            ))}
            
            {/* Level up banner */}
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 blur-xl opacity-50 rounded-2xl" />
              
              <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl border-4 border-yellow-300">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Crown className="w-8 h-8 text-yellow-200" />
                  </motion.div>
                  <div className="text-center">
                    <div className="text-yellow-200 text-sm uppercase tracking-wider">Congratulations!</div>
                    <div className="text-2xl">LEVEL {level}!</div>
                  </div>
                  <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Star className="w-8 h-8 text-yellow-200" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Progress Container - Enhanced Duolingo Style */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm card-3d">
        <div className="flex items-center justify-between mb-4">
          {/* Level Badge - Enhanced */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              {/* Animated ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1.5 rounded-full border-2 border-dashed border-yellow-400/40"
              />
              
              {/* Pulsing glow */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(234, 179, 8, 0)",
                    "0 0 0 10px rgba(234, 179, 8, 0.2)",
                    "0 0 0 0 rgba(234, 179, 8, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30"
              >
                <span className="text-white font-bold text-xl drop-shadow-md">{level}</span>
              </motion.div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Level</p>
              <p className="font-bold text-lg">
                {level < 5 ? "Beginner" : level < 10 ? "Learner" : level < 20 ? "Scholar" : "Master"}
              </p>
            </div>
          </motion.div>

          {/* XP Counter - Enhanced */}
          <motion.div 
            className="text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-end gap-1.5">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-5 h-5 text-yellow-500" />
              </motion.div>
              <motion.span 
                key={displayXP}
                initial={{ scale: 1.3, y: -5 }}
                animate={{ scale: 1, y: 0 }}
                className="font-bold text-2xl gradient-text-gold"
              >
                {displayXP.toLocaleString()}
              </motion.span>
              <span className="text-muted-foreground text-sm font-medium">/ {levelXP.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-primary font-medium">{(levelXP - currentXP).toLocaleString()}</span> XP to level {level + 1}
            </p>
          </motion.div>
        </div>

        {/* Progress Bar - Enhanced Duolingo Style */}
        <div className="relative h-5 bg-muted rounded-full overflow-hidden shadow-inner">
          {/* Shimmer effect */}
          <div className="absolute inset-0 progress-shimmer" />
          
          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-500 via-green-400 to-yellow-400 rounded-full relative"
          >
            {/* Inner highlight */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-400 to-yellow-400 blur-sm opacity-60" />
            
            {/* Sparkle at the end */}
            {progress > 5 && (
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Daily Progress Section */}
        <div className="mt-4 p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Progress</p>
                <p className="font-semibold text-sm">
                  <span className="text-green-500">+{dailyXP}</span> / {dailyGoal} XP
                </p>
              </div>
            </div>
            
            {dailyXP >= dailyGoal && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold"
              >
                <Star className="w-3 h-3 fill-current" />
                Goal Complete!
              </motion.div>
            )}
          </div>
          
          {/* Daily progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                dailyProgress >= 100 
                  ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                  : "bg-gradient-to-r from-blue-500 to-cyan-400"
              )}
            />
          </div>
        </div>

        {/* Quick Stats - Enhanced */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium">+{dailyXP} XP today</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">2x bonus active</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
