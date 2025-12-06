import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock, Brain, BookOpen, Award, TrendingUp, Target,
  Zap, Calendar, CheckCircle2, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyProgress {
  day: string;
  minutes: number;
}

interface ProgressStats {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  quizzesCompleted: number;
  quizzesPassed: number;
  resourcesCompleted: number;
  certificatesEarned: number;
  weeklyProgress: WeeklyProgress[];
}

interface ProgressDashboardProps {
  stats: ProgressStats;
  dailyGoalMinutes: number;
}

export default function ProgressDashboard({
  stats,
  dailyGoalMinutes,
}: ProgressDashboardProps) {
  const [animatedStats, setAnimatedStats] = useState({
    totalStudyTime: 0,
    quizzesCompleted: 0,
    resourcesCompleted: 0,
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        totalStudyTime: Math.floor(stats.totalStudyTime * progress),
        quizzesCompleted: Math.floor(stats.quizzesCompleted * progress),
        resourcesCompleted: Math.floor(stats.resourcesCompleted * progress),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Default weekly progress if not provided
  const weeklyProgress = stats.weeklyProgress || [
    { day: "Mon", minutes: 0 },
    { day: "Tue", minutes: 0 },
    { day: "Wed", minutes: 0 },
    { day: "Thu", minutes: 0 },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 },
  ];

  const todayMinutes = weeklyProgress[weeklyProgress.length - 1]?.minutes || 0;
  const goalProgress = Math.min((todayMinutes / dailyGoalMinutes) * 100, 100);
  const maxWeeklyMinutes = Math.max(...weeklyProgress.map((d) => d.minutes), dailyGoalMinutes);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Progress
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            This Week
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Daily Goal Progress */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-yellow-500/10 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium">Daily Goal</span>
            </div>
            <span className="text-sm">
              {todayMinutes} / {dailyGoalMinutes} min
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                goalProgress >= 100
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-primary to-yellow-500"
              )}
            />
          </div>
          {goalProgress >= 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-2 text-green-500 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Goal completed! +25 XP bonus
            </motion.div>
          )}
        </div>

        {/* Weekly Activity Chart */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Weekly Activity
          </h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyProgress.map((day, index) => {
              const height = (day.minutes / maxWeeklyMinutes) * 100;
              const isToday = index === weeklyProgress.length - 1;
              const metGoal = day.minutes >= dailyGoalMinutes;

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={cn(
                      "w-full rounded-t-lg relative group cursor-pointer transition-all",
                      isToday
                        ? "bg-gradient-to-t from-primary to-primary/70"
                        : metGoal
                          ? "bg-gradient-to-t from-green-500 to-green-400"
                          : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border">
                      {day.minutes} min
                    </div>
                    
                    {/* Flame for streak days */}
                    {metGoal && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                      >
                        <Flame className="w-4 h-4 text-orange-500" />
                      </motion.div>
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      "text-xs",
                      isToday ? "font-bold text-primary" : "text-muted-foreground"
                    )}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatTime(animatedStats.totalStudyTime)}
                </p>
                <p className="text-xs text-muted-foreground">Total Study Time</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{animatedStats.quizzesCompleted}</p>
                <p className="text-xs text-muted-foreground">Quizzes Completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{animatedStats.resourcesCompleted}</p>
                <p className="text-xs text-muted-foreground">Resources Done</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.certificatesEarned}</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quiz Performance */}
        {stats.quizzesCompleted > 0 && (
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Quiz Performance</span>
              <span className="text-sm text-muted-foreground">
                {stats.quizzesPassed} / {stats.quizzesCompleted} passed
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(stats.quizzesPassed / stats.quizzesCompleted) * 100}%`,
                }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((stats.quizzesPassed / stats.quizzesCompleted) * 100)}% pass rate
            </p>
          </div>
        )}

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-yellow-500/5 border border-primary/10"
        >
          <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm font-medium">
            {stats.currentStreak >= 7
              ? "🔥 Amazing! You're on fire with a " + stats.currentStreak + "-day streak!"
              : stats.currentStreak >= 3
                ? "💪 Great progress! Keep the momentum going!"
                : "🚀 Every expert was once a beginner. Keep learning!"}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
