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
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Job Application Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Land Your Dream Job with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Automation
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              AutoJobr revolutionizes job searching with AI-powered automation, intelligent matching, 
              and comprehensive tracking—helping you apply smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleLogin} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.open('/extension/install.html', '_blank')} className="text-lg px-8 py-4">
                <Chrome className="w-5 h-5 mr-2" />
                Install Extension
              </Button>
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
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AutoJobr combines cutting-edge AI technology with seamless automation to transform your job search experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm relative">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    {feature.highlight && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200">
                        {feature.highlight}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Play className="w-4 h-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start automating your job applications in minutes with our intuitive setup process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Profile</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your resume and complete your professional profile. Our AI will analyze and optimize your information for maximum impact.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Install Extension</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add our Chrome extension to automatically fill job applications across 50+ job boards and ATS platforms with one click.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Apply with AI</h3>
              <p className="text-muted-foreground leading-relaxed">
                Let AI analyze job matches, generate cover letters, and track your applications while you focus on interview preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Star className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Loved by Job Seekers Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of professionals who have landed their dream jobs using AutoJobr.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools & Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Monitor className="w-4 h-4 mr-2" />
              Complete Toolkit
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access our comprehensive suite of job search tools, all powered by advanced AI and designed for maximum efficiency.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Web Dashboard */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">Web Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete application tracking</li>
                  <li>• Resume management & analysis</li>
                  <li>• Job recommendations</li>
                  <li>• Performance analytics</li>
                </ul>
              </CardContent>
            </Card>

            {/* Chrome Extension */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-3">
                  <Chrome className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">Chrome Extension</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Auto-fill job applications</li>
                  <li>• Real-time job analysis</li>
                  <li>• 50+ job board support</li>
                  <li>• One-click application</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Tools */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">AI-Powered Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Groq AI job matching</li>
                  <li>• Cover letter generation</li>
                  <li>• Resume optimization</li>
                  <li>• ATS scoring & analysis</li>
                </ul>
              </CardContent>
            </Card>

            {/* Recruiter Platform */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">Recruiter Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Job posting management</li>
                  <li>• Candidate screening</li>
                  <li>• Application tracking</li>
                  <li>• Real-time messaging</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Feature List */}
          <div className="mt-16 grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">For Job Seekers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Smart Resume Management</h4>
                    <p className="text-sm text-muted-foreground">Upload multiple resumes, get ATS optimization, and detailed scoring analysis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Unified Application Tracking</h4>
                    <p className="text-sm text-muted-foreground">Track applications from both web platform and Chrome extension in one dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">AI Job Matching</h4>
                    <p className="text-sm text-muted-foreground">Get match scores, skill gap analysis, and personalized recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">Performance metrics, response rates, and optimization insights</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">For Recruiters</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Job Posting Management</h4>
                    <p className="text-sm text-muted-foreground">Create, edit, and manage job postings with advanced filtering and categorization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Candidate Communication</h4>
                    <p className="text-sm text-muted-foreground">Built-in messaging system for seamless candidate interaction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Application Review</h4>
                    <p className="text-sm text-muted-foreground">Streamlined application review with candidate profile integration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Email Verification</h4>
                    <p className="text-sm text-muted-foreground">Corporate email verification for verified recruiter accounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Award className="w-4 h-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free and upgrade as you land more interviews. No hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold">$0<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">2 resume uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">5 job analyses per day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Basic auto-fill</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Application tracking</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={handleLogin}>
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-4xl font-bold">$10<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Perfect for active job seekers</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Unlimited resume uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Unlimited AI job analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">AI cover letter generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced auto-fill features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Enhanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={handleLogin}>
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold">$49<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">For career coaches & teams</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Everything in Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Team management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Dedicated support</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={handleLogin}>
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are landing their dream jobs faster with AutoJobr's AI-powered automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              <Rocket className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('/extension/install.html', '_blank')} className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              <Chrome className="w-5 h-5 mr-2" />
              Install Extension
            </Button>
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