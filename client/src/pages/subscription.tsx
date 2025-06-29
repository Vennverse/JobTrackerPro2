import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Crown, Check, X, Zap, Target, Brain, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionData {
  subscription: {
    planType: string;
    subscriptionStatus: string;
    subscriptionEndDate?: string;
  };
  usage: {
    jobAnalyses: number;
    resumeAnalyses: number;
    applications: number;
    autoFills: number;
  };
  limits: {
    jobAnalyses: number;
    resumeAnalyses: number;
    applications: number;
    autoFills: number;
  } | null;
}

export default function Subscription() {
  const { toast } = useToast();

  const { data: subscriptionData, isLoading } = useQuery<SubscriptionData>({
    queryKey: ['/api/subscription/status'],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (paymentData: { paypalOrderId: string; paypalSubscriptionId: string }) => {
      return apiRequest('POST', '/api/subscription/upgrade', paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      toast({
        title: "Upgraded Successfully!",
        description: "Welcome to AutoJobr Premium! Enjoy unlimited access to all features.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/subscription/cancel');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll retain premium features until the end of your billing period.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = async () => {
    // Show message that proper payment integration is required
    toast({
      title: "Payment Integration Required",
      description: "Please contact support to set up PayPal or Stripe payment integration for premium subscriptions.",
      variant: "destructive",
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = subscriptionData?.subscription.planType === 'premium';
  const isActive = subscriptionData?.subscription.subscriptionStatus === 'active';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription & Usage</h1>
          <p className="text-muted-foreground">
            Manage your AutoJobr subscription and track your daily usage
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isPremium ? (
                  <>
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Premium Plan
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 text-blue-500" />
                    Free Plan
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isPremium ? (
                  isActive ? "Active until " + new Date(subscriptionData.subscription.subscriptionEndDate!).toLocaleDateString() : "Premium plan inactive"
                ) : (
                  "Limited daily usage with premium features available"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge variant={isPremium && isActive ? "default" : "secondary"}>
                    {isPremium && isActive ? "Active" : isPremium ? "Inactive" : "Free"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Price</span>
                  <span className="font-semibold">
                    {isPremium ? "$10/month" : "$0/month"}
                  </span>
                </div>
                
                {!isPremium && (
                  <>
                    <Separator />
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold">$10<span className="text-sm text-muted-foreground">/month</span></div>
                      <p className="text-sm text-muted-foreground">Unlock unlimited features & AI-powered tools</p>
                    </div>
                    <Button 
                      onClick={handleUpgrade} 
                      disabled={upgradeMutation.isPending}
                      className="w-full"
                    >
                      {upgradeMutation.isPending ? "Processing..." : "Upgrade to Premium"}
                    </Button>
                  </>
                )}

                {isPremium && isActive && (
                  <Button 
                    onClick={() => cancelMutation.mutate()} 
                    disabled={cancelMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {cancelMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Daily Usage
              </CardTitle>
              <CardDescription>
                {isPremium ? "Unlimited usage" : "Resets daily at midnight"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Unlimited Access</p>
                  <p className="text-sm text-muted-foreground">Enjoy all features without limits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Job Analyses
                      </span>
                      <span className="text-sm font-medium">
                        {subscriptionData?.usage.jobAnalyses || 0}/{subscriptionData?.limits?.jobAnalyses || 0}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscriptionData?.usage.jobAnalyses || 0, subscriptionData?.limits?.jobAnalyses || 1)}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Resume Analyses
                      </span>
                      <span className="text-sm font-medium">
                        {subscriptionData?.usage.resumeAnalyses || 0}/{subscriptionData?.limits?.resumeAnalyses || 0}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscriptionData?.usage.resumeAnalyses || 0, subscriptionData?.limits?.resumeAnalyses || 1)}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Applications</span>
                      <span className="text-sm font-medium">
                        {subscriptionData?.usage.applications || 0}/{subscriptionData?.limits?.applications || 0}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscriptionData?.usage.applications || 0, subscriptionData?.limits?.applications || 1)}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Auto-fills</span>
                      <span className="text-sm font-medium">
                        {subscriptionData?.usage.autoFills || 0}/{subscriptionData?.limits?.autoFills || 0}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscriptionData?.usage.autoFills || 0, subscriptionData?.limits?.autoFills || 1)}
                      className="h-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
            <CardDescription>
              See what's included with each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Free Plan
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    5 job analyses per day
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    2 resume analyses per day
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    10 application tracking per day
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    15 auto-fills per day
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Basic job recommendations
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Premium Plan
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Unlimited job analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Unlimited resume analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Unlimited application tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Unlimited auto-fills
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Advanced AI job matching
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}