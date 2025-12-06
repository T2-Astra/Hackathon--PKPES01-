import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Flame, Target, Zap, Crown, Medal } from "lucide-react";
import AchievementBadge from "@/components/gamification/AchievementBadge";

const categoryConfig = [
  { id: "all", name: "All", icon: Trophy },
  { id: "streak", name: "Streaks", icon: Flame },
  { id: "quiz", name: "Quizzes", icon: Target },
  { id: "learning", name: "Learning", icon: Star },
  { id: "social", name: "Social", icon: Medal },
  { id: "level", name: "Levels", icon: Crown },
];

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch all achievements from API
  const { data: allAchievements = [], isLoading } = useQuery({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch user's earned achievements
  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/user/achievements"],
    queryFn: async () => {
      const res = await fetch("/api/user/achievements", {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Merge achievements with user progress
  const achievementsWithProgress = allAchievements.map((achievement: any) => {
    const userAchievement = userAchievements.find(
      (ua: any) => ua.achievementId === (achievement._id?.toString() || achievement.id)
    );
    return {
      ...achievement,
      id: achievement._id?.toString() || achievement.id,
      isEarned: !!userAchievement,
      earnedAt: userAchievement?.earnedAt
        ? new Date(userAchievement.earnedAt)
        : undefined,
      progress: userAchievement?.progress || 0,
    };
  });

  const filteredAchievements =
    selectedCategory === "all"
      ? achievementsWithProgress
      : achievementsWithProgress.filter(
          (a: any) => a.category === selectedCategory
        );

  const earnedCount = achievementsWithProgress.filter(
    (a: any) => a.isEarned
  ).length;
  const totalXpEarned = achievementsWithProgress
    .filter((a: any) => a.isEarned)
    .reduce((sum: number, a: any) => sum + (a.xpReward || 0), 0);

  const rarityStats = {
    common: achievementsWithProgress.filter(
      (a: any) => a.rarity === "common" && a.isEarned
    ).length,
    rare: achievementsWithProgress.filter(
      (a: any) => a.rarity === "rare" && a.isEarned
    ).length,
    epic: achievementsWithProgress.filter(
      (a: any) => a.rarity === "epic" && a.isEarned
    ).length,
    legendary: achievementsWithProgress.filter(
      (a: any) => a.rarity === "legendary" && a.isEarned
    ).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Achievements
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your accomplishments and earn rewards
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              {totalXpEarned} XP Earned
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-primary">{earnedCount}</p>
              <p className="text-sm text-muted-foreground">Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-gray-500">
                {rarityStats.common}
              </p>
              <p className="text-sm text-muted-foreground">Common</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-blue-500">
                {rarityStats.rare}
              </p>
              <p className="text-sm text-muted-foreground">Rare</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-purple-500">
                {rarityStats.epic}
              </p>
              <p className="text-sm text-muted-foreground">Epic</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {rarityStats.legendary}
              </p>
              <p className="text-sm text-muted-foreground">Legendary</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to next achievement */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Progress to next achievement
              </span>
              <span className="text-sm text-muted-foreground">
                {earnedCount}/{achievementsWithProgress.length} unlocked
              </span>
            </div>
            <Progress
              value={
                achievementsWithProgress.length > 0
                  ? (earnedCount / achievementsWithProgress.length) * 100
                  : 0
              }
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            {categoryConfig.map((cat) => {
              const Icon = cat.icon;
              const count =
                cat.id === "all"
                  ? achievementsWithProgress.length
                  : achievementsWithProgress.filter(
                      (a: any) => a.category === cat.id
                    ).length;

              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {/* Earned Achievements */}
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-semibold">Earned</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {filteredAchievements
                  .filter((a: any) => a.isEarned)
                  .map((achievement: any) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <AchievementBadge
                        name={achievement.name}
                        description={achievement.description}
                        icon={achievement.icon}
                        rarity={achievement.rarity || "common"}
                        isEarned={achievement.isEarned}
                        earnedAt={achievement.earnedAt}
                      />
                      <span className="text-xs text-center text-muted-foreground line-clamp-2">
                        {achievement.name}
                      </span>
                    </div>
                  ))}
              </div>
              {filteredAchievements.filter((a: any) => a.isEarned).length ===
                0 && (
                <p className="text-muted-foreground text-center py-8">
                  No achievements earned in this category yet
                </p>
              )}
            </div>

            {/* Locked Achievements */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Locked</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {filteredAchievements
                  .filter((a: any) => !a.isEarned)
                  .map((achievement: any) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <AchievementBadge
                        name={achievement.name}
                        description={achievement.description}
                        icon={achievement.icon}
                        rarity={achievement.rarity || "common"}
                        isEarned={false}
                        progress={achievement.progress}
                      />
                      <span className="text-xs text-center text-muted-foreground line-clamp-2">
                        {achievement.name}
                      </span>
                    </div>
                  ))}
              </div>
              {filteredAchievements.filter((a: any) => !a.isEarned).length ===
                0 && (
                <p className="text-muted-foreground text-center py-8">
                  All achievements in this category earned! 🎉
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
