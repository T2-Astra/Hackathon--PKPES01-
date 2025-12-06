import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Flame, Star, Crown, Zap, Gift, Target, ChevronDown, X, CheckCircle2, Coins
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";
import { cn } from "@/lib/utils";

// Animated number component
const AnimatedNumber = ({ value, className }: { value: number; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const diff = value - displayValue;
      const steps = Math.min(Math.abs(diff), 20);
      const increment = diff / steps;
      let current = displayValue;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += increment;
        setDisplayValue(Math.round(current));
        if (step >= steps) {
          setDisplayValue(value);
          setIsAnimating(false);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [value]);

  return (
    <motion.span
      className={className}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

// Streak Fire with pulse animation
const StreakFire = ({ streak }: { streak: number }) => (
  <motion.div
    className="relative flex items-center gap-1"
    whileHover={{ scale: 1.05 }}
  >
    {streak > 0 && (
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute -inset-1 bg-orange-500/30 rounded-full blur-md"
      />
    )}
    <motion.div
      animate={streak > 0 ? { rotate: [0, -5, 5, 0] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
    >
      <Flame className={cn("w-5 h-5", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
    </motion.div>
    <span className={cn("font-bold text-sm", streak > 0 ? "text-orange-500" : "text-muted-foreground")}>
      {streak}
    </span>
  </motion.div>
);

// XP Progress Bar with animation
const XPBar = ({ xp, level, nextLevelXp }: { xp: number; level: number; nextLevelXp: number }) => {
  const progress = (xp / nextLevelXp) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-xs font-bold text-primary-foreground">Lv</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-background border border-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-primary">
          {level}
        </div>
      </div>
      <div className="w-20 hidden sm:block">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 text-center">{xp}/{nextLevelXp}</p>
      </div>
    </div>
  );
};

// Daily Quest Item
const QuestItem = ({ title, progress, total, xp, completed }: { 
  title: string; progress: number; total: number; xp: number; completed: boolean 
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all",
      completed ? "bg-green-500/10" : "bg-muted/50"
    )}
  >
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
      completed ? "bg-green-500" : "bg-primary/20"
    )}>
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-white" />
      ) : (
        <Target className="w-4 h-4 text-primary" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        <Progress value={(progress / total) * 100} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground">{progress}/{total}</span>
      </div>
    </div>
    <span className={cn(
      "text-xs font-bold px-2 py-0.5 rounded-full",
      completed ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"
    )}>
      +{xp} XP
    </span>
  </motion.div>
);

export default function GameHUD() {
  const { user } = useAuth();
  const [showQuests, setShowQuests] = useState(false);

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ["/api/user/progress"],
    queryFn: async () => {
      const res = await fetch("/api/user/progress", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });

  // Fetch user preferences
  const { data: userPrefs } = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/preferences", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
  });

  if (!user) return null;

  const stats = userProgress || {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    coins: 0,
    quizzesCompleted: 0,
    totalStudyTime: 0,
  };

  const dailyGoalMinutes = userPrefs?.dailyTime ? parseInt(userPrefs.dailyTime) : 30;

  const dailyQuests = [
    { 
      title: "Complete a lesson", 
      progress: Math.min(stats.quizzesCompleted % 3, 1), 
      total: 1, 
      xp: 20, 
      completed: stats.quizzesCompleted % 3 >= 1 
    },
    { 
      title: `Study for ${dailyGoalMinutes} min`, 
      progress: Math.min(stats.totalStudyTime % dailyGoalMinutes, dailyGoalMinutes), 
      total: dailyGoalMinutes, 
      xp: 30, 
      completed: stats.totalStudyTime % dailyGoalMinutes >= dailyGoalMinutes - 1 
    },
    { 
      title: "Maintain streak", 
      progress: stats.currentStreak > 0 ? 1 : 0, 
      total: 1, 
      xp: 15, 
      completed: stats.currentStreak > 0 
    },
  ];

  const completedQuests = dailyQuests.filter(q => q.completed).length;
  const totalQuestXP = dailyQuests.reduce((sum, q) => sum + q.xp, 0);

  const getInitials = () => `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <>
      {/* HUD Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-3 right-3 z-40 flex items-center gap-2 md:gap-3 bg-card/95 backdrop-blur-xl border rounded-2xl px-3 py-2 shadow-lg"
      >
        {/* Streak */}
        <StreakFire streak={stats.currentStreak} />

        <div className="w-px h-6 bg-border hidden sm:block" />

        {/* XP & Level */}
        <XPBar xp={stats.totalXp % 1000} level={stats.level} nextLevelXp={1000} />

        <div className="w-px h-6 bg-border hidden sm:block" />

        {/* Coins */}
        <motion.div 
          className="flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
        >
          <Coins className="w-5 h-5 text-yellow-500" />
          <AnimatedNumber value={stats.coins || 0} className="font-bold text-sm text-yellow-600" />
        </motion.div>

        <div className="w-px h-6 bg-border" />

        {/* Daily Quests Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuests(!showQuests)}
          className={cn(
            "relative flex items-center gap-1 px-2 py-1 rounded-lg transition-colors",
            showQuests ? "bg-primary/10" : "hover:bg-muted"
          )}
        >
          <Gift className={cn("w-5 h-5", completedQuests === dailyQuests.length ? "text-green-500" : "text-primary")} />
          <span className="text-xs font-medium hidden sm:inline">{completedQuests}/{dailyQuests.length}</span>
          <ChevronDown className={cn("w-3 h-3 transition-transform", showQuests && "rotate-180")} />
          
          {/* Notification dot */}
          {completedQuests < dailyQuests.length && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </motion.button>


      </motion.div>

      {/* Daily Quests Dropdown */}
      <AnimatePresence>
        {showQuests && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuests(false)}
              className="fixed inset-0 z-30"
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-16 right-3 z-40 w-80 bg-card border rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Daily Quests</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full font-medium">
                      +{totalQuestXP} XP
                    </span>
                    <button onClick={() => setShowQuests(false)} className="p-1 hover:bg-muted rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedQuests === dailyQuests.length 
                    ? "🎉 All quests completed!" 
                    : `Complete ${dailyQuests.length - completedQuests} more for bonus XP`}
                </p>
              </div>

              {/* Quests List */}
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {dailyQuests.map((quest, i) => (
                  <QuestItem key={i} {...quest} />
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-muted/30">
                <p className="text-xs text-center text-muted-foreground">
                  ⏰ Resets in {new Date().getHours() < 12 ? 24 - new Date().getHours() : 36 - new Date().getHours()}h
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
