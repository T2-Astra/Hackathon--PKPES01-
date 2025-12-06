import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Play, Trash2, ChevronLeft, ChevronRight,
  RotateCcw, Check, X, Loader2, Brain, ArrowUp, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyDCSCfzH-fsmC592sdxX0SN6mDxtweapHc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface FlashcardDeck {
  _id?: string;
  title: string;
  description?: string;
  category?: string;
  cards: Flashcard[];
  cardCount: number;
  isAiGenerated: boolean;
  mastery: number;
  createdAt?: Date;
}

export default function Flashcards() {
  const queryClient = useQueryClient();
  const [studyingDeck, setStudyingDeck] = useState<FlashcardDeck | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCardCount, setAiCardCount] = useState("10");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ["/api/flashcard-decks"],
    queryFn: async () => {
      const res = await fetch("/api/flashcard-decks", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createDeckMutation = useMutation({
    mutationFn: async (deck: Partial<FlashcardDeck>) => {
      const res = await fetch("/api/flashcard-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(deck),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] });
      setAiTopic("");
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId: string) => {
      await fetch(`/api/flashcard-decks/${deckId}`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] });
    },
  });

  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are an expert educator. Create flashcards for learning. Respond with valid JSON only.",
      });

      const prompt = `Create ${aiCardCount} flashcards for learning "${aiTopic}".
Return JSON only:
{"title":"Deck title","description":"Brief description","cards":[{"front":"Question or term","back":"Answer or definition"}]}

Make cards clear, concise, and educational. Include a mix of definitions, concepts, and practical examples.`;

      const response = await model.generateContent(prompt);
      let text = response.response.text().trim();
      if (text.startsWith("```")) text = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      const generated = JSON.parse(text);
      
      createDeckMutation.mutate({
        title: generated.title || `${aiTopic} Flashcards`,
        description: generated.description || `AI-generated flashcards for ${aiTopic}`,
        category: aiTopic,
        cards: generated.cards.map((c: any, i: number) => ({ id: `card-${i}`, front: c.front, back: c.back })),
        cardCount: generated.cards.length,
        isAiGenerated: true,
        mastery: 0,
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
    }
    setIsGenerating(false);
  };

  // Study mode
  if (studyingDeck) {
    return (
      <StudyMode
        deck={studyingDeck}
        onClose={() => setStudyingDeck(null)}
        onUpdateMastery={(mastery) => {
          fetch(`/api/flashcard-decks/${studyingDeck._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ mastery }),
          }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] }));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">
        <style>{`
          @property --gradient-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          .shiny-badge {
            --gradient-angle: 0deg;
            position: relative;
            overflow: hidden;
            border-radius: 9999px;
            padding: 0.5rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            background: linear-gradient(hsl(var(--background)), hsl(var(--background))) padding-box,
              conic-gradient(from var(--gradient-angle), transparent 0%, hsl(var(--primary)) 10%, hsl(var(--primary)/0.8) 20%, hsl(var(--primary)) 30%, transparent 40%) border-box;
            border: 1.5px solid transparent;
            animation: badge-spin 3s linear infinite;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.3s;
          }
          .shiny-badge:hover {
            transform: scale(1.02);
            box-shadow: 0 0 20px hsl(var(--primary)/0.3);
          }
          @keyframes badge-spin {
            to { --gradient-angle: 360deg; }
          }
          .shiny-badge::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 30% 50%, hsl(var(--primary)/0.15), transparent 50%);
            border-radius: inherit;
          }
        `}</style>

        <div className="shiny-badge flex items-center gap-2 mb-6">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-primary bg-primary/20">AI</span>
          <span className="text-foreground/90">Powered Flashcard Generator</span>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">
          Learn anything with <span className="text-primary">flashcards</span>
        </h1>
        <p className="text-center mb-10 text-muted-foreground">
          Enter a topic and let AI create study cards for you
        </p>

        {/* Input Section */}
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl p-4 border flex flex-col gap-3 bg-card/50 backdrop-blur border-border">
            <textarea
              placeholder="Enter a topic to generate flashcards... (e.g., React Hooks, Spanish Vocabulary, Biology Terms)"
              className="w-full bg-transparent resize-none text-sm focus:outline-none min-h-[80px] max-h-[120px] text-foreground placeholder-muted-foreground"
              rows={3}
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && aiTopic.trim()) {
                  e.preventDefault();
                  handleGenerateWithAI();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors bg-muted hover:bg-muted/80 text-muted-foreground"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cards:</span>
                </button>
                <div className="flex gap-1">
                  {["5", "10", "15", "20"].map((num) => (
                    <button
                      key={num}
                      onClick={() => setAiCardCount(num)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        aiCardCount === num
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !aiTopic.trim()}
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg shrink-0",
                  aiTopic.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground"
                )}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decks Section */}
      {(decks.length > 0 || isLoading) && (
        <div className="px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Your Decks
            </h2>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-48 animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck: FlashcardDeck) => (
                  <Card key={deck._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {deck.isAiGenerated && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Sparkles className="w-3 h-3" /> AI
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold">{deck.title}</h3>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this deck?")) {
                                deleteDeckMutation.mutate(deck._id!);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {deck.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{deck.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <span>{deck.cardCount || deck.cards?.length || 0} cards</span>
                          <span className={cn(
                            "font-medium",
                            (deck.mastery || 0) >= 80 ? "text-green-500" : (deck.mastery || 0) >= 50 ? "text-yellow-500" : ""
                          )}>
                            {deck.mastery || 0}% mastery
                          </span>
                        </div>
                        <Progress value={deck.mastery || 0} className="h-1.5 mb-4" />
                        <Button className="w-full gap-2" onClick={() => setStudyingDeck(deck)}>
                          <Play className="w-4 h-4" />
                          Study Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// Study Mode Component
function StudyMode({ deck, onClose, onUpdateMastery }: { 
  deck: FlashcardDeck; 
  onClose: () => void;
  onUpdateMastery: (mastery: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const cards = deck.cards || [];
  const currentCard = cards[currentIndex];

  const handleAnswer = (correct: boolean) => {
    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      const totalCorrect = results.correct + (correct ? 1 : 0);
      const mastery = Math.round((totalCorrect / cards.length) * 100);
      onUpdateMastery(mastery);
      setIsComplete(true);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No cards in this deck</h3>
          <p className="text-muted-foreground mb-4">Add some cards to start studying</p>
          <Button onClick={onClose}>Go Back</Button>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const mastery = Math.round((results.correct / cards.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
            mastery >= 80 ? "bg-green-500/20" : mastery >= 50 ? "bg-yellow-500/20" : "bg-red-500/20"
          )}>
            <span className={cn(
              "text-3xl font-bold",
              mastery >= 80 ? "text-green-500" : mastery >= 50 ? "text-yellow-500" : "text-red-500"
            )}>
              {mastery}%
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">
            {mastery >= 80 ? "Excellent! 🎉" : mastery >= 50 ? "Good job! 👍" : "Keep practicing! 💪"}
          </h3>
          <p className="text-muted-foreground mb-6">
            You got {results.correct} out of {cards.length} correct
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setResults({ correct: 0, incorrect: 0 });
              setIsComplete(false);
            }} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
            <Button onClick={onClose} className="flex-1">Done</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Progress */}
        <Progress value={((currentIndex) / cards.length) * 100} className="h-2 mb-8" />

        {/* Flashcard */}
        <div
          className="relative h-72 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={cn(
            "absolute inset-0 transition-transform duration-500 transform-style-3d",
            isFlipped && "rotate-y-180"
          )}>
            {/* Front */}
            <Card className={cn(
              "absolute inset-0 p-8 flex items-center justify-center backface-hidden",
              isFlipped && "invisible"
            )}>
              <div className="text-center">
                <Badge className="mb-4">Question</Badge>
                <p className="text-xl font-medium">{currentCard?.front}</p>
                <p className="text-sm text-muted-foreground mt-4">Tap to reveal answer</p>
              </div>
            </Card>

            {/* Back */}
            <Card className={cn(
              "absolute inset-0 p-8 flex items-center justify-center backface-hidden rotate-y-180 bg-primary/5",
              !isFlipped && "invisible"
            )}>
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">Answer</Badge>
                <p className="text-xl font-medium">{currentCard?.back}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        {isFlipped && (
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              className="flex-1 h-14 gap-2 border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => handleAnswer(false)}
            >
              <X className="w-5 h-5" /> Incorrect
            </Button>
            <Button
              className="flex-1 h-14 gap-2 bg-green-500 hover:bg-green-600"
              onClick={() => handleAnswer(true)}
            >
              <Check className="w-5 h-5" /> Correct
            </Button>
          </div>
        )}

        {/* Navigation hint */}
        {!isFlipped && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(Math.max(0, currentIndex - 1));
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              disabled={currentIndex === cards.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1));
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
