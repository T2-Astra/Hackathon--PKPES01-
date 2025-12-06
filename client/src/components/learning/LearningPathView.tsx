import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play, Lock, CheckCircle2, Star, Flame, Trophy,
  Clock, ExternalLink, ChevronLeft, Zap, X, BookOpen, Loader2, Link2, Youtube, FileText, Lightbulb, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchService } from "@/lib/search-service";

const GEMINI_API_KEY = "AIzaSyBm6iWJwEGwH5gDTXs2fTtaHTxM5xLPrjc";
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
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/learning-paths`, { 
        credentials: "include",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
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
      const token = localStorage.getItem('authToken');
      await fetch(`/api/learning-paths/${path._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
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
      const token = localStorage.getItem('authToken');
      const updatedModules = [...(path.modules || [])];
      if (updatedModules[moduleIndex]) {
        updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], generatedContent: content };
      }
      await fetch(`/api/learning-paths/${path._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
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
            variant="duo-cta"
            className="w-full h-14 text-lg gap-2"
          >
            <CheckCircle2 className="w-6 h-6" />
            Complete Lesson
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">+10 XP</span>
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

        {/* Skill Tree - Enhanced Duolingo Style */}
        <div className="relative py-4">
          {/* Animated path line */}
          <svg className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-4 h-full" style={{ zIndex: 0 }}>
            <line 
              x1="8" y1="0" x2="8" y2="100%" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="text-muted skill-path-line"
              strokeLinecap="round"
            />
          </svg>

          <div className="space-y-8 relative">
            {path.modules?.map((module, index) => {
              const unlocked = isModuleUnlocked(index);
              const completed = isModuleCompleted(index);
              const isCurrent = index === currentModule;
              const isLeft = index % 2 === 0;
              
              // Add treasure chest every 5 lessons
              const showTreasure = (index + 1) % 5 === 0 && index < (path.modules?.length || 0) - 1;

              return (
                <div key={module.id}>
                  <div
                    className={cn(
                      "flex items-center gap-4",
                      isLeft ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    {/* Lesson Card */}
                    <div className={cn(
                      "flex-1 max-w-[calc(50%-2rem)]",
                      isLeft ? "text-right" : "text-left"
                    )}>
                      <div className={cn(
                        "inline-block p-4 rounded-2xl border-2 transition-all card-3d",
                        completed && "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/40",
                        isCurrent && "bg-gradient-to-br from-primary/10 to-cyan-500/5 border-primary shadow-lg shadow-primary/20",
                        !unlocked && "bg-muted/30 border-muted/50 opacity-50 grayscale"
                      )}>
                        <p className="font-bold text-sm mb-1">{module.title}</p>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </p>
                        
                        {/* XP reward indicator */}
                        {(isCurrent || completed) && (
                          <div className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                            completed ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-600"
                          )}>
                            <Zap className="w-3 h-3" />
                            <span className="font-medium">{completed ? "+10 XP" : "10 XP"}</span>
                          </div>
                        )}
                        
                        {isCurrent && (
                          <div className={cn("flex gap-2 mt-3", isLeft ? "justify-end" : "justify-start")}>
                            <Button
                              variant="duo-green"
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => handleOpenLesson(module, index)}
                            >
                              <Play className="w-3 h-3" /> Start Lesson
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Node Circle - Enhanced Duolingo Style */}
                    <div className={cn(
                      "relative lesson-node shrink-0",
                      !unlocked && "lesson-node-locked",
                      isCurrent && "lesson-node-available"
                    )}>
                      {/* Outer glow for current */}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full bg-primary/30 blur-md scale-150" />
                      )}
                      
                      {/* Completion sparkle */}
                      {completed && (
                        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 sparkle z-20" />
                      )}
                      
                      <div className={cn(
                        "relative w-16 h-16 rounded-full flex items-center justify-center z-10 border-4 transition-all shadow-lg",
                        completed && "bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 text-white shadow-green-500/40",
                        isCurrent && "bg-gradient-to-br from-primary to-cyan-500 border-primary/50 text-white shadow-primary/40",
                        !unlocked && "bg-muted border-muted-foreground/20 text-muted-foreground shadow-none"
                      )}>
                        {completed ? (
                          <CheckCircle2 className="w-7 h-7 drop-shadow-md" />
                        ) : isCurrent ? (
                          <Play className="w-7 h-7 drop-shadow-md" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                        
                        {/* Level number badge */}
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2",
                          completed ? "bg-yellow-400 border-yellow-300 text-yellow-900" : 
                          isCurrent ? "bg-white border-primary text-primary" :
                          "bg-muted border-muted-foreground/20 text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 max-w-[calc(50%-2rem)]" />
                  </div>
                  
                  {/* Treasure Chest Milestone */}
                  {showTreasure && (
                    <div className="flex justify-center py-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        completed ? "bg-gradient-to-br from-yellow-400 to-orange-500 chest-glow" : "bg-muted/50"
                      )}>
                        <Star className={cn(
                          "w-6 h-6",
                          completed ? "text-white" : "text-muted-foreground"
                        )} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Trophy - Enhanced */}
            <div className="flex flex-col items-center pt-6">
              <div className="relative">
                {/* Glow effect for completed */}
                {currentModule >= (path.modules?.length || 0) && (
                  <div className="absolute inset-0 rounded-full bg-yellow-400/40 blur-xl scale-150" />
                )}
                
                <div className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl transition-all",
                  currentModule >= (path.modules?.length || 0)
                    ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-500 border-yellow-300 text-white shadow-yellow-500/50 chest-glow"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                )}>
                  <Trophy className="w-12 h-12 drop-shadow-lg" />
                </div>
                
                {currentModule >= (path.modules?.length || 0) && (
                  <>
                    <Sparkles className="absolute -top-2 left-0 w-6 h-6 text-yellow-300 sparkle" />
                    <Sparkles className="absolute -top-1 right-0 w-5 h-5 text-yellow-300 sparkle" style={{ animationDelay: '0.3s' }} />
                    <Sparkles className="absolute bottom-0 -right-2 w-4 h-4 text-yellow-300 sparkle" style={{ animationDelay: '0.6s' }} />
                  </>
                )}
              </div>
              
              <p className="text-center mt-3 font-bold text-sm">
                {currentModule >= (path.modules?.length || 0) ? (
                  <span className="gradient-text-gold">Path Complete!</span>
                ) : (
                  <span className="text-muted-foreground">Complete all lessons</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
