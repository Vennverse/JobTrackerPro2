import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase,
  Plus,
  Eye,
  Edit,
  Activity,
  Sparkles,
  Building,
  MessageCircle,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';

export default function UnifiedRecruiterDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all dashboard data
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery<any[]>({
    queryKey: ['/api/recruiter/jobs'],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<any[]>({
    queryKey: ['/api/recruiter/applications'],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<any[]>({
    queryKey: ['/api/chat/conversations'],
  });

  if (jobsLoading || applicationsLoading || conversationsLoading) {
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
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
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
                            {application.status || 'pending'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}