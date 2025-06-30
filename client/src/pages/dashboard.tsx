import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Target,
  Briefcase,
  BookOpen,
  Lightbulb,
  Zap,
  Crown,
  Plus,
  Download,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Building,
  ArrowRight,
  Sparkles,
  Activity,
  BarChart3,
  TrendingDown,
  Filter,
  Search,
  Bell,
  Settings
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showJobAnalysisDialog, setShowJobAnalysisDialog] = useState(false);
  const [showCoverLetterDialog, setShowCoverLetterDialog] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [coverJobDescription, setCoverJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [coverLetterResult, setCoverLetterResult] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isLoading]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/applications/stats"],
    retry: false,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    retry: false,
  });

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["/api/resumes"],
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const { data: jobRecommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/jobs/recommendations"],
    retry: false,
  });

  const { data: jobPostings, isLoading: jobPostingsLoading } = useQuery({
    queryKey: ["/api/jobs/postings"],
    retry: false,
  });

  const { data: recentAnalyses } = useQuery({
    queryKey: ["/api/jobs/analyses"],
    retry: false,
  });

  // Job application mutation
  const applyToJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest(`/api/applications`, {
        method: "POST",
        body: JSON.stringify(jobData),
      });
      if (response.ok) {
        return response.json();
      }
      throw new Error("Failed to apply to job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/stats"] });
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  });

  // Enhanced job analysis
  const analyzeJob = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("/api/jobs/analyze", {
        method: "POST",
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          company: companyName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        
        queryClient.invalidateQueries({ queryKey: ["/api/jobs/analyses"] });
        
        toast({
          title: "Analysis Complete",
          description: `Match score: ${result.matchScore}%`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Analysis failed");
      }
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Analysis Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate cover letter
  const generateCoverLetter = async () => {
    if (!coverJobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("/api/cover-letter/generate", {
        method: "POST",
        body: JSON.stringify({
          jobDescription: coverJobDescription,
          jobTitle,
          company: companyName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCoverLetterResult(result.coverLetter);
        
        toast({
          title: "Cover Letter Generated",
          description: "Your personalized cover letter is ready",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Generation failed");
      }
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Resume upload handler
  const handleResumeUpload = async (file: File) => {
    setIsUploadingResume(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
        
        toast({
          title: "Resume Uploaded Successfully",
          description: `ATS Score: ${result.atsScore || 'Analyzing...'}% - Your resume has been analyzed and optimized.`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload resume");
      }
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Upload Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <motion.div 
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'Job Seeker'}! 
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track your progress and discover new opportunities
              </p>
            </div>
            <motion.div 
              className="flex gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </motion.div>
          </div>
          
          {/* Quick Stats Bar */}
          <motion.div 
            className="flex gap-4 text-sm text-gray-600 dark:text-gray-300"
            variants={itemVariants}
          >
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-green-500" />
              <span>{stats?.totalApplications || 0} applications</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>{stats?.responseRate || 0}% response rate</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-purple-500" />
              <span>{stats?.avgMatchScore || 0}% avg match</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          {[
            {
              title: "Total Applications",
              value: stats?.totalApplications || 0,
              change: "+12%",
              icon: Briefcase,
              color: "blue",
              description: "This month"
            },
            {
              title: "Interview Rate",
              value: `${stats?.responseRate || 0}%`,
              change: "+5%",
              icon: Users,
              color: "green",
              description: "Success rate"
            },
            {
              title: "Avg Match Score",
              value: `${stats?.avgMatchScore || 0}%`,
              change: "+8%",
              icon: Target,
              color: "purple",
              description: "Job compatibility"
            },
            {
              title: "Active Resumes",
              value: resumes?.length || 0,
              change: "Updated",
              icon: FileText,
              color: "orange",
              description: "Ready to use"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="relative"
            >
              <Card className="h-full border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Panel */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            variants={itemVariants}
          >
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => setShowJobAnalysisDialog(true)}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Job Match
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => setShowCoverLetterDialog(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Cover Letter
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => window.location.href = "/resumes"}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resume Upload & Analysis */}
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-teal-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Resume Analysis
                  </CardTitle>
                  <p className="text-sm text-green-100">
                    Upload and optimize your resumes with AI-powered ATS scoring
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Resumes uploaded:</span>
                    <span className="font-medium">
                      {(resumes as any)?.length || 0}/{user?.planType === 'premium' ? '∞' : '2'}
                    </span>
                  </div>
                  
                  {((resumes as any)?.length || 0) < (user?.planType === 'premium' ? 999 : 2) ? (
                    <div>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleResumeUpload(file);
                          }
                        }}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                        disabled={isUploadingResume}
                      />
                      {isUploadingResume && (
                        <div className="mt-2 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white mx-auto"></div>
                          <p className="text-xs mt-1 text-green-100">Analyzing resume...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-green-100 mb-2">
                        {user?.planType === 'premium' ? 'Unlimited uploads available' : 'Upload limit reached'}
                      </p>
                      {user?.planType !== 'premium' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0"
                          onClick={() => window.location.href = "/pricing"}
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade for Unlimited
                        </Button>
                      )}
                    </div>
                  )}

                  {(resumes as any) && (resumes as any).length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Latest Resume Analysis:</div>
                      <div className="bg-white/20 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm truncate">{(resumes as any)[0]?.name || 'Resume'}</span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              ((resumes as any)[0]?.atsScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              ((resumes as any)[0]?.atsScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            ATS: {(resumes as any)[0]?.atsScore || 'N/A'}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium text-green-200">
                              {(resumes as any)[0]?.analysis?.content?.strengthsFound?.length || 0}
                            </div>
                            <div>Strengths</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-orange-200">
                              {(resumes as any)[0]?.analysis?.recommendations?.length || 0}
                            </div>
                            <div>Tips</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-200">
                              {(resumes as any)[0]?.analysis?.keywordOptimization?.missingKeywords?.length || 0}
                            </div>
                            <div>Missing</div>
                          </div>
                        </div>
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                          onClick={() => window.location.href = "/resumes"}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Analysis
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAnalyses?.slice(0, 3).map((analysis: any, index: number) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        whileHover={{ x: 5 }}
                      >
                        <div className={`w-2 h-2 rounded-full ${getMatchScoreBg(analysis.matchScore)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {analysis.jobTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {analysis.company}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${getMatchScoreColor(analysis.matchScore)} text-xs`}
                        >
                          {analysis.matchScore}%
                        </Badge>
                      </motion.div>
                    )) || (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No recent activity
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Job Recommendations */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      Recommended Jobs
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendationsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                      ))}
                    </div>
                  ) : jobRecommendations?.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {jobRecommendations.slice(0, 6).map((job: any, index: number) => (
                          <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {job.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {job.company}
                                  </p>
                                </div>
                                <Badge 
                                  className={`${getMatchScoreBg(job.matchScore)} ${getMatchScoreColor(job.matchScore)} border-0`}
                                >
                                  {job.matchScore}% match
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {job.salaryRange}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {job.workMode}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                  {job.requirements?.slice(0, 2).map((req: string, reqIndex: number) => (
                                    <Badge key={reqIndex} variant="secondary" className="text-xs">
                                      {req}
                                    </Badge>
                                  ))}
                                  {job.requirements?.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{job.requirements.length - 2}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => applyToJobMutation.mutate({
                                      jobTitle: job.title,
                                      company: job.company,
                                      location: job.location,
                                      salaryRange: job.salaryRange,
                                      workMode: job.workMode,
                                      jobUrl: job.applicationUrl,
                                      status: "applied",
                                      matchScore: job.matchScore
                                    })}
                                    disabled={applyToJobMutation.isPending}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                    Apply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">No job recommendations yet</p>
                      <p className="text-xs text-gray-400">Complete your profile to get personalized recommendations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Recent Applications Section */}
        <motion.div 
          className="mt-8"
          variants={itemVariants}
        >
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/applications"}
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : applications?.length > 0 ? (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((app: any, index: number) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            app.status === 'interviewed' ? 'bg-green-500' :
                            app.status === 'pending' ? 'bg-yellow-500' :
                            app.status === 'rejected' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{app.jobTitle}</p>
                            <p className="text-xs text-gray-500">{app.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              app.status === 'interviewed' ? 'default' :
                              app.status === 'pending' ? 'secondary' :
                              app.status === 'rejected' ? 'destructive' :
                              'outline'
                            }
                            className="capitalize text-xs"
                          >
                            {app.status}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(app.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                    <p className="text-xs text-gray-400">Start applying to jobs to track your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Job Analysis Dialog */}
      <Dialog open={showJobAnalysisDialog} onOpenChange={setShowJobAnalysisDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              AI Job Match Analysis
            </DialogTitle>
            <DialogDescription>
              Get detailed insights about how well you match with a specific job opportunity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Inc"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                rows={8}
              />
            </div>

            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Analysis Results
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Match Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={analysisResult.matchScore} className="flex-1" />
                      <span className={`font-bold ${getMatchScoreColor(analysisResult.matchScore)}`}>
                        {analysisResult.matchScore}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recommendation</p>
                    <Badge 
                      variant={analysisResult.matchScore >= 70 ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {analysisResult.matchScore >= 70 ? "Apply Now" : "Consider Improvements"}
                    </Badge>
                  </div>
                </div>

                {analysisResult.matchingSkills?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                      Matching Skills ({analysisResult.matchingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.matchingSkills.slice(0, 8).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                      Skills to Develop ({analysisResult.missingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.missingSkills.slice(0, 6).map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={analyzeJob} 
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowJobAnalysisDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Cover Letter Dialog */}
      <Dialog open={showCoverLetterDialog} onOpenChange={setShowCoverLetterDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              AI Cover Letter Generator
            </DialogTitle>
            <DialogDescription>
              Generate a personalized cover letter tailored to the specific job opportunity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coverJobTitle">Job Title</Label>
                <Input
                  id="coverJobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="coverCompanyName">Company</Label>
                <Input
                  id="coverCompanyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Inc"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="coverJobDescription">Job Description</Label>
              <Textarea
                id="coverJobDescription"
                value={coverJobDescription}
                onChange={(e) => setCoverJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
              />
            </div>

            {coverLetterResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Generated Cover Letter
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(coverLetterResult);
                      toast({
                        title: "Copied!",
                        description: "Cover letter copied to clipboard",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {coverLetterResult}
                  </pre>
                </div>
              </motion.div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={generateCoverLetter} 
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCoverLetterDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}