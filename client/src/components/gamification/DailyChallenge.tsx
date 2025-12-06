import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target, Zap, Clock, CheckCircle2, Play, Flame,
  Brain, BookOpen, Trophy, Sparkles, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "study_time" | "streak" | "lesson" | "flashcard";
  xpReward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  timeLeft?: string;
}

interface DailyChallengeProps {
  challenges: Challenge[];
  onStartChallenge: (id: string) => void;
  className?: string;
}

const typeConfig = {
  quiz: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
  study_time: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  streak: { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
  lesson: { icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
  flashcard: { icon: Target, color: "text-pink-500", bg: "bg-pink-500/10" },
};

export default function DailyChallenge({
  challenges,
  onStartChallenge,
  className,
}: DailyChallengeProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const totalXP = challenges.reduce((sum, c) => sum + c.xpReward, 0);
  const earnedXP = challenges
    .filter((c) => c.isCompleted)
    .reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <Card className={cn("overflow-hidden card-3d quest-card", className)}>
      {/* Header with gradient */}
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 via-yellow-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-6 h-6 text-primary" />
            </motion.div>
            <CardTitle className="text-lg">Daily Challenges</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{earnedXP}</span>
            <span className="text-muted-foreground">/ {totalXP} XP</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              {completedCount} of {challenges.length} completed
            </span>
            {completedCount === challenges.length && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-500 font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                All done!
              </motion.span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / challenges.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-yellow-500 rounded-full"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2">
        {challenges.map((challenge, index) => {
          const config = typeConfig[challenge.type];
          const Icon = config.icon;
          const progressPercent = (challenge.progress / challenge.target) * 100;
          const isExpanded = expandedId === challenge.id;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all",
                  challenge.isCompleted
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-card hover:bg-muted/50 border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <motion.div
                    animate={
                      challenge.isCompleted
                        ? { scale: [1, 1.2, 1] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      challenge.isCompleted
                        ? "bg-green-500"
                        : config.bg
                    )}
                  >
                    {challenge.isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </motion.div>
                    ) : (
                      <Icon className={cn("w-5 h-5", config.color)} />
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={cn(
                          "font-medium text-sm",
                          challenge.isCompleted && "line-through text-muted-foreground"
                        )}
                      >
                        {challenge.title}
                      </h4>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs font-semibold">
                          +{challenge.xpReward}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!challenge.isCompleted && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {challenge.progress} / {challenge.target}
                          </span>
                          <span className="font-medium">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className={cn(
                              "h-full rounded-full",
                              progressPercent >= 100
                                ? "bg-green-500"
                                : "bg-primary"
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand indicator */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    className="text-muted-foreground"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && !challenge.isCompleted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          {challenge.description}
                        </p>
                        <Button
                          size="sm"
                          variant="duo-green"
                          className="w-full gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartChallenge(challenge.id);
                          }}
                        >
                          <Play className="w-4 h-4" />
                          Start Challenge
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Bonus reward for completing all */}
        {completedCount === challenges.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            </motion.div>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">
              All Challenges Complete!
            </p>
            <p className="text-sm text-muted-foreground">
              +50 bonus XP earned
            </p>
          </motion.div>
        )}

        {/* Time remaining */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <Clock className="w-3 h-3" />
          <span>Resets in 12h 34m</span>
        </div>
      </CardContent>
    </Card>
  );
}
