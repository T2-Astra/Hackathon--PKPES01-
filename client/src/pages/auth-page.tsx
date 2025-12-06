import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useLocation } from 'wouter';
import { SignInButton, SignUpButton, useUser, useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';

export default function AuthPage() {
  const { login, checkAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  // Handle Clerk authentication
  useEffect(() => {
    if (isLoaded && clerkUser) {
      // Always process Clerk authentication when user is present
      const handleClerkAuth = async () => {
        try {
          const userData = {
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            clerkId: clerkUser.id,
          };

          // Try to create/login user in our backend
          const response = await fetch('/api/auth/clerk-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData),
          });

          if (response.ok) {
            const data = await response.json();
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
              // Clear pending flags
              localStorage.removeItem('learnflow_pending_onboarding');
              localStorage.setItem('learnflow_onboarding_completed', 'true');
            }
            
            // Clear any flags
            sessionStorage.removeItem('clerk_login_initiated'); 
            console.log('✅ Clerk login successful, redirecting to home...');
            // Use replace for immediate redirect
            window.location.replace('/');
          }
        } catch (error) {
          console.error('Clerk auth error:', error);
        }
      };

      handleClerkAuth();
    }
  }, [isLoaded, clerkUser, login]);
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
        credentials: 'include', // Include cookies
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
          // Clear pending flags
          localStorage.removeItem('learnflow_pending_onboarding');
          localStorage.setItem('learnflow_onboarding_completed', 'true');
        }
        
        console.log('✅ Email login successful, redirecting to home...');
        // Force a complete page refresh to ensure auth state is loaded
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
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Registration successful, now login with the same credentials
        // Auto-login after successful registration using login API
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
            // Clear pending flags
            localStorage.removeItem('learnflow_pending_onboarding');
            localStorage.setItem('learnflow_onboarding_completed', 'true');
          }
          
          console.log('✅ Registration + auto-login successful, redirecting to home...');
          // Force a complete page refresh to ensure auth state is loaded
          window.location.replace('/');
        } else {
          setError('Registration successful! Please login manually.');
          // Still redirect to login tab
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
              <TabsTrigger 
                value="login" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 md:py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                data-testid="tab-login"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 md:py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                data-testid="tab-register"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-2 md:mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <CardHeader className="flex flex-col space-y-1.5 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-2xl font-semibold leading-none tracking-tight">Login to your account</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <form onSubmit={handleLogin} className="space-y-2 md:space-y-4">
                    {error && (
                      <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded">
                        {error}
                      </div>
                    )}
                    <div>
                      <Label 
                        htmlFor="login-email" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Email
                      </Label>
                      <Input
                        type="email"
                        id="login-email"
                        name="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        data-testid="input-login-email"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <Label 
                        htmlFor="login-password" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Password
                      </Label>
                      <Input
                        type="password"
                        id="login-password"
                        name="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        data-testid="input-login-password"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-10 px-4 py-2 w-full"
                      data-testid="button-login"
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>

                    {/* Google Sign In Button */}
                    {isLoaded && (
                      <>
                        {/* Divider */}
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                          </div>
                        </div>

                        {/* Google Sign In Button */}
                        <SignInButton mode="modal">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 md:h-10 flex items-center justify-center gap-2 border border-border hover:bg-accent"
                            data-testid="button-google-login"
                            onClick={() => {
                              // Set flag to indicate intentional login
                              sessionStorage.setItem('clerk_login_initiated', 'true');
                            }}
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                          </Button>
                        </SignInButton>
                      </>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="mt-2 md:mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <CardHeader className="flex flex-col space-y-1.5 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-2xl font-semibold leading-none tracking-tight">Create your account</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <form onSubmit={handleRegister} className="space-y-2 md:space-y-4">
                    {error && (
                      <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
                        {error}
                      </div>
                    )}
                    <div>
                      <Label 
                        htmlFor="register-firstName" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        First Name
                      </Label>
                      <Input
                        type="text"
                        id="register-firstName"
                        name="firstName"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        data-testid="input-register-firstName"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label 
                        htmlFor="register-lastName" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Last Name
                      </Label>
                      <Input
                        type="text"
                        id="register-lastName"
                        name="lastName"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        data-testid="input-register-lastName"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                    <div>
                      <Label 
                        htmlFor="register-email" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Email
                      </Label>
                      <Input
                        type="email"
                        id="register-email"
                        name="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        data-testid="input-register-email"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <Label 
                        htmlFor="register-password" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Password
                      </Label>
                      <Input
                        type="password"
                        id="register-password"
                        name="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        data-testid="input-register-password"
                        placeholder="Create a password"
                        required
                      />
                    </div>
                    <div>
                      <Label 
                        htmlFor="register-confirmPassword" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        type="password"
                        id="register-confirmPassword"
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        data-testid="input-register-confirmPassword"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-10 px-4 py-2 w-full"
                      data-testid="button-register"
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    {/* Google Sign Up Button */}
                    {isLoaded && (
                      <>
                        {/* Divider */}
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                          </div>
                        </div>

                        {/* Google Sign Up Button */}
                        <SignUpButton mode="modal">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 md:h-10 flex items-center justify-center gap-2 border border-border hover:bg-accent"
                            data-testid="button-google-register"
                            onClick={() => {
                              // Set flag to indicate intentional registration
                              sessionStorage.setItem('clerk_login_initiated', 'true');
                            }}
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Sign Up with Google
                          </Button>
                        </SignUpButton>
                      </>
                    )}
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
          <h2 className="text-3xl xl:text-4xl font-sans font-bold mb-4 xl:mb-6 drop-shadow-sm">Maharashtra Polytechnic Learning Hub</h2>
          <p className="text-base xl:text-lg opacity-90 mb-6 xl:mb-8 max-w-md mx-auto leading-relaxed">
            Access comprehensive study materials, previous year papers, and notes for all engineering departments.
          </p>
          
          <div className="grid grid-cols-2 gap-4 xl:gap-6 text-sm">
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 xl:p-5 border border-white/30 dark:border-white/10 hover:bg-white/25 dark:hover:bg-black/25 hover:border-white/40 dark:hover:border-white/15 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">📚 Comprehensive Notes</h3>
              <p className="text-gray-700 dark:text-white/85">Subject-wise organized study materials</p>
            </div>
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 xl:p-5 border border-white/30 dark:border-white/10 hover:bg-white/25 dark:hover:bg-black/25 hover:border-white/40 dark:hover:border-white/15 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">📝 Previous Papers</h3>
              <p className="text-gray-700 dark:text-white/85">Years of exam papers for practice</p>
            </div>
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 xl:p-5 border border-white/30 dark:border-white/10 hover:bg-white/25 dark:hover:bg-black/25 hover:border-white/40 dark:hover:border-white/15 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">🤝 Community Driven</h3>
              <p className="text-gray-700 dark:text-white/85">Students helping students succeed</p>
            </div>
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 xl:p-5 border border-white/30 dark:border-white/10 hover:bg-white/25 dark:hover:bg-black/25 hover:border-white/40 dark:hover:border-white/15 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">✅ Quality Assured</h3>
              <p className="text-gray-700 dark:text-white/85">Admin-approved content only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
