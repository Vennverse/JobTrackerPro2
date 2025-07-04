import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Briefcase, Users, MessageSquare, Eye, Calendar, Building, Star, 
  FileText, Mail, CheckCircle, XCircle, Clock, Download, User, Phone, 
  MapPin, GraduationCap, Award, Filter, Search, Target, Brain, 
  TrendingUp, AlertCircle, Shield, Settings, BarChart3, Zap,
  Video, UserCheck, BookOpen, Globe, Heart, CheckSquare
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

export default function AdvancedRecruiterDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState("");
  const [sortBy, setSortBy] = useState("matchScore");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  const [showJobTemplate, setShowJobTemplate] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Core data queries
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/recruiter/jobs'],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/recruiter/applications'],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/chat/conversations'],
  });

  // Advanced features data
  const { data: candidateMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/recruiter/candidate-matches'],
  });

  const { data: jobTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/recruiter/job-templates'],
  });

  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ['/api/recruiter/interviews'],
  });

  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/recruiter/analytics'],
  });

  const { data: aiInsights = {}, isLoading: aiInsightsLoading } = useQuery({
    queryKey: ['/api/recruiter/ai-insights'],
  });

  // Filter and sort candidate matches
  const filteredCandidates = candidateMatches.filter((candidate: CandidateMatch) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !skillFilter || candidate.matchingSkills.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase()));
    const matchesExperience = !experienceFilter || candidate.experience === experienceFilter;
    const matchesLocation = !locationFilter || candidate.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSalary = !salaryFilter || candidate.salary.includes(salaryFilter);
    
    return matchesSearch && matchesSkill && matchesExperience && matchesLocation && matchesSalary;
  }).sort((a: CandidateMatch, b: CandidateMatch) => {
    switch (sortBy) {
      case "matchScore":
        return b.matchScore - a.matchScore;
      case "joinProbability":
        return b.joinProbability - a.joinProbability;
      case "engagementScore":
        return b.engagementScore - a.engagementScore;
      case "lastActive":
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      default:
        return b.matchScore - a.matchScore;
    }
  });

  // Mutations for actions
  const contactCandidateMutation = useMutation({
    mutationFn: async ({ candidateId, message }: { candidateId: string; message: string }) => {
      return await apiRequest("POST", `/api/recruiter/contact-candidate`, { candidateId, message });
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/candidate-matches'] });
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async (interviewData: any) => {
      return await apiRequest("POST", `/api/recruiter/schedule-interview`, interviewData);
    },
    onSuccess: () => {
      toast({ title: "Interview scheduled successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/interviews'] });
    },
  });

  const createJobFromTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await apiRequest("POST", `/api/recruiter/create-job-from-template`, { templateId });
    },
    onSuccess: () => {
      toast({ title: "Job created from template" });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getFlightRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-gray-600";
    }
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
                Advanced Recruiter Dashboard
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  ✓ AI-Powered
                </Badge>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Smart recruiting with AI-powered candidate matching and insights
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowJobTemplate(true)}>
                <BookOpen className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button onClick={() => setLocation('/recruiter/post-job')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{jobPostings.length}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Active Jobs</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {analytics.jobViews || 0} total views
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{applications.length}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Applications</p>
                  <p className="text-xs text-green-500 mt-1">
                    {analytics.applicationsToday || 0} today
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{candidateMatches.length}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">AI Matches</p>
                  <p className="text-xs text-purple-500 mt-1">
                    {candidateMatches.filter((m: CandidateMatch) => m.matchScore >= 80).length} high quality
                  </p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{interviews.length}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Interviews</p>
                  <p className="text-xs text-orange-500 mt-1">
                    {interviews.filter((i: Interview) => i.status === 'scheduled').length} scheduled
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features Tabs */}
        <Tabs defaultValue="smart-matching" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="smart-matching">Smart Matching</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Smart Candidate Matching */}
          <TabsContent value="smart-matching">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Smart Candidate Matching
                    </CardTitle>
                    <CardDescription>AI-powered candidate recommendations with compatibility scoring</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowAIInsights(true)}>
                    <Brain className="w-4 h-4 mr-2" />
                    AI Insights
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill">Skill</Label>
                    <Input
                      id="skill"
                      placeholder="e.g. React"
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City or remote"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      placeholder="e.g. 100k"
                      value={salaryFilter}
                      onChange={(e) => setSalaryFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sort">Sort by</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matchScore">Match Score</SelectItem>
                        <SelectItem value="joinProbability">Join Probability</SelectItem>
                        <SelectItem value="engagementScore">Engagement</SelectItem>
                        <SelectItem value="lastActive">Last Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Candidate Matches */}
                <div className="space-y-4">
                  {matchesLoading ? (
                    <div className="text-center py-8">
                      <p>Loading AI-powered matches...</p>
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                      <p className="text-gray-600">Try adjusting your filters or post more jobs to get AI-powered candidate matches</p>
                    </div>
                  ) : (
                    filteredCandidates.map((candidate: CandidateMatch) => (
                      <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                  <p className="text-sm text-gray-600">{candidate.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {candidate.matchScore}% match
                                  </Badge>
                                  {candidate.isContacted && (
                                    <Badge variant="secondary">Contacted</Badge>
                                  )}
                                </div>
                              </div>

                              {/* Scoring Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500">Skills Match</p>
                                  <p className={`font-medium ${getScoreColor(candidate.skillMatchScore)}`}>
                                    {candidate.skillMatchScore}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Join Probability</p>
                                  <p className={`font-medium ${getScoreColor(candidate.joinProbability)}`}>
                                    {candidate.joinProbability}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Engagement</p>
                                  <p className={`font-medium ${getScoreColor(candidate.engagementScore)}`}>
                                    {candidate.engagementScore}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Flight Risk</p>
                                  <p className={`font-medium ${getFlightRiskColor(candidate.flightRisk)}`}>
                                    {candidate.flightRisk}
                                  </p>
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-2">Matching Skills:</p>
                                <div className="flex flex-wrap gap-1">
                                  {candidate.matchingSkills.slice(0, 5).map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {candidate.matchingSkills.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{candidate.matchingSkills.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {candidate.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Award className="w-4 h-4" />
                                  {candidate.experience}
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {candidate.salary}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Active {candidate.lastActive}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedCandidate(candidate)}
                                variant="outline"
                              >
                                View Profile
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  // Contact candidate logic
                                  toast({ title: "Opening message composer..." });
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedCandidate(candidate);
                                  setShowScheduleInterview(true);
                                }}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Interview
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visual Pipeline */}
          <TabsContent value="pipeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recruitment Pipeline
                </CardTitle>
                <CardDescription>Visual overview of your recruitment process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { stage: "Applied", count: applications.filter((a: any) => a.status === 'pending').length, color: "bg-blue-500" },
                    { stage: "Screening", count: applications.filter((a: any) => a.status === 'reviewed').length, color: "bg-yellow-500" },
                    { stage: "Interview", count: applications.filter((a: any) => a.status === 'shortlisted').length, color: "bg-purple-500" },
                    { stage: "Offer", count: applications.filter((a: any) => a.status === 'interviewed').length, color: "bg-green-500" },
                    { stage: "Hired", count: applications.filter((a: any) => a.status === 'hired').length, color: "bg-emerald-500" }
                  ].map((stage, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="p-4">
                        <div className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2`}>
                          {stage.count}
                        </div>
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-sm text-gray-600">{stage.count} candidates</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Conversion Metrics */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {applications.length > 0 ? Math.round((applications.filter((a: any) => a.status === 'hired').length / applications.length) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Overall Conversion Rate</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics.averageTimeToHire || 0}
                        </p>
                        <p className="text-sm text-gray-600">Avg. Time to Hire (days)</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {analytics.averageCandidateRating || 0}/5
                        </p>
                        <p className="text-sm text-gray-600">Candidate Experience</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interview Management */}
          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Interview Management
                    </CardTitle>
                    <CardDescription>Schedule and manage interviews with candidates</CardDescription>
                  </div>
                  <Button onClick={() => setShowScheduleInterview(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviewsLoading ? (
                    <div className="text-center py-8">
                      <p>Loading interviews...</p>
                    </div>
                  ) : interviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
                      <p className="text-gray-600">Schedule your first interview to get started</p>
                    </div>
                  ) : (
                    interviews.map((interview: Interview) => (
                      <Card key={interview.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Video className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                                  <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                                </div>
                                <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>
                                  {interview.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500">Type</p>
                                  <p className="font-medium">{interview.interviewType}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Date</p>
                                  <p className="font-medium">{new Date(interview.scheduledDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Duration</p>
                                  <p className="font-medium">{interview.duration}min</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Confirmed</p>
                                  <p className="font-medium">
                                    {interview.candidateConfirmed ? 
                                      <CheckCircle className="w-4 h-4 text-green-600" /> : 
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                    }
                                  </p>
                                </div>
                              </div>

                              {interview.meetingLink && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium mb-1">Meeting Link:</p>
                                  <a 
                                    href={interview.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    {interview.meetingLink}
                                  </a>
                                </div>
                              )}

                              {interview.score && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium mb-1">Score: {interview.score}/10</p>
                                  <Progress value={interview.score * 10} className="h-2" />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="w-4 h-4 mr-2" />
                                Remind
                              </Button>
                              {interview.status === 'scheduled' && (
                                <Button size="sm">
                                  <Video className="w-4 h-4 mr-2" />
                                  Join
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics and Performance */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Time to Review</span>
                      <span className="font-medium">{analytics.averageTimeToReview || 0}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Time to Interview</span>
                      <span className="font-medium">{analytics.averageTimeToInterview || 0}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Time to Hire</span>
                      <span className="font-medium">{analytics.averageTimeToHire || 0}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="font-medium">{analytics.responseRate || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Candidate Experience Rating</span>
                      <span className="font-medium">{analytics.averageCandidateRating || 0}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    This Month's Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Jobs Posted</span>
                      <span className="font-medium">{analytics.jobsPosted || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Applications Received</span>
                      <span className="font-medium">{analytics.jobApplications || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Interviews Scheduled</span>
                      <span className="font-medium">{analytics.interviewsScheduled || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Offers Extended</span>
                      <span className="font-medium">{analytics.offersExtended || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Successful Hires</span>
                      <span className="font-medium">{analytics.hires || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employer Branding */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Employer Branding & Career Pages
                </CardTitle>
                <CardDescription>Create custom career pages and showcase your company culture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Build Your Career Page</h3>
                  <p className="text-gray-600 mb-4">Create a custom career page to showcase your company culture and attract top talent</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Career Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  ATS/CRM Integrations
                </CardTitle>
                <CardDescription>Connect with popular hiring tools and platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Greenhouse", status: "available", color: "bg-green-100 text-green-700" },
                    { name: "Workday", status: "available", color: "bg-blue-100 text-blue-700" },
                    { name: "Lever", status: "available", color: "bg-purple-100 text-purple-700" },
                    { name: "iCIMS", status: "available", color: "bg-yellow-100 text-yellow-700" },
                    { name: "BambooHR", status: "available", color: "bg-orange-100 text-orange-700" },
                    { name: "JazzHR", status: "available", color: "bg-pink-100 text-pink-700" }
                  ].map((integration, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                          <Settings className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold mb-1">{integration.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {integration.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {/* Job Templates Dialog */}
      <Dialog open={showJobTemplate} onOpenChange={setShowJobTemplate}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Job Templates</DialogTitle>
            <DialogDescription>Use pre-built templates to post jobs faster</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {jobTemplates.map((template: JobTemplate) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{template.templateName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      Used {template.usageCount} times
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => createJobFromTemplateMutation.mutate(template.id)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleInterview} onOpenChange={setShowScheduleInterview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              {selectedCandidate ? `Schedule interview with ${selectedCandidate.name}` : "Schedule a new interview"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="interview-type">Interview Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Screen</SelectItem>
                  <SelectItem value="video">Video Interview</SelectItem>
                  <SelectItem value="onsite">On-site Interview</SelectItem>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="interview-date">Date & Time</Label>
              <Input type="datetime-local" id="interview-date" />
            </div>
            <div>
              <Label htmlFor="interview-duration">Duration (minutes)</Label>
              <Input type="number" id="interview-duration" defaultValue="60" />
            </div>
            <div>
              <Label htmlFor="meeting-link">Meeting Link (optional)</Label>
              <Input id="meeting-link" placeholder="https://meet.google.com/..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleInterview(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Interview scheduled successfully" });
                setShowScheduleInterview(false);
              }}>
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Insights & Recommendations
            </DialogTitle>
            <DialogDescription>Smart insights to improve your recruiting performance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance Insights
                </h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Your response time is 23% faster than average</li>
                  <li>• Candidates prefer video interviews over phone screens</li>
                  <li>• Thursday applications have 34% higher acceptance rates</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Matching Recommendations
                </h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 12 high-quality candidates match your React Developer role</li>
                  <li>• Consider expanding location criteria for 40% more matches</li>
                  <li>• Salary benchmarks suggest increasing range by 15%</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Action Items
                </h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 3 applications require immediate attention</li>
                  <li>• Update job descriptions to improve match quality</li>
                  <li>• Schedule follow-ups for 5 pending candidates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}