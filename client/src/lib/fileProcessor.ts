// File processing utilities for AI chat
export interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  isImage: boolean;
  base64?: string;
  error?: string;
}

// Supported file types for text extraction
const TEXT_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'text/csv',
  'application/xml',
  'text/xml'
];

const CODE_FILE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php',
  '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.sql', '.sh', '.bat',
  '.html', '.css', '.scss', '.less', '.json', '.xml', '.yaml', '.yml', '.toml',
  '.md', '.txt', '.log', '.conf', '.ini', '.env'
];

const IMAGE_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp'
];

// Check if file is a text file
export function isTextFile(file: File): boolean {
  // Check MIME type
  if (TEXT_FILE_TYPES.includes(file.type)) {
    return true;
  }
  
  // Check file extension for code files
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return CODE_FILE_EXTENSIONS.includes(extension);
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return IMAGE_FILE_TYPES.includes(file.type);
}

// Read text content from file
export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content || '');
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Convert image to base64
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

// Process PDF files (basic text extraction)
export async function processPDF(file: File): Promise<string> {
  // For now, return a description of the PDF
  // In a full implementation, you'd use a PDF parsing library
  return `[PDF File: ${file.name} - ${(file.size / 1024 / 1024).toFixed(1)}MB]
  
This is a PDF document. To fully analyze PDF content, you would need to implement PDF text extraction using libraries like pdf-parse or PDF.js.

For now, I can see this is a PDF file named "${file.name}" with a size of ${(file.size / 1024 / 1024).toFixed(1)}MB.

Please describe what's in this PDF or paste the text content if you'd like me to analyze it.`;
}

// Main file processing function
export async function processFile(file: File): Promise<ProcessedFile> {
  const processedFile: ProcessedFile = {
    name: file.name,
    type: file.type,
    size: file.size,
    content: '',
    isImage: false,
  };

  try {
    if (isImageFile(file)) {
      // Process image files
      processedFile.isImage = true;
      processedFile.base64 = await imageToBase64(file);
      processedFile.content = `[Image: ${file.name}]
      
This is an image file (${file.type}) named "${file.name}".
Image size: ${(file.size / 1024 / 1024).toFixed(1)}MB
Dimensions: Will be analyzed when processed by AI.

I can analyze this image and describe what I see, identify objects, read text in the image, explain diagrams, or help with any questions about the visual content.`;

    } else if (isTextFile(file)) {
      // Process text/code files
      const textContent = await readTextFile(file);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      processedFile.content = `[File: ${file.name}]
File type: ${file.type || 'text/' + fileExtension}
Size: ${(file.size / 1024).toFixed(1)}KB

Content:
${textContent}`;

    } else if (file.type === 'application/pdf') {
      // Process PDF files
      processedFile.content = await processPDF(file);
      
    } else {
      // Unsupported file type
      processedFile.content = `[File: ${file.name}]
File type: ${file.type}
Size: ${(file.size / 1024 / 1024).toFixed(1)}MB

This file type is not directly supported for content analysis. 

Supported formats:
- Images: PNG, JPG, GIF, WebP, SVG
- Text files: TXT, MD, HTML, CSS, JS, TS, JSON, XML
- Code files: Python, Java, C++, and many more
- Documents: PDF (basic support)

Please convert to a supported format or describe the file contents if you'd like me to help analyze it.`;
    }

  } catch (error) {
    processedFile.error = `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    processedFile.content = `[Error processing file: ${file.name}]

There was an error reading this file. This might be due to:
- File corruption
- Unsupported encoding
- File access permissions
- Browser limitations

Please try uploading the file again or use a different format.`;
  }

  return processedFile;
}

// Process multiple files
export async function processFiles(files: File[]): Promise<ProcessedFile[]> {
  const processedFiles: ProcessedFile[] = [];
  
  for (const file of files) {
    const processed = await processFile(file);
    processedFiles.push(processed);
  }
  
  return processedFiles;
}

// Create context string for AI from processed files
export function createFileContext(processedFiles: ProcessedFile[]): string {
  if (processedFiles.length === 0) return '';
  
  const context = processedFiles.map((file, index) => {
    let fileInfo = `\n--- FILE ${index + 1}: ${file.name} ---\n`;
    fileInfo += file.content;
    fileInfo += `\n--- END OF FILE ${index + 1} ---\n`;
    return fileInfo;
  }).join('\n');

  const summary = `I have uploaded ${processedFiles.length} file(s):
${processedFiles.map((f, i) => `${i + 1}. ${f.name} (${f.isImage ? 'Image' : 'Text'} - ${(f.size / 1024).toFixed(1)}KB)`).join('\n')}

Please analyze these files and help me understand their content, answer questions about them, or provide insights based on what you see.

${context}`;

  return summary;
}
