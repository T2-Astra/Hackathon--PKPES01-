import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Sparkles,
  Play,
  BookOpen,
  Clock,
  Layers,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import FlashcardViewer from "@/components/learning/FlashcardViewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FlashcardDeck {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  cardCount: number;
  isAiGenerated: boolean;
  lastStudied?: Date;
  mastery: number;
}

export default function Flashcards() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [isStudying, setIsStudying] = useState(false);

  // Fetch flashcard decks from API
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ["/api/flashcard-decks"],
    queryFn: async () => {
      const res = await fetch("/api/flashcard-decks", {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch cards for selected deck
  const { data: deckCards = [] } = useQuery({
    queryKey: ["/api/flashcard-decks", selectedDeck?._id || selectedDeck?.id, "cards"],
    queryFn: async () => {
      if (!selectedDeck) return [];
      const deckId = selectedDeck._id || selectedDeck.id;
      const res = await fetch(`/api/flashcard-decks/${deckId}/cards`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedDeck && isStudying,
  });

  const filteredDecks = decks.filter(
    (deck: FlashcardDeck) =>
      deck.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCards = decks.reduce(
    (sum: number, d: FlashcardDeck) => sum + (d.cardCount || 0),
    0
  );
  const aiGeneratedCount = decks.filter(
    (d: FlashcardDeck) => d.isAiGenerated
  ).length;

  const handleStudyComplete = (results: {
    correct: number;
    incorrect: number;
  }) => {
    console.log("Study complete:", results);
    setIsStudying(false);
    setSelectedDeck(null);
  };

  if (isStudying && selectedDeck) {
    const cards =
      deckCards.length > 0
        ? deckCards.map((c: any) => ({
            id: c._id || c.id,
            front: c.front,
            back: c.back,
            hint: c.hint,
          }))
        : [
            {
              id: "sample",
              front: "No cards in this deck yet",
              back: "Add some cards to start studying!",
            },
          ];

    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <FlashcardViewer
            cards={cards}
            deckTitle={selectedDeck.title}
            onComplete={handleStudyComplete}
            onClose={() => {
              setIsStudying(false);
              setSelectedDeck(null);
            }}
          />
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
              <Layers className="w-8 h-8 text-primary" />
              Flashcards
            </h1>
            <p className="text-muted-foreground mt-1">
              Master concepts with spaced repetition
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setLocation("/ai-tools")}>
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Deck
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search flashcard decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{decks.length}</p>
                  <p className="text-sm text-muted-foreground">Total Decks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCards}</p>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{aiGeneratedCount}</p>
                  <p className="text-sm text-muted-foreground">AI Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          /* Decks Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck: FlashcardDeck) => (
              <Card
                key={deck._id || deck.id}
                className="group hover:shadow-lg transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {deck.isAiGenerated && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </Badge>
                        )}
                        {deck.category && (
                          <Badge variant="outline" className="text-xs">
                            {deck.category}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-1">
                        {deck.title}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {deck.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{deck.cardCount || 0} cards</span>
                    {deck.lastStudied && (
                      <span>
                        Last studied:{" "}
                        {new Date(deck.lastStudied).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Mastery Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mastery</span>
                      <span
                        className={cn(
                          "font-medium",
                          (deck.mastery || 0) >= 80
                            ? "text-green-500"
                            : (deck.mastery || 0) >= 50
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                        )}
                      >
                        {deck.mastery || 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          (deck.mastery || 0) >= 80
                            ? "bg-green-500"
                            : (deck.mastery || 0) >= 50
                              ? "bg-yellow-500"
                              : "bg-primary"
                        )}
                        style={{ width: `${deck.mastery || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      setSelectedDeck(deck);
                      setIsStudying(true);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Study Now
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Create New Deck Card */}
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">Create New Deck</h3>
                <p className="text-sm text-muted-foreground">
                  Add your own flashcards
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && filteredDecks.length === 0 && decks.length === 0 && (
          <Card className="p-8 text-center">
            <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              No flashcard decks yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first deck or generate one with AI
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" className="gap-2" onClick={() => setLocation("/ai-tools")}>
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Deck
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
