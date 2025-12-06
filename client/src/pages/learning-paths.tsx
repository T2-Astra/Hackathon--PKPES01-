import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Sparkles, BookOpen, Flame, Play,
  Clock, Trophy, ChevronRight, Zap, Trash2
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
      const res = await fetch("/api/learning-paths", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ pathId, completedModules }: { pathId: string; completedModules: number }) => {
      const res = await fetch(`/api/learning-paths/${pathId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/learning-paths/${pathId}`, {
        method: "DELETE",
        credentials: "include",
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
        {/* Header with Streak */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Learning Paths</h1>
            <p className="text-muted-foreground text-sm">15 minutes a day to master new skills</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-500/10">
              <Flame className={cn("w-5 h-5", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
              <span className="font-bold text-orange-500">{streak}</span>
            </div>
            <Button onClick={() => setShowGenerator(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Path
            </Button>
          </div>
        </div>

        {/* Daily Goal Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  todayCompleted ? "bg-green-500" : "bg-primary/20"
                )}>
                  {todayCompleted ? (
                    <Trophy className="w-8 h-8 text-white" />
                  ) : (
                    <Zap className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    {todayCompleted ? "Goal Complete! 🎉" : "Today's Goal"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {todayCompleted ? "Great job! Come back tomorrow" : "Complete 1 lesson (15 min)"}
                  </p>
                </div>
              </div>
              {!todayCompleted && learningPaths.length > 0 && (
                <Button onClick={() => setSelectedPath(learningPaths[0])} className="gap-2">
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : learningPaths.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start Your Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first learning path and start learning 15 minutes a day
            </p>
            <Button onClick={() => setShowGenerator(true)} size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Create Learning Path
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Your Paths</h2>
            {learningPaths.map((path: any) => {
              const progress = path.completedModules / (path.modules?.length || 1) * 100;
              const isComplete = progress >= 100;
              
              return (
                <Card
                  key={path._id}
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                    isComplete && "border-green-500/30 bg-green-500/5"
                  )}
                  onClick={() => setSelectedPath(path)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center">
                      {/* Icon */}
                      <div className={cn(
                        "w-24 h-full flex items-center justify-center p-6",
                        isComplete ? "bg-green-500/10" : "bg-primary/10"
                      )}>
                        <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center",
                          isComplete ? "bg-green-500 text-white" : "bg-primary text-white"
                        )}>
                          {isComplete ? (
                            <Trophy className="w-7 h-7" />
                          ) : (
                            <BookOpen className="w-7 h-7" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{path.title}</h3>
                              {path.isAiGenerated && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Sparkles className="w-3 h-3" /> AI
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {path.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => handleDeletePath(e, path._id)}
                              className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Progress value={progress} className="h-2" />
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {path.modules?.length || 0} lessons
                            </span>
                            <span className="font-medium text-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                      </div>
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
