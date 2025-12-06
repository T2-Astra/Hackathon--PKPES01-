// MCQ Generator Service
// This module generates multiple choice questions using Google Gemini API
// Falls back to mock data if API is not available

import { GoogleGenerativeAI } from '@google/generative-ai';

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Gemini API key
const GEMINI_API_KEY = 'AIzaSyBOA_G75-RHR8rmWbhP9eJX0mmSzToDVKo';
console.log('🔑 MCQ Generator using API key:', GEMINI_API_KEY.substring(0, 10) + '...');

/**
 * Generates MCQ questions based on a prompt
 * Uses Google Gemini API
 */
export async function generateMCQQuestions(
  prompt: string,
  numQuestions: number = 5
): Promise<MCQQuestion[]> {
  if (!GEMINI_API_KEY) {
    console.log('⚠️ No Gemini API key configured, using mock data');
    return generateMockMCQQuestions(prompt, numQuestions);
  }

  try {
    // Try AI generation first
    return await generateWithGemini(prompt, numQuestions);
  } catch (error) {
    console.error('❌ AI generation failed, falling back to mock data:', error);
    // Fall back to mock generation
    return generateMockMCQQuestions(prompt, numQuestions);
  }
}

/**
 * Generate MCQ questions using Google Gemini API
 */
async function generateWithGemini(
  prompt: string,
  numQuestions: number
): Promise<MCQQuestion[]> {
  console.log(`🤖 Generating ${numQuestions} questions using Gemini...`);
  console.log(`🔑 Using API key: ${GEMINI_API_KEY.substring(0, 15)}...`);

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  const systemInstruction = `You are an expert quiz generator. Generate high-quality multiple-choice questions.
Always return valid JSON without markdown code blocks.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction
  });

  const userPrompt = `Generate exactly ${numQuestions} multiple-choice questions about: "${prompt}".

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct",
      "difficulty": "easy"
    }
  ]
}

Requirements:
- Exactly ${numQuestions} questions
- 4 options per question
- correctAnswer must be the exact text of one option
- Vary difficulty: easy, medium, hard
- Educational and engaging
- Clear explanations`;

  const result = await model.generateContent(userPrompt);
  const response = result.response;
  const content = response.text();

  if (!content) {
    console.error('❌ No content in Gemini response');
    throw new Error('Invalid API response format');
  }

  // Extract JSON from response (remove markdown code blocks if present)
  let jsonText = content.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const questionsData = JSON.parse(jsonText);
  const questions = questionsData.questions as MCQQuestion[];

  console.log(`✅ Successfully generated ${questions.length} questions with Gemini`);

  return questions;
}

/**
 * Generate mock MCQ questions
 * Used when no AI API is available or as a fallback
 */
function generateMockMCQQuestions(
  prompt: string,
  numQuestions: number
): MCQQuestion[] {
  const questions: MCQQuestion[] = [];
  
  // Clean and extract key topic from prompt
  const topic = extractMainTopic(prompt);
  
  // Different question patterns for variety
  const patterns = [
    {
      question: `What is the primary purpose of ${topic}?`,
      options: [
        `To solve complex problems in ${topic} domain`,
        'To complicate existing solutions',
        'To replace all existing methods',
        'To serve as a temporary solution'
      ],
      correctAnswer: `To solve complex problems in ${topic} domain`
    },
    {
      question: `Which of the following best describes ${topic}?`,
      options: [
        'A systematic approach to problem-solving',
        'A random collection of ideas',
        'An outdated methodology',
        'A purely theoretical concept'
      ],
      correctAnswer: 'A systematic approach to problem-solving'
    },
    {
      question: `What is the main advantage of using ${topic}?`,
      options: [
        'Improved efficiency and effectiveness',
        'Increased complexity',
        'Reduced understanding',
        'Limited applicability'
      ],
      correctAnswer: 'Improved efficiency and effectiveness'
    },
    {
      question: `In which scenario would ${topic} be most beneficial?`,
      options: [
        'When dealing with complex, real-world problems',
        'Only in academic settings',
        'Never in practical applications',
        'Only for simple tasks'
      ],
      correctAnswer: 'When dealing with complex, real-world problems'
    },
    {
      question: `What fundamental principle underlies ${topic}?`,
      options: [
        'Structured thinking and systematic analysis',
        'Random trial and error',
        'Avoiding all complexity',
        'Ignoring established methods'
      ],
      correctAnswer: 'Structured thinking and systematic analysis'
    },
    {
      question: `How does ${topic} relate to other concepts in the field?`,
      options: [
        'It builds upon and extends existing knowledge',
        'It contradicts all previous knowledge',
        'It has no connection to other concepts',
        'It replaces all other concepts'
      ],
      correctAnswer: 'It builds upon and extends existing knowledge'
    },
    {
      question: `What skill is most important for understanding ${topic}?`,
      options: [
        'Analytical and critical thinking',
        'Memorization only',
        'Guessing and intuition',
        'Avoiding complex problems'
      ],
      correctAnswer: 'Analytical and critical thinking'
    },
    {
      question: `Which statement about ${topic} is most accurate?`,
      options: [
        'It requires both theoretical knowledge and practical application',
        'It is only theoretical with no practical use',
        'It requires no prior knowledge',
        'It cannot be learned or improved'
      ],
      correctAnswer: 'It requires both theoretical knowledge and practical application'
    },
    {
      question: `What is a common challenge when working with ${topic}?`,
      options: [
        'Balancing complexity with simplicity',
        'It has no challenges',
        'Too simple to be useful',
        'Impossible to understand'
      ],
      correctAnswer: 'Balancing complexity with simplicity'
    },
    {
      question: `Why is mastering ${topic} valuable?`,
      options: [
        'It enhances problem-solving capabilities and career prospects',
        'It has no real value',
        'Only for passing exams',
        'It limits career options'
      ],
      correctAnswer: 'It enhances problem-solving capabilities and career prospects'
    }
  ];
  
  // Generate requested number of questions
  for (let i = 0; i < numQuestions; i++) {
    const pattern = patterns[i % patterns.length];
    
    // Shuffle options to randomize correct answer position
    const shuffledOptions = shuffleArray([...pattern.options]);
    
    questions.push({
      question: pattern.question,
      options: shuffledOptions,
      correctAnswer: pattern.correctAnswer
    });
  }
  
  return questions;
}

/**
 * Extract the main topic from a prompt
 */
function extractMainTopic(prompt: string): string {
  // Remove common question words and extract key phrases
  const cleanPrompt = prompt
    .toLowerCase()
    .replace(/generate|create|make|mcq|questions?|about|on|for|the/gi, '')
    .trim();
  
  // Take first meaningful phrase (up to 50 chars)
  const topic = cleanPrompt.length > 50 
    ? cleanPrompt.substring(0, 47) + '...'
    : cleanPrompt;
  
  return topic || 'the given topic';
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Export types
export type { MCQQuestion };
