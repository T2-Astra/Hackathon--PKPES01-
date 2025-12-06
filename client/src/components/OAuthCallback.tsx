import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { authService } from '@/services/authService';

const STORAGE_KEY = 'learnflow_auth_user';

export const OAuthCallback: React.FC = () => {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (!accessToken) {
          setStatus('error');
          setErrorMessage('No access token received');
          setTimeout(() => setLocation('/auth'), 2000);
          return;
        }

        // Fetch user info from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info from Google');
        }

        const userInfo = await response.json();

        // Send to our backend to create/login user
        const backendResponse = await fetch('/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: userInfo.email,
            firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || '',
            lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
            googleId: userInfo.sub,
            image: userInfo.picture
          })
        });

        if (!backendResponse.ok) {
          throw new Error('Backend authentication failed');
        }

        const data = await backendResponse.json();

        const user = {
          id: data.user.id,
          name: `${data.user.firstName} ${data.user.lastName}`,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          image: userInfo.picture,
          provider: 'google',
          isAdmin: data.user.isAdmin
        };

        // Store user and token
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem('authToken', data.token);
        
        // Update auth service
        authService.setUser(user, data.token);

        // Handle pending onboarding data
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

        setStatus('success');
        
        let redirectPath = sessionStorage.getItem('oauth_redirect_path') || '/';
        sessionStorage.removeItem('oauth_redirect_path');
        
        // Don't redirect back to auth page after login
        if (redirectPath === '/auth' || redirectPath === '/oauth/callback') {
          redirectPath = '/';
        }
        
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => setLocation('/auth'), 3000);
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-foreground">Signing in...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg text-foreground">Success! Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg text-foreground">Authentication failed</p>
            {errorMessage && <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
