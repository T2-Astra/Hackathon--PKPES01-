import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, Shield, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  streakFreezes?: number;
  className?: string;
  compact?: boolean;
}

// Fire particle component for the animated effect
const FireParticle = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
    animate={{ 
      y: -30 - Math.random() * 20, 
      x: (Math.random() - 0.5) * 20,
      opacity: 0,
      scale: 0
    }}
    transition={{ 
      duration: 0.8 + Math.random() * 0.4,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 0.5
    }}
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, #FFD700 0%, #FF6B00 50%, #FF4500 100%)`,
      bottom: '30%',
      left: `${40 + Math.random() * 20}%`,
    }}
  />
);

export default function StreakCounter({
  currentStreak,
  longestStreak,
  lastActivityDate,
  streakFreezes = 2,
  className,
  compact = false,
}: StreakCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFlames, setShowFlames] = useState(false);
  const [displayStreak, setDisplayStreak] = useState(0);

  // Determine streak status
  const today = new Date().toDateString();
  const lastActivity = lastActivityDate ? new Date(lastActivityDate).toDateString() : null;
  const isActiveToday = lastActivity === today;
  const isAtRisk = !isActiveToday && currentStreak > 0;

  // Flame intensity based on streak
  const flameIntensity = currentStreak >= 30 ? "legendary" : 
                         currentStreak >= 14 ? "epic" : 
                         currentStreak >= 7 ? "hot" : "warm";

  // Generate fire particles
  const fireParticles = useMemo(() => 
    Array.from({ length: currentStreak > 0 ? 8 : 0 }, (_, i) => ({
      id: i,
      delay: i * 0.1,
      size: 4 + Math.random() * 4
    })), [currentStreak > 0]
  );

  // Animate streak number counting up
  useEffect(() => {
    if (currentStreak > 0) {
      setShowFlames(true);
      setIsAnimating(true);
      
      // Animate number counting up
      const duration = 500;
      const steps = Math.min(currentStreak, 20);
      const increment = currentStreak / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= currentStreak) {
          setDisplayStreak(currentStreak);
          clearInterval(timer);
        } else {
          setDisplayStreak(Math.floor(current));
        }
      }, duration / steps);
      
      const animTimer = setTimeout(() => setIsAnimating(false), 1000);
      return () => {
        clearTimeout(animTimer);
        clearInterval(timer);
      };
    } else {
      setDisplayStreak(0);
    }
  }, [currentStreak]);

  // Generate week calendar
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const today_index = new Date().getDay();
  const adjustedIndex = today_index === 0 ? 6 : today_index - 1;

  // Compact version for header/sidebar
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer",
          currentStreak > 0 
            ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30" 
            : "bg-muted",
          className
        )}
      >
        {/* Fire particles for compact view */}
        {currentStreak > 0 && (
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            {fireParticles.slice(0, 3).map(p => (
              <FireParticle key={p.id} delay={p.delay} size={p.size * 0.6} />
            ))}
          </div>
        )}
        
        <motion.div
          animate={currentStreak > 0 ? { 
            scale: [1, 1.15, 1],
            rotate: [-3, 3, -3]
          } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="relative z-10"
        >
          <Flame className={cn(
            "w-6 h-6",
            currentStreak > 0 ? "text-orange-500 fire-animate" : "text-muted-foreground"
          )} />
        </motion.div>
        
        <motion.span 
          key={displayStreak}
          initial={{ scale: 1.3, y: -5 }}
          animate={{ scale: 1, y: 0 }}
          className={cn(
            "font-bold text-lg relative z-10",
            currentStreak > 0 ? "gradient-text-gold" : "text-muted-foreground"
          )}
        >
          {displayStreak}
        </motion.span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card border rounded-2xl p-4 shadow-sm relative overflow-hidden card-3d", className)}
    >
      {/* Background flame effect for high streaks */}
      {currentStreak >= 7 && (
        <motion.div
          animate={{ 
            opacity: [0.1, 0.25, 0.1],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-t from-orange-500/30 via-red-500/10 to-transparent pointer-events-none"
        />
      )}

      {/* Fire particles */}
      {currentStreak > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireParticles.map(p => (
            <FireParticle key={p.id} delay={p.delay} size={p.size} />
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Animated Flame - Enhanced Duolingo Style */}
            <div className="relative">
              {/* Outer glow ring */}
              {currentStreak > 0 && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={cn(
                    "absolute inset-0 rounded-full blur-md",
                    flameIntensity === "legendary" && "bg-purple-500",
                    flameIntensity === "epic" && "bg-orange-500",
                    flameIntensity === "hot" && "bg-orange-400",
                    flameIntensity === "warm" && "bg-yellow-400"
                  )}
                />
              )}
              
              <motion.div
                animate={showFlames ? {
                  scale: [1, 1.1, 1],
                  rotate: [-5, 5, -5]
                } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center relative",
                  flameIntensity === "legendary" && "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-lg shadow-purple-500/50",
                  flameIntensity === "epic" && "bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 shadow-lg shadow-orange-500/50",
                  flameIntensity === "hot" && "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-400/50",
                  flameIntensity === "warm" && "bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 shadow-lg shadow-yellow-400/50",
                  currentStreak === 0 && "bg-muted"
                )}
              >
                <motion.div
                  animate={currentStreak > 0 ? {
                    y: [0, -4, 0],
                    scale: [1, 1.15, 1]
                  } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Flame className={cn(
                    "w-9 h-9",
                    currentStreak > 0 ? "text-white drop-shadow-lg" : "text-muted-foreground"
                  )} />
                </motion.div>
                
                {/* Sparkles for legendary streaks */}
                {flameIntensity === "legendary" && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 left-1/2 -translate-x-1/2" />
                    </motion.div>
                  </>
                )}
              </motion.div>
              
              {/* Streak number badge - Enhanced */}
              {currentStreak > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full px-2.5 py-1 shadow-lg border-2 border-orange-400"
                >
                  <motion.span 
                    key={displayStreak}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-bold text-orange-500"
                  >
                    {displayStreak}
                  </motion.span>
                </motion.div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-lg">
                {currentStreak === 0 ? "Start Your Streak!" : (
                  <span className="flex items-center gap-1">
                    <motion.span
                      key={displayStreak}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {displayStreak}
                    </motion.span>
                    <span>Day Streak!</span>
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isActiveToday ? "You're on fire today! 🔥" : 
                 isAtRisk ? "Complete a lesson to keep your streak!" :
                 "Learn something new today"}
              </p>
            </div>
          </div>

          {/* Streak Freezes - Enhanced */}
          {streakFreezes > 0 && (
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-500 px-3 py-2 rounded-xl border border-blue-500/30 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-bold">{streakFreezes}</span>
            </motion.div>
          )}
        </div>

        {/* Week Calendar */}
        <div className="bg-muted/50 rounded-xl p-3 mb-4">
          <div className="flex justify-between">
            {weekDays.map((day, index) => {
              const isPast = index < adjustedIndex;
              const isToday = index === adjustedIndex;
              const isCompleted = isPast || (isToday && isActiveToday);
              
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isCompleted && "bg-gradient-to-br from-orange-400 to-orange-600",
                      isToday && !isActiveToday && "border-2 border-dashed border-orange-400 bg-orange-400/10",
                      !isCompleted && !isToday && "bg-muted"
                    )}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Flame className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : isToday ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="w-4 h-4 text-orange-400" />
                      </motion.div>
                    ) : null}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Longest: </span>
            <span className="font-semibold text-orange-500">{longestStreak} days</span>
          </div>
          
          {currentStreak >= 7 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-green-500"
            >
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">2x XP Bonus!</span>
            </motion.div>
          )}
        </div>

        {/* At Risk Warning */}
        <AnimatePresence>
          {isAtRisk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-orange-500">
                <motion.div
                  animate={{ rotate: [-10, 10, -10] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Flame className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-medium">
                  Your streak is at risk! Complete a lesson now.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
