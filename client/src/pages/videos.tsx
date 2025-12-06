import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Send, Bot, User, Code, Info, GraduationCap, Mic, ChevronDown, Search } from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

// OpenRouter API Configuration
const MODEL_API_KEYS = {
  'openai/gpt-4o-mini': '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',
  'anthropic/claude-3.5-sonnet': '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'
};

  
// OpenRouter API call function
const callOpenRouter = async (modelId: string, message: string) => {
  try {
    const apiKey = MODEL_API_KEYS[modelId as keyof typeof MODEL_API_KEYS];

    if (!apiKey) {
      throw new Error(`No API key configured for model: ${modelId}`);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PolyLearnHub'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: `You are PolyLearn AI, an educational assistant for polytechnic students. When responding:

1. **Bold important concepts, terms, and key points** using **markdown formatting**
2. Use clear, structured explanations with proper formatting
3. Emphasize **main ideas** and **critical information** in bold
4. Format code with \`backticks\` and code blocks
5. Use bullet points and numbered lists for clarity
6. Make responses educational and easy to understand

Always format your responses with proper markdown to make them visually appealing and easy to read.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'No response received';
    
    return {
      content: content, // Keep original markdown formatting
      success: true
    };
  } catch (error) {
    console.error(`Error calling ${modelId}:`, error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
};

interface Video {
  id: string;
  title: string;
  youtubeId: string;
  category: string;
  duration: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Videos() {
  const { isCollapsed } = useSidebar();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("coding");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to PolyLearnHub! 🎓 Select a video and start learning. I'm here to help you with any questions!",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Educational video data - Add your YouTube video IDs here
  const videos: Video[] = [
    {
      id: '1',
      title: 'OSY Operating System 315319',
      youtubeId: '-9-MuWhRzmM',
      category: 'Operating Systems',
      duration: '',
    },
    {
      id: '2',
      title: 'Machine Learning Course',
      youtubeId: 'ukzFI9rgwfU',
      category: 'AI & ML',
      duration: '',
    },
    {
      id: '3',
      title: 'Web Development Tutorial',
      youtubeId: 'mU6anWqZJcc',
      category: 'Web Development',
      duration: '',
    },
    {
      id: '4',
      title: 'Python Programming',
      youtubeId: '_uQrJ0TkZlc',
      category: 'Programming',
      duration: '',
    },
    {
      id: '5',
      title: 'Database Management (DBMS)',
      youtubeId: 'HXV3zeQKqGY',
      category: 'Database',
      duration: '',
    },
    {
      id: '6',
      title: 'Operating Systems',
      youtubeId: 'mXw9ruZaxzQ',
      category: 'Operating Systems',
      duration: '',
    },
    {
      id: '7',
      title: 'Digital Electronics',
      youtubeId: 'M0mx8S05v60',
      category: 'Electronics',
      duration: '',
    },
    {
      id: '8',
      title: 'Software Engineering',
      youtubeId: 'O753uuutqH8',
      category: 'Software Engineering',
      duration: '',
    },
    {
      id: '9',
      title: 'Computer Networks',
      youtubeId: 'IPvYjXCsTg8',
      category: 'Networking',
      duration: '',
    },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const currentQuestion = inputMessage;
    setInputMessage("");

    // Add a loading message
    const loadingMessage: Message = {
      id: 'loading',
      text: 'Thinking...',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Select model based on user choice
      const modelId = selectedModel === 'general' 
        ? 'openai/gpt-4o-mini'  // Omnia uses GPT-4o Mini
        : 'anthropic/claude-3.5-sonnet';  // Hexa uses Claude 3.5 Sonnet

      // Call OpenRouter API
      const result = await callOpenRouter(modelId, currentQuestion);
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'));
      
      if (result.success) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: result.content,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Handle error
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I'm ${selectedModel === 'general' ? 'Omnia' : 'Hexa'}. ${result.error || 'Sorry, I encountered an error. Please try again.'}`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'));
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    // Don't add a message when selecting video - keep chat clean
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`container mx-auto px-2 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${
        isCollapsed ? 'md:ml-0' : 'md:ml-0'
      }`}>
        {!selectedVideo ? (
          // Video Cards Grid - Show when no video is selected
          <>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-16 md:pt-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Educational Videos</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Watch educational content and get instant help from our AI assistant
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search videos by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {videos.filter(video => 
                searchQuery === "" || 
                video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                video.category.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((video) => (
                <Card
                  key={video.id}
                  className="cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 overflow-hidden group animate-in fade-in-0 slide-in-from-bottom-4"
                  onClick={() => handleVideoSelect(video)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to hqdefault if maxresdefault doesn't exist
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 ease-in-out flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-in-out shadow-lg group-hover:shadow-xl">
                          <Play className="w-8 h-8 text-primary-foreground ml-1 transition-all duration-300 ease-in-out group-hover:scale-110" />
                        </div>
                      </div>
                      <Badge className="absolute top-3 right-3 z-10 shadow-lg">{video.category}</Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-all duration-300 ease-in-out">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{video.category}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          // Video Player with Chatbot - Show when video is selected (Fixed Layout)
          <div 
            className={`fixed top-0 right-0 bottom-0 bg-background z-40 flex flex-col lg:flex-row overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-64'
            }`}
          >
            {/* Left Side - Video Player */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b bg-background sticky top-0 z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold mb-1">Now Playing</h1>
                    <p className="text-xs text-muted-foreground">Ask our AI assistant anything about this video</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVideo(null)}
                  >
                    ← Back
                  </Button>
                </div>
              </div>

              <div className="flex-1 flex items-start p-3 sm:p-6">
                <div className="w-full max-w-5xl mx-auto">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1&showinfo=0`}
                          title={selectedVideo.title}
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="p-4">
                        <Badge className="mb-2">{selectedVideo.category}</Badge>
                        <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right Side - Chatbot - Full Height */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-card flex flex-col flex-shrink-0 max-h-[40vh] lg:max-h-none transform transition-all duration-300 ease-in-out">
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b bg-primary/5 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold">PolyLearn AI</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Always here to help</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        // User message - with background like main chatbot
                        <div className="rounded-lg bg-primary text-primary-foreground max-w-[240px] sm:max-w-[280px] p-2 sm:p-3">
                          <div className="whitespace-pre-wrap text-xs sm:text-sm">
                            {message.text}
                          </div>
                        </div>
                      ) : (
                        // Bot message - plain text without background or avatar (like main chatbot)
                        <div className="w-full">
                          <div className="text-foreground">
                            <MarkdownRenderer 
                              content={message.text}
                              className="text-xs sm:text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Model Selector & Input - Claude Style */}
              <div className="border-t flex-shrink-0 p-2 sm:p-3">
                <div className="space-y-2 sm:space-y-2.5">
                  {/* Input Area with Integrated Buttons */}
                  <div className="relative rounded-lg border border-border bg-background shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md">
                    <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2">
                       {/* Model Selector Button - Icon Only */}
                       <Select value={selectedModel} onValueChange={setSelectedModel}>
                         <SelectTrigger className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-xs border-0 bg-transparent hover:bg-muted/50 transition-colors">
                           {selectedModel === 'coding' ? (
                             <Code className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                           ) : (
                             <Info className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                           )}
                         </SelectTrigger>
                         <SelectContent className="rounded-lg min-w-[240px]">
                          <SelectItem value="coding" className="cursor-pointer">
                            <div className="flex items-center gap-2 py-1">
                              <div className="w-7 h-7 bg-blue-500/10 rounded-md flex items-center justify-center">
                                <Code className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">Hexa</p>
                                <p className="text-xs text-muted-foreground">• Coding Assistant</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="general" className="cursor-pointer">
                            <div className="flex items-center gap-2 py-1">
                              <div className="w-7 h-7 bg-green-500/10 rounded-md flex items-center justify-center">
                                <Info className="w-4 h-4 text-green-500" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">Omnia</p>
                                <p className="text-xs text-muted-foreground">• General Assistant</p>
                              </div>
                            </div>
                          </SelectItem>
                         </SelectContent>
                       </Select>

                      {/* Divider */}
                      <div className="h-6 w-px bg-border"></div>

                      {/* Text Input */}
                      <Input
                        placeholder={selectedModel === 'coding' ? "Ask about code..." : "How can I help?"}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 sm:px-2 h-6 sm:h-8 text-xs sm:text-sm placeholder:text-muted-foreground/60"
                      />

                      {/* Send Button */}
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        size="icon" 
                        className="h-6 w-6 sm:h-8 sm:w-8 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
