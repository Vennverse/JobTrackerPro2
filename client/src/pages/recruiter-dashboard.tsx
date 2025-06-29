import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Briefcase, Users, MessageSquare, Eye, Calendar, Building, Star, FileText, Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function RecruiterDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");

  // Fetch recruiter's job postings
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/recruiter/jobs'],
  });

  // Fetch applications for recruiter's jobs
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/recruiter/applications'],
  });

  // Fetch chat conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/chat/conversations'],
  });

  // Mutation for updating application status
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status, notes }: { applicationId: number; status: string; notes?: string }) => {
      return await apiRequest("PUT", `/api/recruiter/applications/${applicationId}`, {
        status,
        recruiterNotes: notes,
        reviewedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Updated",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update application status.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateApplication = (status: string) => {
    if (selectedApplication) {
      updateApplicationMutation.mutate({
        applicationId: selectedApplication.id,
        status,
        notes: recruiterNotes,
      });
    }
  };

  const openApplicationDialog = (application: any) => {
    setSelectedApplication(application);
    setApplicationStatus(application.status || "pending");
    setRecruiterNotes(application.recruiterNotes || "");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building className="w-8 h-8 text-blue-600" />
                Recruiter Dashboard
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  ✓ Verified
                </Badge>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your job postings and connect with talented candidates
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/recruiter/post-job')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobPostings.length}</p>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-sm text-gray-600">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{conversations.length}</p>
                  <p className="text-sm text-gray-600">Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {jobPostings.reduce((total: number, job: any) => total + (job.viewsCount || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="chat">Messages</TabsTrigger>
          </TabsList>

          {/* Job Postings Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Job Postings</CardTitle>
                    <CardDescription>Manage and track your job listings</CardDescription>
                  </div>
                  <Button onClick={() => setLocation('/recruiter/post-job')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : jobPostings.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No job postings yet</h3>
                    <p className="text-gray-600 mb-4">Create your first job posting to start finding candidates</p>
                    <Button onClick={() => setLocation('/recruiter/post-job')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobPostings.map((job: any) => (
                      <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <Badge variant={job.isActive ? "default" : "secondary"}>
                                {job.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{job.companyName}</p>
                            <p className="text-sm text-gray-500 mb-3">
                              {job.location} • {job.workMode} • {job.jobType}
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
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setLocation(`/recruiter/edit-job/${job.id}`)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Applications</CardTitle>
                <CardDescription>Review and manage applications to your job postings</CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600">Applications will appear here once candidates apply to your jobs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">Candidate Application</h3>
                              <Badge variant="outline">{application.status}</Badge>
                              {application.matchScore && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {application.matchScore}% match
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Applied: {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                            {application.coverLetter && (
                              <p className="text-sm text-gray-700 mb-2">
                                "{application.coverLetter.substring(0, 100)}..."
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Application Details</DialogTitle>
                                  <DialogDescription>
                                    Review candidate application and update status
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Applied Date</Label>
                                      <p className="text-sm text-gray-600">{new Date(application.appliedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Status</Label>
                                      <Badge variant="outline" className="ml-2">{application.status}</Badge>
                                    </div>
                                  </div>
                                  
                                  {application.matchScore && (
                                    <div>
                                      <Label className="text-sm font-medium">Match Score</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${application.matchScore}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-medium">{application.matchScore}%</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {application.coverLetter && (
                                    <div>
                                      <Label className="text-sm font-medium">Cover Letter</Label>
                                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                        {application.coverLetter}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {application.recruiterNotes && (
                                    <div>
                                      <Label className="text-sm font-medium">Previous Notes</Label>
                                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                        {application.recruiterNotes}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openApplicationDialog(application)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Application Status</DialogTitle>
                                  <DialogDescription>
                                    Change the status of this application and add notes
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
                                    <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                                      Cancel
                                    </Button>
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
                                toast({
                                  title: "Message Feature",
                                  description: "Direct messaging will be available in the next update.",
                                });
                              }}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Chat with candidates and manage conversations</CardDescription>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-600">Start chatting with candidates who apply to your jobs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation: any) => (
                      <div key={conversation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Conversation</h3>
                            <p className="text-sm text-gray-600">
                              Last message: {new Date(conversation.lastMessageAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">Open Chat</Button>
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
    </div>
  );
}