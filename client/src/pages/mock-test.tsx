import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AIMCQInput from '@/components/ui/ai-mcq-input';
import SmoothDrawer from '@/components/ui/smooth-drawer';
import { 
  ClipboardList, 
  Upload, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  ArrowRight,
  FileText,
  Clock,
  Target,
  Sparkles,
  ListChecks,
  MessageSquare,
  HelpCircle,
  Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Vapi, { VapiTranscript, VapiError, VapiAssistant } from '@vapi-ai/web';

// VAPI Configuration
const VAPI_CONFIG = {
  WEB_TOKEN: '9f442c8e-4b35-49c1-8705-d82f0f47b7e1',
  WORKFLOW_ID: '12384a72-caff-4282-ad5a-f04659dc6708',
};

interface TestQuestion {
  id: number;
  question: string;
  userAnswer?: string;
  score?: number;
  options?: string[]; // For MCQ mode
  correctAnswer?: string; // For MCQ mode
}

interface MCQQuestion extends TestQuestion {
  options: string[];
  correctAnswer: string;
}

interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  grade: string;
}

export default function MockTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [testTopic, setTestTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestActive, setIsTestActive] = useState(false);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isVAPIActive, setIsVAPIActive] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [isVapiLoading, setIsVapiLoading] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [vapiInitialized, setVapiInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // MCQ Mode State
  const [isMCQMode, setIsMCQMode] = useState(true); // Default to MCQ mode
  const [userPrompt, setUserPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showHowItWorksVideo, setShowHowItWorksVideo] = useState(false);

  // Initialize VAPI
  useEffect(() => {
    if (vapiInitialized) return; // Prevent re-initialization
    
    const initVapi = async () => {
      try {
        console.log('Initializing VAPI with token:', VAPI_CONFIG.WEB_TOKEN.substring(0, 8) + '...');
        const vapi = new Vapi(VAPI_CONFIG.WEB_TOKEN);
        
        // Set up event listeners
        vapi.on('call-start', () => {
          console.log('✅ VAPI call started successfully');
          setIsVAPIActive(true);
          setIsVapiLoading(false);
        });

        vapi.on('call-end', () => {
          console.log('✅ VAPI call ended');
          setIsVAPIActive(false);
          setIsVapiLoading(false);
        });

        vapi.on('speech-start', () => {
          console.log('🎤 User started speaking');
        });

        vapi.on('speech-end', () => {
          console.log('🎤 User stopped speaking');
        });

        vapi.on('transcript', (transcript: VapiTranscript) => {
          console.log('📝 Transcript received:', transcript);
          setCurrentTranscript(transcript.text || '');
          
          // Update the current question's answer when user finishes speaking
          if (transcript.text && transcript.role === 'user') {
            setQuestions(prev => prev.map((q, index) => 
              index === currentQuestionIndex 
                ? { ...q, userAnswer: transcript.text }
                : q
            ));
            
            // Silently record the answer without showing toast
          }
          
          // Log assistant messages too
          if (transcript.role === 'assistant') {
            console.log('🤖 Assistant said:', transcript.text);
          }
        });

        // Add more event listeners for debugging
        vapi.on('message', (message) => {
          console.log('💬 VAPI message:', message);
        });

        vapi.on('volume-level', (level) => {
          console.log('🔊 Volume level:', level);
        });

        vapi.on('error', (error: VapiError) => {
          console.error('❌ VAPI error:', error);
          toast({
            title: 'Voice Error',
            description: error.message || 'There was an issue with the voice system. Please try again.',
            variant: 'destructive',
          });
          setIsVAPIActive(false);
          setIsVapiLoading(false);
        });

        setVapiInstance(vapi);
        setVapiInitialized(true);
        console.log('✅ VAPI initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize VAPI:', error);
        toast({
          title: 'Voice System Error',
          description: 'Failed to initialize voice system. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    initVapi();

    return () => {
      if (vapiInstance) {
        console.log('🧹 Cleaning up VAPI instance');
        vapiInstance.stop();
      }
    };
  }, [vapiInitialized]); // Only run when vapiInitialized changes

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 20MB',
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
      toast({
        title: 'File uploaded',
        description: `${file.name} ready for mock test generation`,
      });
    }
  };

  const generateMCQQuestions = async () => {
    if (!userPrompt && !uploadedFile) {
      toast({
        title: 'No content provided',
        description: 'Please enter a prompt or upload a file',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let prompt = userPrompt;

      // If file is uploaded, extract text and use it as prompt
      if (uploadedFile) {
        toast({
          title: 'Processing file',
          description: 'Extracting text from uploaded file...',
        });

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('numQuestions', numQuestions.toString());

        const response = await fetch('/api/generate-mcq-from-file', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process file');
        }

        const data = await response.json();
        const mcqQuestions: TestQuestion[] = data.questions.map((q: any, i: number) => ({
          id: i + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        }));

        setQuestions(mcqQuestions);
        setIsTestActive(true);
        setCurrentQuestionIndex(0);
        
        toast({
          title: 'MCQ test generated from file',
          description: `${numQuestions} questions generated from ${uploadedFile.name}!`,
        });
        
        setIsGenerating(false);
        return;
      }

      // Generate from text prompt
      const response = await fetch('/api/generate-mcq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          numQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate MCQ questions');
      }

      const data = await response.json();
      const mcqQuestions: TestQuestion[] = data.questions.map((q: any, i: number) => ({
        id: i + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));

      setQuestions(mcqQuestions);
      setIsTestActive(true);
      setCurrentQuestionIndex(0);
      
      toast({
        title: 'MCQ test generated',
        description: `${numQuestions} multiple choice questions ready!`,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Failed to generate MCQ test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockTest = async () => {
    if (isMCQMode) {
      return generateMCQQuestions();
    }

    if (!uploadedFile && !testTopic) {
      toast({
        title: 'No content provided',
        description: 'Please upload a file or enter a topic',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate more realistic sample questions based on topic
      const topicName = testTopic || uploadedFile?.name || 'General Knowledge';
      const sampleQuestions = [
        `What are the key concepts in ${topicName}?`,
        `Explain the main principles of ${topicName}.`,
        `How would you apply ${topicName} in a real-world scenario?`,
        `What are the advantages and disadvantages of ${topicName}?`,
        `Describe the relationship between different components in ${topicName}.`,
        `What challenges might you face when working with ${topicName}?`,
        `Compare and contrast different approaches in ${topicName}.`,
        `What are the best practices for ${topicName}?`,
        `How has ${topicName} evolved over time?`,
        `What future developments do you expect in ${topicName}?`
      ];

      const mockQuestions: TestQuestion[] = Array.from({ length: numQuestions }, (_, i) => ({
        id: i + 1,
        question: sampleQuestions[i % sampleQuestions.length],
      }));

      setQuestions(mockQuestions);
      setIsTestActive(true);
      setCurrentQuestionIndex(0);
      
      toast({
        title: 'Mock test generated',
        description: `${numQuestions} questions ready. Click the microphone to start!`,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Failed to generate mock test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startVAPITest = async () => {
    if (!vapiInstance) {
      toast({
        title: 'Voice System Not Ready',
        description: 'Please wait for the voice system to initialize and try again',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🚀 Starting VAPI test for question:', currentQuestionIndex + 1);
      setIsVapiLoading(true);
      setCurrentTranscript('');
      
      // Create a dynamic assistant for the current question
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) {
        throw new Error('No question available');
      }

      const assistant: VapiAssistant = {
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a test proctor conducting a mock exam. Your job is to:
1. Ask the question clearly: "${currentQuestion.question}"
2. Wait for the student's complete answer
3. Once they finish, acknowledge briefly and end the call
4. Keep responses short and professional
5. Do not provide hints or correct answers
6. If they ask for clarification, repeat the question once`
            }
          ]
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        firstMessage: `Hello! I'm your test assistant. Here is your question: ${currentQuestion.question}. Please take your time to think and then provide your answer.`,
        endCallMessage: 'Thank you for your answer. Your response has been recorded.',
        endCallPhrases: ['that\'s my answer', 'I\'m done', 'finished', 'complete', 'end answer']
      };

      console.log('🎯 Starting VAPI with assistant config:', assistant);
      await vapiInstance.start(assistant);
    } catch (error) {
      console.error('❌ Failed to start VAPI:', error);
      toast({
        title: 'Voice Error',
        description: `Failed to start voice interaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setIsVapiLoading(false);
    }
  };

  const stopVAPITest = async () => {
    if (!vapiInstance) return;

    try {
      await vapiInstance.stop();
      setIsVAPIActive(false);
      setIsVapiLoading(false);
    } catch (error) {
      console.error('Failed to stop VAPI:', error);
      setIsVAPIActive(false);
      setIsVapiLoading(false);
    }
  };

  const evaluateTest = () => {
    setIsEvaluating(true);
    
    // Simulate evaluation
    setTimeout(() => {
      let correctAnswers = 0;
      
      if (isMCQMode) {
        // For MCQ mode, check if selected answer matches correct answer
        correctAnswers = questions.filter(q => 
          q.userAnswer === q.correctAnswer
        ).length;
      } else {
        // For voice mode, use mock scoring
        const answeredQuestions = questions.filter(q => q.userAnswer).length;
        correctAnswers = Math.floor(answeredQuestions * 0.7);
      }
      
      const score = (correctAnswers / questions.length) * 100;
      const percentage = score;
      
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      setTestResult({
        totalQuestions: questions.length,
        correctAnswers,
        score,
        percentage,
        grade,
      });
      setIsEvaluating(false);
      setIsTestActive(false);
    }, 2000);
  };

  const resetTest = () => {
    setUploadedFile(null);
    setTestTopic('');
    setUserPrompt('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setIsTestActive(false);
    setTestResult(null);
    setIsVAPIActive(false);
    setShowDetailedResults(false);
  };

  const handleMCQAnswer = (answer: string) => {
    setQuestions(prev => prev.map((q, index) => 
      index === currentQuestionIndex 
        ? { ...q, userAnswer: answer }
        : q
    ));
  };

  return (
    <div className="min-h-screen bg-background md:pl-16">
      {/* Mobile Header */}
      <div className="draggable h-12 bg-card/30 backdrop-blur-sm sticky top-0 z-10 flex items-center border-transparent px-2 md:hidden">
        <div className="no-draggable flex items-center justify-center">
          <button 
            type="button" 
            className="hover:text-foreground touch:h-10 touch:w-10 inline-flex h-9 w-9 items-center justify-center rounded-md focus:ring-2 focus:ring-primary focus:outline-none focus:ring-inset active:opacity-50"
            aria-expanded="false"
            aria-controls="sidebar"
          >
            <span className="sr-only">Open sidebar</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon-lg text-muted-foreground mx-2">
              <path d="M11.6663 12.6686L11.801 12.6823C12.1038 12.7445 12.3313 13.0125 12.3313 13.3337C12.3311 13.6547 12.1038 13.9229 11.801 13.985L11.6663 13.9987H3.33325C2.96609 13.9987 2.66839 13.7008 2.66821 13.3337C2.66821 12.9664 2.96598 12.6686 3.33325 12.6686H11.6663ZM16.6663 6.00163L16.801 6.0153C17.1038 6.07747 17.3313 6.34546 17.3313 6.66667C17.3313 6.98788 17.1038 7.25586 16.801 7.31803L16.6663 7.33171H3.33325C2.96598 7.33171 2.66821 7.03394 2.66821 6.66667C2.66821 6.2994 2.96598 6.00163 3.33325 6.00163H16.6663Z"></path>
            </svg>
          </button>
        </div>
        
        <div className="no-draggable flex-1 flex items-start justify-between ml-4 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Mock Test</h1>
              <p className="text-[10px] text-muted-foreground">
                {isMCQMode ? 'AI-powered MCQ testing' : 'AI-powered voice testing'}
              </p>
            </div>
          </div>
          
          {/* Mode Toggle in Header - Aligned with hamburger */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border mt-0">
            <MessageSquare className={cn(
              "w-3 h-3 transition-colors",
              !isMCQMode ? "text-primary" : "text-muted-foreground"
            )} />
            <Switch
              id="header-test-mode"
              checked={isMCQMode}
              onCheckedChange={(checked) => {
                setIsMCQMode(checked);
                if (isTestActive) {
                  resetTest();
                }
              }}
              disabled={isTestActive}
              className="scale-75"
            />
            <ListChecks className={cn(
              "w-3 h-3 transition-colors",
              isMCQMode ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
        </div>
      </div>


      {/* Desktop Header */}
      <div className="hidden md:block border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 pt-16 md:pt-4 sm:md:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Mock Test</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isMCQMode ? 'AI-powered MCQ testing system' : 'AI-powered voice testing system'}
                </p>
              </div>
            </div>
            
            {/* Toggle Button */}
            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border border-border w-full sm:w-auto">
              <div className="flex items-center gap-2">
              <MessageSquare className={cn(
                "w-4 h-4 transition-colors",
                !isMCQMode ? "text-primary" : "text-muted-foreground"
              )} />
              <Label htmlFor="test-mode" className="text-sm font-medium cursor-pointer">
                {isMCQMode ? 'MCQ Mode' : 'Voice Mode'}
              </Label>
            </div>
            <Switch
              id="test-mode"
              checked={isMCQMode}
              onCheckedChange={(checked) => {
                setIsMCQMode(checked);
                if (isTestActive) {
                  resetTest();
                }
              }}
              disabled={isTestActive}
            />
            <ListChecks className={cn(
              "w-4 h-4 transition-colors",
              isMCQMode ? "text-primary" : "text-muted-foreground"
            )} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {!testResult ? (
          <div className={cn(
            "grid gap-6 max-w-4xl mx-auto",
            !isTestActive && isMCQMode && "min-h-[60vh] flex items-center justify-center"
          )}>
            {/* Upload Section */}
            {!isTestActive && (
              <>
                {isMCQMode ? (
                  /* Modern AI MCQ Input - Centered */
                  <div className="w-full space-y-4">
                    <div className="flex justify-center">
                      <AIMCQInput
                        value={userPrompt}
                        onChange={setUserPrompt}
                        onGenerate={generateMockTest}
                        numQuestions={numQuestions}
                        onNumQuestionsChange={setNumQuestions}
                        difficulty={difficulty}
                        onDifficultyChange={setDifficulty}
                        isGenerating={isGenerating}
                        uploadedFile={uploadedFile}
                        onFileUpload={setUploadedFile}
                        onFileRemove={() => setUploadedFile(null)}
                      />
                    </div>
                    {/* Desktop - Both buttons */}
                    <div className="hidden sm:flex justify-center items-center gap-3">
                      <SmoothDrawer
                        title="PolyLearnHub MCQ Generator"
                        description="Create AI-powered multiple choice tests instantly. Generate questions on any topic with varying difficulty levels and get instant results."
                        primaryButtonText="Start Testing Now"
                        secondaryButtonText="Close"
                        features={[
                          "🤖 AI-Generated Questions (GPT-4o-mini)",
                          "📊 Instant Scoring & Grading",
                          "🎯 Multiple Difficulty Levels",
                          "⚡ 3-15 Questions per Test",
                          "🎤 Voice Mode Available",
                          "📱 Mobile Responsive"
                        ]}
                        onPrimaryAction={() => {
                          // Scroll to input or focus on it
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        triggerText="Learn More"
                      />
                      <Button
                        onClick={() => setShowHowItWorksVideo(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        How it Works
                      </Button>
                    </div>
                    
                    {/* Mobile - Both buttons in one line */}
                    <div className="sm:hidden flex justify-center items-center gap-3">
                      <SmoothDrawer
                        title="PolyLearnHub MCQ Generator"
                        description="Create AI-powered multiple choice tests instantly. Generate questions on any topic with varying difficulty levels and get instant results."
                        primaryButtonText="Start Testing Now"
                        secondaryButtonText="Close"
                        features={[
                          "🤖 AI-Generated Questions (GPT-4o-mini)",
                          "📊 Instant Scoring & Grading",
                          "🎯 Multiple Difficulty Levels",
                          "⚡ 3-15 Questions per Test",
                          "🎤 Voice Mode Available",
                          "📱 Mobile Responsive"
                        ]}
                        onPrimaryAction={() => {
                          // Scroll to input or focus on it
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        triggerText="Learn More"
                        triggerClassName="text-xs px-3 py-2 h-9"
                      />
                      <Button
                        onClick={() => setShowHowItWorksVideo(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-2 text-xs h-9 px-3"
                      >
                        <Play className="w-3 h-3" />
                        How it Works
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Voice Mode Setup Card */
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Setup Mock Test
                      </CardTitle>
                      <CardDescription>
                        Upload study material or enter a topic to generate AI-powered voice test questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* File Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Study Material (Optional)</label>
                        <div className="flex gap-3">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                          />
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="flex-1"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadedFile ? uploadedFile.name : 'Choose File'}
                          </Button>
                          {uploadedFile && (
                            <Button
                              onClick={() => setUploadedFile(null)}
                              variant="destructive"
                              size="icon"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Topic Input */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Test Topic</label>
                        <input
                          type="text"
                          value={testTopic}
                          onChange={(e) => setTestTopic(e.target.value)}
                          placeholder="e.g., Data Structures, Thermodynamics, Circuit Analysis"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Number of Questions */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Questions</label>
                        <div className="flex gap-2">
                          {[3, 5, 7, 9].map((num) => (
                            <Button
                              key={num}
                              onClick={() => setNumQuestions(num)}
                              variant={numQuestions === num ? 'default' : 'outline'}
                              size="sm"
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Generate Button */}
                      <Button
                        onClick={generateMockTest}
                        disabled={isGenerating || (!uploadedFile && !testTopic)}
                        className="w-full"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Generating Mock Test...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Mock Test
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Test Interface */}
            {isTestActive && (
              <div className="space-y-6">
                {/* Progress */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="font-medium">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                      </div>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {isMCQMode ? 'MCQ Test' : 'Voice Test'}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions */}
                {!isMCQMode && (
                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">How Voice Testing Works:</h4>
                          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>1. Click the microphone button to start</li>
                            <li>2. The AI assistant will read the question aloud</li>
                            <li>3. Speak your answer clearly when prompted</li>
                            <li>4. Say "I'm done" or "finished" when you complete your answer</li>
                            <li>5. The assistant will acknowledge and end the recording</li>
                          </ol>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Current Question */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.question}
                    </CardTitle>
                    <CardDescription>
                      {isMCQMode 
                        ? 'Select the correct answer from the options below'
                        : 'The AI assistant will read this question to you and wait for your spoken response'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isMCQMode ? (
                      /* MCQ Options */
                      <div className="space-y-3">
                        {questions[currentQuestionIndex]?.options?.map((option, index) => {
                          const isSelected = questions[currentQuestionIndex]?.userAnswer === option;
                          const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                          
                          return (
                            <button
                              key={index}
                              onClick={() => handleMCQAnswer(option)}
                              className={cn(
                                "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                                "hover:border-primary/50 hover:bg-primary/5",
                                isSelected 
                                  ? "border-primary bg-primary/10" 
                                  : "border-border bg-card"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold",
                                  isSelected 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {optionLabel}
                                </div>
                                <p className="flex-1 pt-1">{option}</p>
                                {isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* VAPI Voice Interface */
                      <div className="flex flex-col items-center gap-4 p-8 bg-muted/30 rounded-lg border border-border">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          {!vapiInstance 
                            ? "Voice system is loading..." 
                            : isVAPIActive 
                            ? "🎤 Listening... Speak your answer clearly"
                            : "Click the microphone to start voice test"
                          }
                        </p>
                      </div>
                      
                      <button
                        onClick={isVAPIActive ? stopVAPITest : startVAPITest}
                        disabled={isVapiLoading}
                        className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                          isVAPIActive
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : isVapiLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary hover:bg-primary/90"
                        )}
                      >
                        {isVapiLoading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isVAPIActive ? (
                          <MicOff className="w-10 h-10 text-white" />
                        ) : (
                          <Mic className="w-10 h-10 text-primary-foreground" />
                        )}
                      </button>

                      {isVapiLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span>Connecting...</span>
                        </div>
                      )}

                      {isVAPIActive && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>Recording your answer</span>
                        </div>
                      )}

                      {currentTranscript && (
                        <div className="w-full p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Live Transcript:</p>
                          <p className="text-foreground">
                            {currentTranscript}
                          </p>
                        </div>
                      )}

                      {questions[currentQuestionIndex]?.userAnswer && (
                        <div className="w-full p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Answer Recorded</p>
                          </div>
                          <p className="text-foreground">
                            {questions[currentQuestionIndex].userAnswer}
                          </p>
                        </div>
                      )}

                      {/* Troubleshooting */}
                      {vapiInstance && !isVAPIActive && (
                        <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            <strong>Troubleshooting:</strong> If you don't hear the assistant speaking:
                            <br />• Check your browser's audio permissions
                            <br />• Ensure your speakers/headphones are working
                            <br />• Try refreshing the page if issues persist
                          </p>
                        </div>
                      )}
                    </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        variant="outline"
                      >
                        Previous
                      </Button>

                      {currentQuestionIndex < questions.length - 1 ? (
                        <Button
                          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        >
                          Next Question
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={evaluateTest}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit Test
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex justify-center">
                  <Button
                    onClick={resetTest}
                    variant="ghost"
                    className="text-muted-foreground"
                  >
                    Cancel Test
                  </Button>
                </div>
              </div>
            )}

            {/* Evaluating State */}
            {isEvaluating && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Evaluating Your Answers</h3>
                      <p className="text-sm text-muted-foreground">
                        AI is analyzing your responses and calculating your score...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Test Results */
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Test Completed!</CardTitle>
                <CardDescription>Here are your results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-primary">
                    {testResult.percentage.toFixed(0)}%
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    Grade: {testResult.grade}
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {testResult.totalQuestions}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Questions</div>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {testResult.correctAnswers}
                    </div>
                    <div className="text-xs text-muted-foreground">Correct</div>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg text-center border border-red-500/20">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {testResult.totalQuestions - testResult.correctAnswers}
                    </div>
                    <div className="text-xs text-muted-foreground">Incorrect</div>
                  </div>
                </div>

                {/* Performance Message */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-center text-foreground">
                    {testResult.percentage >= 80
                      ? "🎉 Excellent work! You have a strong understanding of the topic."
                      : testResult.percentage >= 60
                      ? "👍 Good job! Keep practicing to improve further."
                      : "💪 Keep studying! Review the topics and try again."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={resetTest}
                    variant="outline"
                    className="flex-1"
                  >
                    Take Another Test
                  </Button>
                  <Button
                    onClick={() => setShowDetailedResults(true)}
                    className="flex-1"
                  >
                    See Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Results View */}
        {showDetailedResults && testResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Detailed Results
                  </CardTitle>
                  <Button
                    onClick={() => setShowDetailedResults(false)}
                    variant="outline"
                    size="sm"
                  >
                    Back to Summary
                  </Button>
                </div>
                <CardDescription>
                  Review your answers and see the correct solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((question, index) => {
                  const isCorrect = isMCQMode 
                    ? question.userAnswer === question.correctAnswer
                    : Math.random() > 0.3; // Mock scoring for voice mode
                  
                  return (
                    <div
                      key={question.id}
                      className={cn(
                        "p-4 rounded-lg border-2",
                        isCorrect
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                          isCorrect
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                        )}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">
                            {question.question}
                          </h4>
                          
                          {isMCQMode && question.options && (
                            <div className="space-y-2 mb-3">
                              {question.options.map((option, optionIndex) => {
                                const isUserAnswer = question.userAnswer === option;
                                const isCorrectAnswer = question.correctAnswer === option;
                                const optionLabel = String.fromCharCode(65 + optionIndex);
                                
                                return (
                                  <div
                                    key={optionIndex}
                                    className={cn(
                                      "flex items-center gap-2 p-2 rounded border",
                                      isCorrectAnswer
                                        ? "bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-700"
                                        : isUserAnswer
                                        ? "bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700"
                                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                                      isCorrectAnswer
                                        ? "bg-green-500 text-white"
                                        : isUserAnswer
                                        ? "bg-red-500 text-white"
                                        : "bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                                    )}>
                                      {optionLabel}
                                    </div>
                                    <span className={cn(
                                      "flex-1",
                                      isCorrectAnswer
                                        ? "text-green-800 dark:text-green-200 font-medium"
                                        : isUserAnswer
                                        ? "text-red-800 dark:text-red-200"
                                        : "text-slate-600 dark:text-slate-400"
                                    )}>
                                      {option}
                                    </span>
                                    {isCorrectAnswer && (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {!isMCQMode && (
                            <div className="mb-3">
                              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Your Answer:</p>
                                <p className="text-foreground">
                                  {question.userAnswer || 'No answer recorded'}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              isCorrect
                                ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                            )}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* How it Works Video Dialog */}
        <Dialog open={showHowItWorksVideo} onOpenChange={setShowHowItWorksVideo}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle>How MCQ Generator Works</DialogTitle>
              <DialogDescription>
                Follow this step-by-step guide to learn how to use our AI-powered MCQ generator
              </DialogDescription>
            </DialogHeader>
            <div className="w-full rounded-lg overflow-hidden border">
              {/* Step-by-step guide instead of video for now */}
              <div className="p-6 space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Enter Your Topic or Upload File</h4>
                      <p className="text-sm text-muted-foreground">
                        Type any topic (e.g., "Machine Learning", "React Hooks") or upload a PDF/document with your study material.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Choose Number of Questions</h4>
                      <p className="text-sm text-muted-foreground">
                        Select between 3-15 questions. More questions = more comprehensive test.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Generate MCQ Test</h4>
                      <p className="text-sm text-muted-foreground">
                        Our AI (GPT-4o-mini) creates multiple choice questions with 4 options each, tailored to your topic.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Take the Test</h4>
                      <p className="text-sm text-muted-foreground">
                        Answer questions at your own pace. You can navigate back and forth between questions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Get Instant Results</h4>
                      <p className="text-sm text-muted-foreground">
                        See your score, grade, and detailed breakdown of correct/incorrect answers immediately after submission.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Pro Tips:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use specific topics for better question quality</li>
                    <li>• Upload PDFs for questions based on your exact material</li>
                    <li>• Try both MCQ and Voice modes for different learning styles</li>
                    <li>• Take multiple tests to reinforce learning</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowHowItWorksVideo(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
