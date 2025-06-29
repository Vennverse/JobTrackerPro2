import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Github, Mail, Linkedin, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [availableProviders, setAvailableProviders] = useState({
    google: false,
    github: false,
    linkedin: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check which OAuth providers are configured
    const checkProviders = async () => {
      try {
        const response = await fetch('/api/auth/providers');
        const data = await response.json();
        // Handle the nested response format from the backend
        setAvailableProviders(data.providers || data);
      } catch (error) {
        console.error('Failed to check provider availability:', error);
      }
    };
    
    checkProviders();
  }, []);

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      
      const data = await response.json();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        console.error('Auth failed:', data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Demo login failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full gap-8">
        {/* Left side - Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome to AutoJobr</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred way to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo Login Button */}
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Continue with Demo Account
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Try AutoJobr instantly with a demo account
              </div>
            </div>

            <Separator />

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading || !availableProviders.google}
              >
                <FcGoogle className="w-4 h-4 mr-2" />
                Continue with Google
                {!availableProviders.google && (
                  <span className="ml-auto text-xs text-muted-foreground">Setup Required</span>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading || !availableProviders.github}
              >
                <Github className="w-4 h-4 mr-2" />
                Continue with GitHub
                {!availableProviders.github && (
                  <span className="ml-auto text-xs text-muted-foreground">Setup Required</span>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('linkedin')}
                disabled={isLoading || !availableProviders.linkedin}
              >
                <Linkedin className="w-4 h-4 mr-2" />
                Continue with LinkedIn
                {!availableProviders.linkedin && (
                  <span className="ml-auto text-xs text-muted-foreground">Setup Required</span>
                )}
              </Button>
            </div>

            {/* Email Login Section (if enabled) */}
            {import.meta.env.VITE_ENABLE_EMAIL_LOGIN === 'true' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      disabled={isLoading}
                    />
                  </div>
                  <Button className="w-full" disabled={isLoading}>
                    <Mail className="w-4 h-4 mr-2" />
                    Sign in with Email
                  </Button>
                </div>
              </>
            )}

            <div className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>

        {/* Right side - Hero Section */}
        <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Automate Your Job Search with{" "}
              <span className="text-primary">AI-Powered</span> Precision
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Join thousands of job seekers who have automated their applications, 
              tracked their progress, and landed their dream jobs with AutoJobr.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 Smart Form Filling</h3>
              <p className="text-sm text-muted-foreground">
                Automatically fill job applications across 40+ major job sites
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">📊 Application Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your applications and get insights on your job search
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🤖 AI Job Matching</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered job recommendations based on your profile
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🚀 Chrome Extension</h3>
              <p className="text-sm text-muted-foreground">
                Seamless browser integration with stealth auto-filling
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}