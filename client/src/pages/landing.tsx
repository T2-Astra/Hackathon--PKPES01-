import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, FileText, BookOpen, GraduationCap, TrendingUp, Star, ClipboardList, Palette, Sparkles } from "lucide-react";
import { useLanguageContext } from "@/hooks/useLanguageContext";
import { TypingAnimation } from "@/components/ui/typing-animation";
import SmoothDrawer from "@/components/ui/smooth-drawer";
import CardFlip from "@/components/ui/card-flip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DepartmentCard from "../components/department-card";
import LandingResourceCard from "../components/landing-resource-card";
import RateWebsiteSheet from "@/components/ui/rate-website-sheet";
import { Department, QuestionPaper } from "@shared/schema";
import SettingsDialog from "@/pages/settings";

export default function Landing() {
  const { t } = useLanguageContext();
  const [, setLocation] = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: recentPapers } = useQuery<QuestionPaper[]>({
    queryKey: ["/api/question-papers/recent"],
  });

  // Fetch real-time statistics
  const { data: stats } = useQuery<{
    departments: number;
    questionPapers: number;
    studyNotes: number;
    activeStudents: number;
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const redirectToLogin = () => {
    setLocation('/auth');
  };

  const scrollToDepartments = () => {
    document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen">
      {/* Quick Actions Dropdown - Fixed Top Right */}
      {/* Hero Section */}
      <section id="home" className="py-12 lg:py-20 pt-16 md:pt-12 lg:md:pt-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <button className="shiny-cta focus:outline-none">
                <span>✨ Introducing Learnflow</span>
              </button>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
              Welcome to <span className="text-primary">LearnFlow</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t.home.subtitle}
            </p>
            {/* Mobile Layout */}
            <div className="flex flex-col gap-3 justify-center mb-16 sm:hidden">
              {/* First row: 2 buttons on mobile */}
              <div className="flex flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={scrollToDepartments}
                  className="border-border hover:bg-accent text-foreground px-4 py-2 text-sm font-medium flex-1"
                  data-testid="button-explore-departments"
                >
                  {t.home.departments}
                </Button>
                <Button
                  variant="outline"
                  onClick={redirectToLogin}
                  className="border-border hover:bg-accent text-foreground px-4 py-2 text-sm font-medium flex-1"
                  data-testid="button-quick-search"
                >
                  Sign In to Search
                </Button>
              </div>
              {/* Second row: Platform Features button on mobile */}
              <SmoothDrawer
                triggerText="Platform Features"
                triggerVariant="outline"
                triggerClassName="bg-primary hover:bg-primary/90 text-primary-foreground border-primary px-4 py-2 text-sm font-medium w-full"
                feature1="Question Papers & Notes"
                feature2="AI Study Assistant"
                feature3="Video Lectures"
                feature4="Upload Notes"
                onPrimaryAction={redirectToLogin}
                primaryButtonText="Sign In to Start"
                tertiaryButtonText="Know More"
                onTertiaryAction={redirectToLogin}
                secondaryButtonText="Close"
              />
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex flex-row gap-4 justify-center mb-16">
              {/* Platform Features button - GREEN and in the middle */}
              <SmoothDrawer
                triggerText="Platform Features"
                triggerVariant="outline"
                triggerClassName="bg-primary hover:bg-primary/90 text-primary-foreground border-primary px-8 py-3 text-base font-medium"
                feature1="Question Papers & Notes"
                feature2="AI Study Assistant"
                feature3="Video Lectures"
                feature4="Upload Notes"
                onPrimaryAction={redirectToLogin}
                primaryButtonText="Sign In to Start"
                tertiaryButtonText="Know More"
                onTertiaryAction={redirectToLogin}
                secondaryButtonText="Close"
              />
              
              {/* Sign In to Search button */}
              <Button
                variant="outline"
                onClick={redirectToLogin}
                className="border-border hover:bg-accent text-foreground px-8 py-3 text-base font-medium"
                data-testid="button-quick-search"
              >
                Sign In to Search
              </Button>
            </div>

            {/* Stats Cards - Flip Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-7xl mx-auto">
              {/* Departments Card */}
              <CardFlip
                title={`${stats?.departments || departments?.length || 7}`}
                subtitle="Active"
                description="Departments"
                features={departments?.map(dept => dept.name).filter(name => name !== "Electronics Engineering") || [
                  "Computer Engineering",
                  "Mechanical Engineering",
                  "Civil Engineering",
                  "Electrical Engineering",
                  "Information Technology",
                  "Artificial Intelligence"
                ]}
                icon={<Building2 className="h-6 w-6 text-primary" />}
              />

              {/* Question Papers Card */}
              <CardFlip
                title={stats?.questionPapers ? `${stats.questionPapers}+` : "Loading..."}
                subtitle="Growing"
                description="Question Papers"
                features={[
                  "All Departments",
                  "Multiple Years",
                  "Semester-wise",
                  "High Quality PDFs"
                ]}
                icon={<FileText className="h-6 w-6 text-primary" />}
              />

              {/* Study Notes Card */}
              <CardFlip
                title={stats?.studyNotes ? `${stats.studyNotes}+` : "Loading..."}
                subtitle="Updated"
                description="Study Notes"
                features={[
                  "Topic-wise Notes",
                  "Easy to Understand",
                  "Exam Focused",
                  "Regular Updates"
                ]}
                icon={<BookOpen className="h-6 w-6 text-primary" />}
              />

              {/* Mock Test Card */}
              <CardFlip
                title="AI Powered"
                subtitle="Available"
                description="Mock Tests"
                frontSubtitle="Generate practice tests instantly"
                features={[
                  "AI Generated Questions",
                  "Multiple Difficulty Levels",
                  "Instant Results",
                  "Voice & MCQ Modes"
                ]}
                icon={<ClipboardList className="h-6 w-6 text-primary" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-sans text-3xl lg:text-4xl font-bold mb-4">Learning Categories</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your area of interest to access personalized resources, courses, and study materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {departments?.map((dept) => (
              <div
                key={dept.id}
                onClick={redirectToLogin}
                className="cursor-pointer"
              >
                <DepartmentCard department={dept} />
              </div>
            )) || (
                // Show skeleton cards while loading
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-32 sm:h-48 animate-pulse bg-muted" />
                ))
              )}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-sans text-3xl lg:text-4xl font-bold mb-4">Recent Question Papers</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Latest question papers uploaded to our repository.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {recentPapers?.slice(0, 6).map((paper) => (
              <LandingResourceCard 
                key={paper.id}
                resource={paper} 
                type="question-paper" 
                onLoginRedirect={redirectToLogin}
              />
            )) || (
                // Show skeleton cards while loading
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse bg-muted" />
                ))
              )}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={redirectToLogin}
              variant="outline"
              className="border-border hover:bg-accent text-foreground px-8 py-3 font-medium"
              data-testid="button-view-all-resources"
            >
              Sign In to View All Resources
            </Button>
          </div>
        </div>
      </section>

      {/* Settings Dialog */}
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}