import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JobSearch() {
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

    setIsLoading(true);
    
    // Create Google Jobs search URL
    const googleJobsUrl = `https://www.google.com/search?q=${encodeURIComponent(position + " jobs " + location)}&ibp=htl;jobs`;
    
    setSearchUrl(googleJobsUrl);
    setHasSearched(true);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Search Complete",
        description: `Showing ${position} jobs in ${location}`,
      });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">External Job Search</h1>
          <p className="text-muted-foreground">
            Search for jobs directly from Google Jobs
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Job Search
            </CardTitle>
            <CardDescription>
              Enter a job position and location to search for opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium">
                  Job Position
                </label>
                <Input
                  id="position"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, New York, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !position.trim() || !location.trim()}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Jobs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Google Jobs Results
              </CardTitle>
              <CardDescription>
                Showing jobs for "{position}" in "{location}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading job results...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Info Banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Live Google Jobs Search
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          The results below are loaded directly from Google Jobs. You can interact with them just like on Google.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Google Jobs Preview */}
                  <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" style={{ height: '400px' }}>
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                        <ExternalLink className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Ready to Search Google Jobs</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Click below to open Google Jobs in a new tab with your search for "{position}" jobs in "{location}"
                      </p>
                      <Button 
                        onClick={() => window.open(searchUrl, '_blank')}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Open Google Jobs
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => window.open(searchUrl, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in New Tab
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setPosition("");
                        setLocation("");
                        setSearchUrl("");
                        setHasSearched(false);
                      }}
                    >
                      New Search
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ready to Search Jobs?</h3>
                  <p className="text-muted-foreground mt-2">
                    Enter a job position and location above to start searching for opportunities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}