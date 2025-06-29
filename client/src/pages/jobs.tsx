import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  ExternalLink,
  Filter,
  SlidersHorizontal,
  Briefcase,
  Star,
  BookmarkPlus
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  created?: string;
  url: string;
  contract_type?: string;
  category?: string;
}

export default function Jobs() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);

  const { data: jobsData, isLoading: jobsLoading, error } = useQuery({
    queryKey: ["/api/jobs/postings", searchQuery, location],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/postings`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch jobs");
      }
      
      const jobs = await response.json();
      
      // Filter jobs based on search query and location if provided
      let filteredJobs = jobs;
      if (searchQuery.length >= 1) {
        filteredJobs = jobs.filter((job: any) => 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (location) {
        filteredJobs = filteredJobs.filter((job: any) => 
          job.location?.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      return filteredJobs;
    },
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const handleSearch = () => {
    if (searchQuery.length < 3) {
      toast({
        title: "Search too short",
        description: "Please enter at least 3 characters to search",
        variant: "destructive"
      });
      return;
    }
    setPage(1);
  };

  const handleApplyJob = (job: Job) => {
    window.open(job.url, '_blank');
    
    // Track application
    fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        jobTitle: job.title,
        company: job.company,
        jobUrl: job.url,
        location: job.location,
        status: 'applied',
        source: 'job_search'
      })
    }).catch(console.error);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Job</h1>
          <p className="text-muted-foreground">
            Search thousands of jobs from top companies worldwide
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
                    placeholder="Job title, keywords, or company (min 3 characters)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={jobsLoading || searchQuery.length < 3}>
                  {jobsLoading ? "Searching..." : "Search"}
                </Button>
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
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch();
                    }}
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
                <h3 className="font-semibold mb-2">Search Error</h3>
                <p>Unable to fetch jobs at this time. Please try again later.</p>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {jobsData && jobsData.results?.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No Jobs Found</h3>
                <p>Try adjusting your search terms or location</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Results */}
        {jobsData?.results && jobsData.results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {jobsData.count} jobs found
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {jobsData.results.map((job: Job, index: number) => (
                <Card key={job.id || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-primary hover:underline cursor-pointer"
                            onClick={() => window.open(job.url, '_blank')}>
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          {job.created && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(job.created).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {job.contract_type && (
                            <Badge variant="secondary">{job.contract_type}</Badge>
                          )}
                          {job.category && (
                            <Badge variant="outline">{job.category}</Badge>
                          )}
                          <Badge variant="outline">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Add to bookmarks
                            toast({
                              title: "Job bookmarked",
                              description: "Added to your saved jobs"
                            });
                          }}
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleApplyJob(job)}
                          size="sm"
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {jobsData.count > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(jobsData.count / 20)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(jobsData.count / 20)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}