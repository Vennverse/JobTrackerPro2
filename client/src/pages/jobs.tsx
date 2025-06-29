import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  Briefcase,
  Eye,
  CheckCircle
} from "lucide-react";

interface JobPosting {
  id: number;
  title: string;
  companyName: string;
  location: string;
  description: string;
  salary?: string;
  workMode: string;
  jobType: string;
  createdAt: string;
  skillsRequired: string[];
  benefits?: string[];
  isActive: boolean;
  applicationsCount?: number;
}

export default function Jobs() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);

  // Fetch all job postings from recruiters
  const { data: allJobs, isLoading: jobsLoading, error } = useQuery({
    queryKey: ["/api/jobs/postings"],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/postings`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch jobs");
      }
      
      return await response.json() as JobPosting[];
    },
    retry: false,
  });

  // Get user's applications to show applied status
  const { data: userApplications } = useQuery({
    queryKey: ["/api/jobs/my-applications"],
    retry: false,
  });

  // Filter jobs based on search criteria
  useEffect(() => {
    if (!allJobs) {
      setFilteredJobs([]);
      return;
    }

    let filtered = allJobs.filter((job: JobPosting) => job.isActive);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((job: JobPosting) => 
        job.title.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.skillsRequired.some(skill => skill.toLowerCase().includes(query))
      );
    }

    if (locationFilter.trim()) {
      const location = locationFilter.toLowerCase();
      filtered = filtered.filter((job: JobPosting) => 
        job.location?.toLowerCase().includes(location) ||
        job.workMode.toLowerCase().includes(location)
      );
    }

    setFilteredJobs(filtered);
  }, [allJobs, searchQuery, locationFilter]);

  // Application mutation
  const applyToJobMutation = useMutation({
    mutationFn: async ({ jobId }: { jobId: number }) => {
      return await apiRequest("POST", `/api/jobs/postings/${jobId}/apply`, {});
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

  const handleApplyJob = (jobId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    applyToJobMutation.mutate({ jobId });
  };

  const handleViewJob = (jobId: number) => {
    window.open(`/jobs/${jobId}`, '_blank');
  };

  const isJobApplied = (jobId: number) => {
    return Array.isArray(userApplications) && userApplications.some((app: any) => app.jobPostingId === jobId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Job</h1>
          <p className="text-muted-foreground">
            Discover job opportunities posted by recruiters on our platform
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Job title, keywords, company, or skills"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location or remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Search Suggestions */}
        {!searchQuery && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Software Engineer", "Data Scientist", "Product Manager", "Designer", "Marketing Manager", "Sales Representative"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {jobsLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-4">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">Error Loading Jobs</h3>
                <p>Unable to fetch jobs at this time. Please try again later.</p>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!jobsLoading && filteredJobs.length === 0 && allJobs && allJobs.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No Jobs Available</h3>
                <p>There are currently no job postings from recruiters. Check back later!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtered No Results */}
        {!jobsLoading && filteredJobs.length === 0 && allJobs && allJobs.length > 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No Jobs Found</h3>
                <p>Try adjusting your search terms or location filters</p>
              </div>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setLocationFilter("");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Job Results */}
        {!jobsLoading && filteredJobs.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </h2>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job: JobPosting) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-primary hover:underline cursor-pointer"
                            onClick={() => handleViewJob(job.id)}>
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{job.workMode}</Badge>
                          <Badge variant="outline">{job.jobType}</Badge>
                          {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    
                    {job.skillsRequired && job.skillsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skillsRequired.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skillsRequired.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skillsRequired.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {job.applicationsCount !== undefined && (
                          <span>{job.applicationsCount} applications</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewJob(job.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Job
                        </Button>
                        {isJobApplied(job.id) ? (
                          <Button variant="secondary" size="sm" disabled>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Applied
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleApplyJob(job.id)}
                            disabled={applyToJobMutation.isPending}
                          >
                            {applyToJobMutation.isPending ? "Applying..." : "Apply"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}