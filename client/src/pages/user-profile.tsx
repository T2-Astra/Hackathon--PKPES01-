import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, Shield, Edit3, Save, X, Flame, Trophy, Star, Crown,
  BookOpen, Clock, Award, Target, Zap, Share2, Link2, Copy, Check,
  Settings, Lock, Download, Trash2, ChevronRight, Sparkles, TrendingUp,
  Calendar, Gift, Play, Users, Medal, Rocket
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Animated Card Component
const Card3D = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Floating Animation
const FloatingIcon = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 2, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Daily Goal Ring
const DailyGoalRing = ({ progress, goal }: { progress: number; goal: number }) => {
  const percentage = Math.min((progress / goal) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/30" />
        <motion.circle
          cx="48" cy="48" r="40" stroke="url(#goalGradient)" strokeWidth="6" fill="none" strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold">{progress}</span>
        <span className="text-[10px] text-muted-foreground">/ {goal} min</span>
      </div>
    </div>
  );
};

// Streak Fire Component
const StreakFire = ({ streak }: { streak: number }) => (
  <motion.div className="relative" whileHover={{ scale: 1.1 }}>
    {streak > 0 && (
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 bg-orange-500 rounded-full blur-xl"
      />
    )}
    <motion.div
      animate={streak > 0 ? { scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] } : {}}
      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
      className={cn(
        "relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
        streak > 0 ? "bg-gradient-to-br from-orange-400 via-red-500 to-orange-500 shadow-orange-500/40" : "bg-muted"
      )}
    >
      <Flame className={cn("w-7 h-7", streak > 0 ? "text-white" : "text-muted-foreground")} />
    </motion.div>
    <div className={cn(
      "absolute -bottom-1 -right-1 bg-background border-2 rounded-full px-2 py-0.5 text-xs font-bold",
      streak > 0 ? "border-orange-500 text-orange-500" : "border-muted text-muted-foreground"
    )}>
      {streak}
    </div>
  </motion.div>
);

// Level Badge Component
const LevelBadge = ({ level, xp, nextLevelXp }: { level: number; xp: number; nextLevelXp: number }) => {
  const progress = (xp / nextLevelXp) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-lg font-bold text-primary-foreground">Lv</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-background border-2 border-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-primary">
          {level}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">Level {level}</span>
          <span className="text-muted-foreground">{xp} / {nextLevelXp} XP</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, color, delay }: { icon: any; value: string | number; label: string; color: string; delay: number }) => (
  <Card3D delay={delay}>
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <div className={cn("absolute inset-0 opacity-10", `bg-gradient-to-br from-${color}-500 to-${color}-600`)} />
      <CardContent className="p-4 relative">
        <div className="flex items-center justify-between">
          <div>
            <motion.p className="text-2xl font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.2, type: "spring" }}>
              {value}
            </motion.p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <FloatingIcon delay={delay}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-${color}-500/20`)}>
              <Icon className={cn("w-5 h-5", `text-${color}-500`)} />
            </div>
          </FloatingIcon>
        </div>
      </CardContent>
    </Card>
  </Card3D>
);

// Achievement Badge Component
const AchievementBadge = ({ title, icon: Icon, unlocked, color, description }: { title: string; icon: any; unlocked: boolean; color: string; description: string }) => (
  <motion.div
    whileHover={{ scale: unlocked ? 1.05 : 1 }}
    className={cn(
      "relative p-4 rounded-2xl border-2 text-center transition-all",
      unlocked ? `border-${color}-500/30 bg-gradient-to-br from-${color}-500/10 to-${color}-600/5` : "border-muted bg-muted/30 grayscale opacity-60"
    )}
  >
    <div className={cn(
      "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2",
      unlocked ? `bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg shadow-${color}-500/30` : "bg-muted"
    )}>
      <Icon className={cn("w-6 h-6", unlocked ? "text-white" : "text-muted-foreground")} />
    </div>
    <p className="text-xs font-medium truncate">{title}</p>
    {unlocked && <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />}
  </motion.div>
);

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editData, setEditData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
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

  // Fetch user preferences
  const { data: userPrefs } = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/preferences", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Fetch learning paths
  const { data: learningPaths = [] } = useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const res = await fetch("/api/learning-paths", { 
        credentials: "include",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const stats = userProgress || {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    totalStudyTime: 0,
    quizzesCompleted: 0,
    certificatesEarned: 0,
    lessonsCompleted: 0,
    accuracy: 0,
    bestStreak: 0,
  };

  const dailyGoalMinutes = userPrefs?.dailyTime ? parseInt(userPrefs.dailyTime) : 30;
  const userInterests = userPrefs?.interests || [];

  const handleSave = async () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    setIsEditing(false);
  };

  const getInitials = () => `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${user.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const achievements = [
    { title: "First Path", icon: Rocket, unlocked: learningPaths.length > 0, color: "green", description: "Complete your first learning path" },
    { title: "Quiz Master", icon: Target, unlocked: stats.quizzesCompleted >= 5, color: "blue", description: "Complete 5 quizzes" },
    { title: "Night Owl", icon: Star, unlocked: false, color: "purple", description: "Study after midnight" },
    { title: "Perfect Score", icon: Trophy, unlocked: stats.accuracy >= 100, color: "yellow", description: "Get 100% on a quiz" },
    { title: "Week Warrior", icon: Flame, unlocked: stats.currentStreak >= 7, color: "orange", description: "7 day streak" },
    { title: "Certified", icon: Award, unlocked: stats.certificatesEarned > 0, color: "amber", description: "Earn a certificate" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-8">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 pt-16 md:pt-6">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-6 md:p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-xl">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-500 text-white font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center border-2 border-background">
                  <span className="text-xs font-bold text-primary-foreground">{stats.level}</span>
                </div>
              </motion.div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  {user.firstName} {user.lastName}
                  {user.isAdmin && <Shield className="w-5 h-5 text-primary" />}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {userPrefs?.college || "Learner"} · Level {stats.level}
                </p>
                {userInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {userInterests.slice(0, 3).map((interest: string) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-end gap-4">
              <div className="flex items-center gap-4">
                <StreakFire streak={stats.currentStreak} />
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">{stats.totalXp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyProfileLink} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 max-w-md">
            <LevelBadge level={stats.level} xp={stats.totalXp % 1000} nextLevelXp={1000} />
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="overview" className="gap-2"><TrendingUp className="w-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="learning" className="gap-2"><BookOpen className="w-4 h-4" />Learning</TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2"><Trophy className="w-4 h-4" />Badges</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" />Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Sparkles} value={stats.totalXp.toLocaleString()} label="Total XP" color="yellow" delay={0} />
              <StatCard icon={Flame} value={stats.currentStreak} label="Day Streak" color="orange" delay={0.1} />
              <StatCard icon={BookOpen} value={stats.lessonsCompleted || learningPaths.length} label="Lessons" color="blue" delay={0.2} />
              <StatCard icon={Target} value={stats.quizzesCompleted} label="Quizzes" color="green" delay={0.3} />
            </div>

            {/* Daily Goal & Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D delay={0.4}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-500" />
                          Daily Goal
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {dailyGoalMinutes} minutes per day
                        </p>
                        <div className="mt-4 flex gap-1">
                          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                                i < stats.currentStreak % 7 ? "bg-green-500 text-white" : "bg-muted"
                              )}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                      <DailyGoalRing progress={stats.totalStudyTime % dailyGoalMinutes} goal={dailyGoalMinutes} />
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D delay={0.5}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Study Time</span>
                        <span className="font-medium">{Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Best Streak</span>
                        <span className="font-medium flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />{stats.bestStreak || stats.currentStreak} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Certificates</span>
                        <span className="font-medium flex items-center gap-1">
                          <Award className="w-4 h-4 text-amber-500" />{stats.certificatesEarned}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>

            {/* Quick Actions */}
            <Card3D delay={0.6}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Play, label: "Continue", href: "/learning-paths", color: "green" },
                      { icon: Target, label: "Quiz", href: "/mock-test", color: "blue" },
                      { icon: Zap, label: "AI Tools", href: "/ai-tools", color: "purple" },
                      { icon: Trophy, label: "Achievements", href: "/achievements", color: "yellow" },
                    ].map((action) => (
                      <Link key={action.label} href={action.href}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-all cursor-pointer text-center"
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
          </TabsContent>


          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            {/* Active Learning Paths */}
            <Card3D delay={0}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Active Learning Paths
                    </CardTitle>
                    <Link href="/learning-paths">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningPaths.length > 0 ? (
                    learningPaths.slice(0, 3).map((path: any, i: number) => (
                      <motion.div
                        key={path._id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{path.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={path.progress || 0} className="h-2 flex-1" />
                              <span className="text-xs font-medium text-muted-foreground">{Math.round(path.progress || 0)}%</span>
                            </div>
                          </div>
                          <Link href="/learning-paths">
                            <Button variant="duo-green" size="sm" className="gap-1">
                              <Play className="w-4 h-4" /> Continue
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground mb-4">No learning paths yet</p>
                      <Link href="/learning-paths">
                        <Button variant="duo-green">Create Your First Path</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Card3D>

            {/* Learning Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card3D delay={0.1}>
                <Card className="text-center p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalStudyTime || 0}</p>
                  <p className="text-sm text-muted-foreground">Minutes Learned</p>
                </Card>
              </Card3D>
              <Card3D delay={0.2}>
                <Card className="text-center p-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.accuracy || 85}%</p>
                  <p className="text-sm text-muted-foreground">Quiz Accuracy</p>
                </Card>
              </Card3D>
              <Card3D delay={0.3}>
                <Card className="text-center p-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.certificatesEarned}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </Card>
              </Card3D>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card3D delay={0}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Achievements & Badges
                  </CardTitle>
                  <CardDescription>
                    {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {achievements.map((achievement, i) => (
                      <motion.div
                        key={achievement.title}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <AchievementBadge {...achievement} />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>

            {/* Leaderboard Preview */}
            <Card3D delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Weekly Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "You", xp: stats.totalXp, isUser: true },
                      { rank: 2, name: "Alex K.", xp: Math.max(0, stats.totalXp - 150), isUser: false },
                      { rank: 3, name: "Sarah M.", xp: Math.max(0, stats.totalXp - 280), isUser: false },
                    ].map((entry, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl",
                          entry.isUser ? "bg-primary/10 border-2 border-primary/20" : "bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          entry.rank === 1 ? "bg-yellow-500 text-white" :
                          entry.rank === 2 ? "bg-gray-400 text-white" :
                          "bg-amber-600 text-white"
                        )}>
                          {entry.rank}
                        </div>
                        <span className="flex-1 font-medium">{entry.name}</span>
                        <span className="text-sm font-bold text-yellow-500">{entry.xp} XP</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/achievements">
                    <Button variant="outline" className="w-full mt-4 gap-2">
                      View Full Leaderboard <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Profile Information */}
            <Card3D delay={0}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                      <CardDescription>Your personal information</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit3 className="w-4 h-4 mr-2" />Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max. 1MB)</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      {isEditing ? (
                        <Input value={editData.firstName} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} />
                      ) : (
                        <p className="font-medium">{user.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      {isEditing ? (
                        <Input value={editData.lastName} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} />
                      ) : (
                        <p className="font-medium">{user.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                  </div>
                </CardContent>
              </Card>
            </Card3D>

            {/* Account Actions */}
            <Card3D delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Lock className="w-4 h-4" />Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Link2 className="w-4 h-4" />Connected Accounts
                  </Button>
                </CardContent>
              </Card>
            </Card3D>

            {/* Danger Zone */}
            <Card3D delay={0.2}>
              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-500 text-base">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
