import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchService, SearchResult } from "@/lib/search-service";

const GEMINI_API_KEY = "AIzaSyDCSCfzH-fsmC592sdxX0SN6mDxtweapHc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  learnUrl?: string;
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

interface LearningPathGeneratorProps {
  onPathSaved?: (savedPath: any) => void;
}

export default function LearningPathGenerator({ onPathSaved }: LearningPathGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [currentLevel, setCurrentLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [goal, setGoal] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("30");
  const [isGenerating, setIsGenerating] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      let searchContext = "";
      
      let foundSources: SearchResult[] = [];
      
      // Perform web search if enabled
      if (webSearchEnabled) {
        const searchResponse = await searchService.search(`best ${topic} learning path tutorial ${currentLevel}`, 5);
        if (searchResponse.results.length > 0) {
          foundSources = searchResponse.results;
          searchContext = `\n\nWeb search results for reference:\n${searchService.formatResultsForAI(searchResponse.results)}`;
        }
      }

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are an expert curriculum designer. Create practical learning paths. Respond with valid JSON only.",
      });

      const prompt = `Create a learning path for "${topic}" at ${currentLevel} level.
Goal: ${goal || "Become proficient"}
Daily time: ${timeCommitment} minutes
${searchContext}

Return JSON only:
{"title":"string","description":"string","totalDuration":"X weeks","difficulty":"${currentLevel}","prerequisites":["string"],"estimatedCompletion":"X days","skills":["string"],"modules":[{"id":"1","title":"string","description":"string","duration":"X week(s)","topics":["string"],"difficulty":"beginner|intermediate|advanced"}]}

Create 4-5 modules with progressive difficulty. Use the web search results to make recommendations more accurate and up-to-date.`;

      const response = await model.generateContent(prompt);
      let text = response.response.text().trim();
      if (text.startsWith("```")) text = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      const parsedPath = JSON.parse(text) as GeneratedPath;
      
      // Assign learning URLs from search sources to modules
      if (parsedPath.modules && foundSources.length > 0) {
        parsedPath.modules = parsedPath.modules.map((module, index) => {
          const sourceIndex = index % foundSources.length;
          return { ...module, learnUrl: foundSources[sourceIndex]?.url };
        });
      }
      
      // Auto-save the path immediately after generation
      await autoSavePath(parsedPath, foundSources);
    } catch (error) {
      console.error("Error:", error);
      const fallbackPath: GeneratedPath = {
        title: `Learn ${topic}`,
        description: `A structured path to learn ${topic} from ${currentLevel} level.`,
        totalDuration: "6 weeks",
        difficulty: currentLevel,
        prerequisites: ["Basic computer skills"],
        estimatedCompletion: "42 days",
        skills: [topic, "Problem Solving"],
        modules: [
          { id: "1", title: "Fundamentals", description: "Core concepts", duration: "2 weeks", topics: ["Basics", "Setup"], difficulty: "beginner" as const },
          { id: "2", title: "Intermediate", description: "Build skills", duration: "2 weeks", topics: ["Practice", "Projects"], difficulty: "intermediate" as const },
          { id: "3", title: "Advanced", description: "Master the topic", duration: "2 weeks", topics: ["Advanced", "Real-world"], difficulty: "advanced" as const },
        ],
      };
      await autoSavePath(fallbackPath, []);
    }
    setIsGenerating(false);
  };
  
  const autoSavePath = async (pathData: GeneratedPath, _sources: SearchResult[]) => {
    try {
      const response = await fetch("/api/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: pathData.title,
          description: pathData.description,
          category: topic,
          skillLevel: currentLevel,
          estimatedDuration: parseInt(pathData.totalDuration) * 7 * parseInt(timeCommitment),
          totalModules: pathData.modules.length,
          completedModules: 0,
          progress: 0,
          modules: pathData.modules,
          skills: pathData.skills,
          prerequisites: pathData.prerequisites,
          isAiGenerated: true,
          status: "active",
        }),
      });
      if (response.ok) {
        const savedPath = await response.json();
        // Immediately show the Duolingo-style path view
        onPathSaved?.(savedPath);
      }
    } catch (error) {
      console.error("Failed to auto-save:", error);
    }
  };






  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">What do you want to learn?</label>
        <Input
          placeholder="e.g., React, Python, Machine Learning..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your level</label>
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as const).map((level) => (
            <Button
              key={level}
              variant={currentLevel === level ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentLevel(level)}
              className="flex-1 capitalize"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Goal (optional)</label>
        <Textarea
          placeholder="e.g., Build a web app, Get a job..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Daily time</label>
        <div className="flex gap-2">
          {["15", "30", "60", "120"].map((time) => (
            <Button
              key={time}
              variant={timeCommitment === time ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeCommitment(time)}
              className="flex-1"
            >
              {time}m
            </Button>
          ))}
        </div>
      </div>

      {/* Web Search Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Web Search</label>
        <button
          type="button"
          onClick={() => setWebSearchEnabled(!webSearchEnabled)}
          className={cn(
            "rounded-full transition-all flex items-center gap-2 px-3 py-1.5 border text-sm",
            webSearchEnabled
              ? "bg-emerald-500/15 border-emerald-400 text-emerald-600"
              : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className={cn("w-4 h-4", webSearchEnabled && "text-emerald-500")} />
          {webSearchEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <Button onClick={handleGenerate} disabled={!topic.trim() || isGenerating} className="w-full">
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />{webSearchEnabled ? "Searching & Generating..." : "Generating..."}</>
        ) : (
          "Generate Path"
        )}
      </Button>
    </div>
  );
}
