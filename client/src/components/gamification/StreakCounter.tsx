import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  streakFreezes?: number;
  className?: string;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  lastActivityDate,
  streakFreezes = 2,
  className,
}: StreakCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFlames, setShowFlames] = useState(false);

  // Determine streak status
  const today = new Date().toDateString();
  const lastActivity = lastActivityDate ? new Date(lastActivityDate).toDateString() : null;
  const isActiveToday = lastActivity === today;
  const isAtRisk = !isActiveToday && currentStreak > 0;

  // Flame intensity based on streak
  const flameIntensity = currentStreak >= 30 ? "legendary" : 
                         currentStreak >= 14 ? "epic" : 
                         currentStreak >= 7 ? "hot" : "warm";

  useEffect(() => {
    if (currentStreak > 0) {
      setShowFlames(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  // Generate week calendar
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const today_index = new Date().getDay();
  const adjustedIndex = today_index === 0 ? 6 : today_index - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card border rounded-2xl p-4 shadow-sm relative overflow-hidden", className)}
    >
      {/* Background flame effect for high streaks */}
      {currentStreak >= 7 && (
        <motion.div
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent pointer-events-none"
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Animated Flame */}
            <div className="relative">
              <motion.div
                animate={showFlames ? {
                  scale: [1, 1.1, 1],
                  rotate: [-5, 5, -5]
                } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center",
                  flameIntensity === "legendary" && "bg-gradient-to-br from-purple-500 to-pink-500",
                  flameIntensity === "epic" && "bg-gradient-to-br from-orange-500 to-red-500",
                  flameIntensity === "hot" && "bg-gradient-to-br from-orange-400 to-orange-600",
                  flameIntensity === "warm" && "bg-gradient-to-br from-yellow-400 to-orange-400",
                  currentStreak === 0 && "bg-muted"
                )}
              >
                <motion.div
                  animate={currentStreak > 0 ? {
                    y: [0, -3, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Flame className={cn(
                    "w-8 h-8",
                    currentStreak > 0 ? "text-white" : "text-muted-foreground"
                  )} />
                </motion.div>
              </motion.div>
              
              {/* Streak number badge */}
              {currentStreak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 shadow-lg border-2 border-orange-400"
                >
                  <span className="text-sm font-bold text-orange-500">{currentStreak}</span>
                </motion.div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-lg">
                {currentStreak === 0 ? "Start Your Streak!" : `${currentStreak} Day Streak!`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isActiveToday ? "You're on fire today! 🔥" : 
                 isAtRisk ? "Complete a lesson to keep your streak!" :
                 "Learn something new today"}
              </p>
            </div>
          </div>

          {/* Streak Freezes */}
          {streakFreezes > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-full"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{streakFreezes}</span>
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
