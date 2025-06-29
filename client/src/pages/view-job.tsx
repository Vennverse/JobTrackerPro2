import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building, MapPin, DollarSign, Users, Clock, Briefcase, Eye, Calendar, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ViewJob() {
  const params = useParams();
  const jobId = params.id;
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job posting details
  const { data: job, isLoading } = useQuery({
    queryKey: [`/api/jobs/postings/${jobId}`],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/postings/${jobId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Job not found');
      }
      return response.json();
    },
    enabled: !!jobId,
  });

  // Get user's applications to check if already applied
  const { data: userApplications } = useQuery({
    queryKey: ["/api/jobs/my-applications"],
    retry: false,
  });

  // Application mutation
  const applyToJobMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/jobs/postings/${jobId}/apply`, {});
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the recruiter.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my-applications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isJobApplied = () => {
    return Array.isArray(userApplications) && userApplications.some((app: any) => app.jobPostingId === parseInt(jobId as string));
  };

  const handleApplyJob = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    applyToJobMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The job posting you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/jobs')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/jobs')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {job.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {job.companyName}
              </p>
            </div>
            {!job.isActive && (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.workMode}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.jobType}
                  </div>
                  {job.minSalary && job.maxSalary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.minSalary === job.maxSalary
                        ? `${job.currency || '$'}${job.minSalary}`
                        : job.minSalary
                        ? `${job.currency || '$'}${job.minSalary}`
                        : `${job.currency || '$'}${job.maxSalary}`}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{job.responsibilities}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {job.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Required */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Applications</span>
                  </div>
                  <span className="font-semibold">{job.applicationsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Views</span>
                  </div>
                  <span className="font-semibold">{job.viewsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Posted</span>
                  </div>
                  <span className="font-semibold text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {job.experienceLevel && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Experience</span>
                    </div>
                    <span className="font-semibold text-sm">{job.experienceLevel}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {user?.userType === 'recruiter' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => setLocation(`/recruiter/edit-job/${job.id}`)}
                  >
                    Edit Job
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation('/recruiter-dashboard')}
                  >
                    View Applications
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Apply to this Job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isJobApplied() ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Already Applied
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleApplyJob}
                      disabled={applyToJobMutation.isPending}
                    >
                      {applyToJobMutation.isPending ? "Applying..." : "Apply Now"}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation('/jobs')}
                  >
                    Back to Jobs
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}