import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, Medal, Award, Crown, Zap, TrendingUp,
  TrendingDown, Minus, ChevronUp, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalXp: number;
  level: number;
  rank: number;
  weeklyXp?: number;
  monthlyXp?: number;
  isCurrentUser?: boolean;
  rankChange?: number; // positive = moved up, negative = moved down
  avatar?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

const rankConfig = {
  1: {
    icon: Crown,
    color: "text-yellow-500",
    bg: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/20",
  },
  2: {
    icon: Medal,
    color: "text-gray-400",
    bg: "bg-gradient-to-r from-gray-400/20 to-gray-500/20",
    border: "border-gray-400/30",
    glow: "shadow-gray-400/20",
  },
  3: {
    icon: Award,
    color: "text-orange-600",
    bg: "bg-gradient-to-r from-orange-600/20 to-orange-700/20",
    border: "border-orange-600/30",
    glow: "shadow-orange-600/20",
  },
};

export default function Leaderboard({
  entries,
  currentUserId,
  className,
}: LeaderboardProps) {
  const [timeframe, setTimeframe] = useState<"all" | "monthly" | "weekly">("all");

  // Sort entries based on timeframe
  const sortedEntries = [...entries].sort((a, b) => {
    if (timeframe === "weekly") return (b.weeklyXp || 0) - (a.weeklyXp || 0);
    if (timeframe === "monthly") return (b.monthlyXp || 0) - (a.monthlyXp || 0);
    return b.totalXp - a.totalXp;
  });

  // Recalculate ranks after sorting
  const rankedEntries = sortedEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const getXpForTimeframe = (entry: LeaderboardEntry) => {
    if (timeframe === "weekly") return entry.weeklyXp || 0;
    if (timeframe === "monthly") return entry.monthlyXp || 0;
    return entry.totalXp;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <CardTitle className="text-lg">Leaderboard</CardTitle>
          </div>
        </div>

        {/* Timeframe Tabs */}
        <Tabs
          value={timeframe}
          onValueChange={(v) => setTimeframe(v as any)}
          className="mt-3"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-3">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-2 mb-6 pt-4">
          {[1, 0, 2].map((podiumIndex) => {
            const entry = rankedEntries[podiumIndex];
            if (!entry) return null;
            const config = rankConfig[entry.rank as 1 | 2 | 3];
            const Icon = config?.icon || Trophy;
            const heights = ["h-20", "h-28", "h-16"];
            const orders = ["order-2", "order-1", "order-3"];

            return (
              <motion.div
                key={entry.userId}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: podiumIndex * 0.1 }}
                className={cn("flex flex-col items-center", orders[podiumIndex])}
              >
                {/* Avatar with crown for #1 */}
                <div className="relative mb-2">
                  {entry.rank === 1 && (
                    <motion.div
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                    >
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "relative rounded-full p-1",
                      entry.rank === 1 && "bg-gradient-to-br from-yellow-400 to-orange-500",
                      entry.rank === 2 && "bg-gradient-to-br from-gray-300 to-gray-500",
                      entry.rank === 3 && "bg-gradient-to-br from-orange-400 to-orange-600"
                    )}
                  >
                    <Avatar className="w-12 h-12 border-2 border-white">
                      <AvatarFallback className="bg-card text-lg font-bold">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </div>

                {/* Name */}
                <p className="text-sm font-medium truncate max-w-[80px] text-center">
                  {entry.username}
                </p>

                {/* XP */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  {getXpForTimeframe(entry).toLocaleString()}
                </div>

                {/* Podium */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ delay: 0.3 + podiumIndex * 0.1 }}
                  className={cn(
                    "w-20 rounded-t-lg flex items-center justify-center mt-2",
                    heights[podiumIndex],
                    config?.bg || "bg-muted"
                  )}
                >
                  <span className="text-2xl font-bold opacity-50">
                    {entry.rank}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Rest of the list */}
        <div className="space-y-2">
          {rankedEntries.slice(3).map((entry, index) => {
            const isCurrentUser = entry.isCurrentUser || entry.userId === currentUserId;

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  isCurrentUser
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  <span
                    className={cn(
                      "font-bold",
                      entry.rank <= 10 ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    #{entry.rank}
                  </span>
                </div>

                {/* Rank change indicator */}
                <div className="w-5">
                  {entry.rankChange !== undefined && entry.rankChange !== 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "flex items-center",
                        entry.rankChange > 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {entry.rankChange > 0 ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarFallback
                    className={cn(
                      "text-sm font-medium",
                      isCurrentUser && "bg-primary text-primary-foreground"
                    )}
                  >
                    {entry.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {entry.username}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          You
                        </Badge>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Level {entry.level}
                    {entry.rank <= 10 && (
                      <span className="ml-2 text-primary">• Top 10</span>
                    )}
                  </p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Zap className="w-4 h-4" />
                    {getXpForTimeframe(entry).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Current user highlight if not in top */}
        {currentUserId && !rankedEntries.slice(0, 10).find((e) => e.userId === currentUserId || e.isCurrentUser) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t border-dashed"
          >
            <p className="text-xs text-muted-foreground text-center mb-2">
              Your Position
            </p>
            {rankedEntries
              .filter((e) => e.userId === currentUserId || e.isCurrentUser)
              .map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <span className="font-bold text-primary">#{entry.rank}</span>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{entry.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {entry.level}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Zap className="w-4 h-4" />
                    {getXpForTimeframe(entry).toLocaleString()}
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
