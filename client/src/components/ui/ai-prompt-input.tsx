import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, ChevronDown, Paperclip, Mic, 
  MicOff, Square, X, Plus, Upload, Camera, FileText, PenTool, Zap, Sparkles, Search
} from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { ScreenshotDialog } from './screenshot-dialog';
import { StudyNotesDialog } from './study-notes-dialog';
import { useLanguageContext } from '@/hooks/useLanguageContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from "@/lib/utils";
import SiriOrb from './SiriOrb';

interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (isWebSearch?: boolean) => void;
  onStop?: () => void;
  selectedModel: string;
  onModelToggle?: (modelId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  onFileUpload?: (file: File) => void;
  uploadedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  compact?: boolean;
}

const AI_MODELS = [
  "Hexa",
  "Omnia",
];

const QUICK_PROMPTS = [
  {
    category: "📚 Study Help",
    prompts: [
      "Explain this concept in simple terms",
      "Break down this problem step by step",
      "What are the key points I should remember?",
      "Give me practice questions on this topic"
    ]
  },
  {
    category: "📝 Homework",
    prompts: [
      "Help me solve this math problem",
      "Check my work and explain any mistakes",
      "What's the formula for this calculation?",
      "Show me similar examples"
    ]
  },
  {
    category: "🧠 Exam Prep",
    prompts: [
      "Create a study plan for my exam",
      "What are likely exam questions on this topic?",
      "Help me memorize these key facts",
      "Explain the most important concepts"
    ]
  },
  {
    category: "💡 Quick Help",
    prompts: [
      "Summarize this in bullet points",
      "What does this mean?",
      "How do I approach this type of problem?",
      "Give me tips to understand this better"
    ]
  }
];

const MODEL_ICONS: Record<string, React.ReactNode> = {
  "Hexa": (
    <div className="translate-y-[3px]">
      <img 
        src="https://wpforms.com/wp-content/uploads/2024/08/claude-logo.png" 
        alt="Hexa (Claude Sonnet 3.5)" 
        className="w-4 h-4 object-contain"
      />
    </div>
  ),
  "Omnia": (
    <div className="translate-y-[2px]">
      <div className="w-4 h-4 ai-avatar rounded-full flex items-center justify-center">
        <span className="text-xs font-bold">G</span>
      </div>
    </div>
  ),
};

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  onStop,
  selectedModel,
  onModelToggle,
  isLoading = false,
  placeholder = "Ask me anything...",
  onFileUpload,
  uploadedFiles = [],
  onRemoveFile,
  compact = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isScreenshotDialogOpen, setIsScreenshotDialogOpen] = useState(false);
  const [isQuickPromptsOpen, setIsQuickPromptsOpen] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const { voiceLanguage } = useLanguageContext();
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const quickPromptsRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [waveformKey, setWaveformKey] = useState(0);

  // Voice input functionality
  const {
    isListening,
    isSupported: isVoiceSupported,
    transcript,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  } = useVoiceInput({
    language: voiceLanguage || 'en-US',
    continuous: true, // Enable continuous listening until manually stopped
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        // Append the final transcript to the current value
        const newValue = value + (value ? ' ' : '') + transcript;
        onChange(newValue);
        resetTranscript();
      }
    },
    onError: (error) => {
      console.error('Voice input error:', error);
    }
  });

  // Long press handlers for quick prompts
  const handleMouseDown = () => {
    if (isVoiceSupported && !isListening) {
      longPressTimerRef.current = setTimeout(() => {
        setIsQuickPromptsOpen(true);
      }, 500); // 500ms long press
    }
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Waveform animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setWaveformKey(prev => prev + 1);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max height of 200px
    }
  };

  // Auto-resize on value change
  useEffect(() => {
    autoResizeTextarea();
  }, [value]);

  // Initial auto-resize on mount
  useEffect(() => {
    autoResizeTextarea();
  }, []);


  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
      if (quickPromptsRef.current && !quickPromptsRef.current.contains(event.target as Node)) {
        setIsQuickPromptsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModelDropdownOpen(false);
        setIsAttachmentMenuOpen(false);
        setIsQuickPromptsOpen(false);
      }
    }

    if (isModelDropdownOpen || isAttachmentMenuOpen || isQuickPromptsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isModelDropdownOpen, isAttachmentMenuOpen, isQuickPromptsOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.size > 20 * 1024 * 1024) {
        alert('File size must be less than 20MB');
        return;
      }
      
      onFileUpload?.(file);
    }
    
    if (event.target) {
      event.target.value = '';
    }
  };

  // Enhanced prompt function using AI
  const enhancePrompt = async () => {
    if (!value.trim()) return;
    
    setIsEnhancingPrompt(true);
    
    try {
      // Use the same API key as the chatbot
      const apiKey = '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';
      
      // Call OpenRouter API to enhance the prompt
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'PolyLearnHub'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Please enhance this prompt to be more detailed, specific, and effective for getting better AI responses. Make it clearer and more comprehensive while maintaining the original intent:

"${value.trim()}"

Return only the enhanced prompt, nothing else.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Prompt enhancement failed:', errorData);
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const enhancedPrompt = data.choices[0]?.message?.content?.trim();
      
      if (enhancedPrompt && enhancedPrompt !== value.trim()) {
        onChange(enhancedPrompt);
        console.log('✅ Prompt enhanced successfully');
      } else {
        console.warn('No enhancement received, keeping original prompt');
      }
    } catch (error) {
      console.error('❌ Error enhancing prompt:', error);
      // Show error to user (you could add a toast notification here)
      alert(`Failed to enhance prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleSubmit = async () => {
    onSubmit(isWebSearchEnabled);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.size <= 20 * 1024 * 1024) {
        onFileUpload?.(file);
      }
    }
  };

  return (
    <div className={cn(
      "w-full mx-auto",
      compact ? "px-1" : "px-2 md:px-0 max-w-4xl"
    )}>
      <fieldset className="flex w-full min-w-0 flex-col">
        <div 
          className={cn(
            "!box-content flex flex-col backdrop-blur-sm items-stretch transition-all duration-300 relative cursor-text z-10 rounded-2xl border-2 shadow-sm hover:shadow-md focus-within:shadow-lg",
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'bg-card border-border hover:border-primary/50 focus-within:border-primary',
            compact ? "mx-1" : "mx-2 md:mx-0"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
        >
          <div className={cn("flex flex-col", compact ? "gap-2 m-2" : "gap-3.5 m-3.5")}>
            {/* Drag Overlay */}
            {isDragOver && (
              <div className="absolute inset-2 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-foreground font-semibold text-sm">Drop files here</p>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-1.5 text-sm">
                    <Paperclip className="w-3 h-3 text-primary" />
                    <span className="text-foreground max-w-32 truncate">{file.name}</span>
                    <button
                      onClick={() => onRemoveFile?.(index)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Voice Recording Mode */}
            {isListening ? (
              <div className={cn(
                "relative flex items-center justify-between px-3 py-2",
                compact ? "min-h-[2.5rem]" : "min-h-[3rem]"
              )}>
                {/* Left side - Siri Orb and Status */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Animated Siri Orb */}
                  <SiriOrb 
                    size="24px" 
                    colors={{
                      bg: "rgba(0, 0, 0, 0.05)",
                      c1: "#ff4081", // Material Pink
                      c2: "#00bcd4", // Material Cyan
                      c3: "#4caf50", // Material Green
                    }}
                    animationDuration={8}
                  />
                  
                  {/* Recording Status */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Listening...</span>
                  </div>
                  
                  {/* Show interim transcript */}
                  {interimTranscript && (
                    <div className="text-sm text-muted-foreground italic flex-1 truncate ml-2">
                      "{interimTranscript}"
                    </div>
                  )}
                </div>
                
                {/* Right side - Stop Button */}
                <button
                  onClick={stopListening}
                  className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors ml-2"
                  aria-label="Stop recording"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Text Input */
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  placeholder={placeholder}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    onChange(e.target.value);
                    // Trigger auto-resize after state update
                    setTimeout(autoResizeTextarea, 0);
                  }}
                  onInput={autoResizeTextarea}
                  className={cn(
                    "w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base leading-6 overflow-hidden",
                    compact ? "min-h-[2.5rem]" : "min-h-[3rem]"
                  )}
                  style={{ height: compact ? '2.5rem' : '3rem' }}
                />
              </div>
            )}  
            
            {/* Bottom Controls - Hidden during voice recording */}
            {!isListening && (
              <div className="flex gap-2.5 w-full items-center">
              <div className="relative flex-1 flex items-center gap-2 shrink min-w-0">
                {/* Attachment Menu Button */}
                <div className="relative shrink-0" ref={attachmentMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                    className="inline-flex items-center justify-center relative shrink-0 select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 text-muted-foreground border-border active:scale-[0.98] hover:text-foreground hover:bg-muted"
                    aria-pressed={isAttachmentMenuOpen}
                    aria-expanded={isAttachmentMenuOpen}
                    aria-haspopup="listbox"
                    aria-label="Open attachments menu"
                  >
                    <div className="flex flex-row items-center justify-center gap-1">
                      <div className="transition-transform duration-200" style={{ transform: 'none' }}>
                        {isAttachmentMenuOpen ? (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            fill="currentColor" 
                            viewBox="0 0 256 256"
                            className="animate-in fade-in-0 zoom-in-95 duration-150"
                          >
                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                          </svg>
                        ) : (
                          <Plus className="w-4 h-4 transition-transform duration-150" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Attachment Menu Dropdown */}
                  {isAttachmentMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-lg shadow-lg min-w-[200px] z-50 animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-bottom-2">
                      <div className="p-1.5 flex flex-col">
                        <div className="flex flex-col">
                          {/* Upload a file */}
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setIsAttachmentMenuOpen(false);
                            }}
                            className="group flex w-full text-left gap-2.5 py-auto px-1.5 text-sm text-foreground rounded-lg select-none items-center active:scale-[0.995] hover:bg-muted/60 hover:text-foreground h-[2rem]"
                          >
                            <div className="min-w-4 min-h-4 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground">
                              <Upload className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-sm text-foreground group-hover:text-foreground">Upload a file</p>
                            </div>
                          </button>

                          {/* Take a screenshot */}
                          <button
                            onClick={() => {
                              setIsScreenshotDialogOpen(true);
                              setIsAttachmentMenuOpen(false);
                            }}
                            className="group flex w-full text-left gap-2.5 py-auto px-1.5 text-sm text-foreground rounded-lg select-none items-center active:scale-[0.995] hover:bg-muted/60 hover:text-foreground h-[2rem]"
                          >
                            <div className="min-w-4 min-h-4 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground">
                              <Camera className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-sm text-foreground group-hover:text-foreground">Take a screenshot</p>
                            </div>
                          </button>

                          {/* Create Study Notes */}
                          <button
                            onClick={() => {
                              setIsNotesDialogOpen(true);
                              setIsAttachmentMenuOpen(false);
                            }}
                            className="group flex w-full text-left gap-2.5 py-auto px-1.5 text-sm text-foreground rounded-lg select-none items-center active:scale-[0.995] hover:bg-muted/60 hover:text-foreground h-[2rem]"
                          >
                            <div className="min-w-4 min-h-4 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground">
                              <PenTool className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-sm text-foreground group-hover:text-foreground">Create study notes</p>
                            </div>
                          </button>

                          {/* Enhance Prompt */}
                          <button
                            onClick={() => {
                              enhancePrompt();
                              setIsAttachmentMenuOpen(false);
                            }}
                            disabled={!value.trim() || isEnhancingPrompt}
                            className="group flex w-full text-left gap-2.5 py-auto px-1.5 text-sm text-foreground rounded-lg select-none items-center active:scale-[0.995] hover:bg-muted/60 hover:text-foreground h-[2rem] disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <div className="min-w-4 min-h-4 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground">
                              {isEnhancingPrompt ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-sm text-foreground group-hover:text-foreground">
                                {isEnhancingPrompt ? 'Enhancing...' : 'Enhance prompt'}
                              </p>
                            </div>
                          </button>

                          {/* Web Search Toggle */}
                          <button
                            onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                            className={cn(
                              "group flex w-full text-left gap-2.5 py-auto px-1.5 text-sm rounded-lg select-none items-center active:scale-[0.995] hover:bg-muted/60 h-[2rem]",
                              isWebSearchEnabled ? "text-primary" : "text-foreground hover:text-foreground"
                            )}
                          >
                            <div className={cn(
                              "min-w-4 min-h-4 flex items-center justify-center shrink-0",
                              isWebSearchEnabled ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              <Search className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <p className={cn(
                                "text-sm",
                                isWebSearchEnabled ? "text-primary" : "text-foreground group-hover:text-foreground"
                              )}>
                                Web search
                              </p>
                            </div>
                            
                            {/* Toggle Switch */}
                            <div className="relative select-none cursor-pointer">
                              <div className={cn(
                                "w-7 h-4 rounded-full transition-colors border",
                                isWebSearchEnabled 
                                  ? "bg-primary border-primary" 
                                  : "bg-muted border-border"
                              )}>
                                <div className={cn(
                                  "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform",
                                  isWebSearchEnabled ? "translate-x-3" : "translate-x-0.5"
                                )} />
                              </div>
                            </div>
                          </button>

                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".txt,.md,.html,.css,.js,.ts,.json,.pdf,.png,.jpg,.jpeg,.gif,.webp,.svg"
                  />
                </div>



                {/* Voice Input Button */}
                <div className="relative shrink-0" ref={quickPromptsRef}>
                  <button
                    type="button"
                    onClick={isVoiceSupported ? toggleListening : () => setIsQuickPromptsOpen(!isQuickPromptsOpen)}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    disabled={!isVoiceSupported && !isQuickPromptsOpen}
                    className={cn(
                      "inline-flex items-center justify-center relative shrink-0 select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 active:scale-[0.98]",
                      isListening 
                        ? "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/25" 
                        : "text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                    )}
                    aria-label={isListening ? "Stop recording" : (isVoiceSupported ? "Start voice input (hold for prompts)" : "Quick prompts")}
                    title={isListening ? "Click to stop recording" : (isVoiceSupported ? "Click to start voice input, hold for quick prompts" : "Quick prompts")}
                  >
                    {isListening ? (
                      <div className="flex items-center justify-center">
                        <Square className="w-4 h-4 fill-current" />
                      </div>
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>

                  {/* Voice input visual feedback */}
                  {isListening && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  )}

                  {/* Show interim transcript */}
                  {interimTranscript && (
                    <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-sm text-muted-foreground max-w-xs z-50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>"{interimTranscript}"</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Prompts Button (when voice is not supported or as secondary option) */}
                  {!isVoiceSupported && (
                    <button
                      type="button"
                      onClick={() => setIsQuickPromptsOpen(!isQuickPromptsOpen)}
                      className="absolute -right-10 top-0 inline-flex items-center justify-center relative shrink-0 select-none border-0 transition-all h-8 min-w-8 rounded-full bg-background hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] shadow-sm"
                      aria-label="Quick study prompts"
                      title="Quick study prompts"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  )}

                  {/* Long press for quick prompts when voice is supported */}
                  {isVoiceSupported && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Hold for prompts
                    </div>
                  )}

                  {/* Quick Prompts Menu */}
                  {isQuickPromptsOpen && (
                    <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-lg shadow-lg w-80 z-50 animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-bottom-2 max-h-96 overflow-y-auto custom-scrollbar">
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Quick Study Prompts</span>
                        </div>
                        
                        <div className="space-y-3">
                          {QUICK_PROMPTS.map((category, categoryIndex) => (
                            <div key={categoryIndex}>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                {category.category}
                              </h4>
                              <div className="space-y-1">
                                {category.prompts.map((prompt, promptIndex) => (
                                  <button
                                    key={promptIndex}
                                    onClick={() => {
                                      onChange(prompt);
                                      setIsQuickPromptsOpen(false);
                                      // Focus textarea after inserting prompt
                                      setTimeout(() => {
                                        textareaRef.current?.focus();
                                      }, 100);
                                    }}
                                    className="w-full text-left text-xs p-2 rounded-md hover:bg-muted/60 transition-colors text-foreground hover:text-foreground"
                                  >
                                    {prompt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Model Selector */}
              {!compact && (
                <div className="shrink-0 p-1 -m-1">
                  <div className="relative" ref={modelDropdownRef}>
                    <button
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="inline-flex items-center justify-center relative shrink-0 select-none disabled:pointer-events-none disabled:opacity-50 text-muted-foreground border-transparent transition duration-300 hover:bg-muted hover:text-foreground h-8 rounded-md px-3 min-w-[4rem] active:scale-[0.985] whitespace-nowrap text-xs pl-2.5 pr-2 gap-1"
                      type="button"
                      data-testid="model-selector-dropdown"
                    >
                      <div className="inline-flex gap-[3px] text-[14px] h-[14px] leading-none items-baseline">
                        <div className="flex items-center gap-[4px]">
                          <div className="whitespace-nowrap select-none">
                            {selectedModel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center opacity-75" style={{width: '20px', height: '20px'}}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="shrink-0 opacity-75" aria-hidden="true">
                          <path d="M14.128 7.16482C14.3126 6.95983 14.6298 6.94336 14.835 7.12771C15.0402 7.31242 15.0567 7.62952 14.8721 7.83477L10.372 12.835L10.2939 12.9053C10.2093 12.9667 10.1063 13 9.99995 13C9.85833 12.9999 9.72264 12.9402 9.62788 12.835L5.12778 7.83477L5.0682 7.75273C4.95072 7.55225 4.98544 7.28926 5.16489 7.12771C5.34445 6.96617 5.60969 6.95939 5.79674 7.09744L5.87193 7.16482L9.99995 11.7519L14.128 7.16482Z"></path>
                        </svg>
                      </div>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isModelDropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0"
                          style={{ zIndex: 9998 }}
                          onClick={() => setIsModelDropdownOpen(false)} 
                        />
                        
                        {/* Dropdown */}
                        <div 
                          className="absolute bottom-full left-0 mb-1 bg-card border border-border backdrop-blur-xl rounded-xl min-w-[16rem] overflow-hidden p-1.5 text-muted-foreground shadow-xl z-50"
                          role="menu"
                          aria-orientation="vertical"
                          style={{ 
                            position: 'absolute',
                            zIndex: 9999
                          }}
                        >
                          {AI_MODELS.map((model, index) => (
                            <div key={model}>
                              <div
                                role="menuitem"
                                onClick={() => {
                                  if (model !== 'Hexa') {
                                    onModelToggle?.(model);
                                    setIsModelDropdownOpen(false);
                                  }
                                }}
                                className={cn(
                                  "py-1.5 px-2 rounded-lg grid grid-cols-[minmax(0,_1fr)_auto] gap-2 items-center outline-none select-none pr-1 py-1.5",
                                  model === 'Hexa' 
                                    ? "cursor-not-allowed opacity-50" 
                                    : "cursor-pointer hover:bg-muted hover:text-foreground group"
                                )}
                                tabIndex={-1}
                              >
                                <div>
                                  <div className="flex items-center">
                                    <div className="flex-1 text-sm">
                                      <div className="flex items-center gap-1.5">
                                        <div>{model}</div>
                                        {model === 'Hexa' && (
                                          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                                            Coming Soon
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-muted-foreground pr-4 text-xs mt-1">
                                    {model === 'Hexa' ? 'Coming Soon - Advanced AI Model' : 'General purpose assistant for all tasks'}
                                  </div>
                                </div>
                                {selectedModel === model && model !== 'Hexa' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-primary mb-1 mr-1.5">
                                    <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Send/Stop Button */}
              <div>
                <button
                  type="button"
                  onClick={isLoading ? onStop : handleSubmit}
                  className={cn(
                    "inline-flex items-center justify-center relative shrink-0 select-none disabled:pointer-events-none disabled:opacity-50 font-bold transition-colors rounded-md active:scale-95",
                    isLoading 
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                      : value.trim() || uploadedFiles.length > 0
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 disabled:bg-muted disabled:text-muted-foreground',
                    compact ? "h-6 w-6" : "h-8 w-8"
                  )}
                  disabled={!isLoading && !value.trim() && uploadedFiles.length === 0}
                  aria-label={isLoading ? "Stop generation" : "Send message"}
                >
                  {isLoading ? 
                    <Square className={compact ? "w-3 h-3" : "w-4 h-4"} /> : 
                    <ArrowRight className={compact ? "w-3 h-3" : "w-4 h-4"} />
                  }
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Study Notes Dialog */}
      <StudyNotesDialog
        isOpen={isNotesDialogOpen}
        onClose={() => setIsNotesDialogOpen(false)}
        onNotesCreate={(file) => {
          // Add created notes to uploaded files
          if (onFileUpload) {
            onFileUpload(file);
          }
        }}
      />

      {/* Screenshot Dialog */}
      <ScreenshotDialog
        isOpen={isScreenshotDialogOpen}
        onClose={() => setIsScreenshotDialogOpen(false)}
        onScreenshotCapture={(file) => {
          // Add screenshot to uploaded files
          if (onFileUpload) {
            onFileUpload(file);
          }
        }}
      />
    </div>
  );
};
