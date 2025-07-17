import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Briefcase,
  Users,
  MessageSquare,
  Eye,
  Calendar,
  Building,
  Star,
  FileText,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  User,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  MessageCircle,
  Share2,
  Zap,
  Copy,
  ExternalLink,
  Video,
  Code,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RecruiterNavbar } from "@/components/RecruiterNavbar";

export default function RecruiterDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  );
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumePreview, setResumePreview] = useState("");
  const [jobCompatibility, setJobCompatibility] = useState<any>(null);
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedJobForShare, setSelectedJobForShare] = useState<any>(null);
  const [shareLink, setShareLink] = useState("");
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [selectedJobForPromote, setSelectedJobForPromote] = useState<any>(null);

  // Fetch recruiter's job postings
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/recruiter/jobs"],
  });

  // Fetch applications for recruiter's jobs
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/recruiter/applications"],
  });

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Fetch chat conversations
  const { data: conversations = [], isLoading: conversationsLoading } =
    useQuery({
      queryKey: ["/api/chat/conversations"],
    });

  // Fetch applicant details when selected
  const { data: applicantDetails, isLoading: applicantLoading } = useQuery({
    queryKey: [`/api/recruiter/applicant/${selectedApplicantId}`],
    enabled: !!selectedApplicantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Get job compatibility analysis
  const getJobCompatibility = async (applicantId: string, jobId: number) => {
    try {
      const response = await fetch(
        `/api/recruiter/job-compatibility/${applicantId}/${jobId}`,
        {
          credentials: "include",
        },
      );
      return response.json();
    } catch (error) {
      console.error("Failed to get job compatibility:", error);
      return null;
    }
  };

  // Mutation for updating application status
  const updateApplicationMutation = useMutation({
    mutationFn: async ({
      applicationId,
      status,
      notes,
    }: {
      applicationId: number;
      status: string;
      notes?: string;
    }) => {
      return await apiRequest(
        `/api/recruiter/applications/${applicationId}`,
        "PUT",
        {
          status,
          recruiterNotes: notes,
          reviewedAt: new Date().toISOString(),
        },
      );
    },
    onSuccess: () => {
      toast({
        title: "Application Updated",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/recruiter/applications"],
      });
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



  // Mutation for generating shareable links
  const shareJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest("POST", `/api/recruiter/jobs/${jobId}/share`);
    },
    onSuccess: (data: any) => {
      setShareLink(data.shareableLink);
      toast({
        title: "Share Link Generated",
        description: "Your job posting is now ready to share!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Share Failed",
        description: error.message || "Failed to generate share link.",
        variant: "destructive",
      });
    },
  });

  // Mutation for promoting jobs
  const promoteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest("POST", `/api/recruiter/jobs/${jobId}/promote`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Job Promotion Ready",
        description: "Complete payment to promote your job posting.",
      });
      // Handle Stripe payment flow here
    },
    onError: (error: any) => {
      toast({
        title: "Promotion Failed",
        description: error.message || "Failed to create job promotion.",
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
      <RecruiterNavbar user={user} />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Interview Assignment Feature Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interview Assignment System</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Assign Virtual AI Interviews & Mock Coding Tests to candidates with automated notifications
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Video className="w-3 h-3 mr-1" />
                      Virtual AI Interviews
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Code className="w-3 h-3 mr-1" />
                      Mock Coding Tests
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/recruiter/interview-assignments")}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                size="lg"
              >
                <Video className="w-4 h-4 mr-2" />
                Assign Interviews
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Targeting Feature Card */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Premium Candidate Targeting</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Target ideal candidates with precision - Education, Skills, Experience, Clubs & More
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <Star className="w-3 h-3 mr-1" />
                      Revenue Generator
                    </Badge>
                    <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                      $99-$300+ per posting
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/premium-targeting")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Launch Targeting
              </Button>
            </div>
          </CardContent>
        </Card>

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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/chat')}>
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
                    {jobPostings.reduce(
                      (total: number, job: any) =>
                        total + (job.viewsCount || 0),
                      0,
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="chat">Messages</TabsTrigger>
          </TabsList>

          {/* Job Postings Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Job Postings</CardTitle>
                    <CardDescription>
                      Manage and track your job listings
                    </CardDescription>
                  </div>
                  <Button onClick={() => setLocation("/recruiter/post-job")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse border rounded-lg p-4"
                      >
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : jobPostings.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No job postings yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first job posting to start finding candidates
                    </p>
                    <Button onClick={() => setLocation("/recruiter/post-job")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobPostings.map((job: any) => (
                      <div
                        key={job.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {job.title}
                              </h3>
                              <Badge
                                variant={job.isActive ? "default" : "secondary"}
                              >
                                {job.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">
                              {job.companyName}
                            </p>
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
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(`/jobs/${job.id}`, "_blank")
                              }
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setLocation(`/recruiter/edit-job/${job.id}`)
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJobForShare(job);
                                setShowShareDialog(true);
                              }}
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJobForPromote(job);
                                setShowPromoteDialog(true);
                              }}
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              Promote ($10)
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
                <CardDescription>
                  Review and manage applications to your job postings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Resume Download Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Quick Resume Access</h3>
                        <p className="text-sm text-blue-700">Download candidate resumes from applications</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                        <Download className="w-3 h-3 mr-1" />
                        Available below
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    💡 Tip: Click "Review" on any application below to access candidate resume and contact information
                  </div>
                </div>

                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse border rounded-lg p-4"
                      >
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-600">
                      Applications will appear here once candidates apply to
                      your jobs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {application.applicantName || `${application.applicantFirstName || ''} ${application.applicantLastName || ''}`.trim() || 'Candidate'}
                              </h3>
                              <Badge variant="outline">
                                {application.status}
                              </Badge>
                              {application.matchScore && (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  <Star className="w-3 h-3" />
                                  {application.matchScore}% match
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Job:</strong> {application.jobPostingTitle || 'Job Title'} at {application.jobPostingCompany || 'Company'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Applied:{" "}
                              {new Date(
                                application.appliedAt,
                              ).toLocaleDateString()}
                            </p>
                            {application.coverLetter && (
                              <p className="text-sm text-gray-700 mb-2">
                                "{application.coverLetter.substring(0, 100)}..."
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog
                              open={
                                selectedApplicantId === application.applicantId
                              }
                              onOpenChange={(open) => {
                                if (open) {
                                  setSelectedApplicantId(
                                    application.applicantId,
                                  );
                                } else {
                                  setSelectedApplicantId(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Candidate Profile & Application Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete candidate information and
                                    application details
                                  </DialogDescription>
                                </DialogHeader>
                                {applicantLoading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                  </div>
                                ) : applicantDetails ? (
                                  <div className="space-y-6">
                                    {/* Basic Info */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                          <User className="w-5 h-5" />
                                          Candidate Information
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Full Name
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile
                                                ?.fullName ||
                                                `${applicantDetails.user?.firstName || ""} ${applicantDetails.user?.lastName || ""}`.trim() ||
                                                "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Email
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.user?.email ||
                                                "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Phone
                                            </Label>
                                            <p className="text-sm text-gray-700 flex items-center gap-1">
                                              <Phone className="w-3 h-3" />
                                              {applicantDetails.profile
                                                ?.phone || "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Location
                                            </Label>
                                            <p className="text-sm text-gray-700 flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {applicantDetails.profile
                                                ?.location ||
                                                `${applicantDetails.profile?.city || ""}, ${applicantDetails.profile?.state || ""}`.replace(
                                                  /^,\s*/,
                                                  "",
                                                ) ||
                                                "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Professional Title
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile
                                                ?.professionalTitle ||
                                                "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Years of Experience
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile?.yearsExperience || "Not specified"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Expected Salary
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile?.expectedSalary || "Not specified"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Work Authorization
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile?.workAuthorization || "Not specified"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Preferred Job Type
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile?.preferredJobType || "Not specified"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Willing to Relocate
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile?.willingToRelocate ? "Yes" : "No"}
                                            </p>
                                          </div>
                                          <div className="col-span-2">
                                            <Label className="text-sm font-medium">
                                              Professional Summary
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile?.summary || "No summary provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Years of Experience
                                            </Label>
                                            <p className="text-sm text-gray-700">
                                              {applicantDetails.profile
                                                ?.yearsExperience || 0}{" "}
                                              years
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Application Details */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>
                                          Application Information
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Applied Date
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                              {new Date(
                                                application.appliedAt,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Status
                                            </Label>
                                            <Badge
                                              variant="outline"
                                              className="ml-2"
                                            >
                                              {application.status}
                                            </Badge>
                                          </div>
                                        </div>

                                        {application.matchScore && (
                                          <div className="mb-4">
                                            <Label className="text-sm font-medium">
                                              Match Score
                                            </Label>
                                            <div className="flex items-center gap-2 mt-1">
                                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                  className="bg-blue-600 h-2 rounded-full"
                                                  style={{
                                                    width: `${application.matchScore}%`,
                                                  }}
                                                ></div>
                                              </div>
                                              <span className="text-sm font-medium">
                                                {application.matchScore}%
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {application.coverLetter && (
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Cover Letter
                                            </Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                              {application.coverLetter}
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {/* Resume */}
                                    {true && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Resume & Documents
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-3">
                                            {applicantDetails.resumes && applicantDetails.resumes.length > 0 ? (
                                              applicantDetails.resumes.map((resume: any, index: number) => (
                                                <div key={resume.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                                                  <div className="flex-1">
                                                    <p className="font-medium">
                                                      {resume.filename || `Resume_${index + 1}.pdf`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                      {resume.atsScore && `ATS Score: ${resume.atsScore}/100`}
                                                      {resume.uploadedAt && ` • Uploaded ${new Date(resume.uploadedAt).toLocaleDateString()}`}
                                                    </p>
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={async () => {
                                                        try {
                                                          const response =
                                                            await fetch(
                                                              `/api/resumes/download/${resume.id}`,
                                                              {
                                                                credentials: "include",
                                                              },
                                                            );
                                                          if (response.ok) {
                                                            const blob = await response.blob();
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement("a");
                                                            a.href = url;
                                                            a.download = resume.filename || "resume.pdf";
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            window.URL.revokeObjectURL(url);
                                                            document.body.removeChild(a);
                                                          } else {
                                                            toast({
                                                            title:
                                                              "Download Failed",
                                                            description:
                                                              "Resume not available for download",
                                                            variant:
                                                              "destructive",
                                                          });
                                                        }
                                                      } catch (error) {
                                                        toast({
                                                          title:
                                                            "Download Failed",
                                                          description:
                                                            "Failed to download resume",
                                                          variant: "destructive",
                                                        });
                                                      }
                                                    }}
                                                  >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                      setResumePreview(
                                                        resume.text ||
                                                          "Resume content not available",
                                                      );
                                                      setShowResumePreview(true);
                                                    }}
                                                  >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Preview
                                                  </Button>
                                                </div>
                                              </div>
                                              ))
                                            ) : (
                                              <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
                                                <div className="text-center">
                                                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                  <p className="text-gray-600 font-medium">No Resume Available</p>
                                                  <p className="text-sm text-gray-500 mt-1">
                                                    This candidate hasn't uploaded a resume yet.
                                                  </p>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Skills */}
                                    {applicantDetails.skills &&
                                      applicantDetails.skills.length > 0 && (
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <Award className="w-5 h-5" />
                                              Skills & Expertise
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                              {applicantDetails.skills.map(
                                                (skill: any) => (
                                                  <Badge
                                                    key={skill.id}
                                                    variant="secondary"
                                                  >
                                                    {skill.skillName}
                                                    {skill.proficiencyLevel &&
                                                      ` (${skill.proficiencyLevel})`}
                                                  </Badge>
                                                ),
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )}

                                    {/* Work Experience */}
                                    {applicantDetails.workExperience &&
                                      applicantDetails.workExperience.length >
                                        0 && (
                                        <Card>
                                          <CardHeader>
                                            <CardTitle>
                                              Work Experience
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-4">
                                              {applicantDetails.workExperience.map(
                                                (exp: any) => (
                                                  <div
                                                    key={exp.id}
                                                    className="border-l-2 border-blue-200 pl-4"
                                                  >
                                                    <h4 className="font-semibold">
                                                      {exp.jobTitle}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                      {exp.company}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                      {exp.startDate &&
                                                        new Date(
                                                          exp.startDate,
                                                        ).toLocaleDateString()}{" "}
                                                      -
                                                      {exp.endDate
                                                        ? new Date(
                                                            exp.endDate,
                                                          ).toLocaleDateString()
                                                        : "Present"}
                                                    </p>
                                                    {exp.description && (
                                                      <p className="text-sm mt-2">
                                                        {exp.description}
                                                      </p>
                                                    )}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )}

                                    {/* Education */}
                                    {applicantDetails.education &&
                                      applicantDetails.education.length > 0 && (
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <GraduationCap className="w-5 h-5" />
                                              Education
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-4">
                                              {applicantDetails.education.map(
                                                (edu: any) => (
                                                  <div
                                                    key={edu.id}
                                                    className="border-l-2 border-green-200 pl-4"
                                                  >
                                                    <h4 className="font-semibold">
                                                      {edu.degree}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                      {edu.institution}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                      {edu.fieldOfStudy &&
                                                        `Field: ${edu.fieldOfStudy}`}
                                                      {edu.gpa &&
                                                        ` • GPA: ${edu.gpa}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                      {edu.startDate &&
                                                        new Date(
                                                          edu.startDate,
                                                        ).toLocaleDateString()}{" "}
                                                      -
                                                      {edu.endDate
                                                        ? new Date(
                                                            edu.endDate,
                                                          ).toLocaleDateString()
                                                        : "Present"}
                                                    </p>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )}

                                    {/* Additional Profile Info */}
                                    {(applicantDetails.profile?.summary ||
                                      applicantDetails.profile
                                        ?.workAuthorization) && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle>
                                            Additional Information
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          {applicantDetails.profile
                                            ?.summary && (
                                            <div>
                                              <Label className="text-sm font-medium">
                                                Professional Summary
                                              </Label>
                                              <p className="text-sm text-gray-700 mt-1">
                                                {
                                                  applicantDetails.profile
                                                    .summary
                                                }
                                              </p>
                                            </div>
                                          )}
                                          {applicantDetails.profile
                                            ?.workAuthorization && (
                                            <div>
                                              <Label className="text-sm font-medium">
                                                Work Authorization
                                              </Label>
                                              <p className="text-sm text-gray-700">
                                                {
                                                  applicantDetails.profile
                                                    .workAuthorization
                                                }
                                              </p>
                                            </div>
                                          )}
                                          {applicantDetails.profile
                                            ?.linkedinUrl && (
                                            <div>
                                              <Label className="text-sm font-medium">
                                                LinkedIn
                                              </Label>
                                              <a
                                                href={
                                                  applicantDetails.profile
                                                    .linkedinUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                              >
                                                {
                                                  applicantDetails.profile
                                                    .linkedinUrl
                                                }
                                              </a>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Job Compatibility Analysis */}
                                    <Card>
                                      <CardHeader>
                                        <div className="flex items-center justify-between">
                                          <CardTitle className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            Job Compatibility Analysis
                                          </CardTitle>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                              setLoadingCompatibility(true);
                                              const compatibility =
                                                await getJobCompatibility(
                                                  application.applicantId,
                                                  application.jobPostingId,
                                                );
                                              setJobCompatibility(
                                                compatibility,
                                              );
                                              setLoadingCompatibility(false);
                                            }}
                                            disabled={loadingCompatibility}
                                          >
                                            {loadingCompatibility
                                              ? "Analyzing..."
                                              : "Analyze Fit"}
                                          </Button>
                                        </div>
                                      </CardHeader>
                                      <CardContent>
                                        {loadingCompatibility ? (
                                          <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                          </div>
                                        ) : jobCompatibility ? (
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <span className="text-sm font-medium">
                                                    Overall Match
                                                  </span>
                                                  <Badge
                                                    variant="secondary"
                                                    className="bg-blue-100 text-blue-700"
                                                  >
                                                    {jobCompatibility.matchScore ||
                                                      application.matchScore ||
                                                      0}
                                                    %
                                                  </Badge>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                  <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                      width: `${jobCompatibility.matchScore || application.matchScore || 0}%`,
                                                    }}
                                                  ></div>
                                                </div>
                                              </div>
                                            </div>

                                            {jobCompatibility.matchingSkills && (
                                              <div>
                                                <Label className="text-sm font-medium text-green-700">
                                                  Matching Skills
                                                </Label>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {jobCompatibility.matchingSkills
                                                    .slice(0, 5)
                                                    .map(
                                                      (
                                                        skill: string,
                                                        index: number,
                                                      ) => (
                                                        <Badge
                                                          key={index}
                                                          variant="secondary"
                                                          className="bg-green-100 text-green-700 text-xs"
                                                        >
                                                          {skill}
                                                        </Badge>
                                                      ),
                                                    )}
                                                </div>
                                              </div>
                                            )}

                                            {jobCompatibility.missingSkills && (
                                              <div>
                                                <Label className="text-sm font-medium text-orange-700">
                                                  Skills to Develop
                                                </Label>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {jobCompatibility.missingSkills
                                                    .slice(0, 5)
                                                    .map(
                                                      (
                                                        skill: string,
                                                        index: number,
                                                      ) => (
                                                        <Badge
                                                          key={index}
                                                          variant="secondary"
                                                          className="bg-orange-100 text-orange-700 text-xs"
                                                        >
                                                          {skill}
                                                        </Badge>
                                                      ),
                                                    )}
                                                </div>
                                              </div>
                                            )}

                                            {jobCompatibility.applicationRecommendation && (
                                              <div>
                                                <Label className="text-sm font-medium">
                                                  AI Recommendation
                                                </Label>
                                                <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-md">
                                                  {
                                                    jobCompatibility.applicationRecommendation
                                                  }
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-center py-4 text-gray-500">
                                            <p>
                                              Click "Analyze Fit" to get
                                              AI-powered compatibility analysis
                                            </p>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <p className="text-gray-600">
                                      Failed to load candidate details
                                    </p>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Dialog
                              open={selectedApplication?.id === application.id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setSelectedApplication(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setApplicationStatus(
                                      application.status || "pending",
                                    );
                                    setRecruiterNotes(
                                      application.recruiterNotes || "",
                                    );
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
                                    Update the status and add notes for this
                                    application
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="status">
                                      Application Status
                                    </Label>
                                    <Select
                                      value={applicationStatus}
                                      onValueChange={setApplicationStatus}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          Pending Review
                                        </SelectItem>
                                        <SelectItem value="reviewed">
                                          Reviewed
                                        </SelectItem>
                                        <SelectItem value="shortlisted">
                                          Shortlisted
                                        </SelectItem>
                                        <SelectItem value="interviewed">
                                          Interviewed
                                        </SelectItem>
                                        <SelectItem value="hired">
                                          Hired
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                          Rejected
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="notes">
                                      Recruiter Notes
                                    </Label>
                                    <Textarea
                                      id="notes"
                                      placeholder="Add your notes about this candidate..."
                                      value={recruiterNotes}
                                      onChange={(e) =>
                                        setRecruiterNotes(e.target.value)
                                      }
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setSelectedApplication(null)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleUpdateApplication(
                                          applicationStatus,
                                        )
                                      }
                                      disabled={
                                        updateApplicationMutation.isPending
                                      }
                                    >
                                      {updateApplicationMutation.isPending
                                        ? "Updating..."
                                        : "Update Status"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Message Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLocation(`/chat?user=${application.applicantId}`);
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
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

          {/* Tests Tab */}
          <TabsContent value="tests">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Test Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and assign skills assessments to candidates
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setLocation("/recruiter/test-assignments")}
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Assignments
                  </Button>
                  <Button
                    onClick={() => setLocation("/recruiter/test-management")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Tests
                  </Button>
                </div>
              </div>

              {/* Test Quick Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-sm text-gray-600">Test Templates</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-sm text-gray-600">Pending Tests</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-sm text-gray-600">Pass Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Getting Started Card */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Get Started with Skills Testing</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    Create custom tests or use our platform templates to assess candidate skills. 
                    Send tests via email and track results in real-time.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => setLocation("/recruiter/test-management")}
                      variant="outline"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                    <Button
                      onClick={() => setLocation("/recruiter/test-management")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Chat with candidates and manage conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse border rounded-lg p-4"
                      >
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-gray-600">
                      Start chatting with candidates who apply to your jobs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation: any) => (
                      <div
                        key={conversation.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Conversation</h3>
                            <p className="text-sm text-gray-600">
                              Last message:{" "}
                              {new Date(
                                conversation.lastMessageAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Open Chat
                          </Button>
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

      {/* Resume Preview Modal */}
      <Dialog open={showResumePreview} onOpenChange={setShowResumePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              Full text content of the candidate's resume
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
              {resumePreview || "No resume content available"}
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Share Job Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Job Posting</DialogTitle>
            <DialogDescription>
              Generate a shareable link for "{selectedJobForShare?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {shareLink ? (
              <div className="space-y-3">
                <div>
                  <Label>Shareable Link</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        toast({ title: "Link copied to clipboard!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Social Media Text</Label>
                  <Textarea
                    value={`🚀 Exciting opportunity at ${selectedJobForShare?.companyName}! We're hiring for ${selectedJobForShare?.title}. Apply now: ${shareLink}`}
                    readOnly
                    rows={3}
                    className="bg-gray-50"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowShareDialog(false);
                      setShareLink("");
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => window.open(shareLink, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Job Page
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Button
                  onClick={() => {
                    if (selectedJobForShare) {
                      shareJobMutation.mutate(selectedJobForShare.id);
                    }
                  }}
                  disabled={shareJobMutation.isPending}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {shareJobMutation.isPending ? "Generating..." : "Generate Share Link"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote Job Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Job Posting</DialogTitle>
            <DialogDescription>
              Boost "{selectedJobForPromote?.title}" with premium promotion for $10/month
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Premium Promotion Benefits</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Highlighted in search results</li>
                <li>• Shown to top job seekers via notifications</li>
                <li>• Increased visibility for 30 days</li>
                <li>• Priority placement in job recommendations</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">$10.00 USD</div>
              <p className="text-sm text-gray-600">One-time payment for 30 days of promotion</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPromoteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedJobForPromote) {
                    promoteJobMutation.mutate(selectedJobForPromote.id);
                  }
                }}
                disabled={promoteJobMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {promoteJobMutation.isPending ? "Processing..." : "Promote Job"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
