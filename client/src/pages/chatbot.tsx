import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShimmerText } from '@/components/ui/shimmer-text';
import { AIPromptInput } from '@/components/ui/ai-prompt-input';
import { ChatInterface, type ChatMessage } from '@/components/ui/chat-interface';
import { useAuth } from '@/hooks/useAuthContext';
import { searchBrave, type BraveSearchResult } from '@/lib/braveSearch';
import { generateFormattedStudyNotesPDF, downloadPDF } from '@/lib/pdfGenerator';
import { fileAnalysisService, type FileAttachment } from '@/lib/file-analysis-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyDCSCfzH-fsmC592sdxX0SN6mDxtweapHc';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to generate images using Flux model from Pollinations AI
const generateImageWithFlux = async (prompt: string): Promise<string> => {
  try {
    const cleanPrompt = prompt
      .replace(/generate an? image of?/gi, '')
      .replace(/create an? image of?/gi, '')
      .replace(/make an? image of?/gi, '')
      .replace(/draw/gi, '')
      .trim();

    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=512&height=512&nologo=true&enhance=true`;
    
    console.log('🎨 Generated image URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error generating image with Flux:', error);
    throw error;
  }
};

// Function to detect if user wants image generation
const isImageGenerationRequest = (text: string): boolean => {
  const imageKeywords = [
    'generate image', 'create image', 'draw', 'make image',
    'generate picture', 'create picture', 'show me image',
    'visualize', 'illustration', 'picture of', 'image of'
  ];
  const lowerText = text.toLowerCase();
  return imageKeywords.some(keyword => lowerText.includes(keyword));
};

// Enhanced file reading utility
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
};

// Extract file contents for AI context
const extractFileContents = async (files: File[]): Promise<{ text: string; images: { data: string; mimeType: string }[] }> => {
  if (files.length === 0) return { text: '', images: [] };
  
  const images: { data: string; mimeType: string }[] = [];
  const textContents: string[] = [];

  for (const file of files) {
    try {
      const content = await readFileContent(file);
      const fileSize = (file.size / 1024).toFixed(1);
      
      if (file.type.startsWith('image/')) {
        const base64Data = content.replace(/^data:image\/\w+;base64,/, '');
        images.push({ data: base64Data, mimeType: file.type });
        textContents.push(`[IMAGE: ${file.name} - ${fileSize}KB]`);
      } else if (file.type === 'application/pdf') {
        textContents.push(`[PDF DOCUMENT: ${file.name} - ${fileSize}KB]\nNote: PDF content analysis requested.`);
      } else {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const isCodeFile = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(fileExtension || '');
        textContents.push(`[${isCodeFile ? 'CODE FILE' : 'TEXT FILE'}: ${file.name}]\n\`\`\`${fileExtension || 'text'}\n${content}\n\`\`\``);
      }
    } catch (error) {
      console.error(`Error reading file ${file.name}:`, error);
      textContents.push(`[ERROR: Could not read ${file.name}]`);
    }
  }
  
  return { text: textContents.join('\n\n'), images };
};

// Call Gemini API with file analysis support
const callGemini = async (
  message: string,
  fileContents?: { text: string; images: { data: string; mimeType: string }[] },
  conversationHistory: ChatMessage[] = [],
  attachments?: FileAttachment[]
) => {
  try {
    console.log('🤖 Calling Gemini API...');
    
    // If we have file attachments, use the file analysis service for better handling
    if (attachments && attachments.length > 0 && fileAnalysisService.isConfigured()) {
      console.log('📁 Using file analysis service for attachments...');
      const historyForAnalysis = conversationHistory.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        content: msg.content
      }));
      
      const result = await fileAnalysisService.analyzeFiles(message, attachments, historyForAnalysis);
      if (result.success) {
        return { content: result.content, success: true };
      }
      // Fall through to regular Gemini if file analysis fails
      console.log('⚠️ File analysis failed, falling back to regular Gemini');
    }
    
    const systemInstruction = `You are a helpful AI assistant for students. Follow these guidelines:
- Keep responses clean and well-organized
- For code: provide complete, working code blocks
- Be conversational and concise
- When creating HTML/CSS/JS projects, provide a SINGLE HTML file with embedded CSS and JavaScript
- Help with homework, explain concepts, debug code, and assist with studying
- For images: describe content, extract text if present
- For PDFs: extract key information, summarize content
- For code files: explain the code, identify issues`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction
    });

    // Build conversation history for context
    const historyMessages = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: historyMessages,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });

    // Build message parts
    const messageParts: any[] = [];
    let messageText = message;

    // Add file context
    if (fileContents) {
      if (fileContents.text) {
        messageText += `\n\nUploaded Files:\n${fileContents.text}`;
      }
      
      // Add images
      for (const img of fileContents.images) {
        messageParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        });
      }
    }

    messageParts.push({ text: messageText });

    const result = await chat.sendMessage(messageParts);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    console.log('✅ Gemini response received');
    return { content: text.trim(), success: true };
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
};

export default function ChatBot() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentlyWebSearching, setIsCurrentlyWebSearching] = useState(false);
  const [selectedModel] = useState('Omnia');
  const [showChat, setShowChat] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isStudyNotesRequest, setIsStudyNotesRequest] = useState(false);
  const [pdfData, setPdfData] = useState<{ blob: Blob; filename: string } | null>(null);

  // Prompt limit system
  const [promptCount, setPromptCount] = useState(0);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const MAX_FREE_PROMPTS = 5;

  useEffect(() => {
    if (!user) {
      const savedCount = localStorage.getItem('guestPromptCount');
      if (savedCount) setPromptCount(parseInt(savedCount, 10));
    }
  }, [user]);

  useEffect(() => {
    if (!user) localStorage.setItem('guestPromptCount', promptCount.toString());
  }, [promptCount, user]);

  useEffect(() => {
    if (user) {
      setPromptCount(0);
      localStorage.removeItem('guestPromptCount');
    }
  }, [user]);

  const redirectToLogin = () => setLocation('/auth');

  const handlePromptSubmit = async (isWebSearch = false) => {
    if (!user && promptCount >= MAX_FREE_PROMPTS) {
      setShowLimitDialog(true);
      return;
    }

    if (prompt.trim() || uploadedFiles.length > 0) {
      if (!user) setPromptCount(prev => prev + 1);

      setIsLoading(true);
      setIsCurrentlyWebSearching(isWebSearch);
      setShowChat(true);

      // Handle image generation
      if (isImageGenerationRequest(prompt)) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: prompt,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        const loadingMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '🎨 **Generating image...**',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, loadingMessage]);

        try {
          const imageUrl = await generateImageWithFlux(prompt);
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === loadingMessage.id 
                ? {
                    ...msg,
                    content: `✨ **Image Generated!**\n\n<img src="${imageUrl}&t=${Date.now()}" alt="Generated Image" style="border-radius: 12px; max-width: 100%; height: auto;" />`
                  }
                : msg
            )
          );
        } catch (error) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === loadingMessage.id 
                ? { ...msg, content: '❌ Sorry, image generation failed. Please try again.' }
                : msg
            )
          );
        }

        setPrompt('');
        setIsLoading(false);
        setIsCurrentlyWebSearching(false);
        return;
      }

      let actualPrompt = prompt;
      let searchResults: BraveSearchResult[] = [];

      // Handle web search
      if (isWebSearch && prompt.trim()) {
        try {
          searchResults = await searchBrave(prompt.trim());
          if (searchResults.length > 0) {
            const formattedResults = searchResults.map((result, index) => 
              `${index + 1}. **${result.title}**\n   URL: ${result.url}\n   ${result.description}`
            ).join('\n\n');
            
            actualPrompt = `User Query: "${prompt.trim()}"\n\nWeb Search Results:\n${formattedResults}\n\nPlease provide a comprehensive answer based on these search results.`;
          }
        } catch (error) {
          console.error('Web search failed:', error);
        }
      }

      // Extract file contents
      let fileContents: { text: string; images: { data: string; mimeType: string }[] } | undefined;
      let fileAttachments: FileAttachment[] = [];
      let hasStudyNotes = false;
      
      if (uploadedFiles.length > 0) {
        try {
          fileContents = await extractFileContents(uploadedFiles);
          hasStudyNotes = uploadedFiles.some(f => 
            f.name.toLowerCase().includes('study') || f.name.toLowerCase().includes('notes')
          );
          setIsStudyNotesRequest(hasStudyNotes);
          
          // Prepare attachments for file analysis service
          for (const file of uploadedFiles) {
            const content = await readFileContent(file);
            fileAttachments.push({
              type: file.type.startsWith('image/') ? 'image' : 'file',
              name: file.name,
              data: content,
              mimeType: file.type
            });
          }
        } catch (error) {
          console.error('Error extracting file contents:', error);
        }
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt || `Uploaded ${uploadedFiles.length} file(s) for analysis.`,
        timestamp: new Date(),
        attachments: uploadedFiles.length > 0 ? uploadedFiles.map(file => ({
          type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
          name: file.name,
          data: '',
          mimeType: file.type
        })) : undefined
      };

      setMessages(prev => [...prev, userMessage]);
      const currentQuestion = actualPrompt;
      setPrompt('');
      setUploadedFiles([]);

      try {
        const result = await callGemini(currentQuestion, fileContents, messages, fileAttachments);
        
        if (result.success) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: result.content,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);

          // Generate PDF for study notes
          if (hasStudyNotes || isStudyNotesRequest) {
            try {
              const title = uploadedFiles.length > 0 
                ? uploadedFiles[0].name.replace(/\.[^/.]+$/, '') 
                : 'AI Study Notes';
              
              const pdfResult = generateFormattedStudyNotesPDF(result.content, title);
              setPdfData(pdfResult);
              
              setTimeout(() => {
                const pdfMessage: ChatMessage = {
                  id: (Date.now() + 2).toString(),
                  role: 'assistant',
                  content: '📄 **PDF Ready!** Your study notes have been converted to PDF.',
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, pdfMessage]);
              }, 1000);
            } catch (error) {
              console.error('PDF generation failed:', error);
            }
          }
        } else {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Sorry, I encountered an error: ${result.error || 'Please try again.'}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again later.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsCurrentlyWebSearching(false);
        setIsStudyNotesRequest(false);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowChat(false);
    setPrompt('');
    setPdfData(null);
  };

  const handleStop = () => setIsLoading(false);

  const handleFileUpload = (file: File) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadPDF = () => {
    if (pdfData) {
      try {
        downloadPDF(pdfData.blob, pdfData.filename);
      } catch (error) {
        console.error('Error downloading PDF:', error);
      }
    }
  };

  const handleViewPDF = () => {
    if (pdfData) {
      try {
        const url = URL.createObjectURL(pdfData.blob);
        window.open(url, '_blank');
      } catch (error) {
        console.error('Error viewing PDF:', error);
      }
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessages = messages.slice(0, messageIndex);
    updatedMessages.push({
      ...messages[messageIndex],
      content: newContent
    });
    
    setMessages(updatedMessages);
    setPrompt(newContent);
    
    setTimeout(() => handlePromptSubmit(), 100);
  };

  return (
    <div className="min-h-screen bg-background md:pl-16">
      {/* Mobile Header */}
      <div className="draggable h-12 bg-card/30 backdrop-blur-sm sticky top-0 z-10 flex items-center border-transparent px-2 md:hidden">
        <div className="no-draggable flex items-center justify-center">
          <button 
            type="button" 
            className="hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md"
          >
            <span className="sr-only">Open sidebar</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11.6663 12.6686L11.801 12.6823C12.1038 12.7445 12.3313 13.0125 12.3313 13.3337C12.3311 13.6547 12.1038 13.9229 11.801 13.985L11.6663 13.9987H3.33325C2.96609 13.9987 2.66839 13.7008 2.66821 13.3337C2.66821 12.9664 2.96598 12.6686 3.33325 12.6686H11.6663ZM16.6663 6.00163L16.801 6.0153C17.1038 6.07747 17.3313 6.34546 17.3313 6.66667C17.3313 6.98788 17.1038 7.25586 16.801 7.31803L16.6663 7.33171H3.33325C2.96598 7.33171 2.66821 7.03394 2.66821 6.66667C2.66821 6.2994 2.96598 6.00163 3.33325 6.00163H16.6663Z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-3rem)] md:h-screen">
        {showChat ? (
          <>
            <ChatInterface 
              messages={messages}
              isLoading={isLoading}
              isWebSearch={isCurrentlyWebSearching}
              onEditMessage={handleEditMessage}
              onDownloadPDF={handleDownloadPDF}
              onViewPDF={handleViewPDF}
              showPDFDownload={!!pdfData}
            />
            
            <div className="border-t border-border p-4 bg-background">
              <div className="max-w-3xl mx-auto">
                <AIPromptInput
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={(isWebSearch) => handlePromptSubmit(isWebSearch)}
                  onStop={handleStop}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                  onFileUpload={handleFileUpload}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-6">
                <div className="mb-8">
                  <div className="flex items-center justify-center">
                    <ShimmerText 
                      text={`🎓 Welcome${user ? `, ${user.firstName}` : ''}`}
                      className="text-2xl font-semibold mb-2"
                    />
                  </div>
                </div>
              </div>
              
              <AIPromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={(isWebSearch) => handlePromptSubmit(isWebSearch)}
                onStop={handleStop}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onFileUpload={handleFileUpload}
                uploadedFiles={uploadedFiles}
                onRemoveFile={handleRemoveFile}
                placeholder="Ask me about your studies, upload homework, or get help with any subject..."
              />

              {/* Quick prompts */}
              <div className="mt-4">
                <ul className="flex flex-wrap justify-center w-full gap-2 pt-4">
                  {['Essay Help', 'Explain Topics', 'Debug Code', 'Homework Help', 'Quick Answer'].map((item) => (
                    <li key={item} className="inline-block">
                      <button
                        onClick={() => setPrompt(`Help me with ${item.toLowerCase()}`)}
                        className="border border-border/50 hover:border-border cursor-pointer bg-card/50 hover:bg-card rounded-lg text-sm text-muted-foreground font-medium px-2.5 h-8 transition-all"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prompt limit warning */}
              {!user && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  {MAX_FREE_PROMPTS - promptCount} free prompts remaining. Sign in for unlimited access.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Free Limit Reached</DialogTitle>
            <DialogDescription>
              You've used all {MAX_FREE_PROMPTS} free prompts. Sign in to continue with unlimited access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowLimitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={redirectToLogin}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
