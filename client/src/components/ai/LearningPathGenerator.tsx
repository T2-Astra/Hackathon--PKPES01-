import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  Target,
  Clock,
  BookOpen,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Zap,
  Trophy,
  GraduationCap,
  Rocket,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface GeneratedPath {
  title: string;
  description: string;
  totalDuration: string;
  difficulty: string;
  prerequisites: string[];
  modules: Module[];
  estimatedCompletion: string;
  skills: string[];
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-600 border-red-500/30",
};

export default function LearningPathGenerator() {
  const [topic, setTopic] = useState("");
  const [currentLevel, setCurrentLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [goal, setGoal] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("30");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<GeneratedPath | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const generationSteps = [
    "Analyzing your learning goals...",
    "Assessing skill requirements...",
    "Creating personalized curriculum...",
    "Optimizing learning sequence...",
    "Finalizing your path...",
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedPath(null);
    setGenerationStep(0);

    // Simulate AI generation with steps
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch("/api/ai/generate-learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic,
          currentLevel,
          goal,
          dailyMinutes: parseInt(timeCommitment),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPath(data.path);
      } else {
        // Fallback mock data for demo
        setGeneratedPath(generateMockPath(topic, currentLevel));
      }
    } catch (error) {
      // Fallback mock data
      setGeneratedPath(generateMockPath(topic, currentLevel));
    }

    setIsGenerating(false);
  };

  const generateMockPath = (topic: string, level: string): GeneratedPath => ({
    title: `Master ${topic}`,
    description: `A comprehensive learning path to help you become proficient in ${topic}, tailored to your ${level} level.`,
    totalDuration: "8 weeks",
    difficulty: level,
    prerequisites: level === "beginner" ? ["Basic computer skills"] : ["Fundamentals of programming"],
    estimatedCompletion: "56 days",
    skills: [topic, "Problem Solving", "Critical Thinking", "Practical Application"],
    modules: [
      {
        id: "1",
        title: `Introduction to ${topic}`,
        description: "Learn the fundamentals and core concepts",
        duration: "1 week",
        topics: ["Core Concepts", "History & Evolution", "Use Cases", "Getting Started"],
        difficulty: "beginner",
      },
      {
        id: "2",
        title: "Building Foundations",
        description: "Strengthen your understanding with hands-on practice",
        duration: "2 weeks",
        topics: ["Basic Syntax", "Common Patterns", "Best Practices", "Mini Projects"],
        difficulty: "beginner",
      },
      {
        id: "3",
        title: "Intermediate Concepts",
        description: "Dive deeper into advanced topics",
        duration: "2 weeks",
        topics: ["Advanced Patterns", "Optimization", "Real-world Applications", "Case Studies"],
        difficulty: "intermediate",
      },
      {
        id: "4",
        title: "Advanced Techniques",
        description: "Master complex scenarios and edge cases",
        duration: "2 weeks",
        topics: ["Expert Patterns", "Performance Tuning", "Architecture", "Industry Standards"],
        difficulty: "advanced",
      },
      {
        id: "5",
        title: "Capstone Project",
        description: "Apply everything you've learned in a real project",
        duration: "1 week",
        topics: ["Project Planning", "Implementation", "Testing", "Deployment"],
        difficulty: "advanced",
      },
    ],
  });

  const savePath = async () => {
    if (!generatedPath) return;

    try {
      await fetch("/api/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...generatedPath,
          isAiGenerated: true,
          status: "active",
        }),
      });
      alert("Learning path saved successfully!");
    } catch (error) {
      console.error("Failed to save path:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Learning Path Generator</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Create a personalized curriculum powered by AI
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What do you want to learn?</label>
            <Input
              placeholder="e.g., React, Machine Learning, Data Science, Python..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Current Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your current level</label>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentLevel(level)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all capitalize",
                    currentLevel === level
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center",
                    level === "beginner" && "bg-green-500/20",
                    level === "intermediate" && "bg-yellow-500/20",
                    level === "advanced" && "bg-red-500/20"
                  )}>
                    {level === "beginner" && <Star className="w-4 h-4 text-green-500" />}
                    {level === "intermediate" && <Zap className="w-4 h-4 text-yellow-500" />}
                    {level === "advanced" && <Rocket className="w-4 h-4 text-red-500" />}
                  </div>
                  <span className="font-medium">{level}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your learning goal (optional)</label>
            <Textarea
              placeholder="e.g., Build a full-stack web app, Get a job as a data scientist..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={2}
            />
          </div>

          {/* Time Commitment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Daily time commitment</label>
            <div className="grid grid-cols-4 gap-2">
              {["15", "30", "60", "120"].map((time) => (
                <Button
                  key={time}
                  variant={timeCommitment === time ? "default" : "outline"}
                  onClick={() => setTimeCommitment(time)}
                  className="h-12"
                >
                  {time} min
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full h-14 text-lg gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Learning Path
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{generationSteps[generationStep]}</p>
                      <Progress value={(generationStep + 1) / generationSteps.length * 100} className="h-2 mt-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Path */}
      <AnimatePresence>
        {generatedPath && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Path Overview */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Path Generated!</span>
                    </div>
                    <h2 className="text-2xl font-bold">{generatedPath.title}</h2>
                    <p className="text-muted-foreground mt-1">{generatedPath.description}</p>
                  </div>
                  <Button onClick={savePath} className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Save Path
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{generatedPath.totalDuration}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <BookOpen className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-lg font-bold">{generatedPath.modules.length}</p>
                    <p className="text-xs text-muted-foreground">Modules</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">{generatedPath.skills.length}</p>
                    <p className="text-xs text-muted-foreground">Skills</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-lg font-bold">{generatedPath.estimatedCompletion}</p>
                    <p className="text-xs text-muted-foreground">To Complete</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {generatedPath.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-background/50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Modules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Learning Modules
              </h3>
              {generatedPath.modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Module Number */}
                        <div className="w-16 bg-muted flex items-center justify-center shrink-0">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                        
                        {/* Module Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{module.title}</h4>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("border", difficultyColors[module.difficulty])}>
                                {module.difficulty}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {module.duration}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Topics */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {module.topics.map((topic, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-muted rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="w-12 flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
