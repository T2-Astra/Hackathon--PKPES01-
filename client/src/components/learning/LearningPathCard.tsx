import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Clock, Target, Play, CheckCircle2, 
  ChevronRight, Sparkles, TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningPathCardProps {
  id: string;
  title: string;
  description?: string;
  category?: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  estimatedDuration?: number; // in minutes
  totalModules: number;
  completedModules: number;
  progress: number;
  isAiGenerated?: boolean;
  status: "active" | "completed" | "paused";
  onContinue?: () => void;
  onView?: () => void;
  className?: string;
}

const skillLevelColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function LearningPathCard({
  id,
  title,
  description,
  category,
  skillLevel,
  estimatedDuration,
  totalModules,
  completedModules,
  progress,
  isAiGenerated,
  status,
  onContinue,
  onView,
  className,
}: LearningPathCardProps) {
  const isCompleted = status === "completed" || progress >= 100;

  return (
    <Card className={cn(
      "group overflow-hidden transition-all hover:shadow-lg",
      isCompleted && "border-green-500/30 bg-green-500/5",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isAiGenerated && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </Badge>
              )}
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          
          {isCompleted && (
            <div className="shrink-0 p-2 rounded-full bg-green-500">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="secondary" className={cn("capitalize", skillLevelColors[skillLevel])}>
            {skillLevel}
          </Badge>
          
          {estimatedDuration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(estimatedDuration)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{totalModules} modules</span>
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium flex items-center gap-1">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Completed
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {completedModules}/{totalModules} modules
                </>
              )}
            </span>
          </div>
          
          <Progress 
            value={progress} 
            className={cn("h-2", isCompleted && "[&>div]:bg-green-500")} 
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            {!isCompleted && estimatedDuration && (
              <span>~{formatDuration(Math.round(estimatedDuration * (1 - progress / 100)))} left</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {!isCompleted && onContinue && (
            <Button 
              className="flex-1 gap-2" 
              onClick={onContinue}
            >
              <Play className="w-4 h-4" />
              Continue Learning
            </Button>
          )}
          
          {onView && (
            <Button 
              variant={isCompleted ? "default" : "outline"} 
              className={cn("gap-2", !isCompleted && "flex-1")}
              onClick={onView}
            >
              {isCompleted ? "Review" : "View Path"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
