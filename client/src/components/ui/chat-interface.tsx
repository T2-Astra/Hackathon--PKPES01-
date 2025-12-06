import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw, Paperclip, Download, Eye, FileText, Check, X as XIcon, Lock, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import AITextLoading from "@/components/ui/ai-text-loading";
import AILoadingState from "@/components/ui/ai-loading-state";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Chat Message Interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'file';
    name: string;
    data: string;
    mimeType: string;
  }>;
}

// Chat Interface Component
interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isWebSearch?: boolean;
  onRewrite?: (messageId: string, content: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDownloadPDF?: () => void;
  onViewPDF?: () => void;
  showPDFDownload?: boolean;
  compact?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  isWebSearch = false,
  onRewrite,
  onEditMessage,
  onDownloadPDF,
  onViewPDF,
  showPDFDownload = false,
  compact = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState<'private' | 'public'>('private');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [sharingMessageId, setSharingMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (editingMessageId && editTextareaRef.current) {
      editTextareaRef.current.focus();
      // Set cursor to end of text
      const length = editTextareaRef.current.value.length;
      editTextareaRef.current.setSelectionRange(length, length);
    }
  }, [editingMessageId]);

  // Use advanced loading only for web searches
  const currentLoadingType = isWebSearch ? 'advanced' : 'simple';

  const handleEditClick = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditedContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && onEditMessage && editedContent.trim()) {
      onEditMessage(editingMessageId, editedContent);
      setEditingMessageId(null);
      setEditedContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleShareClick = (messageId: string) => {
    setSharingMessageId(messageId);
    setShowShareModal(true);
    setShareLink(null); // Reset share link
  };

  const handleCreateShareLink = () => {
    // Find the index of the message being shared
    const messageIndex = messages.findIndex(msg => msg.id === sharingMessageId);
    if (messageIndex === -1) return;

    // Get all messages up to and including this one
    const sharedMessages = messages.slice(0, messageIndex + 1);
    
    // Create a simple hash-based share link (in production, this would be saved to a database)
    const shareId = btoa(JSON.stringify({
      messages: sharedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      type: shareType,
      createdAt: new Date().toISOString()
    })).substring(0, 16);
    
    const link = `${window.location.origin}/share/${shareId}`;
    setShareLink(link);
  };

  const handleCopyShareLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className={cn(
          "space-y-4",
          compact ? "p-2" : "p-4"
        )}>
          {/* Centered Container like ChatGPT */}
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'user' ? (
                  <div className="relative w-full flex justify-end">
                    {editingMessageId === message.id ? (
                      // Edit Mode
                      <div className={cn(
                        "w-full rounded-lg border-2 border-primary bg-card",
                        compact ? "max-w-[280px] p-2" : "max-w-[600px] p-3"
                      )}>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm opacity-80">
                                <Paperclip className="w-3 h-3" />
                                <span>{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <textarea
                          ref={editTextareaRef}
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className={cn(
                            "w-full bg-transparent text-foreground resize-none outline-none border-none",
                            compact ? "text-sm min-h-[60px]" : "text-base min-h-[80px]"
                          )}
                          placeholder="Edit your message..."
                        />
                        <div className="flex gap-2 justify-end mt-2 pt-2 border-t">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors flex items-center gap-1"
                            aria-label="Cancel"
                          >
                            <XIcon className="w-3 h-3" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editedContent.trim()}
                            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            aria-label="Save"
                          >
                            <Check className="w-3 h-3" />
                            Save & Submit
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div>
                        <div className={cn(
                          "rounded-lg bg-primary text-primary-foreground",
                          compact ? "max-w-[280px] p-2" : "max-w-[600px] p-4"
                        )}>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mb-2 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm opacity-80">
                                  <Paperclip className="w-3 h-3" />
                                  <span>{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className={cn(
                            "whitespace-pre-wrap",
                            compact ? "text-sm" : "text-base"
                          )}>
                            {message.content}
                          </div>
                        </div>
                        {/* User Message Actions */}
                        <div className="mt-2 flex gap-2 justify-end">
                          <button
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Copy"
                          >
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                              <path d="M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z"></path>
                            </svg>
                            Copy
                          </button>
                          {onEditMessage && (
                            <button
                              onClick={() => handleEditClick(message)}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Edit message"
                            >
                              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                                <path d="M11.3312 3.56837C12.7488 2.28756 14.9376 2.33009 16.3038 3.6963L16.4318 3.83106C17.6712 5.20294 17.6712 7.29708 16.4318 8.66895L16.3038 8.80372L10.0118 15.0947C9.68833 15.4182 9.45378 15.6553 9.22179 15.8457L8.98742 16.0225C8.78227 16.1626 8.56423 16.2832 8.33703 16.3828L8.10753 16.4756C7.92576 16.5422 7.73836 16.5902 7.5216 16.6348L6.75695 16.7705L4.36339 17.169C4.22053 17.1928 4.06908 17.2188 3.94054 17.2285C3.84177 17.236 3.70827 17.2386 3.56261 17.2031L3.41417 17.1543C3.19115 17.0586 3.00741 16.8908 2.89171 16.6797L2.84581 16.5859C2.75951 16.3846 2.76168 16.1912 2.7716 16.0596C2.7813 15.931 2.80736 15.7796 2.83117 15.6367L3.2296 13.2432L3.36437 12.4785C3.40893 12.2616 3.45789 12.0745 3.52453 11.8926L3.6173 11.6621C3.71685 11.4352 3.83766 11.2176 3.97765 11.0127L4.15343 10.7783C4.34386 10.5462 4.58164 10.312 4.90538 9.98829L11.1964 3.6963L11.3312 3.56837ZM5.84581 10.9287C5.49664 11.2779 5.31252 11.4634 5.18663 11.6162L5.07531 11.7627C4.98188 11.8995 4.90151 12.0448 4.83507 12.1963L4.77355 12.3506C4.73321 12.4607 4.70242 12.5761 4.66808 12.7451L4.54113 13.4619L4.14269 15.8555L4.14171 15.8574H4.14464L6.5382 15.458L7.25499 15.332C7.424 15.2977 7.5394 15.2669 7.64953 15.2266L7.80285 15.165C7.95455 15.0986 8.09947 15.0174 8.23644 14.9238L8.3839 14.8135C8.53668 14.6876 8.72225 14.5035 9.0714 14.1543L14.0587 9.16602L10.8331 5.94044L5.84581 10.9287ZM15.3634 4.63673C14.5281 3.80141 13.2057 3.74938 12.3097 4.48048L12.1368 4.63673L11.7735 5.00001L15.0001 8.22559L15.3634 7.86329L15.5196 7.68946C16.2015 6.85326 16.2015 5.64676 15.5196 4.81056L15.3634 4.63673Z"></path>
                              </svg>
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full">
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm opacity-80">
                            <Paperclip className="w-3 h-3" />
                            <span>{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-foreground">
                      <MarkdownRenderer 
                        content={message.content}
                        className={compact ? "text-sm" : "text-base"}
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                        {onRewrite && (
                          <button
                            onClick={() => onRewrite(message.id, message.content)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 inline mr-1" />
                            Rewrite
                          </button>
                        )}
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Copy"
                        >
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                            <path d="M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z"></path>
                          </svg>
                          Copy
                        </button>
                        <button
                          onClick={() => handleShareClick(message.id)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Share"
                        >
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                            <path d="M2.66821 12.6663V12.5003C2.66821 12.1331 2.96598 11.8353 3.33325 11.8353C3.70052 11.8353 3.99829 12.1331 3.99829 12.5003V12.6663C3.99829 13.3772 3.9992 13.8707 4.03052 14.2542C4.0612 14.6298 4.11803 14.8413 4.19849 14.9993L4.2688 15.1263C4.44511 15.4137 4.69813 15.6481 5.00024 15.8021L5.13013 15.8577C5.2739 15.9092 5.46341 15.947 5.74536 15.97C6.12888 16.0014 6.62221 16.0013 7.33325 16.0013H12.6663C13.3771 16.0013 13.8707 16.0014 14.2542 15.97C14.6295 15.9394 14.8413 15.8825 14.9993 15.8021L15.1262 15.7308C15.4136 15.5545 15.6481 15.3014 15.802 14.9993L15.8577 14.8695C15.9091 14.7257 15.9469 14.536 15.97 14.2542C16.0013 13.8707 16.0012 13.3772 16.0012 12.6663V12.5003C16.0012 12.1332 16.2991 11.8355 16.6663 11.8353C17.0335 11.8353 17.3313 12.1331 17.3313 12.5003V12.6663C17.3313 13.3553 17.3319 13.9124 17.2952 14.3626C17.2624 14.7636 17.1974 15.1247 17.053 15.4613L16.9866 15.6038C16.7211 16.1248 16.3172 16.5605 15.8215 16.8646L15.6038 16.9866C15.227 17.1786 14.8206 17.2578 14.3625 17.2952C13.9123 17.332 13.3553 17.3314 12.6663 17.3314H7.33325C6.64416 17.3314 6.0872 17.332 5.63696 17.2952C5.23642 17.2625 4.87552 17.1982 4.53931 17.054L4.39673 16.9866C3.87561 16.7211 3.43911 16.3174 3.13501 15.8216L3.01294 15.6038C2.82097 15.2271 2.74177 14.8206 2.70435 14.3626C2.66758 13.9124 2.66821 13.3553 2.66821 12.6663ZM9.33521 12.5003V4.9388L7.13696 7.13704C6.87732 7.39668 6.45625 7.39657 6.19653 7.13704C5.93684 6.87734 5.93684 6.45631 6.19653 6.19661L9.52954 2.86263L9.6311 2.77962C9.73949 2.70742 9.86809 2.66829 10.0002 2.66829C10.1763 2.66838 10.3454 2.73819 10.47 2.86263L13.804 6.19661C14.0633 6.45628 14.0634 6.87744 13.804 7.13704C13.5443 7.39674 13.1222 7.39674 12.8625 7.13704L10.6653 4.93977V12.5003C10.6651 12.8673 10.3673 13.1652 10.0002 13.1654C9.63308 13.1654 9.33538 12.8674 9.33521 12.5003Z"></path>
                          </svg>
                          Share
                        </button>
                        {showPDFDownload && (onDownloadPDF || onViewPDF) && message.content.includes('PDF Ready!') && (
                          <Drawer>
                            <DrawerTrigger asChild>
                              <button className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                                <Download className="w-3 h-3 inline mr-1" />
                                Click to Download PDF
                              </button>
                            </DrawerTrigger>
                            <DrawerContent className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col border bg-background max-w-fit mx-auto p-6 rounded-2xl shadow-xl">
                              <div className="mx-auto w-full max-w-[340px] space-y-6">
                                <DrawerHeader className="px-0 space-y-2.5">
                                  <DrawerTitle className="text-2xl font-semibold flex items-center gap-2.5 tracking-tighter">
                                    <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-inner">
                                      <FileText className="w-8 h-8 text-primary" />
                                    </div>
                                    <span>Study Notes PDF</span>
                                  </DrawerTitle>
                                  <DrawerDescription className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 tracking-tighter">
                                    Your AI-generated study notes are ready. Choose how you'd like to access them.
                                  </DrawerDescription>
                                </DrawerHeader>
                                
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Options:</h4>
                                  <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                                      <span>View PDF in browser</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                                      <span>Download to device</span>
                                    </li>
                                  </ul>
                                </div>

                                <div className="mt-auto p-4 flex flex-col gap-3 px-0">
                                  <div className="flex gap-3">
                                    {onViewPDF && (
                                      <button
                                        onClick={onViewPDF}
                                        className="group flex-1 relative overflow-hidden h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30"
                                      >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                                        <div className="relative flex items-center justify-center gap-2 tracking-tighter">
                                          <Eye className="w-4 h-4" />
                                          View PDF
                                        </div>
                                      </button>
                                    )}
                                    {onDownloadPDF && (
                                      <button
                                        onClick={onDownloadPDF}
                                        className="group flex-1 relative overflow-hidden h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30"
                                      >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                                        <div className="relative flex items-center justify-center gap-2 tracking-tighter">
                                          <Download className="w-4 h-4" />
                                          Download PDF
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                  <DrawerClose asChild>
                                    <button className="w-full h-11 rounded-xl border border-border hover:bg-accent text-sm font-semibold transition-colors tracking-tighter">
                                      Close
                                    </button>
                                  </DrawerClose>
                                </div>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        )}
                      </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                {currentLoadingType === 'advanced' ? (
                  <div className={cn(
                    "bg-muted text-foreground rounded-lg",
                    compact ? "px-3 py-2" : "px-4 py-3",
                    "max-w-fit"
                  )}>
                    <AILoadingState />
                  </div>
                ) : (
                  <AITextLoading 
                    texts={[
                      "Thinking...",
                      "Processing...", 
                      "Analyzing...",
                      "Understanding...",
                      "Preparing response..."
                    ]}
                    className={cn(
                      "text-base font-medium bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-[length:200%_100%] bg-clip-text text-transparent",
                      compact ? "text-sm" : "text-base"
                    )}
                    interval={1200}
                  />
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Share chat</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Only messages up until now will be shared
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            {/* Share Type Options */}
            <div className="flex flex-col border border-border rounded-xl overflow-hidden">
              {/* Private Option */}
              <button
                onClick={() => setShareType('private')}
                className={cn(
                  "flex items-center gap-3 w-full py-3 px-4 text-left transition-colors border-b border-border",
                  shareType === 'private' ? "bg-accent/10" : "hover:bg-accent/5"
                )}
              >
                <div className="flex items-center justify-center w-5 h-5 text-muted-foreground shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Private</p>
                  <p className="text-xs text-muted-foreground">Only you have access</p>
                </div>
                {shareType === 'private' && (
                  <div className="flex items-center justify-center w-5 h-5 text-primary shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </button>

              {/* Public Option */}
              <button
                onClick={() => setShareType('public')}
                className={cn(
                  "flex items-center gap-3 w-full py-3 px-4 text-left transition-colors",
                  shareType === 'public' ? "bg-accent/10" : "hover:bg-accent/5"
                )}
              >
                <div className="flex items-center justify-center w-5 h-5 text-muted-foreground shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Public access</p>
                  <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                </div>
                {shareType === 'public' && (
                  <div className="flex items-center justify-center w-5 h-5 text-primary shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </button>
            </div>

            {/* Share Link Display */}
            {shareLink && (
              <div className="mt-2 p-3 bg-accent/10 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-foreground break-all">
                    {shareLink}
                  </code>
                  <Button
                    onClick={handleCopyShareLink}
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}

            {/* Usage Policy */}
            <p className="text-muted-foreground text-xs px-1">
              Don't share personal information or third-party content without permission.
            </p>

            {/* Action Buttons */}
            <div className="mt-2 flex w-full items-center justify-end gap-2">
              <Button
                onClick={() => setShowShareModal(false)}
                variant="ghost"
                className="h-9 px-4 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateShareLink}
                className="h-9 px-4 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold"
              >
                {shareLink ? 'Regenerate link' : 'Create share link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
