import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Users, MessageSquare, Eye, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function SimpleRecruiterDashboard() {
  const [location, setLocation] = useLocation();

  // Fetch recruiter's job postings
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/recruiter/jobs'],
  });

  // Fetch applications for recruiter's jobs
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/recruiter/applications'],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recruiter Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your job postings and applications
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/recruiter/post-job')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobPostings.length}</p>
                  <p className="text-sm text-gray-600">Job Postings</p>
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

        {/* Job Postings */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Job Postings</CardTitle>
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

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
                {applications.slice(0, 5).map((application: any) => (
                  <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">New Application</h3>
                          <Badge variant="outline">{application.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Applied on {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                        {application.matchScore && (
                          <p className="text-sm text-gray-500">
                            Match Score: {application.matchScore}%
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocation(`/chat`)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}