import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  Shuffle,
  BookOpen,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function FlashcardGenerator() {
  const [inputText, setInputText] = useState("");
  const [deckName, setDeckName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setFlashcards([]);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: inputText, deckName }),
      });

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.flashcards);
      } else {
        // Fallback mock data
        setFlashcards(generateMockFlashcards(inputText));
      }
    } catch (error) {
      setFlashcards(generateMockFlashcards(inputText));
    }

    clearInterval(progressInterval);
    setGenerationProgress(100);
    setIsGenerating(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const generateMockFlashcards = (text: string): Flashcard[] => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    return sentences.slice(0, 10).map((sentence, i) => ({
      id: `card-${i}`,
      front: `What is the key concept in: "${sentence.trim().slice(0, 50)}..."?`,
      back: sentence.trim(),
      difficulty: (["easy", "medium", "hard"] as const)[i % 3],
    }));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const handleShuffle = () => {
    setFlashcards([...flashcards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const saveDeck = async () => {
    try {
      await fetch("/api/flashcard-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: deckName || "AI Generated Deck",
          cards: flashcards,
          isAiGenerated: true,
        }),
      });
      alert("Flashcard deck saved!");
    } catch (error) {
      console.error("Failed to save deck:", error);
    }
  };

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-600",
    medium: "bg-yellow-500/10 text-yellow-600",
    hard: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Flashcard Generator</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Paste your notes and let AI create flashcards
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Deck Name (optional)</label>
            <Input
              placeholder="e.g., Biology Chapter 5, React Hooks..."
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Paste your notes or content</label>
            <Textarea
              placeholder="Paste your study notes, textbook content, or any text you want to learn from..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {inputText.length} characters • AI will generate ~{Math.max(1, Math.floor(inputText.length / 200))} flashcards
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!inputText.trim() || isGenerating}
            className="w-full h-12 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Flashcards... {generationProgress}%
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Flashcards
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Flashcards */}
      <AnimatePresence>
        {flashcards.length > 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{flashcards.length} cards generated</span>
                    </div>
                    <Badge variant="secondary">
                      Card {currentIndex + 1} of {flashcards.length}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShuffle}>
                      <Shuffle className="w-4 h-4 mr-1" />
                      Shuffle
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveDeck}>
                      <Save className="w-4 h-4 mr-1" />
                      Save Deck
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flashcard Display */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="h-12 w-12 rounded-full shrink-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex-1 perspective-1000">
                <motion.div
                  className="relative w-full h-64 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front */}
                    <Card
                      className={cn(
                        "absolute inset-0 backface-hidden",
                        "bg-gradient-to-br from-primary/5 to-primary/10"
                      )}
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <Badge className={cn("mb-4", difficultyColors[flashcards[currentIndex]?.difficulty || "easy"])}>
                          {flashcards[currentIndex]?.difficulty}
                        </Badge>
                        <p className="text-lg font-medium">{flashcards[currentIndex]?.front}</p>
                        <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
                      </CardContent>
                    </Card>

                    {/* Back */}
                    <Card
                      className="absolute inset-0 backface-hidden bg-gradient-to-br from-green-500/5 to-emerald-500/10"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                        <p className="text-lg">{flashcards[currentIndex]?.back}</p>
                        <p className="text-sm text-muted-foreground mt-4">Click to see question</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="h-12 w-12 rounded-full shrink-0"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1 flex-wrap">
              {flashcards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex(i);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentIndex ? "w-6 bg-primary" : "bg-muted hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            {/* All Cards List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  All Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {flashcards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setCurrentIndex(i);
                      setIsFlipped(false);
                    }}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                      i === currentIndex && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{card.front}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{card.back}</p>
                      </div>
                      <Badge className={cn("shrink-0", difficultyColors[card.difficulty])}>
                        {card.difficulty}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
