import { useState } from "react";
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
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign,
  Eye,
  Send,
  Briefcase,
  Filter
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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");

  // Fetch job postings from recruiters only
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs/postings", searchQuery, locationFilter, jobTypeFilter, workModeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (locationFilter) params.append('location', locationFilter);
      if (jobTypeFilter) params.append('jobType', jobTypeFilter);
      if (workModeFilter) params.append('workMode', workModeFilter);
      
      const response = await fetch(`/api/jobs/postings?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return response.json();
    },
    enabled: isAuthenticated
  });

  // Check applied jobs
  const { data: applications } = useQuery({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications", {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated
  });

  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ jobId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply to job');
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

  const handleApply = (jobId: number) => {
    applyMutation.mutate(jobId);
  };

  const handleViewJob = (jobId: number) => {
    setLocation(`/jobs/${jobId}`);
  };

  const appliedJobIds = applications ? applications.map((app: any) => app.jobId) : [];

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search and Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Jobs</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title, skills, company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="City, state, or remote"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Type</label>
                  <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any job type</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Mode Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Work Mode</label>
                  <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any work mode</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="on-site">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setLocationFilter("");
                    setJobTypeFilter("");
                    setWorkModeFilter("");
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Job Opportunities</h1>
                <p className="text-muted-foreground mt-1">
                  {jobsLoading ? "Loading..." : `${jobs?.length || 0} jobs from verified recruiters`}
                </p>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {jobsLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job: JobPosting) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-primary mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-4 text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              <span>{job.companyName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {job.minSalary && job.maxSalary && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                {job.currency || '$'}{job.minSalary.toLocaleString()}-
                                {job.currency || '$'}{job.maxSalary.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.jobType && (
                          <Badge variant="secondary">{job.jobType}</Badge>
                        )}
                        {job.workMode && (
                          <Badge variant="outline">{job.workMode}</Badge>
                        )}
                        {job.experienceLevel && (
                          <Badge variant="outline">{job.experienceLevel}</Badge>
                        )}
                        {job.requiredSkills && job.requiredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.applicationsCount || 0} applications</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewJob(job.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Job
                          </Button>
                          
                          {appliedJobIds.includes(job.id) ? (
                            <Button variant="secondary" size="sm" disabled>
                              Applied
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleApply(job.id)}
                              disabled={applyMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              <Send className="w-4 h-4" />
                              {applyMutation.isPending ? "Applying..." : "Apply"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or check back later for new opportunities.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setLocationFilter("");
                        setJobTypeFilter("");
                        setWorkModeFilter("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}