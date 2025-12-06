import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Eye, Ear, Hand, BookOpen, ChevronRight, ChevronLeft,
  Sparkles, Check, Brain, Target, Clock, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    type: "visual" | "auditory" | "reading" | "kinesthetic";
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "When learning something new, I prefer to:",
    options: [
      { text: "Watch videos or look at diagrams", type: "visual" },
      { text: "Listen to explanations or podcasts", type: "auditory" },
      { text: "Read articles and documentation", type: "reading" },
      { text: "Try it hands-on immediately", type: "kinesthetic" },
    ],
  },
  {
    id: 2,
    question: "I remember information best when:",
    options: [
      { text: "I see it in charts, graphs, or images", type: "visual" },
      { text: "I hear it explained or discuss it", type: "auditory" },
      { text: "I read and take notes", type: "reading" },
      { text: "I practice and do exercises", type: "kinesthetic" },
    ],
  },
  {
    id: 3,
    question: "When solving a problem, I usually:",
    options: [
      { text: "Visualize the solution in my mind", type: "visual" },
      { text: "Talk through it out loud", type: "auditory" },
      { text: "Write down the steps", type: "reading" },
      { text: "Jump in and experiment", type: "kinesthetic" },
    ],
  },
  {
    id: 4,
    question: "In a classroom or course, I learn best from:",
    options: [
      { text: "Presentations with visuals", type: "visual" },
      { text: "Lectures and discussions", type: "auditory" },
      { text: "Textbooks and written materials", type: "reading" },
      { text: "Labs and practical exercises", type: "kinesthetic" },
    ],
  },
  {
    id: 5,
    question: "When I need to study, I prefer:",
    options: [
      { text: "Color-coded notes and mind maps", type: "visual" },
      { text: "Recording and replaying lectures", type: "auditory" },
      { text: "Highlighting and summarizing text", type: "reading" },
      { text: "Building projects or doing practice problems", type: "kinesthetic" },
    ],
  },
];

const styleConfig = {
  visual: {
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    title: "Visual Learner",
    description: "You learn best through images, diagrams, and visual representations.",
    tips: [
      "Use mind maps and flowcharts",
      "Watch video tutorials",
      "Color-code your notes",
      "Create visual summaries",
    ],
  },
  auditory: {
    icon: Ear,
    color: "text-purple-500",
    bg: "bg-purple-500",
    bgLight: "bg-purple-500/10",
    title: "Auditory Learner",
    description: "You learn best through listening and verbal explanations.",
    tips: [
      "Listen to podcasts and audiobooks",
      "Discuss topics with others",
      "Record and replay lectures",
      "Use text-to-speech tools",
    ],
  },
  reading: {
    icon: BookOpen,
    color: "text-green-500",
    bg: "bg-green-500",
    bgLight: "bg-green-500/10",
    title: "Reading/Writing Learner",
    description: "You learn best through reading and writing activities.",
    tips: [
      "Take detailed notes",
      "Read documentation thoroughly",
      "Write summaries in your own words",
      "Create written study guides",
    ],
  },
  kinesthetic: {
    icon: Hand,
    color: "text-orange-500",
    bg: "bg-orange-500",
    bgLight: "bg-orange-500/10",
    title: "Kinesthetic Learner",
    description: "You learn best through hands-on practice and experience.",
    tips: [
      "Build projects while learning",
      "Practice with coding exercises",
      "Take frequent breaks to move",
      "Use interactive simulations",
    ],
  },
};

interface LearningStyleQuizProps {
  onComplete: (style: string, scores: Record<string, number>) => void;
}

export default function LearningStyleQuiz({ onComplete }: LearningStyleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const type = question.options[optionIndex].type;
    setAnswers({ ...answers, [question.id]: type });

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        calculateResult();
      }
    }, 500);
  };

  const calculateResult = () => {
    const scores: Record<string, number> = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0,
    };

    Object.values(answers).forEach((type) => {
      scores[type]++;
    });

    setShowResult(true);
  };

  const getDominantStyle = () => {
    const scores: Record<string, number> = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0,
    };

    Object.values(answers).forEach((type) => {
      scores[type]++;
    });

    return Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as keyof typeof styleConfig;
  };

  if (showResult) {
    const dominantStyle = getDominantStyle();
    const config = styleConfig[dominantStyle];
    const Icon = config.icon;

    const scores: Record<string, number> = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0,
    };
    Object.values(answers).forEach((type) => {
      scores[type]++;
    });

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden">
          {/* Celebration header */}
          <div className={cn("p-6 text-center text-white", config.bg)}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center"
            >
              <Icon className="w-10 h-10" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
            >
              You're a {config.title}!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="opacity-90"
            >
              {config.description}
            </motion.p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Score breakdown */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Your Learning Profile
              </h3>
              <div className="space-y-3">
                {Object.entries(styleConfig).map(([key, style], i) => {
                  const score = scores[key];
                  const percentage = (score / questions.length) * 100;
                  const StyleIcon = style.icon;

                  return (
                    <motion.div
                      key={key}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <StyleIcon className={cn("w-4 h-4", style.color)} />
                          <span className="text-sm font-medium">{style.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                          className={cn("h-full rounded-full", style.bg)}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Personalized Tips
              </h3>
              <div className="grid gap-2">
                {config.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Check className={cn("w-5 h-5 shrink-0", config.color)} />
                    <span className="text-sm">{tip}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Continue button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => onComplete(dominantStyle, scores)}
              >
                Continue to Dashboard
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-center">
                {question.question}
              </h2>

              <div className="grid gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const config = styleConfig[option.type];
                  const Icon = config.icon;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(index)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                        isSelected
                          ? `${config.bgLight} border-current ${config.color}`
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          isSelected ? config.bg : "bg-muted"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isSelected ? "text-white" : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <span className="font-medium">{option.text}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <Check className={cn("w-5 h-5", config.color)} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentQuestion(Math.max(0, currentQuestion - 1));
            setSelectedOption(null);
          }}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
              setSelectedOption(null);
            }
          }}
          disabled={!answers[question.id]}
          className="gap-2"
        >
          Skip
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
