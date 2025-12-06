import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { ChatInterface, type ChatMessage } from '@/components/ui/chat-interface';
import { Button } from '@/components/ui/button';
import { Lock, Globe, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

interface SharedData {
  messages: ChatMessage[];
  type: 'private' | 'public';
  createdAt: string;
}

export default function SharePage() {
  const [, params] = useRoute('/share/:id');
  const [, setLocation] = useLocation();
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    try {
      // Decode the share ID to get the original data
      // In production, this would be fetched from a database
      const decodedData = atob(params.id);
      const data = JSON.parse(decodedData) as SharedData;
      
      setSharedData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error decoding share data:', err);
      setError('Invalid or corrupted share link');
      setLoading(false);
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Share Link Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'This shared conversation could not be found or has been removed.'}
            </p>
          </div>
          <Button onClick={() => setLocation('/')} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-foreground"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-sm">PolyLearnHub</h1>
                <p className="text-xs text-muted-foreground">Shared Conversation</p>
              </div>
            </div>
            
            {/* Privacy Badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/50 border border-border">
              {sharedData.type === 'private' ? (
                <>
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Private</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Public</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setLocation('/chatbot')}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
            >
              <ExternalLink className="w-3 h-3" />
              Try PolyLearnHub
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={sharedData.messages}
          isLoading={false}
          compact={false}
        />
      </div>

      {/* Footer Info */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Shared on {new Date(sharedData.createdAt).toLocaleDateString()}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {sharedData.messages.length} message{sharedData.messages.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <button
                onClick={() => setLocation('/')}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                PolyLearnHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

