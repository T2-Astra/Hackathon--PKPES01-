import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useAuthActions } from '@/services/authService';

export default function AuthPage() {
  const { login } = useAuth();
  const { signInWithGoogle } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: ""
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      
      if (response.ok) {
        await login(data.user, data.token);
        
        // Check if there's pending onboarding data to save
        const pendingOnboarding = localStorage.getItem('learnflow_pending_onboarding');
        const onboardingData = localStorage.getItem('learnflow_onboarding_data');
        
        if (pendingOnboarding === 'true' && onboardingData) {
          try {
            const parsedData = JSON.parse(onboardingData);
            await fetch('/api/user/preferences', {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`,
              },
              credentials: 'include',
              body: JSON.stringify({
                ...parsedData,
                onboardingCompleted: true,
              }),
            });
            console.log('✅ Onboarding preferences saved to MongoDB');
          } catch (err) {
            console.error('Failed to save onboarding data:', err);
          }
          localStorage.removeItem('learnflow_pending_onboarding');
          localStorage.setItem('learnflow_onboarding_completed', 'true');
        }
        
        console.log('✅ Email login successful, redirecting to home...');
        window.location.replace('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Auto-login after successful registration
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password
          }),
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.user && loginData.token) {
          await login(loginData.user, loginData.token);
          
          // Check if there's pending onboarding data to save
          const pendingOnboarding = localStorage.getItem('learnflow_pending_onboarding');
          const onboardingData = localStorage.getItem('learnflow_onboarding_data');
          
          if (pendingOnboarding === 'true' && onboardingData) {
            try {
              const parsedData = JSON.parse(onboardingData);
              await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${loginData.token}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                  ...parsedData,
                  onboardingCompleted: true,
                }),
              });
              console.log('✅ Onboarding preferences saved to MongoDB');
            } catch (err) {
              console.error('Failed to save onboarding data:', err);
            }
            localStorage.removeItem('learnflow_pending_onboarding');
            localStorage.setItem('learnflow_onboarding_completed', 'true');
          }
          
          console.log('✅ Registration + auto-login successful, redirecting to home...');
          window.location.replace('/');
        } else {
          setError('Registration successful! Please login manually.');
          setTimeout(() => window.location.href = '/auth', 2000);
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  // Google button component
  const GoogleButton = ({ text }: { text: string }) => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 md:h-10 flex items-center justify-center gap-2 border border-border hover:bg-accent"
      onClick={handleGoogleSignIn}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {text}
    </Button>
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* Auth Form - Full width on mobile, left panel on desktop */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md my-4 md:my-0">
          <div className="text-center mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
              <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-sans font-bold text-foreground">Welcome to LearnFlow</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">AI-Powered Personalized Learning Platform</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="h-11 md:h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-2 md:mt-2">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-2xl">Login to your account</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <form onSubmit={handleLogin} className="space-y-2 md:space-y-4">
                    {error && (
                      <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded">
                        {error}
                      </div>
                    )}
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        type="email"
                        id="login-email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="h-12 md:h-10"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        type="password"
                        id="login-password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="h-12 md:h-10"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-12 md:h-10">
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <GoogleButton text="Continue with Google" />
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="mt-2 md:mt-2">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-2xl">Create your account</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <form onSubmit={handleRegister} className="space-y-2 md:space-y-4">
                    {error && (
                      <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
                        {error}
                      </div>
                    )}
                    <div>
                      <Label htmlFor="register-firstName">First Name</Label>
                      <Input
                        type="text"
                        id="register-firstName"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        className="h-12 md:h-10"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-lastName">Last Name</Label>
                      <Input
                        type="text"
                        id="register-lastName"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        className="h-12 md:h-10"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        type="email"
                        id="register-email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="h-12 md:h-10"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        type="password"
                        id="register-password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="h-12 md:h-10"
                        placeholder="Create a password"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                      <Input
                        type="password"
                        id="register-confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="h-12 md:h-10"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-12 md:h-10">
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <GoogleButton text="Sign Up with Google" />
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Panel - Branding - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary to-primary/90 dark:from-secondary dark:via-secondary dark:to-secondary/90 p-6 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary-foreground dark:bg-secondary-foreground rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-primary-foreground dark:bg-secondary-foreground rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary-foreground dark:bg-secondary-foreground rounded-full blur-lg"></div>
        </div>
        
        <div className="text-center text-primary-foreground dark:text-secondary-foreground relative z-10">
          <h2 className="text-3xl xl:text-4xl font-bold mb-4">Start Your Learning Journey</h2>
          <p className="text-lg opacity-90 max-w-md">
            Access thousands of study materials, question papers, and AI-powered learning tools.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">10K+</div>
              <div className="opacity-80">Study Materials</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">5K+</div>
              <div className="opacity-80">Question Papers</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">AI</div>
              <div className="opacity-80">Powered Tools</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">24/7</div>
              <div className="opacity-80">Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
