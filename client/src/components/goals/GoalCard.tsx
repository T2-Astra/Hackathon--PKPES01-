import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, Calendar, CheckCircle2, Clock, 
  TrendingUp, MoreVertical, Edit, Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  id: string;
  title: string;
  description?: string;
  category?: string;
  targetDate?: Date;
  targetValue: number;
  currentValue: number;
  goalType: "skill_mastery" | "course_completion" | "study_time" | "streak";
  status: "active" | "completed" | "abandoned";
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  className?: string;
}

const goalTypeLabels = {
  skill_mastery: "Skill Mastery",
  course_completion: "Course Completion",
  study_time: "Study Time",
  streak: "Streak Goal",
};

const goalTypeIcons = {
  skill_mastery: TrendingUp,
  course_completion: Target,
  study_time: Clock,
  streak: Calendar,
};

export default function GoalCard({
  id,
  title,
  description,
  category,
  targetDate,
  targetValue,
  currentValue,
  goalType,
  status,
  onEdit,
  onDelete,
  onComplete,
  className,
}: GoalCardProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100);
  const isCompleted = status === "completed" || progress >= 100;
  const Icon = goalTypeIcons[goalType];

  const daysRemaining = targetDate 
    ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getProgressColor = () => {
    if (isCompleted) return "bg-green-500";
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <Card className={cn(
      "group transition-all hover:shadow-md",
      isCompleted && "border-green-500/30 bg-green-500/5",
      className
    )}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            isCompleted ? "bg-green-500/10" : "bg-primary/10"
          )}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Icon className="w-5 h-5 text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {goalTypeLabels[goalType]}
                  </Badge>
                  {category && (
                    <Badge variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  )}
                </div>
                <h3 className={cn(
                  "font-semibold line-clamp-1",
                  isCompleted && "text-green-600"
                )}>
                  {title}
                </h3>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {!isCompleted && onComplete && (
                    <DropdownMenuItem onClick={onComplete}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}

            {/* Progress */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {currentValue} / {targetValue}
                </span>
                <span className={cn(
                  "font-medium",
                  isCompleted ? "text-green-500" : "text-foreground"
                )}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor())}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            {targetDate && !isCompleted && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {daysRemaining !== null && daysRemaining > 0 ? (
                  <span>{daysRemaining} days remaining</span>
                ) : daysRemaining === 0 ? (
                  <span className="text-orange-500">Due today</span>
                ) : (
                  <span className="text-red-500">Overdue</span>
                )}
              </div>
            )}

            {isCompleted && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Goal completed!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
