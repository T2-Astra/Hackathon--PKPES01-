import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Sparkles, BookOpen, Flame, Play,
  Clock, Trophy, ChevronRight, Zap, Trash2, Award, Gift, Star, CheckCircle2, Lock
} from "lucide-react";
import LearningPathGenerator from "@/components/ai/LearningPathGenerator";
import LearningPathView from "@/components/learning/LearningPathView";
import { cn } from "@/lib/utils";

export default function LearningPaths() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: learningPaths = [], isLoading } = useQuery({
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

  const updateProgressMutation = useMutation({
    mutationFn: async ({ pathId, completedModules }: { pathId: string; completedModules: number }) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/learning-paths/${pathId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ completedModules, progress: (completedModules / selectedPath?.modules?.length) * 100 }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
    },
  });

  const handleUpdateProgress = (pathId: string, moduleIndex: number) => {
    updateProgressMutation.mutate({ pathId, completedModules: moduleIndex });
  };

  const deletePathMutation = useMutation({
    mutationFn: async (pathId: string) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/learning-paths/${pathId}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      alert("Failed to delete learning path");
    },
  });

  const handleDeletePath = (e: React.MouseEvent, pathId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this learning path?")) {
      deletePathMutation.mutate(pathId);
    }
  };

  // Mock streak data
  const streak = 3;
  const todayCompleted = false;


  // Get the latest path data from the query cache
  const getLatestPathData = (pathId: string) => {
    const latestPaths = queryClient.getQueryData<any[]>(["/api/learning-paths"]) || learningPaths;
    return latestPaths.find((p: any) => p._id === pathId) || selectedPath;
  };

  // If a path is selected, show the detailed view with latest data
  if (selectedPath) {
    const latestPath = getLatestPathData(selectedPath._id);
    return (
      <LearningPathView
        key={latestPath._id} // Force remount when path changes
        path={latestPath}
        onBack={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
          setSelectedPath(null);
        }}
        onUpdateProgress={handleUpdateProgress}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Streak - Enhanced Duolingo Style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="gradient-text-green">Learning Paths</span>
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5 s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z"/>
                <path d="M12,2v2c2.76,0,5,2.24,5,5c0,2.1-2.33,5.92-5,9.33V22c0,0,7-7.75,7-13C19,5.13,15.87,2,12,2z" opacity="0.3"/>
              </svg>
            </h1>
            <p className="text-muted-foreground text-sm">15 minutes a day to master new skills</p>
          </div>

        </div>

        {/* Daily Goal Card - Enhanced Duolingo Style */}
        <Card className={cn(
          "relative overflow-hidden card-3d",
          todayCompleted 
            ? "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-green-500/30" 
            : "bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20"
        )}>
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={cn(
              "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30",
              todayCompleted ? "bg-green-500" : "bg-primary"
            )} />
            <div className={cn(
              "absolute -left-8 -bottom-8 w-24 h-24 rounded-full blur-2xl opacity-20",
              todayCompleted ? "bg-emerald-500" : "bg-purple-500"
            )} />
          </div>
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon with animation */}
                <div className="relative">
                  {/* Pulsing ring */}
                  {!todayCompleted && (
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
                  )}
                  
                  <div className={cn(
                    "relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                    todayCompleted 
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30" 
                      : "bg-gradient-to-br from-primary to-purple-500 shadow-primary/30"
                  )}>
                    {todayCompleted ? (
                      <Trophy className="w-8 h-8 text-white drop-shadow-md" />
                    ) : (
                      <Zap className="w-8 h-8 text-white drop-shadow-md" />
                    )}
                  </div>
                  
                  {/* Completion sparkles */}

                </div>
                
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    {todayCompleted ? (
                      <>
                        <span className="gradient-text-green">Goal Complete!</span>
                        <span className="text-2xl">🎉</span>
                      </>
                    ) : (
                      "Today's Goal"
                    )}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {todayCompleted ? "Great job! Come back tomorrow for more XP" : "Complete 1 lesson (15 min) • Earn 10 XP"}
                  </p>
                  
                  {/* XP bonus indicator */}
                  {!todayCompleted && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                      <Zap className="w-3 h-3" />
                      <span className="font-medium">2x XP bonus active!</span>
                    </div>
                  )}
                </div>
              </div>
              
              {!todayCompleted && learningPaths.length > 0 && (
                <Button 
                  onClick={() => setSelectedPath(learningPaths[0])} 
                  variant="duo-green"
                  size="lg"
                  className="gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start
                </Button>
              )}
              
              {todayCompleted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold">+10 XP</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 w-full rounded-2xl skeleton-shimmer" />
            <div className="h-32 w-full rounded-2xl skeleton-shimmer" />
          </div>
        ) : learningPaths.length === 0 ? (
          <Card className="p-8 md:p-12 text-center relative overflow-hidden card-3d">
            {/* Floating particles background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary/20 float-animate"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
            
            {/* Mascot/Icon with wave animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-green-500/20 rounded-full animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-lg shadow-primary/30">
                <BookOpen className="w-12 h-12 text-white wave-animate" />
              </div>

            </div>
            
            <h3 className="text-2xl font-bold mb-2">Start Your Learning Journey!</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Create your first personalized learning path and master new skills in just 15 minutes a day
            </p>
            
            {/* Social proof */}
            <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-green-500 border-2 border-background" />
                ))}
              </div>
              <span>Join 5,000+ learners</span>
            </div>
            
            {/* Bonus badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Earn 50 XP bonus for your first path!
            </div>
            
            {/* CTA Button - Duolingo style pulsing */}
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowGenerator(true)} 
                variant="duo-cta"
                size="xl"
                className="gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9zm6.82 6L12 12.72L5.18 9L12 5.28zM17 16l-5 2.72L7 16v-3.73L12 15l5-2.73z"/>
                </svg>
                Create Learning Path
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Your Paths
            </h2>
            {learningPaths.map((path: any, pathIndex: number) => {
              const totalModules = path.modules?.length || 1;
              const completedModules = path.completedModules || 0;
              const progress = (completedModules / totalModules) * 100;
              const isComplete = progress >= 100;
              const xpReward = totalModules * 30;
              const badgeCount = Math.ceil(totalModules / 3);
              
              return (
                <Card
                  key={path._id}
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all card-3d hover-bounce group",
                    isComplete && "border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5"
                  )}
                  onClick={() => setSelectedPath(path)}
                  style={{ animationDelay: `${pathIndex * 0.1}s` }}
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                          isComplete 
                            ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30" 
                            : "bg-gradient-to-br from-primary to-cyan-500 shadow-primary/30"
                        )}>
                          {isComplete ? (
                            <Trophy className="w-6 h-6 text-white" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-white" />
                          )}
                          {isComplete && (
                            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 sparkle" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base group-hover:text-primary transition-colors">{path.title}</h3>

                          </div>
                          <p className="text-xs text-muted-foreground">{totalModules} lessons · {Math.ceil(totalModules * 15 / 60)}h total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeletePath(e, path._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Horizontal Path Progress with Checkpoints */}
                    <div className="relative mb-4 pr-4">
                      {/* Progress Track */}
                      <div className="relative h-3 bg-muted rounded-full overflow-visible">
                        {/* Filled Progress */}
                        <div 
                          className={cn(
                            "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                            isComplete 
                              ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                              : "bg-gradient-to-r from-primary to-cyan-400"
                          )}
                          style={{ width: `${Math.max(progress, 2)}%` }}
                        >
                          <div className="absolute inset-0 progress-shimmer rounded-full" />
                        </div>
                        
                        {/* Checkpoint Nodes */}
                        {[...Array(Math.min(totalModules, 6))].map((_, i) => {
                          const nodePosition = ((i + 1) / Math.min(totalModules, 6)) * 100;
                          const isNodeComplete = i < completedModules;
                          const isCurrent = i === completedModules;
                          
                          return (
                            <div
                              key={i}
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
                              style={{ left: `${nodePosition}%` }}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                isNodeComplete 
                                  ? "bg-green-500 border-green-400 scale-100" 
                                  : isCurrent 
                                    ? "bg-primary border-primary/50 scale-110 ring-4 ring-primary/20" 
                                    : "bg-muted border-muted-foreground/20 scale-90"
                              )}>
                                {isNodeComplete ? (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                ) : isCurrent ? (
                                  <Play className="w-2.5 h-2.5 text-white" />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Treasure Chest at End */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2"
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                            isComplete 
                              ? "bg-gradient-to-br from-primary to-primary/80 shadow-sm" 
                              : "bg-muted/80 border border-muted-foreground/20"
                          )}>
                            <Gift className={cn(
                              "w-4 h-4",
                              isComplete ? "text-primary-foreground" : "text-muted-foreground"
                            )} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rewards Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium">
                          <Zap className="w-3 h-3" />
                          {xpReward} XP
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                          <Award className="w-3 h-3" />
                          1 Certificate
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                          <Star className="w-3 h-3" />
                          {badgeCount} Badges
                        </span>
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-md",
                        isComplete 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {completedModules}/{totalModules}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}


      </div>

      {/* Generator Dialog */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <DialogHeader>
            <DialogTitle>Create Learning Path</DialogTitle>
          </DialogHeader>
          <LearningPathGenerator
            onPathSaved={(savedPath) => {
              queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
              setShowGenerator(false);
              // Immediately show the Duolingo-style path view
              if (savedPath) {
                setSelectedPath(savedPath);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
