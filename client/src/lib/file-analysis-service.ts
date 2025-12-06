import { GoogleGenerativeAI } from '@google/generative-ai';

const FILE_ANALYSIS_API_KEY = import.meta.env.VITE_FILE_ANALYSIS_GEMINI_KEY || '';
const fileAnalysisAI = FILE_ANALYSIS_API_KEY ? new GoogleGenerativeAI(FILE_ANALYSIS_API_KEY) : null;

export interface FileAttachment {
  type: 'image' | 'file';
  name: string;
  data: string;
  mimeType: string;
}

export class FileAnalysisService {
  isConfigured(): boolean {
    return !!fileAnalysisAI;
  }

  async analyzeFiles(
    prompt: string,
    attachments: FileAttachment[],
    conversationHistory?: { role: 'user' | 'model'; content: string }[]
  ): Promise<{ success: boolean; content: string; error?: string }> {
    if (!fileAnalysisAI) {
      return { success: false, content: '', error: 'File analysis API not configured. Please set VITE_FILE_ANALYSIS_GEMINI_KEY in your .env file.' };
    }

    try {
      const systemInstruction = `You are a helpful AI assistant specialized in analyzing files:
- For images: Describe content, extract text if present
- For PDFs: Extract key information, summarize content
- For code files: Explain the code, identify issues`;

      const model = fileAnalysisAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction
      });

      const chatHistory = conversationHistory?.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })) || [];

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
      });

      const messageParts: any[] = [];
      let messageText = prompt;

      for (const attachment of attachments) {
        if (attachment.type === 'image') {
          const base64Data = attachment.data.replace(/^data:image\/\w+;base64,/, '');
          messageParts.push({
            inlineData: { mimeType: attachment.mimeType, data: base64Data }
          });
          messageText += `\n\n📷 Image: ${attachment.name}`;
        } else if (attachment.mimeType === 'application/pdf' && attachment.data.startsWith('data:')) {
          const base64Data = attachment.data.replace(/^data:application\/pdf;base64,/, '');
          messageParts.push({
            inlineData: { mimeType: 'application/pdf', data: base64Data }
          });
          messageText += `\n\n📄 PDF: ${attachment.name}`;
        } else {
          messageText += `\n\n📎 File: ${attachment.name}\n\nContent:\n${attachment.data}`;
        }
      }

      messageParts.push({ text: messageText });

      const result = await chat.sendMessage(messageParts);
      const text = result.response.text();

      return { success: true, content: text?.trim() || '' };
    } catch (error) {
      return { success: false, content: '', error: String(error) };
    }
  }
}

export const fileAnalysisService = new FileAnalysisService();
