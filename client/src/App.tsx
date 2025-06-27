import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Applications from "@/pages/applications";
import Jobs from "@/pages/jobs";
import Subscription from "@/pages/subscription";
import Onboarding from "@/pages/onboarding";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      {isAuthenticated ? (
        <>
          {/* Redirect to onboarding if not completed */}
          {!user?.onboardingCompleted ? (
            <>
              <Route path="/onboarding" component={Onboarding} />
              <Route path="/" component={Onboarding} />
            </>
          ) : (
            <>
              <Route path="/" component={Dashboard} />
              <Route path="/onboarding" component={Onboarding} />
              <Route path="/profile" component={Profile} />
              <Route path="/applications" component={Applications} />
              <Route path="/jobs" component={Jobs} />
              <Route path="/subscription" component={Subscription} />
            </>
          )}
        </>
      ) : (
        <Route path="/" component={AuthPage} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
