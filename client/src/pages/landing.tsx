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
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="cursor-target relative group"
              title="Quick Actions"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-yellow-400 to-primary rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-primary border border-primary rounded-full p-2 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform duration-300">
                {/* Beautiful Logo: Learning Lighthouse */}
                <svg 
                  className="w-4 h-4 text-primary-foreground" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {/* Lighthouse Tower */}
                  <path d="M10 22 L14 22 L13 4 L11 4 Z" fill="currentColor" opacity="0.8" />
                  
                  {/* Lighthouse Top */}
                  <path d="M9 4 L15 4 L14 2 L10 2 Z" fill="currentColor" />
                  
                  {/* Light Beam - Main */}
                  <path d="M12 2 L4 8 L12 6 L20 8 Z" fill="currentColor" opacity="0.3" />
                  
                  {/* Light Rays */}
                  <path d="M12 2 L8 6" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                  <path d="M12 2 L16 6" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                  <path d="M12 2 L6 9" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  <path d="M12 2 L18 9" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  
                  {/* Knowledge Waves */}
                  <path d="M2 12 Q12 8 22 12" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" />
                  <path d="M3 15 Q12 11 21 15" stroke="currentColor" strokeWidth="1" opacity="0.4" fill="none" />
                  <path d="M4 18 Q12 14 20 18" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
                  
                  {/* Stars of Excellence */}
                  <circle cx="6" cy="4" r="0.8" fill="currentColor" opacity="0.7" />
                  <circle cx="18" cy="4" r="0.8" fill="currentColor" opacity="0.7" />
                  <circle cx="4" cy="10" r="0.6" fill="currentColor" opacity="0.6" />
                  <circle cx="20" cy="10" r="0.6" fill="currentColor" opacity="0.6" />
                  
                  {/* Foundation */}
                  <rect x="9" y="20" width="6" height="2" fill="currentColor" opacity="0.9" />
                  
                  {/* Graduation Cap on Top */}
                  <path d="M8 2 L16 2 L15 1 L9 1 Z" fill="currentColor" opacity="0.9" />
                  <circle cx="16" cy="1.5" r="0.5" fill="currentColor" />
                </svg>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setIsSettingsOpen(true)}
              className="cursor-pointer"
            >
              <Palette className="w-4 h-4 mr-2" />
              <span>Change Theme</span>
            </DropdownMenuItem>
            <RateWebsiteSheet>
              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer">
                <Star className="w-4 h-4 mr-2" />
                <span>Rate Website</span>
              </div>
            </RateWebsiteSheet>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>


      {/* Hero Section */}
      <section id="home" className="py-12 lg:py-20 pt-16 md:pt-12 lg:md:pt-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span data-slot="badge" className="inline-flex items-center justify-center font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none overflow-hidden gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-full shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground mb-6">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </div>
              <span className="font-medium">50+ New Resources</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-3 w-3 text-primary-foreground" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span className="hidden sm:inline-flex items-center">Explore Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-3 w-3 text-primary-foreground" aria-hidden="true">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </span>
            <TypingAnimation 
              text={t.home.welcome}
              typingSpeed={150}
              deletingSpeed={100}
              pauseDuration={2000}
            />
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