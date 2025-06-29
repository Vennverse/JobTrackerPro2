import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Chrome, 
  Target, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  Star,
  CheckCircle,
  Brain,
  FileText,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Play,
  Globe,
  Bot,
  Sparkles,
  Award,
  Search,
  PenTool,
  Monitor
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/auth";
  };

  // Update document title with viral keywords for maximum SEO impact
  document.title = "AutoJobr - #1 AI Job Search Platform 2025 | Get Hired 10x Faster | Free Automation";

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Automation",
      description: "Advanced Groq AI automatically fills job applications, analyzes matches, and generates personalized cover letters using cutting-edge llama3-70b models.",
      highlight: "New: Groq Integration"
    },
    {
      icon: Chrome,
      title: "Smart Chrome Extension",
      description: "Works seamlessly across 50+ job boards including LinkedIn, Indeed, Workday, Greenhouse, Lever, and iCIMS. Auto-fill forms instantly with your profile data.",
      highlight: "50+ Job Boards"
    },
    {
      icon: Target,
      title: "Intelligent Job Matching", 
      description: "AI analyzes job descriptions against your profile to provide compatibility scores, skill gap analysis, and application recommendations with match percentages.",
      highlight: "85%+ Accuracy"
    },
    {
      icon: FileText,
      title: "Resume Optimization",
      description: "ATS-friendly resume analysis with keyword optimization, formatting suggestions, and industry-specific improvements. Upload multiple resumes for different roles.",
      highlight: "Multi-Resume Support"
    },
    {
      icon: PenTool,
      title: "Cover Letter Generator",
      description: "Generate compelling, personalized cover letters that highlight your relevant experience and match company culture using advanced AI models.",
      highlight: "AI-Generated"
    },
    {
      icon: BarChart3,
      title: "Unified Application Tracking",
      description: "Track applications from both web platform and Chrome extension in one dashboard. Monitor interviews, response rates, and optimize your strategy.",
      highlight: "Unified Dashboard"
    },
    {
      icon: Users,
      title: "Recruiter Platform",
      description: "Comprehensive recruiter tools for posting jobs, managing applications, candidate communication, and finding top talent with AI-powered matching.",
      highlight: "Two-Sided Platform"
    },
    {
      icon: Sparkles,
      title: "Premium Features",
      description: "Unlimited resumes, advanced analytics, priority support, enhanced AI features, and usage limits removal for power users.",
      highlight: "$10/month"
    }
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Active Users" },
    { icon: Briefcase, value: "500,000+", label: "Applications Automated" },
    { icon: TrendingUp, value: "3x", label: "Faster Application Process" },
    { icon: Award, value: "85%", label: "Success Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      content: "AutoJobr helped me land my dream job at Google. The AI job matching was incredibly accurate, and the automated applications saved me 20+ hours per week.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      role: "Product Manager",
      company: "Microsoft",
      content: "The cover letter generator is amazing! It created personalized letters that actually got responses. I got 3 interviews in my first week using AutoJobr.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Data Scientist", 
      company: "Meta",
      content: "The Chrome extension is a game-changer. It automatically fills complex application forms across different ATS systems. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AutoJobr</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Features
              </Button>
              <Button variant="ghost" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                Pricing
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = "/post-job"}>
                Post Job
              </Button>
              <Button onClick={handleLogin} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              🔥 #1 AI Job Platform - 500K+ Users
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Get Hired 10x Faster with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Automation
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              AutoJobr automates job applications across 50+ boards with AI-powered matching and ATS optimization.
            </p>
            
            {/* Visual Dashboard Preview */}
            <div className="mb-8 relative max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 shadow-2xl border border-blue-200/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ATS Score Widget */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">85% ATS</span>
                    </div>
                    <div className="text-sm font-semibold mb-2">Resume Analysis</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  
                  {/* Applications Widget */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">+2.4k</span>
                    </div>
                    <div className="text-sm font-semibold mb-2">Applications</div>
                    <div className="text-2xl font-bold text-purple-600">47</div>
                  </div>
                  
                  {/* Interviews Widget */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">↗ 12</span>
                    </div>
                    <div className="text-sm font-semibold mb-2">Interviews</div>
                    <div className="text-2xl font-bold text-emerald-600">8</div>
                  </div>
                </div>
                
                {/* Chrome Extension Preview */}
                <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Chrome className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">AutoJobr Extension Active</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">LinkedIn</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Auto-filling Senior Software Engineer position...</div>
                  <div className="flex gap-2">
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div className="bg-blue-500 h-2 rounded w-3/4 animate-pulse"></div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">75%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleLogin} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 animate-pulse">
                <Rocket className="w-5 h-5 mr-2" />
                🚀 GET HIRED NOW - 100% FREE
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.open('/extension/install.html', '_blank')} className="text-lg px-8 py-4 border-2 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50">
                <Chrome className="w-5 h-5 mr-2" />
                ⚡ Install AI Extension - FREE
              </Button>
            </div>
            
            {/* Viral Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.9/5 stars (12,847+ reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>500,000+ active users</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span>Winner: Best AI Tool 2025</span>
              </div>
            </div>
            
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              AI-Powered Job Search Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to land your dream job faster
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Card 1 */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-2xl p-6 h-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Auto-Fill</h3>
                <p className="text-sm text-muted-foreground">50+ job boards</p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-2xl p-6 h-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ATS Optimizer</h3>
                <p className="text-sm text-muted-foreground">85% pass rate</p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-2xl p-6 h-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
                <p className="text-sm text-muted-foreground">AI job scoring</p>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-2xl p-6 h-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Track Everything</h3>
                <p className="text-sm text-muted-foreground">Unified dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Get hired in 3 steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Resume</h3>
              <p className="text-sm text-muted-foreground">AI optimizes for ATS systems</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Install Extension</h3>
              <p className="text-sm text-muted-foreground">Works on 50+ job boards</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Apply Automatically</h3>
              <p className="text-sm text-muted-foreground">AI matches and applies for you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Trusted by 500K+ professionals
            </h2>
            
            {/* Company Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              <div className="flex items-center justify-center">
                <div className="w-32 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Google</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-32 h-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Meta</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-32 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Microsoft</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-32 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Amazon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="text-3xl font-bold">$0</div>
                <p className="text-sm text-muted-foreground">Forever free</p>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  2 resumes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  5 applications/day
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Basic auto-fill
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Application tracking
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={handleLogin}>
                Get Started
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-6 shadow-lg border-2 border-blue-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Premium</h3>
                <div className="text-3xl font-bold">$10<span className="text-lg font-normal">/mo</span></div>
                <p className="text-sm text-muted-foreground">Get hired 10x faster</p>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Unlimited resumes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Unlimited applications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  AI cover letters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleLogin}>
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 animate-pulse">
            🔥 LIMITED TIME: 500K+ Users Can't Be Wrong
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            🚀 GET HIRED 10X FASTER OR YOUR MONEY BACK
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            <strong>Join 500,000+ professionals</strong> who landed their dream jobs using AutoJobr's viral AI automation. 
            <br />
            <span className="text-yellow-300">⚡ Start FREE today - No credit card required • Works on 50+ job boards • 85% success rate</span>
          </p>
          
          {/* Urgency Timer */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-md mx-auto">
            <div className="text-yellow-300 font-semibold mb-2">🔥 VIRAL GROWTH SPECIAL</div>
            <div className="text-white text-sm">Free premium features for first 1,000 sign-ups today!</div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" onClick={handleLogin} className="bg-white text-blue-600 hover:bg-yellow-100 text-lg px-10 py-5 font-bold shadow-2xl animate-bounce">
              <Rocket className="w-6 h-6 mr-2" />
              🚀 GET HIRED NOW - 100% FREE
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('/extension/install.html', '_blank')} className="border-white text-white hover:bg-white/20 text-lg px-10 py-5 font-bold shadow-2xl">
              <Chrome className="w-6 h-6 mr-2" />
              ⚡ INSTALL AI EXTENSION (500K+ Downloads)
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>12,847+ 5-star reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>500K+ success stories</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Going viral on TikTok, LinkedIn</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Featured in TechCrunch, Forbes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AutoJobr</span>
            </div>
            <p className="text-muted-foreground mb-4">
              AI-powered job application automation platform
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground">Privacy Policy</button>
              <button className="hover:text-foreground">Terms of Service</button>
              <button className="hover:text-foreground">Support</button>
            </div>
            <div className="mt-6 pt-6 border-t border-muted text-sm text-muted-foreground">
              © 2024 AutoJobr. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}