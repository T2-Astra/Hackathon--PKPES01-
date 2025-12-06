import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Sparkles,
  Filter,
  BookOpen,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import LearningPathCard from "@/components/learning/LearningPathCard";
import { useAuth } from "@/hooks/useAuthContext";

export default function LearningPaths() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-paths");

  // Fetch learning paths from API
  const { data: learningPaths = [], isLoading } = useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths", {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch categories for suggested paths
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filteredPaths = learningPaths.filter(
    (path: any) =>
      path.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePaths = filteredPaths.filter(
    (p: any) => p.status === "active" || !p.status
  );
  const completedPaths = filteredPaths.filter(
    (p: any) => p.status === "completed"
  );

  // Calculate total study time
  const totalTime = learningPaths.reduce(
    (acc: number, p: any) => acc + (p.estimatedDuration || 0),
    0
  );
  const totalHours = Math.round(totalTime / 60);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Learning Paths
            </h1>
            <p className="text-muted-foreground mt-1">
              Structured courses to master new skills
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setLocation("/ai-tools")}>
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Custom Path
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search learning paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{learningPaths.length}</p>
                  <p className="text-sm text-muted-foreground">Total Paths</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activePaths.length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedPaths.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-paths">My Paths</TabsTrigger>
            <TabsTrigger value="suggested">Suggested for You</TabsTrigger>
            <TabsTrigger value="explore">Explore All</TabsTrigger>
          </TabsList>

          <TabsContent value="my-paths" className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <>
                {activePaths.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      In Progress
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activePaths.map((path: any) => (
                        <LearningPathCard
                          key={path._id || path.id}
                          id={path._id || path.id}
                          title={path.title}
                          description={path.description}
                          category={path.category}
                          skillLevel={path.skillLevel || "beginner"}
                          estimatedDuration={path.estimatedDuration || 0}
                          totalModules={path.totalModules || 0}
                          completedModules={path.completedModules || 0}
                          progress={path.progress || 0}
                          isAiGenerated={path.isAiGenerated || false}
                          status={path.status || "active"}
                          onContinue={() =>
                            console.log("Continue:", path._id || path.id)
                          }
                          onView={() =>
                            console.log("View:", path._id || path.id)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {completedPaths.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Completed
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedPaths.map((path: any) => (
                        <LearningPathCard
                          key={path._id || path.id}
                          id={path._id || path.id}
                          title={path.title}
                          description={path.description}
                          category={path.category}
                          skillLevel={path.skillLevel || "beginner"}
                          estimatedDuration={path.estimatedDuration || 0}
                          totalModules={path.totalModules || 0}
                          completedModules={path.completedModules || 0}
                          progress={path.progress || 0}
                          isAiGenerated={path.isAiGenerated || false}
                          status="completed"
                          onView={() =>
                            console.log("View:", path._id || path.id)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredPaths.length === 0 && (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No learning paths yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start your learning journey by creating a custom path or
                      exploring suggested ones
                    </p>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Path
                    </Button>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="suggested" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">
                  Based on popular categories
                </p>
              </div>
              {categories.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.slice(0, 6).map((cat: any) => (
                    <Card
                      key={cat._id || cat.name}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cat.description}
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Explore
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No suggestions available yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="explore" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat: any) => (
                <Card
                  key={cat._id || cat.name}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cat.description}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Start Learning
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
