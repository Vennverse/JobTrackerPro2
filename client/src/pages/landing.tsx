import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Chrome, Target, BarChart3, Zap, Shield, Clock, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AutoJobr</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Job Application Automation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Land Your Dream Job with{" "}
              <span className="text-primary">AI-Powered</span> Automation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              AutoJobr automates job applications, tracks your progress, and analyzes job matches—all while you focus on what matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} className="bg-primary hover:bg-primary/90">
                <Rocket className="w-4 h-4 mr-2" />
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.open('/extension/install.html', '_blank')}>
                <Chrome className="w-4 h-4 mr-2" />
                Install Extension
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Land Your Next Job
            </h2>
            <p className="text-muted-foreground">
              Powerful features designed to streamline your job search process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Auto-Fill Applications
                </h3>
                <p className="text-muted-foreground">
                  Instantly populate job application forms with your profile data across major job boards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Smart Job Matching
                </h3>
                <p className="text-muted-foreground">
                  Get real-time analysis of how well you match each job posting with AI-powered insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Application Tracking
                </h3>
                <p className="text-muted-foreground">
                  Track every application automatically and monitor your progress with detailed analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Chrome className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Chrome Extension
                </h3>
                <p className="text-muted-foreground">
                  Seamlessly integrate with any job board using our powerful Chrome extension.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Secure & Private
                </h3>
                <p className="text-muted-foreground">
                  Your data is encrypted and secure. We never share your information with third parties.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Save Time
                </h3>
                <p className="text-muted-foreground">
                  Reduce application time by 90% and apply to more jobs with consistent quality.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by Job Seekers Worldwide
            </h2>
            <p className="text-muted-foreground">
              Join thousands of professionals who have accelerated their job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Applications Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Chrome Extension Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex items-center mb-4">
                <Chrome className="w-8 h-8 mr-3" />
                <span className="text-sm font-semibold uppercase tracking-wide">Chrome Extension</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Auto-Fill Any Job Application in Seconds
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Our Chrome extension works seamlessly with Workday, Greenhouse, LinkedIn, and 15+ other job boards. Get real-time job matching scores and automatic form filling.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Auto-fills forms on 15+ major job boards</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Real-time job match analysis with AI</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Automatic application tracking</span>
                </div>
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-white/90"
                onClick={() => window.open('/extension/install.html', '_blank')}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Install Extension
              </Button>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                        <Rocket className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">AutoJobr Assistant</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Connected
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Match Score</span>
                        <span className="text-lg font-bold text-green-600">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: "92%"}}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Seniority</span>
                        <div className="font-medium">Senior</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Work Mode</span>
                        <div className="font-medium">Remote</div>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">
                      Fill Application Forms
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of professionals who are landing jobs faster with AutoJobr
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleLogin}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Get Started Free Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => window.open('/extension/README.md', '_blank')}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Install Extension
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AutoJobr</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                The smart job application platform that automates your job search and helps you land your dream job faster.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chrome Extension</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 AutoJobr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
