import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, ChevronRight, ChevronLeft, Check, GraduationCap,
  Target, Clock, Brain, Code, Palette, BarChart3, Globe,
  Briefcase, Calculator, Rocket, Trophy, Zap,
  Star, Coffee, Moon, Sun, Users, Laptop, Smartphone,
  LogIn, UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuthContext";
import LearningStyleQuiz from "@/components/onboarding/LearningStyleQuiz";

// Step configurations - 8 steps now (added sign-in step for guests)
const TOTAL_STEPS = 8;

interface OnboardingData {
  name: string;
  college: string;
  course: string;
  year: string;
  interests: string[];
  goals: string[];
  dailyTime: string;
  preferredTime: string;
  learningStyle: string;
  customInterests: string;
  customGoals: string;
}

const interestOptions = [
  { id: "programming", label: "Programming", icon: Code, color: "bg-blue-500" },
  { id: "webdev", label: "Web Development", icon: Globe, color: "bg-green-500" },
  { id: "datascience", label: "Data Science", icon: BarChart3, color: "bg-purple-500" },
  { id: "design", label: "UI/UX Design", icon: Palette, color: "bg-pink-500" },
  { id: "business", label: "Business", icon: Briefcase, color: "bg-orange-500" },
  { id: "math", label: "Mathematics", icon: Calculator, color: "bg-cyan-500" },
  { id: "ai", label: "AI & Machine Learning", icon: Brain, color: "bg-red-500" },
  { id: "mobile", label: "Mobile Development", icon: Smartphone, color: "bg-indigo-500" },
];

const goalOptions = [
  { id: "job", label: "Get a Job", icon: Briefcase },
  { id: "skills", label: "Learn New Skills", icon: Brain },
  { id: "career", label: "Career Change", icon: Rocket },
  { id: "exam", label: "Prepare for Exams", icon: GraduationCap },
  { id: "project", label: "Build Projects", icon: Laptop },
  { id: "certification", label: "Get Certified", icon: Trophy },
];

const timeOptions = [
  { id: "15", label: "15 min/day", description: "Casual", icon: Coffee },
  { id: "30", label: "30 min/day", description: "Regular", icon: Clock },
  { id: "60", label: "1 hour/day", description: "Serious", icon: Target },
  { id: "120", label: "2+ hours/day", description: "Intensive", icon: Rocket },
];

const preferredTimeOptions = [
  { id: "morning", label: "Morning", icon: Sun, time: "6 AM - 12 PM" },
  { id: "afternoon", label: "Afternoon", icon: Coffee, time: "12 PM - 6 PM" },
  { id: "evening", label: "Evening", icon: Moon, time: "6 PM - 12 AM" },
  { id: "flexible", label: "Flexible", icon: Clock, time: "Anytime" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showLearningQuiz, setShowLearningQuiz] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: user?.firstName || "",
    college: "",
    course: "",
    year: "",
    interests: [],
    goals: [],
    dailyTime: "",
    preferredTime: "",
    learningStyle: "",
    customInterests: "",
    customGoals: "",
  });

  const totalStepsForUser = user ? 7 : TOTAL_STEPS;
  const progress = ((currentStep + 1) / totalStepsForUser) * 100;

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "interests" | "goals", item: string) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.name.trim().length > 0;
      case 1: return true; // College info is optional
      case 2: return data.interests.length > 0 || data.customInterests.trim().length > 0;
      case 3: return data.goals.length > 0 || data.customGoals.trim().length > 0;
      case 4: return data.dailyTime !== "";
      case 5: return data.preferredTime !== "";
      case 6: return true; // Learning style quiz
      case 7: return true; // Sign-in step (for guests)
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Save onboarding data to localStorage for guests
    localStorage.setItem('learnflow_onboarding_data', JSON.stringify(data));
    localStorage.setItem('learnflow_onboarding_completed', 'true');
    
    // If user is logged in, also save to API
    if (user) {
      try {
        await fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...data,
            onboardingCompleted: true,
          }),
        });
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
      }
    }
    
    setLocation("/");
  };
  
  // Skip to sign-in step for guests after learning quiz
  const handleSkipToSignIn = () => {
    // Save data to localStorage first
    localStorage.setItem('learnflow_onboarding_data', JSON.stringify(data));
    setCurrentStep(7); // Go to sign-in step
  };
  
  // Continue as guest (skip sign-in)
  const handleContinueAsGuest = () => {
    localStorage.setItem('learnflow_onboarding_data', JSON.stringify(data));
    localStorage.setItem('learnflow_onboarding_completed', 'true');
    setLocation("/");
  };

  const handleLearningStyleComplete = (style: string) => {
    updateData("learningStyle", style);
    setShowLearningQuiz(false);
    
    // If user is logged in, complete onboarding. Otherwise go to sign-in step
    if (user) {
      handleComplete();
    } else {
      setCurrentStep(7); // Go to sign-in step
    }
  };

  if (showLearningQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowLearningQuiz(false)}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <LearningStyleQuiz onComplete={handleLearningStyleComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold">Welcome to LearnFlow!</h1>
          <p className="text-muted-foreground mt-1">
            Let's personalize your learning experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Step {currentStep + 1} of {totalStepsForUser}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Name */}
            {currentStep === 0 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                      className="text-4xl mb-4"
                    >
                      👋
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2">What should we call you?</h2>
                    <p className="text-muted-foreground">This is how you'll appear on LearnFlow</p>
                  </div>
                  <Input
                    placeholder="Enter your name"
                    value={data.name}
                    onChange={(e) => updateData("name", e.target.value)}
                    className="text-center text-lg h-14"
                    autoFocus
                  />
                  {data.name && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-primary font-medium"
                    >
                      Nice to meet you, {data.name}! 🎉
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 1: College/Education */}
            {currentStep === 1 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-4xl mb-4"
                    >
                      🎓
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2">Tell us about your education</h2>
                    <p className="text-muted-foreground">This helps us recommend relevant content</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">College/University (Optional)</label>
                      <Input
                        placeholder="e.g., MIT, Stanford, IIT..."
                        value={data.college}
                        onChange={(e) => updateData("college", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Course/Major (Optional)</label>
                      <Input
                        placeholder="e.g., Computer Science, Engineering..."
                        value={data.course}
                        onChange={(e) => updateData("course", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Year (Optional)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["1st", "2nd", "3rd", "4th+"].map((year) => (
                          <Button
                            key={year}
                            variant={data.year === year ? "default" : "outline"}
                            onClick={() => updateData("year", year)}
                            className="h-12"
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Not a student? No problem! You can skip this step.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Interests */}
            {currentStep === 2 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-4xl mb-4"
                    >
                      ✨
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2">What interests you?</h2>
                    <p className="text-muted-foreground">Select all that apply (at least one)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((interest, index) => {
                      const Icon = interest.icon;
                      const isSelected = data.interests.includes(interest.id);
                      return (
                        <motion.button
                          key={interest.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleArrayItem("interests", interest.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", interest.color)}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-sm">{interest.label}</span>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary ml-auto" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Something else? Tell us!</label>
                    <Textarea
                      placeholder="Type your interests here..."
                      value={data.customInterests}
                      onChange={(e) => updateData("customInterests", e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-4xl mb-4"
                    >
                      🎯
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2">What are your goals?</h2>
                    <p className="text-muted-foreground">We'll help you achieve them!</p>
                  </div>
                  <div className="grid gap-3">
                    {goalOptions.map((goal, index) => {
                      const Icon = goal.icon;
                      const isSelected = data.goals.includes(goal.id);
                      return (
                        <motion.button
                          key={goal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01, x: 5 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => toggleArrayItem("goals", goal.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            isSelected ? "bg-primary" : "bg-muted"
                          )}>
                            <Icon className={cn("w-6 h-6", isSelected ? "text-white" : "text-muted-foreground")} />
                          </div>
                          <span className="font-medium">{goal.label}</span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto"
                            >
                              <Check className="w-6 h-6 text-primary" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Other goals?</label>
                    <Textarea
                      placeholder="Tell us what you want to achieve..."
                      value={data.customGoals}
                      onChange={(e) => updateData("customGoals", e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Daily Time */}
            {currentStep === 4 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-4xl mb-4"
                    >
                      ⏰
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2">How much time can you dedicate?</h2>
                    <p className="text-muted-foreground">We'll create a plan that fits your schedule</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {timeOptions.map((option, index) => {
                      const Icon = option.icon;
                      const isSelected = data.dailyTime === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateData("dailyTime", option.id)}
                          className={cn(
                            "p-6 rounded-2xl border-2 text-center transition-all",
                            isSelected
                              ? "border-primary bg-primary/10 shadow-lg"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Icon className={cn(
                            "w-8 h-8 mx-auto mb-3",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <p className="font-bold text-lg">{option.label}</p>
                          <Badge variant={isSelected ? "default" : "secondary"} className="mt-2">
                            {option.description}
                          </Badge>
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Don't worry, you can change this anytime in settings!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Preferred Time */}
            {currentStep === 5 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl mb-4"
                    >
                      🌟
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2">When do you learn best?</h2>
                    <p className="text-muted-foreground">We'll send reminders at the right time</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {preferredTimeOptions.map((option, index) => {
                      const Icon = option.icon;
                      const isSelected = data.preferredTime === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => updateData("preferredTime", option.id)}
                          className={cn(
                            "p-5 rounded-2xl border-2 text-center transition-all",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <motion.div
                            animate={isSelected ? { rotate: [0, 360] } : {}}
                            transition={{ duration: 1 }}
                          >
                            <Icon className={cn(
                              "w-10 h-10 mx-auto mb-2",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                          </motion.div>
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{option.time}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Learning Style Quiz Intro */}
            {currentStep === 6 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Brain className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2">Discover Your Learning Style!</h2>
                    <p className="text-muted-foreground">
                      Take a quick quiz to discover your learning style
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-sm">Takes only 2 minutes</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm">Get personalized recommendations</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-sm">Earn 100 XP bonus!</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => user ? handleComplete() : handleSkipToSignIn()}
                    >
                      Skip for now
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => setShowLearningQuiz(true)}
                    >
                      <Brain className="w-4 h-4" />
                      Take Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Sign In / Sign Up (for guests only) */}
            {currentStep === 7 && !user && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Trophy className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold mb-2"
                    >
                      You're All Set, {data.name}! 🎉
                    </motion.h2>
                    <p className="text-muted-foreground">
                      Sign in to save your preferences and unlock all features
                    </p>
                  </div>

                  {/* Benefits of signing in */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 space-y-3">
                    <p className="font-medium text-sm text-center mb-3">Why create an account?</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-sm">Earn XP & track your progress</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-sm">Personalized learning paths</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Star className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm">Unlock achievements & certificates</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-sm">Join the leaderboard</p>
                    </div>
                  </div>

                  {/* Sign In / Sign Up Buttons */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full gap-2 h-12 text-base"
                      onClick={() => {
                        // Save onboarding data before redirecting
                        localStorage.setItem('learnflow_onboarding_data', JSON.stringify(data));
                        localStorage.setItem('learnflow_pending_onboarding', 'true');
                        window.location.href = '/auth';
                      }}
                    >
                      <UserPlus className="w-5 h-5" />
                      Create Free Account
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 h-12 text-base"
                      onClick={() => {
                        // Save onboarding data before redirecting
                        localStorage.setItem('learnflow_onboarding_data', JSON.stringify(data));
                        localStorage.setItem('learnflow_pending_onboarding', 'true');
                        window.location.href = '/auth';
                      }}
                    >
                      <LogIn className="w-5 h-5" />
                      Already have an account? Sign In
                    </Button>
                  </div>

                  {/* Continue as Guest */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={handleContinueAsGuest}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Continue as Guest →
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can sign in later to save your progress
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Show Continue button for steps 0-5 (not for quiz intro or sign-in) */}
          {currentStep < 6 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : null}
        </div>

        {/* XP Reward Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-full text-sm">
            <Trophy className="w-4 h-4" />
            <span>Complete onboarding to earn <strong>200 XP</strong>!</span>
          </div>
        </motion.div>

        {/* Progress Dots - show 7 steps for logged-in users, 8 for guests */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: user ? 7 : TOTAL_STEPS }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => index < currentStep && setCurrentStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentStep
                  ? "w-8 bg-primary"
                  : index < currentStep
                    ? "bg-primary/50 cursor-pointer hover:bg-primary/70"
                    : "bg-muted"
              )}
              whileHover={index < currentStep ? { scale: 1.2 } : {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
