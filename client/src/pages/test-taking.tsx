import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Timer,
  Trophy,
  RefreshCw,
  DollarSign,
  Home
} from "lucide-react";

interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'coding' | 'essay' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
}

export default function TestTaking() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showRetakeDialog, setShowRetakeDialog] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Fetch test assignment
  const { data: assignment, isLoading } = useQuery({
    queryKey: [`/api/test-assignments/${id}`],
    enabled: !!id,
  });

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: () => apiRequest(`/api/test-assignments/${id}/start`, "POST"),
    onSuccess: (data) => {
      setTestStarted(true);
      setStartTime(new Date(data.startedAt));
      setTimeRemaining(assignment.testTemplate.timeLimit * 60);
      toast({ title: "Test started! Good luck!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to start test",
        variant: "destructive" 
      });
    },
  });

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/test-assignments/${id}/submit`, "POST", data),
    onSuccess: (data) => {
      setTestCompleted(true);
      setShowResults(true);
      toast({ title: "Test submitted successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit test",
        variant: "destructive" 
      });
    },
  });

  // Timer countdown effect
  useEffect(() => {
    if (!testStarted || testCompleted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted, timeRemaining]);

  const handleAutoSubmit = useCallback(() => {
    if (!testCompleted) {
      const timeSpent = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;
      submitTestMutation.mutate({ answers, timeSpent });
      toast({ 
        title: "Time's up!", 
        description: "Your test has been automatically submitted.",
        variant: "destructive" 
      });
    }
  }, [answers, startTime, testCompleted, submitTestMutation, toast]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number, totalMinutes: number) => {
    const percentage = (seconds / (totalMinutes * 60)) * 100;
    if (percentage > 25) return "text-green-600";
    if (percentage > 10) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;
    submitTestMutation.mutate({ answers, timeSpent });
    setShowConfirmSubmit(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assignment.testTemplate.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getQuestionStatus = (index: number, questionId: string) => {
    if (answers[questionId] !== undefined && answers[questionId] !== '') {
      return 'answered';
    }
    if (index === currentQuestionIndex) {
      return 'current';
    }
    return 'unanswered';
  };

  const getAnsweredCount = () => {
    return assignment.testTemplate.questions.filter((q: TestQuestion) => 
      answers[q.id] !== undefined && answers[q.id] !== ''
    ).length;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Test Not Found</h2>
            <p className="text-gray-600 mb-4">
              The test assignment you're looking for doesn't exist or you don't have permission to access it.
            </p>
            <Button onClick={() => setLocation("/")}>
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show results after completion
  if (showResults) {
    const score = submitTestMutation.data?.score || 0;
    const passed = submitTestMutation.data?.passed || false;
    const passingScore = assignment.testTemplate.passingScore;

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              Test {passed ? "Completed Successfully!" : "Completed"}
            </CardTitle>
            <CardDescription>
              {assignment.testTemplate.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {score}%
              </div>
              <div className="text-gray-600">
                Your Score (Passing: {passingScore}%)
              </div>
              <Progress value={score} className="mt-4 max-w-xs mx-auto" />
            </div>

            {/* Results Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {getAnsweredCount()}/{assignment.testTemplate.questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(submitTestMutation.data?.timeSpent || 0)}
                </div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="text-sm text-gray-600">Result</div>
              </div>
            </div>

            {/* Retake Option */}
            {!passed && (
              <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Didn't Pass This Time?
                </h3>
                <p className="text-yellow-700 mb-4">
                  You can retake this test for a small fee of $5. This gives you another chance to demonstrate your skills.
                </p>
                <Button 
                  onClick={() => setShowRetakeDialog(true)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retake Test ($5)
                </Button>
              </div>
            )}

            {/* Success Message */}
            {passed && (
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Congratulations!
                </h3>
                <p className="text-green-700">
                  You've successfully passed this assessment. The recruiter has been notified of your results.
                </p>
              </div>
            )}

            <div className="text-center">
              <Button onClick={() => setLocation("/job-seeker/tests")}>
                View All My Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Retake Payment Dialog */}
        <Dialog open={showRetakeDialog} onOpenChange={setShowRetakeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retake Test</DialogTitle>
              <DialogDescription>
                Pay $5 to unlock one retake attempt for this test.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
                  <DollarSign className="w-5 h-5" />
                  Retake Fee: $5.00 USD
                </div>
                <p className="text-blue-800 text-sm">
                  This one-time payment allows you to retake the test and potentially improve your score.
                </p>
              </div>
              
              <div className="grid gap-3">
                <Button 
                  onClick={() => {
                    // Integrate with payment processing
                    toast({ title: "Payment integration coming soon" });
                  }}
                  className="w-full"
                >
                  Pay with Stripe
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Integrate with PayPal
                    toast({ title: "PayPal integration coming soon" });
                  }}
                  className="w-full"
                >
                  Pay with PayPal
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Integrate with Razorpay
                    toast({ title: "Razorpay integration coming soon" });
                  }}
                  className="w-full"
                >
                  Pay with Razorpay
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Pre-test instructions
  if (!testStarted) {
    const dueDate = new Date(assignment.dueDate);
    const isExpired = new Date() > dueDate;

    if (isExpired) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-600">Test Expired</h2>
              <p className="text-gray-600 mb-4">
                This test assignment expired on {dueDate.toLocaleDateString()}. Please contact the recruiter if you need an extension.
              </p>
              <Button onClick={() => setLocation("/")}>
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{assignment.testTemplate.title}</CardTitle>
            <CardDescription>
              Skills Assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">Duration</div>
                <div className="text-sm text-gray-600">{assignment.testTemplate.timeLimit} minutes</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="font-semibold">Passing Score</div>
                <div className="text-sm text-gray-600">{assignment.testTemplate.passingScore}%</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Important Instructions:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  Once you start the test, the timer cannot be paused
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  Make sure you have a stable internet connection
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  Answer all questions to maximize your score
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  The test will auto-submit when time runs out
                </li>
              </ul>
            </div>

            {/* Due Date Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-1">
                <Clock className="w-4 h-4" />
                Due Date
              </div>
              <div className="text-yellow-700 text-sm">
                Complete this test by {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
              </div>
            </div>

            {assignment.testTemplate.description && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">About This Test:</h4>
                <p className="text-blue-800 text-sm">{assignment.testTemplate.description}</p>
              </div>
            )}

            <div className="text-center">
              <Button 
                onClick={() => startTestMutation.mutate()}
                disabled={startTestMutation.isPending}
                size="lg"
                className="w-full md:w-auto"
              >
                {startTestMutation.isPending ? "Starting..." : "Start Test"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test interface
  const questions = assignment.testTemplate.questions as TestQuestion[];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header with timer */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{assignment.testTemplate.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${getTimeColor(timeRemaining, assignment.testTemplate.timeLimit)}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-gray-600">Time Remaining</div>
            </div>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Question Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {questions.map((q, index) => {
                  const status = getQuestionStatus(index, q.id);
                  return (
                    <Button
                      key={q.id}
                      variant={status === 'current' ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs h-8 ${
                        status === 'answered' ? 'border-green-500 bg-green-50' : 
                        status === 'current' ? '' : 'border-gray-300'
                      }`}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
              
              <div className="mt-4 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-500 rounded"></div>
                  <span>Answered ({getAnsweredCount()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span>Unanswered ({questions.length - getAnsweredCount()})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Question */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {currentQuestion.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <span className="text-sm text-gray-600">{currentQuestion.points} points</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">{currentQuestion.question}</h2>
                
                {/* Multiple Choice */}
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* True/False */}
                {currentQuestion.type === 'true_false' && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value === 'true')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="cursor-pointer">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="cursor-pointer">False</Label>
                    </div>
                  </RadioGroup>
                )}

                {/* Essay/Coding */}
                {(currentQuestion.type === 'essay' || currentQuestion.type === 'coding') && (
                  <Textarea
                    placeholder={currentQuestion.type === 'coding' ? 
                      "Write your code here..." : 
                      "Write your answer here..."
                    }
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button 
                      onClick={() => setShowConfirmSubmit(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Test
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm space-y-1">
                <div>Questions answered: {getAnsweredCount()} of {questions.length}</div>
                <div>Time remaining: {formatTime(timeRemaining)}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1"
              >
                Continue Test
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitTestMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitTestMutation.isPending ? "Submitting..." : "Submit Test"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}