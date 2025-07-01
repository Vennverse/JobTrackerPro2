import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Building, Users, MessageSquare, Eye, Plus, CheckCircle, Star, 
  Download, FileText, MapPin, Mail, Phone, Calendar, Target,
  TrendingUp, Clock, Filter, Search, ChevronDown, Briefcase,
  UserCheck, Award, BarChart3, Activity, DollarSign, Globe,
  Zap, Sparkles, ThumbsUp, AlertCircle, PlayCircle, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MergedRecruiterDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedCandidateData, setSelectedCandidateData] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  // Data fetching with real API endpoints
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/recruiter/jobs'],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/recruiter/applications'],
  });

  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/recruiter/analytics'],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/chat/conversations'],
  });

  // Mutations
  const updateApplicationMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!selectedApplication) return;
      return apiRequest("PATCH", `/api/recruiter/applications/${selectedApplication.id}`, {
        status,
        recruiterNotes,
        reviewedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Updated",
        description: "Application status has been updated successfully",
      });
      setSelectedApplication(null);
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/analytics'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      toast({
        title: "Job Deleted",
        description: "Job posting has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete job posting",
        variant: "destructive",
      });
    },
  });

  // Filter applications
  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = !searchTerm || 
      (app.applicantData?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.applicantData?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.applicantData?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesJob = jobFilter === "all" || app.jobPostingId.toString() === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Handle application updates
  const handleUpdateApplication = (status: string) => {
    updateApplicationMutation.mutate(status);
  };

  // Get analytics data with fallbacks
  const analyticsData = analytics.overview || {};
  const statusCounts = analytics.applicationsByStatus || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                Recruiter Dashboard
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Manage your job postings and track candidate applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button 
                onClick={() => setLocation('/recruiter/post-job')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Analytics KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Jobs</p>
                  <p className="text-3xl font-bold">{jobPostings.length}</p>
                  <p className="text-blue-100 text-xs flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +{analyticsData.monthlyGrowth || 0}% this month
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Applications</p>
                  <p className="text-3xl font-bold">{applications.length}</p>
                  <p className="text-green-100 text-xs flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +{analyticsData.weeklyGrowth || 0}% this week
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Interviews</p>
                  <p className="text-3xl font-bold">{analyticsData.thisWeekInterviews || 0}</p>
                  <p className="text-purple-100 text-xs flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    This week
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Time to Hire</p>
                  <p className="text-3xl font-bold">{analyticsData.averageTimeToHire || 0}</p>
                  <p className="text-orange-100 text-xs flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Days average
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold">{analyticsData.successRate || 0}%</p>
                  <p className="text-emerald-100 text-xs flex items-center gap-1 mt-1">
                    <Award className="w-3 h-3" />
                    Above target
                  </p>
                </div>
                <ThumbsUp className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="conversations">Messages</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by Job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      {jobPostings.map((job: any) => (
                        <SelectItem key={job.id} value={job.id.toString()}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Applications ({filteredApplications.length})</span>
                  <Badge variant="outline">{filteredApplications.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading applications...</p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-6">Your job postings haven't received any applications yet.</p>
                    <Button onClick={() => setLocation('/recruiter/post-job')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application: any) => {
                      const applicantData = application.applicantData || {};
                      const profile = applicantData.profile || {};
                      const user = applicantData.user || {};
                      
                      return (
                        <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback>
                                  {profile.firstName?.[0] || user.email?.[0] || 'U'}
                                  {profile.lastName?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">
                                    {profile.firstName && profile.lastName 
                                      ? `${profile.firstName} ${profile.lastName}`
                                      : user.email || 'Unknown Applicant'
                                    }
                                  </h4>
                                  <Badge variant="outline">
                                    {application.status || 'pending'}
                                  </Badge>
                                  {application.matchScore && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-500" />
                                      <span className="font-semibold">{application.matchScore}%</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {profile.currentJobTitle || 'Job Title Not Specified'}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Date unknown'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/recruiter/applicant/${application.applicantId}`, {
                                      credentials: 'include'
                                    });
                                    if (response.ok) {
                                      const candidateData = await response.json();
                                      setSelectedCandidateData(candidateData);
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to load candidate details",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/recruiter/resume/download/${application.id}`, {
                                      credentials: 'include'
                                    });
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${profile.firstName || 'candidate'}_resume.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                      
                                      toast({
                                        title: "Resume Downloaded",
                                        description: "Resume has been downloaded successfully",
                                      });
                                    } else {
                                      throw new Error('Failed to download resume');
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Download Failed",
                                      description: "Failed to download resume",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Resume
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedApplication(application);
                                      setApplicationStatus(application.status || "pending");
                                      setRecruiterNotes(application.recruiterNotes || "");
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Review Application</DialogTitle>
                                    <DialogDescription>
                                      Update the status and add notes for this application
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="status">Application Status</Label>
                                      <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending Review</SelectItem>
                                          <SelectItem value="reviewed">Reviewed</SelectItem>
                                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                          <SelectItem value="interviewed">Interviewed</SelectItem>
                                          <SelectItem value="hired">Hired</SelectItem>
                                          <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="notes">Recruiter Notes</Label>
                                      <Textarea
                                        id="notes"
                                        placeholder="Add your notes about this candidate..."
                                        value={recruiterNotes}
                                        onChange={(e) => setRecruiterNotes(e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                    
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        onClick={() => handleUpdateApplication(applicationStatus)}
                                        disabled={updateApplicationMutation.isPending}
                                      >
                                        {updateApplicationMutation.isPending ? "Updating..." : "Update Status"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setLocation(`/chat?with=${application.applicantId}&context=application_${application.id}`);
                                }}
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Postings Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Job Postings ({jobPostings.length})</span>
                  <Button onClick={() => setLocation('/recruiter/post-job')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading jobs...</p>
                  </div>
                ) : jobPostings.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Postings</h3>
                    <p className="text-gray-600 mb-6">You haven't posted any jobs yet.</p>
                    <Button onClick={() => setLocation('/recruiter/post-job')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobPostings.map((job: any) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                <MapPin className="w-4 h-4" />
                                {job.location || 'Location not specified'}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {job.applicationsCount || 0} applications
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {job.viewsCount || 0} views
                                </span>
                              </div>
                            </div>
                            <Badge variant={job.isActive ? "default" : "secondary"}>
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setLocation(`/jobs/${job.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setLocation(`/recruiter/edit-job/${job.id}`)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteJobMutation.mutate(job.id)}
                              disabled={deleteJobMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="conversations" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Conversations ({conversations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conversations Yet</h3>
                    <p className="text-gray-600">Start messaging candidates from their applications.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation: any) => (
                      <div 
                        key={conversation.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/chat?conversationId=${conversation.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {conversation.otherParticipant?.email?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {conversation.otherParticipant?.email || 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {conversation.updatedAt && new Date(conversation.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Candidate Detail Modal */}
      <Dialog open={!!selectedCandidateData} onOpenChange={() => setSelectedCandidateData(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCandidateData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {selectedCandidateData.profile?.firstName?.[0] || selectedCandidateData.user?.email?.[0] || 'U'}
                      {selectedCandidateData.profile?.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedCandidateData.profile?.firstName && selectedCandidateData.profile?.lastName 
                        ? `${selectedCandidateData.profile.firstName} ${selectedCandidateData.profile.lastName}`
                        : selectedCandidateData.user?.email || 'Unknown Candidate'
                      }
                    </h3>
                    <p className="text-gray-600">
                      {selectedCandidateData.profile?.currentJobTitle || 'Job Title Not Specified'}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedCandidateData.user?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm">{selectedCandidateData.profile?.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm">{selectedCandidateData.profile?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Expected Salary</Label>
                      <p className="text-sm">{selectedCandidateData.profile?.expectedSalary || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCandidateData.skills && selectedCandidateData.skills.length > 0 ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Skills</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCandidateData.skills.map((skill: any, index: number) => (
                              <Badge key={index} variant="secondary">
                                {skill.skillName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No skills information available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}