import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, Building, ExternalLink, Loader2, Briefcase, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl: string;
  sourceUrl: string;
  salaryRange?: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  skills: string[];
  tags: string[];
  category: string;
  subcategory: string;
}

export default function JobSearch() {
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const searchJobsMutation = useMutation({
    mutationFn: async ({ position, location, limit = 10 }: { position: string; location: string; limit?: number }) => {
      const response = await apiRequest(
        `/api/jobs/search?position=${encodeURIComponent(position)}&location=${encodeURIComponent(location)}&limit=${limit}`,
        "GET"
      );
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.jobs || []);
      setHasSearched(true);
      toast({
        title: "Search Complete",
        description: `Found ${data.jobs?.length || 0} jobs for ${position} in ${location}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search jobs. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!position.trim()) {
      toast({
        title: "Missing Position",
        description: "Please enter a job position to search for.",
        variant: "destructive",
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: "Missing Location",
        description: "Please enter a location to search in.",
        variant: "destructive",
      });
      return;
    }

    searchJobsMutation.mutate({ position: position.trim(), location: location.trim() });
  };

  const handleLoadMore = () => {
    const currentLimit = searchResults.length + 10;
    searchJobsMutation.mutate({ position, location, limit: currentLimit });
  };

  const getWorkModeColor = (workMode: string) => {
    switch (workMode.toLowerCase()) {
      case 'remote':
        return 'bg-green-100 text-green-800';
      case 'hybrid':
        return 'bg-blue-100 text-blue-800';
      case 'on-site':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry-level':
        return 'bg-yellow-100 text-yellow-800';
      case 'mid-level':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'lead':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Job Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find your next opportunity with our AI-powered job search
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Jobs
              </CardTitle>
              <CardDescription>
                Enter a job position and location to find relevant opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    placeholder="e.g., Software Engineer, Product Manager"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={searchJobsMutation.isPending}
                className="w-full"
              >
                {searchJobsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Jobs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Search Results ({searchResults.length} jobs)
                </h2>
              </div>

              {searchResults.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your search criteria or search for different positions
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((job, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <div className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {job.company}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.location}
                              </div>
                              {job.salaryRange && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salaryRange}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={getWorkModeColor(job.workMode)}>
                                {job.workMode}
                              </Badge>
                              <Badge className={getExperienceLevelColor(job.experienceLevel)}>
                                {job.experienceLevel}
                              </Badge>
                              <Badge variant="outline">{job.jobType}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => window.open(job.applyUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Apply
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {job.description}
                        </p>
                        
                        {job.skills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Required Skills
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {job.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Separator className="my-4" />
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <span>{job.category}</span>
                            <span>•</span>
                            <span>{job.subcategory}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(job.sourceUrl, '_blank')}
                          >
                            View on Google Jobs
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {searchResults.length > 0 && (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={searchJobsMutation.isPending}
                      >
                        {searchJobsMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Get More Jobs'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}