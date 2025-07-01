import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Building, Users, MessageSquare, Eye, Plus, CheckCircle, Star, 
  Download, FileText, MapPin, Mail, Phone, Calendar, Target,
  TrendingUp, Clock, Filter, Search, ChevronDown, Briefcase,
  UserCheck, Award, BarChart3, Activity, DollarSign, Globe,
  Zap, Sparkles, ThumbsUp, AlertCircle, PlayCircle
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Candidate {
  id: string;
  name: string;
  email: string;
  title: string;
  location: string;
  experience: number;
  skills: string[];
  avatar?: string;
  matchScore: number;
  status: string;
  appliedDate: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  source: string;
}

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  status: string;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
  salary: string;
  urgency: 'low' | 'medium' | 'high';
  remote: boolean;
}

interface Pipeline {
  stage: string;
  count: number;
  candidates: Candidate[];
}

export default function EnhancedRecruiterDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"pipeline" | "list" | "calendar">("pipeline");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Data fetching
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/recruiter/jobs'],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/recruiter/applications'],
  });

  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/recruiter/analytics'],
  });

  // Pipeline stages
  const pipelineStages = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
    { id: 'screening', name: 'Screening', color: 'bg-yellow-500' },
    { id: 'interview', name: 'Interview', color: 'bg-purple-500' },
    { id: 'offer', name: 'Offer', color: 'bg-green-500' },
    { id: 'hired', name: 'Hired', color: 'bg-emerald-500' },
    { id: 'rejected', name: 'Rejected', color: 'bg-red-500' }
  ];

  // Mock data for enhanced features
  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      title: 'Senior React Developer',
      location: 'San Francisco, CA',
      experience: 5,
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      matchScore: 95,
      status: 'interview',
      appliedDate: '2025-01-01',
      source: 'LinkedIn',
      expectedSalary: '$140k - $160k',
      noticePeriod: '2 weeks'
    },
    {
      id: '2', 
      name: 'Marcus Rodriguez',
      email: 'marcus.r@email.com',
      title: 'Full Stack Engineer',
      location: 'Austin, TX',
      experience: 3,
      skills: ['Vue.js', 'Python', 'Docker', 'AWS'],
      matchScore: 87,
      status: 'screening',
      appliedDate: '2025-01-01',
      source: 'Indeed',
      expectedSalary: '$110k - $130k',
      noticePeriod: '1 month'
    }
  ];

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    try {
      await apiRequest("POST", "/api/recruiter/bulk-actions", {
        candidateIds: selectedCandidates,
        action
      });
      
      toast({
        title: "Bulk Action Completed",
        description: `${action} applied to ${selectedCandidates.length} candidates`,
      });
      
      setSelectedCandidates([]);
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

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
                Talent Command Center
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Streamline hiring with intelligent candidate matching and analytics
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

      {/* Analytics Dashboard */}
      <div className="container mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Jobs</p>
                  <p className="text-3xl font-bold">{(jobPostings as any).length || 0}</p>
                  <p className="text-blue-100 text-xs flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% this month
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
                  <p className="text-green-100 text-sm">Total Candidates</p>
                  <p className="text-3xl font-bold">{(applications as any).length || 0}</p>
                  <p className="text-green-100 text-xs flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +8% this week
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
                  <p className="text-3xl font-bold">24</p>
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
                  <p className="text-3xl font-bold">18</p>
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
                  <p className="text-3xl font-bold">89%</p>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Job Listings Sidebar */}
          <Card className="lg:col-span-1 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!jobsLoading && (jobPostings as any).map((job: any) => (
                <div 
                  key={job.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedJob === job.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedJob(job.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{job.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {job.applicationsCount || 0}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{job.location}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    {job.viewsCount || 0} views
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setLocation('/recruiter/post-job')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </CardContent>
          </Card>

          {/* Main Pipeline/Candidates Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters and View Controls */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
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
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "pipeline" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("pipeline")}
                    >
                      Pipeline
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      List
                    </Button>
                    <Button
                      variant={viewMode === "calendar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("calendar")}
                    >
                      Calendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline View */}
            {viewMode === "pipeline" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pipelineStages.map((stage) => (
                  <Card key={stage.id} className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                          <CardTitle className="text-sm">{stage.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {mockCandidates.filter(c => c.status === stage.id).length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockCandidates
                        .filter(candidate => candidate.status === stage.id)
                        .map(candidate => (
                          <div 
                            key={candidate.id}
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={candidate.avatar} />
                                <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-sm truncate">{candidate.name}</h5>
                                <p className="text-xs text-gray-600 truncate">{candidate.title}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs font-medium">{candidate.matchScore}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Candidates</CardTitle>
                    {selectedCandidates.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedCandidates.length} selected
                        </span>
                        <Select onValueChange={handleBulkAction}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Bulk Actions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="move_to_screening">Move to Screening</SelectItem>
                            <SelectItem value="schedule_interview">Schedule Interview</SelectItem>
                            <SelectItem value="send_rejection">Send Rejection</SelectItem>
                            <SelectItem value="export_resumes">Export Resumes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCandidates.map(candidate => (
                      <div 
                        key={candidate.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <input 
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCandidates([...selectedCandidates, candidate.id]);
                            } else {
                              setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                            }
                          }}
                          className="rounded"
                        />
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={candidate.avatar} />
                          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{candidate.name}</h4>
                              <p className="text-sm text-gray-600">{candidate.title}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {candidate.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-2">
                                {candidate.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold">{candidate.matchScore}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCandidate.name}</h3>
                    <p className="text-gray-600">{selectedCandidate.title}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge variant="outline">{selectedCandidate.status}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{selectedCandidate.matchScore}%</span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidate Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedCandidate.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm">{selectedCandidate.location}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Experience</Label>
                        <p className="text-sm">{selectedCandidate.experience} years</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Expected Salary</Label>
                        <p className="text-sm">{selectedCandidate.expectedSalary || 'Not specified'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Expertise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Schedule Interview
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Resume
                      </Button>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}