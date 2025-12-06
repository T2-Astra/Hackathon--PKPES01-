import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useLanguageContext } from '@/hooks/useLanguageContext';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  language?: string;
}

export function VoiceInputButton({
  onTranscript,
  onError,
  disabled = false,
  className,
  language = 'en-US'
}: VoiceInputButtonProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const { t } = useLanguageContext();

  const {
    isListening,
    isSupported,
    error,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
  } = useVoiceInput({
    language,
    continuous: true, // Allow manual start/stop control
    interimResults: true,
    onResult: (text, isFinal) => {
      onTranscript?.(text, isFinal);
      if (isFinal) {
        setFeedbackMessage(t.voice.speechRecognized);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
      }
    },
    onError: (errorMsg) => {
      onError?.(errorMsg);
      setFeedbackMessage(errorMsg);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    },
    onStart: () => {
      setFeedbackMessage(t.voice.listening);
      setShowFeedback(true);
    },
    onEnd: () => {
      setShowFeedback(false);
    }
  });

  // Auto-hide feedback after listening stops
  useEffect(() => {
    if (!isListening && showFeedback) {
      const timer = setTimeout(() => setShowFeedback(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isListening, showFeedback]);

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className={cn(
              "h-8 min-w-8 px-[7.5px] opacity-50 cursor-not-allowed",
              className
            )}
            aria-label="Voice input not supported"
          >
            <MicOff className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t.voice.notSupported}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const handleClick = () => {
    if (disabled) return;
    toggleListening();
  };

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
            className={cn(
              "h-8 min-w-8 px-[7.5px] transition-all duration-200",
              "text-muted-foreground border-border hover:text-foreground hover:bg-muted",
              "active:scale-[0.98] bg-transparent border-0.5",
              "inline-flex items-center justify-center relative shrink-0 select-none",
              "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none",
              "rounded-lg flex items-center group !pointer-events-auto !outline-offset-1",
              isListening && [
                "text-red-500 border-red-300 bg-red-50",
                "dark:text-red-400 dark:border-red-600 dark:bg-red-950/20",
                "animate-pulse"
              ],
              error && [
                "text-red-500 border-red-300",
                "dark:text-red-400 dark:border-red-600"
              ],
              className
            )}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? (
              <div className="relative">
                <Mic className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isListening 
              ? t.voice.stopListening
              : t.voice.startListening
            }
          </p>
          {!isListening && (
            <p className="text-xs text-muted-foreground mt-1">
              Supports: Chrome, Edge, Safari
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      {/* Feedback Toast */}
      {showFeedback && (
        <div className={cn(
          "absolute -top-12 left-1/2 transform -translate-x-1/2",
          "px-3 py-1.5 rounded-md text-xs font-medium",
          "bg-background border border-border shadow-lg",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "whitespace-nowrap z-50"
        )}>
          <div className="flex items-center gap-1.5">
            {isListening && <Volume2 className="w-3 h-3 text-green-500" />}
            <span className={cn(
              error ? "text-red-500" : isListening ? "text-green-600" : "text-foreground"
            )}>
              {feedbackMessage}
            </span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
        </div>
      )}

      {/* Interim transcript preview */}
      {isListening && interimTranscript && (
        <div className={cn(
          "absolute -top-16 left-1/2 transform -translate-x-1/2",
          "px-3 py-2 rounded-md text-sm",
          "bg-primary/10 border border-primary/20",
          "max-w-xs truncate z-40"
        )}>
          <span className="text-primary/80 italic">"{interimTranscript}"</span>
        </div>
      )}
    </div>
  );
}
