/**
 * AI MCQ Prompt Input Component
 * Theme-aware input for MCQ test generation with file upload
 */

import {
  ArrowRight,
  Check,
  ChevronDown,
  Plus,
  Upload,
  X,
  FileText,
  Gauge,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";

interface AIMCQInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  numQuestions: number;
  onNumQuestionsChange: (num: number) => void;
  difficulty?: DifficultyLevel;
  onDifficultyChange?: (difficulty: DifficultyLevel) => void;
  isGenerating: boolean;
  onFileUpload?: (file: File) => void;
  uploadedFile?: File | null;
  onFileRemove?: () => void;
}

const DIFFICULTY_OPTIONS: {
  value: DifficultyLevel;
  label: string;
  color: string;
}[] = [
  { value: "easy", label: "Easy", color: "text-green-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "hard", label: "Hard", color: "text-red-500" },
  { value: "mixed", label: "Mixed", color: "text-purple-500" },
];

export default function AIMCQInput({
  value,
  onChange,
  onGenerate,
  numQuestions,
  onNumQuestionsChange,
  difficulty = "medium",
  onDifficultyChange,
  isGenerating,
  onFileUpload,
  uploadedFile,
  onFileRemove,
}: AIMCQInputProps) {
  const QUESTION_OPTIONS = [3, 5, 7, 9, 12, 15];
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentDifficulty =
    DIFFICULTY_OPTIONS.find((d) => d.value === difficulty) ||
    DIFFICULTY_OPTIONS[1];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      e.ctrlKey &&
      !isGenerating &&
      (value.trim() || uploadedFile)
    ) {
      e.preventDefault();
      onGenerate();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, DOCX, TXT, or image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("File size must be less than 20MB");
      return;
    }

    onFileUpload?.(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "!box-content flex flex-col mx-1 sm:mx-2 md:mx-0 items-stretch transition-all duration-200 relative cursor-text z-10 rounded-2xl border shadow-lg",
          "bg-card border-border hover:border-border/80 focus-within:border-primary/50",
          "shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 bg-primary/10 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Drop file here</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 m-3">
          {/* Uploaded file indicator */}
          <AnimatePresence>
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">
                    {uploadedFile.name}
                  </span>
                  <button
                    onClick={onFileRemove}
                    className="p-1 hover:bg-destructive/20 rounded transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <div className="relative">
            <div className="w-full font-large break-words transition-opacity duration-200">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What topic do you want to be tested on?"
                className={cn(
                  "flex rounded-md border border-input ring-offset-background",
                  "focus-visible:outline-none focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "w-full bg-transparent border-none resize-none",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "p-0 min-h-[2.5rem] max-h-[200px]",
                  "text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70"
                )}
              />
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="flex gap-2.5 w-full items-center">
            <div className="relative flex-1 flex items-center gap-2 shrink min-w-0">
              {/* Attachment button */}
              <div className="relative shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "inline-flex items-center justify-center relative shrink-0 select-none",
                    "disabled:pointer-events-none disabled:opacity-50 border transition-all",
                    "h-8 min-w-8 rounded-lg px-[7.5px] active:scale-[0.98]",
                    "text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  )}
                  aria-label="Upload file"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Difficulty selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-center relative shrink-0 select-none",
                      "disabled:pointer-events-none disabled:opacity-50 border transition-all",
                      "h-8 gap-1.5 rounded-lg px-2 active:scale-[0.97]",
                      "text-muted-foreground border-border bg-muted/50",
                      "hover:text-foreground hover:bg-muted hover:border-border/80"
                    )}
                    aria-label="Select difficulty"
                  >
                    <Gauge
                      className={cn("w-3.5 h-3.5", currentDifficulty.color)}
                    />
                    <span
                      className={cn("text-xs font-medium", currentDifficulty.color)}
                    >
                      {currentDifficulty.label}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[8rem]">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => onDifficultyChange?.(option.value)}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className={option.color}>{option.label}</span>
                      {difficulty === option.value && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Question count selector */}
            <div className="overflow-hidden shrink-0 p-1 -m-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-center relative shrink-0 select-none",
                      "disabled:pointer-events-none disabled:opacity-50",
                      "h-8 gap-1.5 rounded-lg border text-sm transition-all",
                      "px-2.5 py-1",
                      "text-gray-300 border-[#333] bg-[#1a1a1a]",
                      "hover:bg-[#252525] hover:border-[#444] hover:text-gray-100"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={numQuestions}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs font-medium"
                      >
                        {numQuestions} Questions
                      </motion.span>
                    </AnimatePresence>
                    <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[10rem] border-[#333] bg-[#1a1a1a]">
                  {QUESTION_OPTIONS.map((num) => (
                    <DropdownMenuItem
                      key={num}
                      onSelect={() => onNumQuestionsChange(num)}
                      className="flex items-center justify-between gap-2 text-gray-200 focus:bg-[#252525] focus:text-white"
                    >
                      <span>{num} questions</span>
                      {numQuestions === num && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Generate button */}
            <div>
              <button
                type="button"
                onClick={onGenerate}
                disabled={(!value.trim() && !uploadedFile) || isGenerating}
                className={cn(
                  "inline-flex items-center justify-center relative shrink-0 select-none",
                  "disabled:pointer-events-none disabled:opacity-50 font-bold transition-all",
                  "h-8 w-8 rounded-lg active:scale-95",
                  (value.trim() || uploadedFile) && !isGenerating
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                )}
                aria-label="Generate MCQ test"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Press Ctrl + Enter to generate • Drag & drop files supported
      </p>
    </div>
  );
}
