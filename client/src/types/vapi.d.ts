// VAPI Web SDK Type Definitions
declare module '@vapi-ai/web' {
  export interface VapiTranscript {
    text?: string;
    role?: 'user' | 'assistant';
    timestamp?: number;
  }

  export interface VapiError {
    message: string;
    code?: string;
  }

  export interface VapiAssistant {
    model: {
      provider: string;
      model: string;
      messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
    };
    voice: {
      provider: string;
      voiceId: string;
    };
    firstMessage?: string;
    endCallMessage?: string;
    endCallPhrases?: string[];
  }

  export interface VapiEventMap {
    'call-start': () => void;
    'call-end': () => void;
    'speech-start': () => void;
    'speech-end': () => void;
    'transcript': (transcript: VapiTranscript) => void;
    'error': (error: VapiError) => void;
    'message': (message: any) => void;
    'volume-level': (level: number) => void;
  }

  export default class Vapi {
    constructor(webToken: string);
    
    on<K extends keyof VapiEventMap>(event: K, listener: VapiEventMap[K]): void;
    off<K extends keyof VapiEventMap>(event: K, listener: VapiEventMap[K]): void;
    
    start(assistant: VapiAssistant): Promise<void>;
    stop(): Promise<void>;
    
    isMuted(): boolean;
    mute(): void;
    unmute(): void;
  }
}
