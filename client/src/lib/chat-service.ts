import { GoogleGenerativeAI } from '@google/generative-ai';

// API Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'file';
    name: string;
    data: string; // base64 for images
    mimeType: string;
  }[];
}

export class ChatService {
  private messages: ChatMessage[] = [];
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  clearMessages(): void {
    this.messages = [];
  }

  isConfigured(): boolean {
    return !!GEMINI_API_KEY;
  }

  // Send message to Gemini API with image support
  async sendMessage(
    content: string,
    attachments?: { type: 'image' | 'file'; name: string; data: string; mimeType: string }[]
  ): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    // System instruction
    const systemInstruction = `You are a helpful AI assistant. Follow these guidelines:
- Keep responses clean and well-organized
- For code: provide complete, working code blocks
- Be conversational and concise`;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemInstruction
    });

    // Build conversation history
    const chatHistory = this.messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });

    // Build message parts with attachments
    const messageParts: any[] = [];
    let messageText = content;

    // Handle image attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type === 'image') {
          // Extract base64 data (remove data URL prefix)
          const base64Data = attachment.data.replace(/^data:image\/\w+;base64,/, '');
          messageParts.push({
            inlineData: {
              mimeType: attachment.mimeType,
              data: base64Data
            }
          });
          messageText += `\n\n📷 Image: ${attachment.name} (attached)`;
        } else if (attachment.type === 'file') {
          // Handle PDF files
          if (attachment.mimeType === 'application/pdf' && attachment.data.startsWith('data:')) {
            const base64Data = attachment.data.replace(/^data:application\/pdf;base64,/, '');
            messageParts.push({
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data
              }
            });
            messageText += `\n\n📄 PDF: ${attachment.name} - Please analyze this document.`;
          } else {
            // Text files - append content directly
            messageText += `\n\n📎 File: ${attachment.name}\n\nContent:\n${attachment.data}`;
          }
        }
      }
    }

    messageParts.push({ text: messageText });

    // Send message and get response
    const result = await chat.sendMessage(messageParts);
    const response = await result.response;
    let text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return text.trim();
  }
}

export const chatService = new ChatService();
