import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play, Lock, CheckCircle2, Star, Flame, Trophy,
  Clock, ExternalLink, ChevronLeft, Zap, X, BookOpen, Loader2, Link2, Youtube, FileText, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchService } from "@/lib/search-service";

const GEMINI_API_KEY = "AIzaSyDCSCfzH-fsmC592sdxX0SN6mDxtweapHc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface LearningResource {
  title: string;
  type: "article" | "video" | "tutorial" | "documentation";
  url: string;
  description: string;
  duration?: string;
} 

interface LessonContent {
  overview: string;
  keyPoints: string[];
  resources: LearningResource[];
  practiceTask: string;
}

interface ActiveLessonState {
  moduleIndex: number;
  startTime: number;
  lessonContent: LessonContent | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  learnUrl?: string;
  generatedContent?: LessonContent; // Cached content in DB
}

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  category: string;
  skillLevel: string;
  modules: Module[];
  totalModules: number;
  completedModules: number;
  progress: number;
  activeLesson?: ActiveLessonState; // Stored in DB
}

interface LearningPathViewProps {
  path: LearningPath;
  onBack: () => void;
  onUpdateProgress: (pathId: string, moduleIndex: number) => void;
}

export default function LearningPathView({ path: initialPath, onBack, onUpdateProgress }: LearningPathViewProps) {
  const [path, setPath] = useState<LearningPath>(initialPath);
  const [currentModule, setCurrentModule] = useState(initialPath.completedModules || 0);
  const [activeLesson, setActiveLesson] = useState<{ module: Module; index: number } | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const streak = 3;
  const xp = 150;

  const isModuleUnlocked = (index: number) => index <= currentModule;
  const isModuleCompleted = (index: number) => index < currentModule;

  // Fetch fresh path data on mount
  const fetchLatestPath = useCallback(async () => {
    try {
      const res = await fetch(`/api/learning-paths`, { credentials: "include" });
      if (res.ok) {
        const paths = await res.json();
        const latestPath = paths.find((p: LearningPath) => p._id === initialPath._id);
        if (latestPath) {
          setPath(latestPath);
          return latestPath;
        }
      }
    } catch (error) {
      console.error("Failed to fetch latest path:", error);
    }
    return initialPath;
  }, [initialPath._id]);

  // Save active lesson state to MongoDB
  const saveActiveLessonToDB = useCallback(async (lessonState: ActiveLessonState | null) => {
    try {
      await fetch(`/api/learning-paths/${path._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ activeLesson: lessonState }),
      });
    } catch (error) {
      console.error("Failed to save lesson state:", error);
    }
  }, [path._id]);

  // Save generated content to module in MongoDB
  const saveModuleContentToDB = useCallback(async (moduleIndex: number, content: LessonContent) => {
    try {
      const updatedModules = [...(path.modules || [])];
      if (updatedModules[moduleIndex]) {
        updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], generatedContent: content };
      }
      await fetch(`/api/learning-paths/${path._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modules: updatedModules }),
      });
    } catch (error) {
      console.error("Failed to save module content:", error);
    }
  }, [path._id, path.modules]);

  // Fetch fresh data on mount
  useEffect(() => {
    const initializeFromDB = async () => {
      await fetchLatestPath();
      setIsInitialized(true);
    };
    
    initializeFromDB();
  }, [fetchLatestPath]);



  const generateLessonContent = async (module: Module, moduleIndex: number) => {
    // Check if content already exists in module
    if (module.generatedContent) {
      setLessonContent(module.generatedContent);
      return;
    }

    setIsLoadingContent(true);
    try {
      const searchQuery = `${module.title} ${path.category} tutorial guide`;
      const searchResponse = await searchService.search(searchQuery, 5);
      
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are an expert educator. Create helpful learning content. Respond with valid JSON only.",
      });

      const prompt = `Create learning content for this lesson:
Topic: ${module.title}
Category: ${path.category}
Level: ${path.skillLevel}
Description: ${module.description}
Topics to cover: ${module.topics.join(", ")}

${searchResponse.results.length > 0 ? `Real resources found:\n${searchResponse.results.map(r => `- ${r.title}: ${r.url}`).join("\n")}` : ""}

Return JSON only:
{
  "overview": "2-3 sentence overview of what the learner will achieve",
  "keyPoints": ["5 key learning points as bullet points"],
  "resources": [
    {"title": "Resource name", "type": "article|video|tutorial|documentation", "url": "real URL from search or well-known site", "description": "Brief description", "duration": "10 min"}
  ],
  "practiceTask": "A specific hands-on task the learner should complete"
}

Use the real URLs from search results when available. For missing resources, use well-known educational sites like MDN, W3Schools, freeCodeCamp, YouTube tutorials, official documentation.`;

      const response = await model.generateContent(prompt);
      let text = response.response.text().trim();
      if (text.startsWith("```")) text = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      const content = JSON.parse(text) as LessonContent;
      
      if (searchResponse.results.length > 0 && content.resources.length < 3) {
        searchResponse.results.slice(0, 3).forEach(r => {
          if (!content.resources.find(res => res.url === r.url)) {
            content.resources.push({
              title: r.title,
              type: "article",
              url: r.url,
              description: r.description,
              duration: "5-10 min"
            });
          }
        });
      }
      
      setLessonContent(content);
      // Save content to DB for persistence
      await saveModuleContentToDB(moduleIndex, content);
    } catch (error) {
      console.error("Error generating content:", error);
      const fallback: LessonContent = {
        overview: `Learn the fundamentals of ${module.title}. This lesson covers essential concepts and practical applications.`,
        keyPoints: module.topics.slice(0, 5).map(t => `Understand ${t}`),
        resources: [
          { title: `${module.title} - Google Search`, type: "article", url: `https://www.google.com/search?q=${encodeURIComponent(module.title + " tutorial")}`, description: "Find tutorials and guides", duration: "Varies" }
        ],
        practiceTask: `Practice the concepts from ${module.title} by building a small project or completing exercises.`
      };
      setLessonContent(fallback);
      await saveModuleContentToDB(moduleIndex, fallback);
    }
    setIsLoadingContent(false);
  };

  const handleOpenLesson = async (module: Module, index: number) => {
    // Fetch latest path data
    const latestPath = await fetchLatestPath();
    const latestModule = latestPath.modules?.[index] || module;
    
    setActiveLesson({ module: latestModule, index });
    
    // Use cached content if available, otherwise generate
    if (latestModule.generatedContent) {
      setLessonContent(latestModule.generatedContent);
    } else {
      setLessonContent(null);
      await generateLessonContent(latestModule, index);
    }
  };

  const handleCloseLesson = async () => {
    setActiveLesson(null);
    setLessonContent(null);
  };

  const handleCompleteModule = async () => {
    if (activeLesson) {
      const newModule = activeLesson.index + 1;
      setCurrentModule(newModule);
      onUpdateProgress(path._id, newModule);
      setActiveLesson(null);
      setLessonContent(null);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return <Youtube className="w-4 h-4 text-red-500" />;
      case "tutorial": return <FileText className="w-4 h-4 text-blue-500" />;
      case "documentation": return <BookOpen className="w-4 h-4 text-purple-500" />;
      default: return <Link2 className="w-4 h-4 text-green-500" />;
    }
  };



  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Active lesson overlay
  if (activeLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleCloseLesson} className="gap-1">
                <X className="w-4 h-4" />
                Close
              </Button>
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium text-sm">Learning</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-card border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{activeLesson.module.title}</h2>
                <p className="text-xs text-muted-foreground">{activeLesson.module.duration} • {path.skillLevel}</p>
              </div>
            </div>
          </div>

          {isLoadingContent && (
            <div className="bg-card border rounded-2xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">Generating personalized learning content...</p>
            </div>
          )}

          {lessonContent && (
            <>
              <div className="bg-card border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-semibold text-sm">Overview</h3>
                </div>
                <p className="text-sm text-muted-foreground">{lessonContent.overview}</p>
              </div>

              <div className="bg-card border rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3">What You'll Learn</h3>
                <ul className="space-y-2">
                  {lessonContent.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3">Learning Resources</h3>
                <div className="space-y-2">
                  {lessonContent.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shrink-0">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{resource.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {resource.duration && (
                          <span className="text-xs text-muted-foreground">{resource.duration}</span>
                        )}
                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Practice Task</h3>
                </div>
                <p className="text-sm text-muted-foreground">{lessonContent.practiceTask}</p>
              </div>
            </>
          )}

          <Button
            onClick={handleCompleteModule}
            className="w-full h-12 text-base gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Complete Lesson (+10 XP)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-orange-500">
                <Flame className="w-5 h-5" />
                <span className="font-bold">{streak}</span>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold">{xp} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <Badge className="mb-3">{path.category}</Badge>
          <h1 className="text-2xl font-bold mb-2">{path.title}</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{path.description}</p>
          
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{currentModule}/{path.modules?.length || 0} lessons</span>
            </div>
            <Progress value={(currentModule / (path.modules?.length || 1)) * 100} className="h-3" />
          </div>
        </div>

        <div className="bg-primary/10 rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Daily Goal: 15 min</p>
              <p className="text-sm text-muted-foreground">Complete 1 lesson today</p>
            </div>
          </div>
          <Zap className="w-8 h-8 text-yellow-500" />
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-muted -translate-x-1/2" />

          <div className="space-y-6 relative">
            {path.modules?.map((module, index) => {
              const unlocked = isModuleUnlocked(index);
              const completed = isModuleCompleted(index);
              const isCurrent = index === currentModule;
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={module.id}
                  className={cn(
                    "flex items-center gap-4",
                    isLeft ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "flex-1 max-w-[calc(50%-2rem)]",
                    isLeft ? "text-right" : "text-left"
                  )}>
                    <div className={cn(
                      "inline-block p-4 rounded-2xl border-2 transition-all",
                      completed && "bg-green-500/10 border-green-500/30",
                      isCurrent && "bg-primary/10 border-primary shadow-lg shadow-primary/20",
                      !unlocked && "bg-muted/50 border-muted opacity-60"
                    )}>
                      <p className="font-semibold text-sm mb-1">{module.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{module.duration}</p>
                      
                      {isCurrent && (
                        <div className={cn("flex gap-2 mt-3", isLeft ? "justify-end" : "justify-start")}>
                          <Button
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => handleOpenLesson(module, index)}
                          >
                            <Play className="w-3 h-3" /> Open
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center z-10 border-4 transition-all shrink-0",
                    completed && "bg-green-500 border-green-400 text-white",
                    isCurrent && "bg-primary border-primary/50 text-white animate-pulse",
                    !unlocked && "bg-muted border-muted-foreground/20 text-muted-foreground"
                  )}>
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isCurrent ? (
                      <Play className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 max-w-[calc(50%-2rem)]" />
                </div>
              );
            })}

            <div className="flex justify-center pt-4">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center border-4",
                currentModule >= (path.modules?.length || 0)
                  ? "bg-yellow-500 border-yellow-400 text-white"
                  : "bg-muted border-muted-foreground/20 text-muted-foreground"
              )}>
                <Trophy className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
