import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceInputOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const {
    onResult,
    onError,
    onStart,
    onEnd,
    language = 'en-US',
    continuous = true,
    interimResults = true,
  } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbacksRef = useRef({ onResult, onError, onStart, onEnd });

  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = { onResult, onError, onStart, onEnd };
  }, [onResult, onError, onStart, onEnd]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (SpeechRecognition) {
      setState(prev => ({ ...prev, isSupported: true }));
      
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      // Optimize for low latency
      if ('webkitSpeechRecognition' in window) {
        try {
          const SpeechGrammarList = (window as any).webkitSpeechGrammarList || (window as any).SpeechGrammarList;
          if (SpeechGrammarList) {
            (recognition as any).grammars = new SpeechGrammarList();
          }
        } catch (e) {
          // Ignore grammar list errors - not critical for functionality
        }
      }

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
        callbacksRef.current.onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          interimTranscript,
        }));

        if (finalTranscript) {
          callbacksRef.current.onResult?.(finalTranscript, true);
        } else if (interimTranscript) {
          callbacksRef.current.onResult?.(interimTranscript, false);
        }

        // Auto-restart for continuous listening with timeout
        if (continuous && finalTranscript) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && state.isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Ignore if already started
              }
            }
          }, 100);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not available.';
            break;
          case 'bad-grammar':
            errorMessage = 'Speech recognition grammar error.';
            break;
          case 'language-not-supported':
            errorMessage = `Language ${language} not supported.`;
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        setState(prev => ({ 
          ...prev, 
          error: errorMessage, 
          isListening: false,
          interimTranscript: ''
        }));
        callbacksRef.current.onError?.(errorMessage);
      };

      recognition.onend = () => {
        setState(prev => ({ 
          ...prev, 
          isListening: false,
          interimTranscript: ''
        }));
        callbacksRef.current.onEnd?.();
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false,
        error: 'Speech recognition not supported in this browser'
      }));
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !state.isSupported) {
      callbacksRef.current.onError?.('Speech recognition not supported');
      return;
    }

    if (state.isListening) {
      return;
    }

    setState(prev => ({ 
      ...prev, 
      transcript: '', 
      interimTranscript: '', 
      error: null 
    }));

    try {
      recognitionRef.current.start();
    } catch (error) {
      const errorMessage = 'Failed to start speech recognition';
      setState(prev => ({ ...prev, error: errorMessage }));
      callbacksRef.current.onError?.(errorMessage);
    }
  }, [state.isSupported, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Error stopping speech recognition:', error);
      }
    }
    
    // Force update state to stopped
    setState(prev => ({ 
      ...prev, 
      isListening: false,
      interimTranscript: ''
    }));
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      transcript: '', 
      interimTranscript: '' 
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}
