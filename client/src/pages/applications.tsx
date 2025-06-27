import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { ApplicationsTable } from "@/components/applications-table";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Target,
  Briefcase,
  ExternalLink,
  RefreshCw
} from "lucide-react";

export default function Applications() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newApplication, setNewApplication] = useState({
    company: "",
    jobTitle: "",
    jobUrl: "",
    location: "",
    workMode: "",
    salary: "",
    status: "applied",
    appliedDate: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const queryClient = useQueryClient();

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

  const { data: jobAnalyses } = useQuery({
    queryKey: ["/api/jobs/analyses"],
    retry: false,
  });

  // Add application mutation
  const addApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const response = await apiRequest("POST", "/api/applications", applicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/stats"] });
      setShowAddDialog(false);
      setNewApplication({
        company: "",
        jobTitle: "",
        jobUrl: "",
        location: "",
        workMode: "",
        salary: "",
        status: "applied",
        appliedDate: new Date().toISOString().split('T')[0],
        notes: ""
      });
      toast({
        title: "Success",
        description: "Application added successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add application",
        variant: "destructive",
      });
    },
  });

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newApplication.company || !newApplication.jobTitle) {
      toast({
        title: "Validation Error",
        description: "Company and job title are required",
        variant: "destructive",
      });
      return;
    }

    addApplicationMutation.mutate(newApplication);
  };

  // Mock enhanced stats for demonstration
  const enhancedStats = {
    ...stats,
    weeklyApplications: 12,
    responseTime: "3.2 days",
    topCompanies: ["TechCorp", "StartupXYZ", "BigTech Inc"],
    averageMatchScore: 82,
    interviewConversionRate: 15,
    followUpRate: 75
  };

  const filteredApplications = applications?.filter((app: any) => {
    const matchesSearch = app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Job Applications</h1>
                <p className="text-muted-foreground">
                  Track and manage all your job applications in one place
                </p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Application</DialogTitle>
                    <DialogDescription>
                      Manually track a job application you've submitted.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddApplication}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Company *</Label>
                          <Input
                            id="company"
                            value={newApplication.company}
                            onChange={(e) => setNewApplication({...newApplication, company: e.target.value})}
                            placeholder="Company name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="jobTitle">Job Title *</Label>
                          <Input
                            id="jobTitle"
                            value={newApplication.jobTitle}
                            onChange={(e) => setNewApplication({...newApplication, jobTitle: e.target.value})}
                            placeholder="Position title"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="jobUrl">Job URL</Label>
                        <Input
                          id="jobUrl"
                          value={newApplication.jobUrl}
                          onChange={(e) => setNewApplication({...newApplication, jobUrl: e.target.value})}
                          placeholder="https://..."
                          type="url"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newApplication.location}
                            onChange={(e) => setNewApplication({...newApplication, location: e.target.value})}
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <Label htmlFor="workMode">Work Mode</Label>
                          <Select value={newApplication.workMode} onValueChange={(value) => setNewApplication({...newApplication, workMode: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="onsite">On-site</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={newApplication.status} onValueChange={(value) => setNewApplication({...newApplication, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="offer">Offer</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="appliedDate">Applied Date</Label>
                          <Input
                            id="appliedDate"
                            type="date"
                            value={newApplication.appliedDate}
                            onChange={(e) => setNewApplication({...newApplication, appliedDate: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input
                          id="salary"
                          value={newApplication.salary}
                          onChange={(e) => setNewApplication({...newApplication, salary: e.target.value})}
                          placeholder="e.g., $80k - $120k"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newApplication.notes}
                          onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                          placeholder="Additional notes about this application..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addApplicationMutation.isPending}>
                        {addApplicationMutation.isPending ? "Adding..." : "Add Application"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} isLoading={statsLoading} />
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search companies, positions..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Applications</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {applications?.length || 0} total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ApplicationsTable 
                applications={applications || []} 
                isLoading={applicationsLoading}
                showActions={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
