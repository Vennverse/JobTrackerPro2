import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  Percent
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    experienceLevel: '',
    location: '',
    skillMatch: '',
    availability: ''
  });
  const [activeTab, setActiveTab] = useState('matches');

  // Fetch data with proper typing
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

  // Filter candidates based on search and filters
  const filteredCandidates = (candidateMatches || []).filter((candidate) => {
    if (!candidate) return false;
    
    const matchesSearch = (candidate.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!selectedFilters.experienceLevel || (candidate.experience || '').includes(selectedFilters.experienceLevel)) &&
      (!selectedFilters.location || (candidate.location || '').includes(selectedFilters.location)) &&
      (!selectedFilters.skillMatch || (candidate.matchScore || 0) >= parseInt(selectedFilters.skillMatch || '0'));
    
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Recruiter Dashboard</h1>
          <p className="text-gray-600">AI-powered recruitment intelligence and candidate matching</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Pipeline View
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="matches">Smart Matching</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Smart Matching Tab */}
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
                  <SelectItem value="">All Levels</SelectItem>
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
                  <SelectItem value="">All Scores</SelectItem>
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
  );
}