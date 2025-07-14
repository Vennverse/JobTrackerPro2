import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign,
  Eye,
  Send,
  Briefcase,
  Filter,
  Star,
  Heart,
  ExternalLink,
  Bookmark,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Sparkles,
  Target,
  Globe,
  Calendar,
  Activity,
  Award,
  ChevronRight,
  Layers,
  BarChart3,
  CheckCircle
} from "lucide-react";

interface JobPosting {
  id: number;
  title: string;
  companyName: string;
  location: string;
  description: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  createdAt: string;
  jobType?: string;
  workMode?: string;
  experienceLevel?: string;
  requiredSkills?: string[];
  benefits?: string[];
  isActive: boolean;
  recruiterName?: string;
  applicationsCount?: number;
}

export default function Jobs() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Enhanced state management
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [filterPreferences, setFilterPreferences] = useState({
    location: "",
    workMode: "",
    experienceLevel: "",
    salaryRange: "",
    jobType: "",
    company: "",
    skills: [] as string[],
    category: ""
  });
  
  // Enhanced search and filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Fetch regular job postings
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs/postings", searchQuery, filterPreferences],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      Object.entries(filterPreferences).forEach(([key, value]) => {
        if (value && typeof value === 'string') params.append(key, value);
      });
      
      const response = await fetch(`/api/jobs/postings?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
    enabled: isAuthenticated
  });

  // Scraped jobs functionality removed per user request

  // Fetch AI-powered job recommendations
  const { data: recommendedJobs = [], isLoading: recommendedLoading } = useQuery({
    queryKey: ["/api/jobs/recommendations"],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/recommendations`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  // Check applied jobs
  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
    enabled: isAuthenticated
  });

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to save job');
      return response.json();
    },
    onSuccess: (_, jobId) => {
      setSavedJobs(prev => new Set([...prev, jobId]));
      toast({ title: "Job Saved", description: "Job added to your saved list!" });
    }
  });

  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/jobs/postings/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ resumeId: null, coverLetter: "" })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply to job');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted", 
        description: "Your application has been sent to the recruiter!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Helper functions
  const appliedJobIds = applications ? applications.map((app: any) => app.jobPostingId) : [];
  
  const handleApply = (jobId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for jobs."
      });
      return;
    }
    applyMutation.mutate(jobId);
  };

  const handleSaveJob = (jobId: number) => {
    saveJobMutation.mutate(jobId);
  };

  const handleViewJob = (jobId: number) => {
    setLocation(`/jobs/${jobId}`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterPreferences({
      location: "",
      workMode: "",
      experienceLevel: "",
      salaryRange: "",
      jobType: "",
      company: "",
      skills: [],
      category: ""
    });
  };

  // AI-grade Job Card Component
  const JobCard = ({ job, source = "platform" }: { job: any; source?: string }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-900/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>
                  {source === "scraped" && (
                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                      <Globe className="w-3 h-3 mr-1" />
                      External
                    </Badge>
                  )}
                  {recommendedJobs.some((rec: any) => rec.id === job.id) && (
                    <Badge className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Match
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{job.companyName || job.company}</span>
                  {job.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveJob(job.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={savedJobs.has(job.id)}
                >
                  <Heart className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleViewJob(job.id)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap gap-2">
              {job.workMode && (
                <Badge variant="secondary" className="text-xs">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {job.workMode}
                </Badge>
              )}
              {job.jobType && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {job.jobType}
                </Badge>
              )}
              {job.salaryRange && (
                <Badge variant="secondary" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {job.salaryRange}
                </Badge>
              )}
              {job.experienceLevel && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {job.experienceLevel}
                </Badge>
              )}
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 5).map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{job.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Description Preview */}
            {job.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                {job.applicationsCount && (
                  <>
                    <span>•</span>
                    <Users className="w-3 h-3" />
                    <span>{job.applicationsCount} applicants</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {source === "scraped" && job.sourceUrl ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Apply
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleApply(job.id)}
                    disabled={appliedJobIds.includes(job.id) || applyMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {appliedJobIds.includes(job.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Applied
                      </>
                    ) : applyMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-1 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        Apply Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view jobs</h1>
            <p className="text-muted-foreground">You need to be authenticated to access job listings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              AI-Powered Job Discovery
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Find your perfect role with intelligent matching across thousands of opportunities
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span>AI Recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span>Global Opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for jobs, companies, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg border-0 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <Button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="outline"
                  className="h-12 px-6"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </Button>
                <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t space-y-4"
                  >
                    <div className="grid md:grid-cols-4 gap-4">
                      <Select value={filterPreferences.location} onValueChange={(value) => setFilterPreferences(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Location</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="san-francisco">San Francisco</SelectItem>
                          <SelectItem value="new-york">New York</SelectItem>
                          <SelectItem value="london">London</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterPreferences.workMode} onValueChange={(value) => setFilterPreferences(prev => ({ ...prev, workMode: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Work Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Mode</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="on-site">On-site</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterPreferences.experienceLevel} onValueChange={(value) => setFilterPreferences(prev => ({ ...prev, experienceLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Level</SelectItem>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="lead">Lead/Principal</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterPreferences.category} onValueChange={(value) => setFilterPreferences(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" onClick={resetFilters} className="w-full">
                      Clear All Filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Job Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="platform" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Platform Jobs
              </TabsTrigger>

            </TabsList>

            {/* AI Recommendations Tab */}
            <TabsContent value="discover">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Personalized for You</h2>
                  <p className="text-muted-foreground">Jobs matched to your skills and preferences</p>
                </div>
                
                <div className="grid gap-4">
                  {recommendedLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : recommendedJobs && recommendedJobs.length > 0 ? (
                    recommendedJobs.map((job: any) => (
                      <JobCard key={`rec-${job.id}`} job={job} source="platform" />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Building Your Recommendations</h3>
                        <p className="text-muted-foreground">Complete your profile to get personalized job matches</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Platform Jobs Tab */}
            <TabsContent value="platform">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Platform Jobs</h2>
                    <p className="text-muted-foreground">
                      {jobsLoading ? "Loading..." : `${jobs?.length || 0} jobs from verified recruiters`}
                    </p>
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="salary">Highest Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  {jobsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : jobs && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                      <JobCard key={`platform-${job.id}`} job={job} source="platform" />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Platform Jobs Found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* External Jobs Tab removed per user request */}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}