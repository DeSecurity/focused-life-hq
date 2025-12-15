import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ViewRouter } from "@/components/views/ViewRouter";
import { AuthView } from "@/components/auth/AuthView";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// Import test function (only in development)
if (import.meta.env.DEV) {
  import('@/test-supabase').then(module => {
    // Make test function available in console
    (window as any).testSupabase = module.testSupabaseConnection;
    console.log('💡 Tip: Run testSupabase() in the console to test your Supabase connection');
  });
}

const queryClient = new QueryClient();

function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        window.location.href = '/';
        return;
      }

      if (accessToken) {
        // Supabase handles the token exchange automatically
        // Just wait a moment for the session to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <AppProvider>
      <AppWithData />
    </AppProvider>
  );
}

function AppWithData() {
  const { dataLoading, currentProfile, data } = useApp();

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="text-destructive text-lg font-semibold">Configuration Required</div>
          <p className="text-muted-foreground">
            Supabase is not configured. Please set up your environment variables.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left text-sm font-mono space-y-2">
            <p className="font-semibold">Create a <code>.env</code> file with:</p>
            <p><code>VITE_SUPABASE_URL=your_supabase_url</code></p>
            <p><code>VITE_SUPABASE_ANON_KEY=your_supabase_key</code></p>
          </div>
          <p className="text-sm text-muted-foreground">
            See <code>SUPABASE_SETUP.md</code> for detailed instructions.
          </p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Initializing your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <MainLayout>
        <ViewRouter />
      </MainLayout>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
