import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useThemeContext";
import { LanguageProvider } from "@/hooks/useLanguageContext";
import TargetCursor from "@/components/ui/TargetCursor";
import NotFound from "@/pages/not-found";
import OAuthCallback from "@/components/OAuthCallback";

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

import Onboarding from "./pages/onboarding";
import LearningPaths from "./pages/learning-paths";
import Achievements from "./pages/achievements";
import Flashcards from "./pages/flashcards";
import Certificates from "./pages/certificates";
import AITools from "./pages/ai-tools";
import Sidebar from "@/components/layout/sidebar";
import GameHUD from "@/components/layout/GameHUD";
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

  // Don't show loading for OAuth callback
  const isOAuthCallback = location === '/oauth/callback';
  
  if (!isOAuthCallback && (loading || (user && prefsLoading))) {
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
  if (!isOAuthCallback && !user && !guestOnboardingCompleted && !isOnboardingPage && !isAuthPage) {
    return <Redirect to="/onboarding" />;
  }
  
  // Redirect logged-in users who haven't completed onboarding
  const needsOnboarding = user && userPrefs && !userPrefs.onboardingCompleted && !guestOnboardingCompleted;
  if (!isOAuthCallback && needsOnboarding && !isOnboardingPage && !isAuthPage && !isLandingPage) {
    return <Redirect to="/onboarding" />;
  }

  // Check specific pages
  const isSharePage = location.startsWith('/share');
  const isHomePage = location === '/';

  return (
    <div className="min-h-screen flex">
      {!isAuthPage && !isSharePage && !isOAuthCallback && <Sidebar />}
      {!isAuthPage && !isSharePage && !isOnboardingPage && !isOAuthCallback && user && <GameHUD />}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${!isAuthPage && !isSharePage && !isOAuthCallback ? (isCollapsed ? 'md:ml-[72px]' : 'md:ml-[256px]') : ''}`}>
        <main className="flex-1">
          <Switch>
            <Route path="/" component={user ? Home : Landing} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/oauth/callback" component={OAuthCallback} />
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
        {!isAuthPage && !isSharePage && !isOAuthCallback && <FloatingFAQ />}
      </div>
    </div>
  );
}

function App() {
  return (
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
  );
}

export default App;
