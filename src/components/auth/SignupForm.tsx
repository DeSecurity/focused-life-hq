/**
 * Signup form component with email/password and Google OAuth
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signUp, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 handleSubmit called!', { 
      type: e.type, 
      email, 
      hasPassword: !!password,
      isLoading,
      loading 
    });
    
    e.preventDefault();
    e.stopPropagation(); // Prevent any bubbling
    
    if (isLoading || loading) {
      console.log('⚠️ Already processing, ignoring submit');
      return;
    }

    setIsLoading(true);
    console.log('📝 Starting signup process...', { email, hasPassword: !!password });

    try {
      const { error } = await signUp(email, password, username);

      if (error) {
        console.error('❌ Signup error:', error);
        toast({
          title: 'Sign up failed',
          description: error.message || 'Failed to create account',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if we have a session (user is logged in immediately)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Error getting session:', sessionError);
      }
      
      console.log('📊 Session check after signup:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        email: session?.user?.email 
      });
      
      if (session) {
        console.log('✅ User signed up and logged in successfully');
        toast({
          title: 'Account created!',
          description: 'Welcome! You have been signed in.',
        });
        // The auth state change listener will handle navigation automatically
        // Give it a moment to update
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } else {
        console.log('⚠️ User created but no session - email confirmation may be required');
        toast({
          title: 'Account created! ✅',
          description: 'Please check your email (including spam folder) and click the confirmation link before signing in.',
          duration: 10000, // Show for 10 seconds
        });
        // Clear the form
        setEmail('');
        setPassword('');
        setUsername('');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('💥 Unexpected signup error:', err);
      toast({
        title: 'Sign up failed',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: 'Google sign-in failed',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
    // If successful, user will be redirected to OAuth callback
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">Get started with your free account</p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        noValidate
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleSubmit(e as any);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="username">Username (optional)</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              disabled={isLoading || loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading || loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
              disabled={isLoading || loading}
            />
          </div>
          <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
        </div>

        <Button
          type="button"
          className="w-full"
          disabled={isLoading || loading}
          onClick={(e) => {
            console.log('🔘 Button clicked!', { isLoading, loading, email, hasPassword: !!password });
            e.preventDefault();
            e.stopPropagation();
            
            // Manually trigger form submission
            if (!isLoading && !loading && email && password) {
              const formEvent = new Event('submit', { bubbles: true, cancelable: true });
              const form = e.currentTarget.closest('form');
              if (form) {
                handleSubmit(formEvent as any);
              } else {
                console.error('❌ Could not find form element');
                // Fallback: call handleSubmit directly
                handleSubmit(e as any);
              }
            } else {
              console.warn('⚠️ Cannot submit:', { isLoading, loading, hasEmail: !!email, hasPassword: !!password });
            }
          }}
        >
          {isLoading || loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading || loading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline font-medium"
          disabled={isLoading || loading}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

