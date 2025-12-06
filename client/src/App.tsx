import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useThemeContext";
import { LanguageProvider } from "@/hooks/useLanguageContext";
import { ClerkProvider } from '@clerk/clerk-react';
import TargetCursor from "@/components/ui/TargetCursor";
import NotFound from "@/pages/not-found";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZGlzdGluY3QtamFja2FsLTYzLmNsZXJrLmFjY291bnRzLmRldiQ';

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
import Home from "./pages/home";
import Department from "./pages/department";
import ChatBot from "./pages/chatbot";
import About from "./pages/about";
import MockTest from "./pages/mock-test";
import AdminUpload from "./pages/admin-upload";
import AdminDashboard from "./pages/admin-dashboard";
import AdminUploads from "./pages/admin-uploads";
import TestAdminPage from "./pages/test-admin";
import UserHistory from "./pages/user-history";
import UserProfile from "./pages/user-profile";
import Videos from "./pages/videos";
import Landing from "./pages/landing";
import AuthPage from "./pages/auth-page";
import Help from "./pages/help";
import ThemeTest from "./pages/theme-test";
import SharePage from "./pages/share";
import Dashboard from "./pages/dashboard";
import Onboarding from "./pages/onboarding";
import LearningPaths from "./pages/learning-paths";
import Achievements from "./pages/achievements";
import Flashcards from "./pages/flashcards";
import Certificates from "./pages/certificates";
import AITools from "./pages/ai-tools";
import Sidebar from "@/components/layout/sidebar";
import Footer from "./components/layout/footer";
import FloatingFAQ from "@/components/ui/FloatingFAQ";
import { useAuth } from "@/hooks/useAuthContext";
import { useSidebar, SidebarProvider } from "@/hooks/useSidebar";

function SimpleTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">App is Working!</h1>
        <p className="text-gray-600">React app loaded successfully</p>
      </div>
    </div>
  );
}

function Router() {
  const { user, loading } = useAuth();
  const { isCollapsed } = useSidebar();
  const [location] = useLocation();

  // Fetch user preferences to check onboarding status
  const { data: userPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const res = await fetch('/api/user/preferences', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user, // Only fetch when user is logged in
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Temporarily show simple test to verify React is working
  if (window.location.search.includes('test')) {
    return <SimpleTest />;
  }

  if (loading || (user && prefsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check onboarding status
  const isOnboardingPage = location === '/onboarding';
  const isAuthPage = location === '/auth';
  const isLandingPage = location === '/';
  
  // Check if guest has completed onboarding (stored in localStorage)
  const guestOnboardingCompleted = localStorage.getItem('learnflow_onboarding_completed') === 'true';
  
  // Redirect NEW visitors (not logged in, haven't done onboarding) to onboarding
  if (!user && !guestOnboardingCompleted && !isOnboardingPage && !isAuthPage) {
    return <Redirect to="/onboarding" />;
  }
  
  // Redirect logged-in users who haven't completed onboarding
  const needsOnboarding = user && userPrefs && !userPrefs.onboardingCompleted && !guestOnboardingCompleted;
  if (needsOnboarding && !isOnboardingPage && !isAuthPage && !isLandingPage) {
    return <Redirect to="/onboarding" />;
  }

  // Check specific pages
  const isSharePage = location.startsWith('/share');
  const isHomePage = location === '/';

  return (
    <div className="min-h-screen flex">
      {!isAuthPage && !isSharePage && <Sidebar />}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${!isAuthPage && !isSharePage ? (isCollapsed ? 'md:ml-[72px]' : 'md:ml-[256px]') : ''}`}>
        <main className="flex-1">
          <Switch>
            <Route path="/" component={user ? Home : Landing} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/chatbot" component={ChatBot} />
            <Route path="/about" component={About} />
            <Route path="/mock-test" component={MockTest} />
            <Route path="/department/:id" component={Department} />
            <Route path="/profile" component={UserProfile} />
            <Route path="/history" component={UserHistory} />
            <Route path="/videos" component={Videos} />
            <Route path="/upload" component={AdminUpload} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/uploads" component={AdminUploads} />
            <Route path="/help" component={Help} />
            <Route path="/test-admin" component={TestAdminPage} />
            <Route path="/theme-test" component={ThemeTest} />
            <Route path="/share/:id" component={SharePage} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/learning-paths" component={LearningPaths} />
            <Route path="/achievements" component={Achievements} />
            <Route path="/flashcards" component={Flashcards} />
            <Route path="/certificates" component={Certificates} />
            <Route path="/ai-tools" component={AITools} />
            <Route>
              {/* Fallback route - show Landing if not authenticated, otherwise NotFound */}
              {user ? <NotFound /> : <Landing />}
            </Route>
          </Switch>
        </main>
        {isHomePage && <Footer />}
        {!isAuthPage && !isSharePage && <FloatingFAQ />}
      </div>
    </div>
  );
}

function App() {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          footer: "display: none",
          footerAction: "display: none",
          footerActionText: "display: none",
          footerActionLink: "display: none",
          modalContent: "padding-bottom: 1rem",
          card: "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); margin: auto; position: relative; top: 50%; transform: translateY(-50%);",
          modalBackdrop: "display: flex; align-items: center; justify-content: center;",
          modal: "display: flex; align-items: center; justify-content: center; min-height: 100vh;",
        },
        layout: {
          showOptionalFields: false,
          socialButtonsPlacement: "bottom",
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <SidebarProvider>
                <TargetCursor 
                  spinDuration={2}
                  hideDefaultCursor={true}
                />
                <Toaster />
                <Router />
              </SidebarProvider>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
