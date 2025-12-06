import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Target,
  Trophy,
  Flame,
  ChevronRight,
  Plus,
  Play,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  Star,
  Crown,
  Medal,
  Gift,
  Rocket,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Animated 3D Card Component
const Card3D = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, rotateX: -10 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
    whileHover={{ 
      scale: 1.02, 
      rotateY: 2,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    }}
    className={cn("transform-gpu perspective-1000", className)}
    style={{ transformStyle: "preserve-3d" }}
  >
    {children}
  </motion.div>
);

// Floating Animation Component
const FloatingIcon = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{ 
      y: [0, -8, 0],
    }}
    transition={{ 
      duration: 2, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

// Pulse Animation Component
const PulseGlow = ({ children, color = "primary" }: { children: React.ReactNode; color?: string }) => (
  <motion.div
    animate={{ 
      boxShadow: [
        `0 0 0 0 rgba(var(--${color}), 0.4)`,
        `0 0 0 10px rgba(var(--${color}), 0)`,
      ]
    }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className="rounded-full"
  >
    {children}
  </motion.div>
);

// Stat Card with 3D effect
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  delay,
  trend 
}: { 
  icon: any; 
  value: string | number; 
  label: string; 
  color: string;
  delay: number;
  trend?: number;
}) => (
  <Card3D delay={delay}>
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all duration-300",
      `hover:border-${color}-500/50`
    )}>
      <div className={cn(
        "absolute inset-0 opacity-10",
        `bg-gradient-to-br from-${color}-500 to-${color}-600`
      )} />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <motion.p 
              className="text-3xl font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
            >
              {value}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
          <FloatingIcon delay={delay}>
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              `bg-${color}-500/20`
            )}>
              <Icon className={cn("w-6 h-6", `text-${color}-500`)} />
            </div>
          </FloatingIcon>
        </div>
        {trend !== undefined && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            className={cn(
              "flex items-center gap-1 mt-3 text-xs font-medium",
              trend >= 0 ? "text-green-500" : "text-red-500"
            )}
          >
            <TrendingUp className={cn("w-3 h-3", trend < 0 && "rotate-180")} />
            {Math.abs(trend)}% from last week
          </motion.div>
        )}
      </CardContent>
    </Card>
  </Card3D>
);

// Daily Goal Ring
const DailyGoalRing = ({ progress, goal }: { progress: number; goal: number }) => {
  const percentage = Math.min((progress / goal) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/30"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-2xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {progress}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ {goal} min</span>
      </div>
    </div>
  );
};

// Streak Fire Animation
const StreakFire = ({ streak }: { streak: number }) => (
  <motion.div 
    className="relative"
    whileHover={{ scale: 1.1 }}
  >
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30"
    >
      <Flame className="w-8 h-8 text-white" />
    </motion.div>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -bottom-1 -right-1 bg-background border-2 border-orange-500 rounded-full px-2 py-0.5 text-xs font-bold"
    >
      {streak}
    </motion.div>
  </motion.div>
);

// XP Level Badge
const LevelBadge = ({ level, xp, nextLevelXp }: { level: number; xp: number; nextLevelXp: number }) => {
  const progress = (xp / nextLevelXp) * 100;
  
  return (
    <motion.div 
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 transform rotate-3">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-background border-2 border-yellow-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {level}
        </div>
      </motion.div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Level {level}</span>
          <span className="text-muted-foreground">{xp} / {nextLevelXp} XP</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Challenge Card
const ChallengeCard = ({ 
  title, 
  description, 
  xp, 
  progress, 
  total,
  icon: Icon,
  color 
}: { 
  title: string; 
  description: string; 
  xp: number;
  progress: number;
  total: number;
  icon: any;
  color: string;
}) => {
  const isComplete = progress >= total;
  
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={cn(
        "p-4 rounded-xl border-2 transition-all",
        isComplete ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isComplete ? "bg-green-500" : `bg-${color}-500/20`
        )}>
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <Award className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <Icon className={cn("w-5 h-5", `text-${color}-500`)} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium truncate">{title}</p>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              isComplete ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-600"
            )}>
              +{xp} XP
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>{progress} / {total}</span>
              <span>{Math.round((progress / total) * 100)}%</span>
            </div>
            <Progress value={(progress / total) * 100} className="h-1.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<"overview" | "paths" | "achievements">("overview");

  // Fetch user preferences (onboarding data)
  const { data: userPrefs } = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/preferences", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ["/api/user/progress"],
    queryFn: async () => {
      const res = await fetch("/api/user/progress", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Fetch learning paths
  const { data: learningPaths = [] } = useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch daily challenges
  const { data: challenges = [] } = useQuery({
    queryKey: ["/api/daily-challenges"],
    queryFn: async () => {
      const res = await fetch("/api/daily-challenges", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const stats = userProgress || {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    totalStudyTime: 0,
    quizzesCompleted: 0,
    certificatesEarned: 0,
  };

  // Get daily goal from user preferences (onboarding data)
  const dailyGoalMinutes = userPrefs?.dailyTime ? parseInt(userPrefs.dailyTime) : 30;
  const userInterests = userPrefs?.interests || [];
  const userGoals = userPrefs?.goals || [];

  const dailyChallenges = [
    { title: "Complete a Quiz", description: "Take any quiz to earn XP", xp: 50, progress: 0, total: 1, icon: Target, color: "blue" },
    { title: `Study for ${dailyGoalMinutes} minutes`, description: "Reach your daily goal", xp: 30, progress: stats.totalStudyTime % dailyGoalMinutes, total: dailyGoalMinutes, icon: Clock, color: "green" },
    { title: "Maintain your streak", description: "Keep your streak alive", xp: 25, progress: stats.currentStreak > 0 ? 1 : 0, total: 1, icon: Flame, color: "orange" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-6 md:p-8"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl">👋</span>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome back, {user?.firstName || "Learner"}!
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                {userPrefs?.college 
                  ? `${userPrefs.college} • ${userPrefs.course || 'Student'}` 
                  : "Ready to continue your learning journey?"}
              </motion.p>
              
              {/* User Interests Tags */}
              {userInterests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {userInterests.slice(0, 4).map((interest: string) => (
                    <span 
                      key={interest}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                    >
                      {interest.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  ))}
                </motion.div>
              )}
              
              {/* Level Progress */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4 max-w-md"
              >
                <LevelBadge level={stats.level} xp={stats.totalXp % 1000} nextLevelXp={1000} />
              </motion.div>
            </div>

            <div className="flex items-center gap-6">
              <StreakFire streak={stats.currentStreak} />
              <Link href="/learning-paths">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/25">
                    <Rocket className="w-5 h-5" />
                    Start Learning
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Sparkles} value={stats.totalXp.toLocaleString()} label="Total XP" color="yellow" delay={0} trend={12} />
          <StatCard icon={BookOpen} value={stats.quizzesCompleted} label="Quizzes Done" color="blue" delay={0.1} trend={8} />
          <StatCard icon={Clock} value={`${Math.floor(stats.totalStudyTime / 60)}h`} label="Study Time" color="green" delay={0.2} trend={15} />
          <StatCard icon={Award} value={stats.certificatesEarned} label="Certificates" color="purple" delay={0.3} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Daily Progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Goal */}
            <Card3D delay={0.4}>
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-500" />
                        Today's Goal
                      </h2>
                      <p className="text-sm text-muted-foreground">Complete your daily learning goal</p>
                    </div>
                    <DailyGoalRing progress={stats.totalStudyTime % dailyGoalMinutes} goal={dailyGoalMinutes} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    {[
                      { label: "Mon", active: true, complete: true },
                      { label: "Tue", active: true, complete: true },
                      { label: "Wed", active: true, complete: true },
                      { label: "Thu", active: true, complete: false },
                      { label: "Fri", active: false, complete: false },
                      { label: "Sat", active: false, complete: false },
                      { label: "Sun", active: false, complete: false },
                    ].slice(0, 7).map((day, i) => (
                      <motion.div
                        key={day.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg",
                          day.complete && "bg-green-500/10"
                        )}
                      >
                        <span className="text-xs text-muted-foreground">{day.label}</span>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          day.complete ? "bg-green-500 text-white" : day.active ? "bg-muted" : "bg-muted/50"
                        )}>
                          {day.complete ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.6 + i * 0.05 }}
                            >
                              <Flame className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>

            {/* Continue Learning */}
            <Card3D delay={0.5}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      Continue Learning
                    </h2>
                    <Link href="/learning-paths">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  
                  {learningPaths.length > 0 ? (
                    <div className="space-y-3">
                      {learningPaths.slice(0, 3).map((path: any, i: number) => (
                        <motion.div
                          key={path.id || i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          whileHover={{ x: 4 }}
                          className="p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{path.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={path.progress || 0} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground">{path.progress || 0}%</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      >
                        <Plus className="w-8 h-8 text-primary" />
                      </motion.div>
                      <p className="text-muted-foreground mb-4">No learning paths yet</p>
                      <Link href="/learning-paths">
                        <Button>Create Your First Path</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Card3D>
          </div>

          {/* Right Column - Challenges & Quick Actions */}
          <div className="space-y-6">
            
            {/* Daily Challenges */}
            <Card3D delay={0.6}>
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2">
                      <Gift className="w-5 h-5 text-yellow-500" />
                      Daily Challenges
                    </h2>
                    <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full font-medium">
                      +105 XP
                    </span>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  {dailyChallenges.map((challenge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                    >
                      <ChallengeCard {...challenge} />
                    </motion.div>
                  ))}
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    ⏰ Resets in 12h 34m
                  </p>
                </CardContent>
              </Card>
            </Card3D>

            {/* Quick Actions */}
            <Card3D delay={0.8}>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Target, label: "Quiz", href: "/mock-test", color: "blue" },
                      { icon: BookOpen, label: "Flashcards", href: "/flashcards", color: "green" },
                      { icon: Zap, label: "AI Tools", href: "/ai-tools", color: "purple" },
                      { icon: Trophy, label: "Achievements", href: "/achievements", color: "yellow" },
                    ].map((action, i) => (
                      <Link key={action.label} href={action.href}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-all cursor-pointer text-center",
                            `hover:bg-${action.color}-500/5`
                          )}
                        >
                          <action.icon className={cn("w-6 h-6 mx-auto mb-2", `text-${action.color}-500`)} />
                          <span className="text-sm font-medium">{action.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center p-4"
            >
              <FloatingIcon delay={0.5}>
                <span className="text-2xl">✨</span>
              </FloatingIcon>
              <p className="text-sm text-muted-foreground mt-2 italic">
                "Every expert was once a beginner. Keep learning!"
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
