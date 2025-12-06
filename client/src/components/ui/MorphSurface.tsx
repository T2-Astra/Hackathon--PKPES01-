"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { useClickOutside } from "@/hooks/use-click-outside"
import SiriOrb from "@/components/ui/SiriOrb"
import { useLocation } from "wouter"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"

const SPEED = 1

// Convert markdown to plain text with formatting
const convertMarkdownToText = (markdown: string) => {
  return markdown
    // Convert **bold** to BOLD
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Convert `code` to CODE
    .replace(/`([^`]+)`/g, '$1')
    // Convert ### headers to HEADERS
    .replace(/#{1,6}\s*(.*)/g, '$1')
    // Convert bullet points
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // Convert numbered lists
    .replace(/^\s*\d+\.\s+/gm, '• ')
    // Clean up extra spaces
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Smart navigation suggestions based on user queries
const getNavigationSuggestion = (message: string) => {
  const query = message.toLowerCase()
  
  // Papers/Question Papers
  if (query.includes('paper') || query.includes('question') || query.includes('exam') || query.includes('test')) {
    return {
      title: "📄 Question Papers",
      description: "Want to browse all available question papers?",
      action: "Go to Question Papers",
      path: "/search?type=question-papers"
    }
  }
  
  // Notes/Study Materials
  if (query.includes('note') || query.includes('study') || query.includes('material') || query.includes('learn')) {
    return {
      title: "📚 Study Notes", 
      description: "Looking for study notes and materials?",
      action: "Go to Study Notes",
      path: "/search?type=notes"
    }
  }
  
  // Upload/Add content
  if (query.includes('upload') || query.includes('add') || query.includes('submit') || query.includes('share')) {
    return {
      title: "📤 Upload Content",
      description: "Want to upload your own materials?", 
      action: "Go to Upload",
      path: "/upload"
    }
  }
  
  // Profile/Account
  if (query.includes('profile') || query.includes('account') || query.includes('history') || query.includes('my')) {
    return {
      title: "👤 User Profile",
      description: "Need to check your profile or history?",
      action: "Go to Profile", 
      path: "/profile"
    }
  }
  
  // Search/Find
  if (query.includes('search') || query.includes('find') || query.includes('look')) {
    return {
      title: "🔍 Search Resources",
      description: "Want to search for specific resources?",
      action: "Go to Search",
      path: "/search"
    }
  }
  
  // Videos/Tutorials
  if (query.includes('video') || query.includes('tutorial') || query.includes('watch')) {
    return {
      title: "🎥 Video Tutorials", 
      description: "Looking for video content?",
      action: "Go to Videos",
      path: "/videos"
    }
  }
  
  // Help/Support
  if (query.includes('help') || query.includes('support') || query.includes('problem') || query.includes('issue')) {
    return {
      title: "❓ Help Center",
      description: "Need more detailed help and support?",
      action: "Go to Help",
      path: "/help"
    }
  }
  
  return null
}

// FAQ AI service function
const callFAQAI = async (message: string) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PolyLearnHub FAQ'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are the PolyLearnHub FAQ Agent - a specialized assistant for frequently asked questions about the polytechnic student platform.

Your primary functions:
1. **Platform Navigation** - Help users find features and understand how to use the platform
2. **Study Resources** - Answer questions about accessing notes, papers, and materials
3. **Account & Features** - Explain user profiles, uploads, search functionality
4. **Quick Help** - Provide instant answers to common student questions
5. **Educational Support** - Brief study tips and academic guidance

Keep responses **concise** (2-3 sentences max), **actionable**, and **student-focused**. Use **bold** for key points.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || 'No response received',
      success: true
    };
  } catch (error) {
    console.error('FAQ AI Error:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
};

interface FooterContext {
  showFeedback: boolean
  success: boolean
  openFeedback: () => void
  closeFeedback: () => void
  toast: any
  setLocation: (path: string) => void
}

const FooterContext = React.createContext({} as FooterContext)
const useFooter = () => React.useContext(FooterContext)

export function MorphSurface() {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const feedbackRef = React.useRef<HTMLTextAreaElement | null>(null)
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [showNavDialog, setShowNavDialog] = React.useState(false)
  const [navSuggestion, setNavSuggestion] = React.useState<any>(null)

  const closeFeedback = React.useCallback(() => {
    setShowFeedback(false)
    feedbackRef.current?.blur()
  }, [])

  const openFeedback = React.useCallback(() => {
    setShowFeedback(true)
    setTimeout(() => {
      feedbackRef.current?.focus()
    })
  }, [])

  const onFeedbackSuccess = React.useCallback(() => {
    closeFeedback()
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
    }, 1500)
  }, [closeFeedback])

  useClickOutside(rootRef, closeFeedback)

  const context = React.useMemo(
    () => ({
      showFeedback,
      success,
      openFeedback,
      closeFeedback,
      toast,
      setLocation,
    }),
    [showFeedback, success, openFeedback, closeFeedback, toast, setLocation]
  )

  return (
      <motion.div
        data-footer
        ref={rootRef}
        className={cx(
          "bg-background/80 backdrop-blur-sm relative flex flex-col items-center overflow-hidden border shadow-lg dark:bg-background/90 nature:bg-background/85"
        )}
        initial={false}
        animate={{
          width: showFeedback ? FEEDBACK_WIDTH : "auto",
          height: showFeedback ? FEEDBACK_HEIGHT : 32,
          borderRadius: showFeedback ? 10 : 16,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED,
          damping: 45,
          mass: 0.7,
          delay: showFeedback ? 0 : 0.08,
        }}
      >
        <FooterContext.Provider value={context}>
          <Dock />
          <Feedback 
            ref={feedbackRef} 
            onSuccess={onFeedbackSuccess}
            showNavDialog={showNavDialog}
            setShowNavDialog={setShowNavDialog}
            navSuggestion={navSuggestion}
            setNavSuggestion={setNavSuggestion}
            setLocation={setLocation}
          />
        </FooterContext.Provider>
      </motion.div>
  )
}

function Dock() {
  const { showFeedback, openFeedback } = useFooter()
  return (
    <footer className="mt-auto flex h-[32px] items-center justify-center whitespace-nowrap select-none">
      <div className="flex items-center justify-center gap-1 px-1.5 max-sm:h-7 max-sm:px-1">
        <div className="flex w-fit items-center gap-1">
          <AnimatePresence mode="wait">
            {showFeedback ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="h-3 w-3"
              />
            ) : (
              <motion.div
                key="siri-orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SiriOrb
                  size="14px"
                  colors={{
                    bg: "rgba(0, 0, 0, 0.05)",
                    c1: "#ff4081",
                    c2: "#00bcd4", 
                    c3: "#4caf50",
                  }}
                  animationDuration={8}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="button"
          className="flex h-fit flex-1 justify-end rounded-full px-1 !py-0.5 text-xs"
          variant="ghost"
          onClick={openFeedback}
        >
          <span className="truncate">FAQ</span>
        </Button>
      </div>
    </footer>
  )
}

const FEEDBACK_WIDTH = 240
const FEEDBACK_HEIGHT = 140

const Feedback = React.forwardRef<HTMLTextAreaElement, {
  onSuccess: () => void
  showNavDialog: boolean
  setShowNavDialog: (show: boolean) => void
  navSuggestion: any
  setNavSuggestion: (suggestion: any) => void
  setLocation: (path: string) => void
}>(({ onSuccess, showNavDialog, setShowNavDialog, navSuggestion, setNavSuggestion, setLocation }, ref) => {
  const { closeFeedback, showFeedback, toast } = useFooter()
  const submitRef = React.useRef<HTMLButtonElement>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [messages, setMessages] = React.useState<Array<{id: string, type: 'user' | 'bot', content: string, timestamp: Date}>>([])
  const [currentInput, setCurrentInput] = React.useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!currentInput.trim()) return
    
    const userMessage = currentInput.trim()
    const messageId = Date.now().toString()
    
    // Add user message
    const userMsg = {
      id: messageId + '_user',
      type: 'user' as const,
      content: userMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMsg])
    setCurrentInput("")
    setIsLoading(true)
    
    // Add loading message
    const loadingMsg = {
      id: messageId + '_loading',
      type: 'bot' as const,
      content: 'Thinking...',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, loadingMsg])
    
    try {
      // Call the FAQ AI service
      const response = await callFAQAI(userMessage)
      if (response.success) {
        // Replace loading message with actual response
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMsg.id 
            ? { ...msg, content: response.content }
            : msg
        ))
        setIsLoading(false)
        
        // Check for navigation suggestion
        const suggestion = getNavigationSuggestion(userMessage)
        if (suggestion) {
          // Show navigation dialog after 5 seconds
          setTimeout(() => {
            setNavSuggestion(suggestion)
            setShowNavDialog(true)
          }, 5000)
        }
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMsg.id 
            ? { ...msg, content: "Sorry, I couldn't process your question. Please try again." }
            : msg
        ))
        setIsLoading(false)
      }
    } catch (error) {
      console.error('FAQ Error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsg.id 
          ? { ...msg, content: "Sorry, I couldn't process your question. Please try again." }
          : msg
      ))
      setIsLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      closeFeedback()
      setMessages([])
      setCurrentInput("")
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (messages.length > 0 && !isLoading) {
        // Clear conversation to start fresh
        setMessages([])
        setCurrentInput("")
      } else if (currentInput.trim()) {
        // Submit the form
        submitRef.current?.click()
      }
    }
  }

  // Clear messages when opening feedback
  React.useEffect(() => {
    if (showFeedback && messages.length === 0) {
      setMessages([])
      setCurrentInput("")
    }
  }, [showFeedback, messages.length])

  return (
    <form
      onSubmit={onSubmit}
      className="absolute bottom-0 right-0"
      style={{
        width: FEEDBACK_WIDTH,
        height: FEEDBACK_HEIGHT,
        pointerEvents: showFeedback ? "all" : "none",
      }}
    >
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 550 / SPEED,
              damping: 45,
              mass: 0.7,
            }}
            className="flex h-full flex-col p-1"
          >
            <div className="flex justify-between py-0.5">
              <p className="text-foreground z-2 ml-[26px] flex items-center gap-[3px] select-none text-xs">
                FAQ Agent
              </p>
              <button
                type={messages.length > 0 && !isLoading ? "button" : "submit"}
                ref={submitRef}
                onClick={messages.length > 0 && !isLoading ? () => { setMessages([]); setCurrentInput(""); } : undefined}
                className="text-foreground right-3 mt-0.5 flex -translate-y-[2px] cursor-pointer items-center justify-center gap-0.5 rounded-[10px] bg-transparent pr-0.5 text-center select-none"
              >
                {messages.length > 0 && !isLoading ? (
                  <>
                    <Kbd className="text-xs">Enter</Kbd>
                    <span className="text-xs ml-1">Clear</span>
                  </>
                ) : (
                  <>
                    <Kbd className="text-xs">Enter</Kbd>
                    <span className="text-xs ml-1">Send</span>
                  </>
                )}
              </button>
            </div>
            
            <textarea
              ref={ref}
              placeholder={messages.length > 0 ? "" : "Ask FAQ questions..."}
              name="message"
              value={messages.length > 0 ? 
                messages.map(msg => 
                  msg.type === 'user' 
                    ? `You: ${msg.content}` 
                    : `FAQ Agent: ${convertMarkdownToText(msg.content)}`
                ).join('\n\n') + (currentInput ? `\n\n${currentInput}` : '') 
                : currentInput
              }
              onChange={(e) => {
                if (messages.length === 0) {
                  setCurrentInput(e.target.value)
                } else {
                  // If there are messages, only allow editing the current input part
                  const lines = e.target.value.split('\n')
                  const newInput = lines.slice(-1)[0] || ""
                  setCurrentInput(newInput)
                }
              }}
              className="bg-background text-foreground h-full w-full resize-none scroll-py-2 rounded-md p-2.5 outline-0 text-sm border border-border placeholder:text-muted-foreground"
              required={!currentInput.trim() && messages.length === 0}
              onKeyDown={onKeyDown}
              spellCheck={false}
              readOnly={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3"
          >
            <SiriOrb
              size="14px"
              colors={{
                bg: "rgba(0, 0, 0, 0.05)",
                c1: "#ff4081",
                c2: "#00bcd4", 
                c3: "#4caf50",
              }}
              animationDuration={8}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation Suggestion Dialog */}
      <Dialog open={showNavDialog} onOpenChange={setShowNavDialog}>
        <DialogContent className="sm:max-w-sm w-80 h-96 p-0 overflow-visible rounded-2xl border shadow-lg bg-background">
          <div className="relative h-full flex flex-col">
            {/* Smaller Header with website theme colors */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg font-semibold text-center">
                  {navSuggestion?.title}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 text-center text-xs">
                  {navSuggestion?.description}
                </DialogDescription>
              </DialogHeader>
            </div>
            
            {/* Content area with more space */}
            <div className="flex-1 flex flex-col justify-center p-6 space-y-6">
              {/* Icon area */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center border-2 border-primary/20">
                  <span className="text-3xl">
                    {navSuggestion?.title?.split(' ')[0]}
                  </span>
                </div>
              </div>
              
              {/* Action buttons with proper spacing */}
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setLocation(navSuggestion?.path)
                    setShowNavDialog(false)
                    closeFeedback()
                  }}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  ✨ {navSuggestion?.action}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNavDialog(false)}
                  className="w-full h-10 border-2 border-border hover:border-border/80 text-muted-foreground hover:text-foreground rounded-lg font-medium transition-all duration-200"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
})

Feedback.displayName = "Feedback"

function Kbd({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <kbd
      className={cx(
        "bg-primary text-foreground flex h-5 w-fit items-center justify-center rounded-sm border px-[4px] font-sans text-xs",
        className
      )}
    >
      {children}
    </kbd>
  )
}

// Add default export for lazy loading
export default MorphSurface
