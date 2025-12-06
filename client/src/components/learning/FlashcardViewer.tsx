import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, ChevronLeft, ChevronRight, Lightbulb,
  ThumbsUp, ThumbsDown, Shuffle, X, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface FlashcardViewerProps {
  cards: Flashcard[];
  deckTitle?: string;
  onComplete?: (results: { correct: number; incorrect: number }) => void;
  onClose?: () => void;
  className?: string;
}

export default function FlashcardViewer({
  cards,
  deckTitle,
  onComplete,
  onClose,
  className,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<Record<string, "correct" | "incorrect">>({});
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(cards);

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;
  const correctCount = Object.values(results).filter(r => r === "correct").length;
  const incorrectCount = Object.values(results).filter(r => r === "incorrect").length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false);
  };

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else if (onComplete) {
      onComplete({ correct: correctCount, incorrect: incorrectCount });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleResult = (result: "correct" | "incorrect") => {
    setResults({ ...results, [currentCard.id]: result });
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setResults({});
    setIsShuffled(true);
  };

  const handleReset = () => {
    setShuffledCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setResults({});
    setIsShuffled(false);
  };

  if (shuffledCards.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <p className="text-muted-foreground">No flashcards in this deck</p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {deckTitle && <h3 className="font-semibold">{deckTitle}</h3>}
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {shuffledCards.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Check className="w-3 h-3 text-green-500" />
            {correctCount}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <X className="w-3 h-3 text-red-500" />
            {incorrectCount}
          </Badge>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Flashcard */}
      <div 
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
      >
        <div
          className={cn(
            "relative w-full min-h-[300px] transition-transform duration-500 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden flex items-center justify-center p-8",
              "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-4">Question</Badge>
              <p className="text-xl font-medium">{currentCard.front}</p>
              {currentCard.hint && !showHint && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                >
                  <Lightbulb className="w-4 h-4" />
                  Show Hint
                </Button>
              )}
              {showHint && currentCard.hint && (
                <p className="mt-4 text-sm text-muted-foreground italic">
                  💡 {currentCard.hint}
                </p>
              )}
              <p className="mt-6 text-xs text-muted-foreground">
                Click to reveal answer
              </p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden flex items-center justify-center p-8",
              "bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20"
            )}
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-4 bg-green-500/10 text-green-600">
                Answer
              </Badge>
              <p className="text-xl font-medium">{currentCard.back}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === shuffledCards.length - 1 && !onComplete}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isFlipped && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={() => handleResult("incorrect")}
            >
              <ThumbsDown className="w-4 h-4" />
              Incorrect
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-green-500/50 text-green-500 hover:bg-green-500/10"
              onClick={() => handleResult("correct")}
            >
              <ThumbsUp className="w-4 h-4" />
              Correct
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShuffle}>
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
