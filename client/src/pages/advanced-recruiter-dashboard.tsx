import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Star, 
  Search, 
  Filter,
  Calendar,
  MessageCircle,
  Brain,
  Award,
  Eye,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  Zap,
  FileText,
  BarChart3,
  TrendingDown,
  UserCheck,
  Building,
  Timer,
  Percent,
  Lightbulb,
  Plus,
  Edit,
  Activity,
  Sparkles
} from 'lucide-react';

interface CandidateMatch {
  id: string;
  name: string;
  email: string;
  matchScore: number;
  skillMatchScore: number;
  joinProbability: number;
  engagementScore: number;
  flightRisk: 'low' | 'medium' | 'high';
  matchingSkills: string[];
  missingSkills: string[];
  experience: string;
  location: string;
  salary: string;
  lastActive: string;
  isContacted: boolean;
  recruiterRating?: number;
}

interface JobTemplate {
  id: number;
  templateName: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  experienceLevel: string;
  workMode: string;
  jobType: string;
  usageCount: number;
}

interface Interview {
  id: number;
  candidateName: string;
  jobTitle: string;
  interviewType: string;
  scheduledDate: string;
  duration: number;
  status: string;
  meetingLink?: string;
  location?: string;
  candidateConfirmed: boolean;
  score?: number;
  recommendation?: string;
}

interface Analytics {
  totalJobPostings: number;
  totalApplications: number;
  avgApplicationsPerJob: number;
  applicationsThisMonth: number;
  applicationsByStatus: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    interview: number;
    hired: number;
    rejected: number;
  };
  weeklyApplications: number[];
  weeklyHires: number[];
  timeToHire: number;
  offerAcceptanceRate: number;
  topSkills: string[];
  sourceEffectiveness: Array<{
    source: string;
    applications: number;
    hires: number;
  }>;
}

interface AIInsights {
  insights: Array<{
    title: string;
    insight: string;
    type: string;
    priority: string;
    actionable: boolean;
  }>;
  performanceMetrics: {
    applicationConversionRate: number;
    interviewShowRate: number;
    offerAcceptanceRate: number;
    candidateSatisfactionScore: number;
  };
  recommendations: string[];
}

export default function AdvancedRecruiterDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    experienceLevel: '',
    location: '',
    skillMatch: '',
    availability: ''
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  // Fetch all dashboard data with proper typing
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery<any[]>({
    queryKey: ['/api/recruiter/jobs'],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<any[]>({
    queryKey: ['/api/recruiter/applications'],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<any[]>({
    queryKey: ['/api/chat/conversations'],
  });

  const { data: candidateMatches = [], isLoading: matchesLoading } = useQuery<CandidateMatch[]>({
    queryKey: ['/api/recruiter/candidate-matches'],
    enabled: true
  });

  const { data: jobTemplates = [], isLoading: templatesLoading } = useQuery<JobTemplate[]>({
    queryKey: ['/api/recruiter/job-templates'],
    enabled: true
  });

  const { data: interviews = [], isLoading: interviewsLoading } = useQuery<Interview[]>({
    queryKey: ['/api/recruiter/interviews'],
    enabled: true
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/recruiter/analytics'],
    enabled: true
  });

  const { data: aiInsights, isLoading: insightsLoading } = useQuery<AIInsights>({
    queryKey: ['/api/recruiter/ai-insights'],
    enabled: true
  });

  // Get applicant details when selected
  const { data: applicantDetails, isLoading: applicantLoading } = useQuery({
    queryKey: [`/api/recruiter/applicant/${selectedApplicantId}`],
    enabled: !!selectedApplicantId,
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

  // Filter candidates based on search and filters
  const filteredCandidates = (candidateMatches || []).filter((candidate) => {
    if (!candidate) return false;
    
    const matchesSearch = (candidate.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!selectedFilters.experienceLevel || selectedFilters.experienceLevel === 'all' || (candidate.experience || '').includes(selectedFilters.experienceLevel)) &&
      (!selectedFilters.location || selectedFilters.location === 'all' || (candidate.location || '').includes(selectedFilters.location)) &&
      (!selectedFilters.skillMatch || selectedFilters.skillMatch === 'all' || (candidate.matchScore || 0) >= parseInt(selectedFilters.skillMatch || '0'));
    
    return matchesSearch && matchesFilters;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getFlightRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (matchesLoading || templatesLoading || interviewsLoading || analyticsLoading || insightsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your recruiter dashboard...</p>
        </div>
      </div>
    );
  }



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
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Manage job postings, track applications, and find the best candidates
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
                Post New Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <MessageCircle className="w-6 h-6 text-purple-600" />
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Job Postings</p>
                <p className="text-2xl font-bold">{analytics?.totalJobPostings || 0}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{analytics?.totalApplications || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Quality Matches</p>
                <p className="text-2xl font-bold">{(candidateMatches || []).filter(m => (m?.matchScore || 0) >= 80).length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interviews Scheduled</p>
                <p className="text-2xl font-bold">{(interviews || []).filter(i => i?.status === 'scheduled').length}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="matches">AI Matches</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Job Postings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Recent Job Postings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobPostings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No job postings yet</p>
                    <Button 
                      className="mt-3"
                      onClick={() => setLocation('/recruiter/post-job')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobPostings.slice(0, 3).map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.companyName}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{job.status || 'Active'}</Badge>
                          <p className="text-xs text-gray-500 mt-1">{job.viewsCount || 0} views</p>
                        </div>
                      </div>
                    ))}
                    {jobPostings.length > 3 && (
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('jobs')}>
                        View All {jobPostings.length} Jobs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No applications yet</p>
                    <p className="text-sm">Applications will appear when candidates apply to your jobs</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{app.candidateName || 'Candidate'}</h4>
                          <p className="text-sm text-gray-600">{app.jobTitle}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                            {app.status || 'pending'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {applications.length > 3 && (
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('applications')}>
                        View All {applications.length} Applications
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Postings Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Job Postings</h3>
            <Button onClick={() => setLocation('/recruiter/post-job')}>
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>
          
          {jobPostings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No job postings yet</h3>
                <p className="text-gray-600 mb-6">Start attracting top talent by posting your first job</p>
                <Button onClick={() => setLocation('/recruiter/post-job')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobPostings.map((job: any) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-4">{job.companyName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location || 'Remote'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {job.viewsCount || 0} views
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {applications.filter((app: any) => app.jobPostingId === job.id).length} applications
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status || 'Active'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Job Applications</h3>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
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
            </div>
          </div>

          {applications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6">Applications will appear here when candidates apply to your job postings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {applications.map((application: any) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{application.candidateName || 'Candidate'}</h3>
                        <p className="text-gray-600 mb-2">{application.jobTitle}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Recently'}
                          </div>
                          {application.matchScore && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {application.matchScore}% match
                            </div>
                          )}
                        </div>
                        {application.recruiterNotes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Notes:</strong> {application.recruiterNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
                          {application.status || 'pending'}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openApplicationDialog(application)}
                            >
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
                                <label className="text-sm font-medium">Status</label>
                                <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                    <SelectItem value="interviewed">Interviewed</SelectItem>
                                    <SelectItem value="hired">Hired</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea 
                                  value={recruiterNotes}
                                  onChange={(e) => setRecruiterNotes(e.target.value)}
                                  placeholder="Add your notes about this candidate..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleUpdateApplication(applicationStatus)}
                                  disabled={updateApplicationMutation.isPending}
                                >
                                  {updateApplicationMutation.isPending ? 'Updating...' : 'Update Application'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search candidates by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedFilters.experienceLevel} onValueChange={(value) => setSelectedFilters({...selectedFilters, experienceLevel: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Entry">Entry Level</SelectItem>
                  <SelectItem value="Mid">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior Level</SelectItem>
                  <SelectItem value="Lead">Lead Level</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedFilters.skillMatch} onValueChange={(value) => setSelectedFilters({...selectedFilters, skillMatch: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Match Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="90">90%+ Match</SelectItem>
                  <SelectItem value="80">80%+ Match</SelectItem>
                  <SelectItem value="70">70%+ Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {candidate.email}
                      </CardDescription>
                    </div>
                    <Badge className={`${getMatchScoreColor(candidate.matchScore)} text-white`}>
                      {candidate.matchScore}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium">{candidate.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {candidate.location}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Skills Match</p>
                    <div className="flex flex-wrap gap-1">
                      {(candidate.matchingSkills || []).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Join Probability</p>
                      <p className="font-medium text-green-600">{candidate.joinProbability}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Engagement</p>
                      <p className="font-medium">{candidate.engagementScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Flight Risk</p>
                      <Badge className={getFlightRiskColor(candidate.flightRisk)} variant="outline">
                        {candidate.flightRisk}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-2 text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-500">No candidate matches available yet. Candidates will appear here as applications are received.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {analytics && analytics.applicationsByStatus && Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
              <Card key={status}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-gray-600 capitalize">{status}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(interviews || []).length > 0 ? (interviews || []).map((interview) => (
              <Card key={interview.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{interview.candidateName}</CardTitle>
                      <CardDescription>{interview.jobTitle}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(interview.status)} variant="outline">
                      {interview.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{interview.interviewType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{interview.scheduledDate}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{interview.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confirmed</p>
                      <p className="font-medium">{interview.candidateConfirmed ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  {interview.score && (
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="font-medium">{interview.score}/100</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-2 text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
                <p className="text-gray-500">Interview schedules will appear here once candidates progress in the pipeline.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Time to Hire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.timeToHire || 0} days</div>
                <p className="text-sm text-gray-600">Average time to hire</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Offer Acceptance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.offerAcceptanceRate || 0}%</div>
                <p className="text-sm text-gray-600">Candidates accepting offers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Applications/Job</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.avgApplicationsPerJob || 0}</div>
                <p className="text-sm text-gray-600">Applications per job posting</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights && aiInsights.performanceMetrics && Object.entries(aiInsights.performanceMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiInsights?.recommendations?.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            {aiInsights?.insights?.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{insight.insight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}