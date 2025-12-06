import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Flame, Zap, Target, Award, Crown, Medal,
  Rocket, Brain, Book, Map, Users, Sunrise, Moon, Layers,
  TrendingUp, CheckCircle, GraduationCap, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  isEarned: boolean;
  earnedAt?: Date;
  progress?: number;
  xpReward?: number;
  className?: string;
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  zap: Zap,
  target: Target,
  award: Award,
  crown: Crown,
  medal: Medal,
  rocket: Rocket,
  brain: Brain,
  book: Book,
  map: Map,
  users: Users,
  sunrise: Sunrise,
  moon: Moon,
  layers: Layers,
  "trending-up": TrendingUp,
  "check-circle": CheckCircle,
  "graduation-cap": GraduationCap,
};

const rarityConfig = {
  common: {
    bg: "from-gray-400 to-gray-500",
    border: "border-gray-400",
    glow: "shadow-gray-400/50",
    text: "text-gray-500",
    label: "Common",
  },
  rare: {
    bg: "from-blue-400 to-blue-600",
    border: "border-blue-400",
    glow: "shadow-blue-400/50",
    text: "text-blue-500",
    label: "Rare",
  },
  epic: {
    bg: "from-purple-400 to-purple-600",
    border: "border-purple-400",
    glow: "shadow-purple-400/50",
    text: "text-purple-500",
    label: "Epic",
  },
  legendary: {
    bg: "from-yellow-400 to-orange-500",
    border: "border-yellow-400",
    glow: "shadow-yellow-400/50",
    text: "text-yellow-500",
    label: "Legendary",
  },
};

export default function AchievementBadge({
  name,
  description,
  icon,
  rarity,
  isEarned,
  earnedAt,
  progress = 0,
  xpReward,
  className,
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const Icon = iconMap[icon] || Trophy;
  const config = rarityConfig[rarity];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={cn("relative cursor-pointer", className)}
          >
            {/* Glow effect for earned badges */}
            {isEarned && (
              <motion.div
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "absolute inset-0 rounded-full blur-md",
                  `bg-gradient-to-br ${config.bg}`
                )}
              />
            )}

            {/* Badge Container */}
            <div
              className={cn(
                "relative w-16 h-16 rounded-full flex items-center justify-center",
                isEarned
                  ? `bg-gradient-to-br ${config.bg} shadow-lg ${config.glow}`
                  : "bg-muted border-2 border-dashed border-muted-foreground/30"
              )}
            >
              {/* Rotating border for legendary */}
              {isEarned && rarity === "legendary" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-3px] rounded-full border-2 border-dashed border-yellow-300/50"
                />
              )}

              {/* Sparkle effects for epic+ */}
              {isEarned && (rarity === "epic" || rarity === "legendary") && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [0, (i - 1) * 20],
                        y: [0, -20 - i * 10],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                      className="absolute"
                    >
                      <Star className="w-3 h-3 text-yellow-300" />
                    </motion.div>
                  ))}
                </>
              )}

              {/* Icon */}
              <motion.div
                animate={isEarned && isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {isEarned ? (
                  <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                ) : (
                  <Lock className="w-6 h-6 text-muted-foreground/50" />
                )}
              </motion.div>

              {/* Progress ring for locked badges */}
              {!isEarned && progress > 0 && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-primary/30"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary"
                    initial={{ strokeDasharray: "0 188.5" }}
                    animate={{
                      strokeDasharray: `${(progress / 100) * 188.5} 188.5`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
              )}
            </div>

            {/* Rarity indicator */}
            {isEarned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  `bg-gradient-to-r ${config.bg} text-white shadow-sm`
                )}
              >
                {config.label}
              </motion.div>
            )}

            {/* Progress percentage for locked */}
            {!isEarned && progress > 0 && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-muted px-2 py-0.5 rounded-full text-[10px] font-medium">
                {progress}%
              </div>
            )}
          </motion.div>
        </TooltipTrigger>

        <TooltipContent side="top" className="max-w-xs p-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isEarned
                    ? `bg-gradient-to-br ${config.bg}`
                    : "bg-muted"
                )}
              >
                <Icon className={cn("w-4 h-4", isEarned ? "text-white" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-semibold">{name}</p>
                <p className={cn("text-xs", config.text)}>{config.label}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-2">{description}</p>

            {/* XP Reward */}
            {xpReward && (
              <div className="flex items-center gap-1 text-sm">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">+{xpReward} XP</span>
              </div>
            )}

            {/* Earned date or progress */}
            {isEarned && earnedAt ? (
              <p className="text-xs text-muted-foreground mt-2">
                Earned on {new Date(earnedAt).toLocaleDateString()}
              </p>
            ) : !isEarned && progress > 0 ? (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ) : null}
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Achievement Unlock Animation Component
export function AchievementUnlockAnimation({
  achievement,
  onComplete,
}: {
  achievement: AchievementBadgeProps;
  onComplete: () => void;
}) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const config = rarityConfig[achievement.rarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="bg-card rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
      >
        {/* Confetti burst */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 300,
              scale: [0, 1, 0],
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn(
              "absolute w-3 h-3 rounded-full",
              i % 4 === 0 && "bg-yellow-400",
              i % 4 === 1 && "bg-primary",
              i % 4 === 2 && "bg-green-400",
              i % 4 === 3 && "bg-purple-400"
            )}
          />
        ))}

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="text-4xl mb-4"
        >
          🎉
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>

        <motion.div
          animate={{
            boxShadow: [
              `0 0 0 0 ${config.glow}`,
              `0 0 30px 10px ${config.glow}`,
              `0 0 0 0 ${config.glow}`,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center",
            `bg-gradient-to-br ${config.bg}`
          )}
        >
          <Icon className="w-12 h-12 text-white" />
        </motion.div>

        <h3 className="text-xl font-semibold mb-1">{achievement.name}</h3>
        <p className="text-muted-foreground mb-4">{achievement.description}</p>

        {achievement.xpReward && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full font-semibold"
          >
            <Zap className="w-5 h-5" />
            +{achievement.xpReward} XP
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
