import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, FileText, Loader2, Copy, Check,
  BookOpen, ListChecks, Brain, Lightbulb, Download,
  Wand2, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyDCSCfzH-fsmC592sdxX0SN6mDxtweapHc';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  flashcards: { front: string; back: string }[];
  quiz: { question: string; options: string[]; answer: number }[];
}

export default function ContentSummarizer() {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      setInputText(`[Uploaded: ${file.name}]\n\nNote: For best results with PDF/DOC files, please copy and paste the text content directly.`);
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setResult(null);
    setSelectedAnswers({});
    setShowAnswers(false);
    setFlippedCards({});
    
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are an expert content analyzer and educator. Always respond with valid JSON only, no markdown code blocks.'
      });

      const prompt = `Analyze the following content and generate a comprehensive study guide.

Content to analyze:
"""
${inputText}
"""

Return ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "summary": "A comprehensive 2-3 paragraph summary of the main ideas and concepts",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "flashcards": [
    {"front": "Question 1?", "back": "Answer 1"},
    {"front": "Question 2?", "back": "Answer 2"},
    {"front": "Question 3?", "back": "Answer 3"}
  ],
  "quiz": [
    {"question": "Quiz question 1?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": 0},
    {"question": "Quiz question 2?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": 1}
  ]
}

Requirements:
- Summary should be educational and well-structured
- Key points should be the most important takeaways
- Flashcards should test understanding of key concepts
- Quiz questions should have 4 options, with "answer" being the index (0-3) of the correct option
- Generate at least 5 key points, 3 flashcards, and 2 quiz questions`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      
      // Parse JSON response
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsedResult = JSON.parse(jsonText) as SummaryResult;
      setResult(parsedResult);
      
    } catch (error) {
      console.error('Error summarizing content:', error);
      // Fallback to demo result on error
      setResult({
        summary: `Unable to process the content with AI. Please try again or check your input. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        keyPoints: [
          "Try pasting shorter content",
          "Ensure the text is clear and readable",
          "Check your internet connection",
        ],
        flashcards: [],
        quiz: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportResults = () => {
    if (!result) return;
    
    const exportText = `# Content Summary

## Summary
${result.summary}

## Key Points
${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Flashcards
${result.flashcards.map((f, i) => `### Card ${i + 1}\n**Q:** ${f.front}\n**A:** ${f.back}`).join('\n\n')}

## Quiz Questions
${result.quiz.map((q, i) => `### Question ${i + 1}\n${q.question}\n${q.options.map((o, j) => `${j === q.answer ? '✓' : '○'} ${o}`).join('\n')}`).join('\n\n')}
`;
    
    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-guide.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn(
      "space-y-6",
      !result && !isProcessing && "min-h-[60vh] flex flex-col items-center justify-center"
    )}>
      {/* Input Section */}
      <Card className={cn(!result && !isProcessing && "w-full max-w-2xl")}>
        <CardContent className="space-y-4 pt-6">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">
              {uploadedFileName ? `Uploaded: ${uploadedFileName}` : 'Drop a file or click to upload'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports TXT, MD (PDF/DOC - paste text for best results)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or paste text</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Text Input */}
          <Textarea
            placeholder="Paste your notes, article, or any content here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[150px] resize-none"
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSummarize}
              disabled={!inputText.trim() || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Summarize
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                setInputText('');
                setResult(null);
                setUploadedFileName(null);
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Animation */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="py-8">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                  >
                    <Brain className="w-8 h-8 text-primary" />
                  </motion.div>
                  <p className="font-medium mb-2">AI is analyzing your content...</p>
                  <p className="text-sm text-muted-foreground mb-3">Generating summary, key points, flashcards & quiz</p>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {result && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">AI Generated Study Guide</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSummarize}
                      className="gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={exportResults}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary" className="gap-1">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Summary</span>
                    </TabsTrigger>
                    <TabsTrigger value="keypoints" className="gap-1">
                      <ListChecks className="w-4 h-4" />
                      <span className="hidden sm:inline">Key Points</span>
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Flashcards</span>
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="gap-1">
                      <Lightbulb className="w-4 h-4" />
                      <span className="hidden sm:inline">Quiz</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4">
                    <div className="relative">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {result.summary}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => copyToClipboard(result.summary)}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="keypoints" className="mt-4">
                    <ul className="space-y-3">
                      {result.keyPoints.map((point, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">
                              {i + 1}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{point}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="flashcards" className="mt-4">
                    <div className="grid gap-4">
                      {result.flashcards.length > 0 ? (
                        <>
                          <p className="text-sm text-muted-foreground text-center mb-2">
                            Click on a card to reveal the answer
                          </p>
                          {result.flashcards.map((card, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              onClick={() => setFlippedCards(prev => ({ ...prev, [i]: !prev[i] }))}
                              className="p-4 rounded-xl border bg-muted/50 cursor-pointer hover:border-primary/50 transition-all min-h-[100px] flex flex-col justify-center"
                            >
                              {flippedCards[i] ? (
                                <div>
                                  <p className="text-xs text-primary mb-1">Answer:</p>
                                  <p className="text-muted-foreground">{card.back}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Question:</p>
                                  <p className="font-medium">{card.front}</p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setFlippedCards({})}
                          >
                            Reset All Cards
                          </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No flashcards generated</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="quiz" className="mt-4">
                    <div className="space-y-6">
                      {result.quiz.length > 0 ? (
                        <>
                          {result.quiz.map((q, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-4 rounded-xl border"
                            >
                              <p className="font-medium mb-3">
                                {i + 1}. {q.question}
                              </p>
                              <div className="grid gap-2">
                                {q.options.map((option, j) => (
                                  <div
                                    key={j}
                                    onClick={() => !showAnswers && setSelectedAnswers(prev => ({ ...prev, [i]: j }))}
                                    className={cn(
                                      "p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                                      selectedAnswers[i] === j && !showAnswers && "border-primary bg-primary/10",
                                      showAnswers && j === q.answer && "border-green-500 bg-green-500/10",
                                      showAnswers && selectedAnswers[i] === j && j !== q.answer && "border-red-500 bg-red-500/10"
                                    )}
                                  >
                                    <span className="text-sm">{option}</span>
                                    {showAnswers && j === q.answer && (
                                      <Check className="w-4 h-4 text-green-500 inline ml-2" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => setShowAnswers(true)}
                              disabled={Object.keys(selectedAnswers).length === 0}
                              className="flex-1"
                            >
                              Check Answers
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setSelectedAnswers({});
                                setShowAnswers(false);
                              }}
                            >
                              Reset
                            </Button>
                          </div>
                          {showAnswers && (
                            <div className="p-4 rounded-xl bg-muted/50 text-center">
                              <p className="font-medium">
                                Score: {result.quiz.filter((q, i) => selectedAnswers[i] === q.answer).length} / {result.quiz.length}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No quiz questions generated</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
