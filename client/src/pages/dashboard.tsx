import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/stats-cards";
import { ApplicationsTable } from "@/components/applications-table";
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
  Download
} from "lucide-react";

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

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

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

  // Fetch recruiter-posted jobs
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
    mutationFn: async ({ jobId, coverLetter }: { jobId: number; coverLetter?: string }) => {
      return await apiRequest("POST", `/api/jobs/postings/${jobId}/apply`, { coverLetter });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the recruiter.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my-applications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Resume upload mutation
  const uploadResumeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded and analyzed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, "")); // Remove extension for name

    uploadResumeMutation.mutate(formData);
    
    // Reset the input
    event.target.value = '';
  };

  // Set active resume mutation
  const setActiveResumeMutation = useMutation({
    mutationFn: async (resumeId: number) => {
      const response = await apiRequest("POST", `/api/resumes/${resumeId}/set-active`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume activated",
        description: "This resume is now your active resume.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to activate resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setActiveResume = (resumeId: number) => {
    setActiveResumeMutation.mutate(resumeId);
  };

  const downloadResume = async (resumeId: number, filename: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download resume');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Resume downloaded",
        description: "Your resume has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJobAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/jobs/analyze", {
        jobDescription: jobDescription.trim()
      });
      const result = await response.json();
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: `Match Score: ${result.matchScore}% - ${result.applicationRecommendation}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze job match",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCoverLetterGeneration = async () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      toast({
        title: "Error", 
        description: "Please enter company name and job title",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/cover-letter/generate", {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        jobDescription: coverJobDescription.trim()
      });
      const result = await response.json();
      setCoverLetterResult(result.coverLetter);
      
      toast({
        title: "Cover Letter Generated",
        description: "Your personalized cover letter is ready!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate cover letter",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Job Analysis Dialog */}
        <Dialog open={showJobAnalysisDialog} onOpenChange={setShowJobAnalysisDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>AI Job Match Analysis</DialogTitle>
              <DialogDescription>
                Paste a job description to get AI-powered compatibility analysis with your profile.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!analysisResult ? (
                <>
                  <div>
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea 
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      className="min-h-[200px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowJobAnalysisDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleJobAnalysis} disabled={isAnalyzing}>
                      {isAnalyzing ? "Analyzing..." : "Analyze Match"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {(analysisResult as any).matchScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Match Score</div>
                  </div>
                  
                  {(analysisResult as any).matchingSkills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Matching Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {(analysisResult as any).matchingSkills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(analysisResult as any).missingSkills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-orange-600">Skills to Develop</h4>
                      <div className="flex flex-wrap gap-1">
                        {(analysisResult as any).missingSkills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs border-orange-300 text-orange-600">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(analysisResult as any).applicationRecommendation && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommendation</h4>
                      <p className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        {(analysisResult as any).applicationRecommendation}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setAnalysisResult(null);
                      setJobDescription("");
                    }}>
                      Analyze Another
                    </Button>
                    <Button onClick={() => setShowJobAnalysisDialog(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Cover Letter Dialog */}
        <Dialog open={showCoverLetterDialog} onOpenChange={setShowCoverLetterDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>AI Cover Letter Generator</DialogTitle>
              <DialogDescription>
                Generate a personalized cover letter using AI based on your profile and the job description.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!coverLetterResult ? (
                <>
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google, Microsoft, Startup Inc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input 
                      id="job-title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Software Engineer, Product Manager"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cover-job-description">Job Description (Optional)</Label>
                    <Textarea 
                      id="cover-job-description"
                      value={coverJobDescription}
                      onChange={(e) => setCoverJobDescription(e.target.value)}
                      placeholder="Paste job description for better personalization..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCoverLetterDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCoverLetterGeneration} disabled={isGenerating}>
                      {isGenerating ? "Generating..." : "Generate Cover Letter"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Generated Cover Letter</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {coverLetterResult}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(coverLetterResult);
                        toast({
                          title: "Copied!",
                          description: "Cover letter copied to clipboard",
                        });
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setCoverLetterResult("");
                        setCompanyName("");
                        setJobTitle("");
                        setCoverJobDescription("");
                      }}>
                        Generate Another
                      </Button>
                      <Button onClick={() => setShowCoverLetterDialog(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const recentApplications = Array.isArray(applications)
    ? applications.slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Your Job Search Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Track applications, monitor progress, and optimize your job search
              strategy
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-8 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Stats Cards */}
          <StatsCards stats={stats as any} isLoading={statsLoading} />

          {/* Resume Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Resume Analysis */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl">Resume Analysis</CardTitle>
                    </div>
                    <Badge variant={profile?.atsScore >= 80 ? "default" : profile?.atsScore >= 60 ? "secondary" : "destructive"}>
                      {profile?.atsScore || 0}% ATS Score
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumesLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : resumes?.length > 0 ? (
                    <>
                      {/* ATS Score Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">ATS Compatibility</span>
                          <span className="text-sm text-muted-foreground">{profile?.atsScore || 0}/100</span>
                        </div>
                        <Progress value={profile?.atsScore || 0} className="h-3" />
                      </div>

                      {/* Resume Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-lg bg-primary/5">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mx-auto mb-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-lg font-bold">{resumes.length}/2</div>
                          <div className="text-xs text-muted-foreground">Resumes</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-lg font-bold">{applications?.filter(app => app.status === 'applied').length || 0}</div>
                          <div className="text-xs text-muted-foreground">Applications</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="text-lg font-bold">{applications?.filter(app => app.status === 'interview').length || 0}</div>
                          <div className="text-xs text-muted-foreground">Interviews</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 mx-auto mb-2">
                            <Target className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="text-lg font-bold">{stats?.avgMatchScore || 0}%</div>
                          <div className="text-xs text-muted-foreground">Match Score</div>
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      {profile?.atsAnalysis && (
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            AI Recommendations
                          </h4>
                          <div className="space-y-2">
                            {(() => {
                              try {
                                const analysis = typeof profile.atsAnalysis === 'string' 
                                  ? JSON.parse(profile.atsAnalysis) 
                                  : profile.atsAnalysis;
                                return analysis.recommendations?.slice(0, 3).map((rec: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{rec}</span>
                                  </div>
                                ));
                              } catch {
                                return (
                                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                    AI recommendations will be available after resume analysis
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Upload Your Resume</h3>
                      <p className="text-muted-foreground mb-4">Get instant ATS analysis and optimization tips</p>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resume
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resume Management Sidebar */}
            <div className="space-y-6">
              {/* Resume Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    My Resumes
                    {user?.planType !== 'premium' && (
                      <Badge variant="outline" className="ml-auto">
                        {Array.isArray(resumes) ? resumes.length : 0}/2 Free
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resumesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      {resumes?.map((resume: any, idx: number) => (
                        <div key={resume.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{resume.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ATS: {resume.atsScore || 0}% • {resume.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!resume.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveResume(resume.id)}
                                className="text-xs px-2 py-1"
                              >
                                Set Active
                              </Button>
                            )}
                            {resume.isActive && (
                              <Badge variant="default" className="text-xs">Active</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadResume(resume.id, resume.fileName || resume.name)}
                              className="text-xs px-2 py-1"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {(!resumes || resumes.length < 2 || user?.planType === 'premium') && (
                        <label htmlFor="resume-upload" className="w-full">
                          <Button variant="outline" className="w-full" size="sm" asChild>
                            <div className="cursor-pointer">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Resume
                            </div>
                          </Button>
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleResumeUpload}
                          />
                        </label>
                      )}
                      
                      {resumes?.length >= 2 && user?.planType !== 'premium' && (
                        <Alert>
                          <Crown className="w-4 h-4" />
                          <AlertDescription className="text-xs">
                            Upgrade to Premium for unlimited resumes and advanced features
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/jobs'}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Find Jobs
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowJobAnalysisDialog(true)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Job Match Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowCoverLetterDialog(true)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Cover Letter Generator
                  </Button>
                </CardContent>
              </Card>

              {/* Extension Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chrome Extension</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Auto-fill enabled on 50+ job boards including LinkedIn, Indeed, and Workday
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Extension Stats
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Recommendations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Recommended Jobs
                </CardTitle>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {recommendationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : jobRecommendations?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobRecommendations.slice(0, 4).map((job: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{job.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {job.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{job.location}</span>
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Recommendations Yet</h3>
                  <p className="text-muted-foreground text-sm">Complete your profile to get personalized job recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Postings from Recruiters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Latest Job Openings
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {Array.isArray(jobPostings) ? jobPostings.length : 0} Available
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {jobPostingsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <Skeleton className="h-20 w-full mb-3" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : Array.isArray(jobPostings) && jobPostings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobPostings.slice(0, 6).map((job: any) => (
                    <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.companyName}</p>
                        </div>
                        {job.skills?.slice(0, 2).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs ml-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{job.location || 'Remote'}</span>
                          <span>•</span>
                          <span>{job.workMode}</span>
                          <span>•</span>
                          <span>{job.jobType}</span>
                        </div>
                        
                        {job.minSalary && job.maxSalary && (
                          <div className="text-xs text-green-600 font-medium">
                            ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} {job.currency}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {job.applicationsCount} applications
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => applyToJobMutation.mutate({ jobId: job.id })}
                          disabled={applyToJobMutation.isPending}
                        >
                          {applyToJobMutation.isPending ? "Applying..." : "Apply Now"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Job Openings Yet</h3>
                  <p className="text-muted-foreground text-sm">Check back later for new opportunities from recruiters</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Applications
                </CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ApplicationsTable
                applications={recentApplications}
                isLoading={applicationsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Job Analysis Dialog */}
      <Dialog open={showJobAnalysisDialog} onOpenChange={setShowJobAnalysisDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>AI Job Match Analysis</DialogTitle>
            <DialogDescription>
              Paste a job description to get AI-powered compatibility analysis with your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!analysisResult ? (
              <>
                <div>
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea 
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="min-h-[200px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowJobAnalysisDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleJobAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "Analyze Match"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {(analysisResult as any).matchScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Job Match Score</p>
                </div>
                
                {(analysisResult as any).matchingSkills && (analysisResult as any).matchingSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Matching Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult as any).matchingSkills.slice(0, 6).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs border-green-300 text-green-600">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {(analysisResult as any).missingSkills && (analysisResult as any).missingSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult as any).missingSkills.slice(0, 6).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs border-orange-300 text-orange-600">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {(analysisResult as any).applicationRecommendation && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendation</h4>
                    <p className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      {(analysisResult as any).applicationRecommendation}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setAnalysisResult(null);
                    setJobDescription("");
                  }}>
                    Analyze Another
                  </Button>
                  <Button onClick={() => setShowJobAnalysisDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Letter Dialog */}
      <Dialog open={showCoverLetterDialog} onOpenChange={setShowCoverLetterDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>AI Cover Letter Generator</DialogTitle>
            <DialogDescription>
              Generate a personalized cover letter using AI based on your profile and the job description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!coverLetterResult ? (
              <>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Startup Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input 
                    id="job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer, Product Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="cover-job-description">Job Description (Optional)</Label>
                  <Textarea
                    id="cover-job-description"
                    value={coverJobDescription}
                    onChange={(e) => setCoverJobDescription(e.target.value)}
                    placeholder="Paste job description for better personalization..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCoverLetterDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCoverLetterGeneration} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Cover Letter"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Generated Cover Letter</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {coverLetterResult}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(coverLetterResult);
                      toast({
                        title: "Copied!",
                        description: "Cover letter copied to clipboard",
                      });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      setCoverLetterResult("");
                      setCompanyName("");
                      setJobTitle("");
                      setCoverJobDescription("");
                    }}>
                      Generate Another
                    </Button>
                    <Button onClick={() => setShowCoverLetterDialog(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
