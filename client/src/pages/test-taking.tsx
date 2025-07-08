import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Shield, 
  Copy,
  FileText,
  Code,
  CheckCircle 
} from "lucide-react";

export default function TestTaking() {
  const { assignmentId } = useParams();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const testContainerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<Date | null>(null);

  const { data: assignment, isLoading } = useQuery({
    queryKey: [`/api/test-assignments/${assignmentId}`],
    enabled: !!assignmentId,
  });

  const { data: questions = [] } = useQuery({
    queryKey: [`/api/test-assignments/${assignmentId}/questions`],
    enabled: !!assignmentId && testStarted,
  });

  const submitTestMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/test-assignments/${assignmentId}/submit`, "POST", data),
    onSuccess: () => {
      toast({ title: "Test submitted successfully!" });
      exitFullscreen();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit test",
        variant: "destructive" 
      });
    },
  });

  // Anti-cheating measures
  useEffect(() => {
    if (!testStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setWarningCount(prev => prev + 1);
        toast({
          title: "Warning: Tab Switch Detected",
          description: `You've switched tabs ${tabSwitchCount + 1} times. Multiple violations may result in test cancellation.`,
          variant: "destructive"
        });
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyAttempts(prev => prev + 1);
      setWarningCount(prev => prev + 1);
      toast({
        title: "Warning: Copy Attempt Detected",
        description: `Copy/paste is disabled. Attempt ${copyAttempts + 1} recorded.`,
        variant: "destructive"
      });
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Warning: Paste Blocked",
        description: "Pasting content is not allowed during the test.",
        variant: "destructive"
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common cheating key combinations
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'f' || e.key === 't' || e.key === 'w')
      ) {
        e.preventDefault();
        setWarningCount(prev => prev + 1);
        toast({
          title: "Warning: Blocked Action",
          description: "Keyboard shortcuts are disabled during the test.",
          variant: "destructive"
        });
      }
    };

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setWarningCount(prev => prev + 1);
      toast({
        title: "Warning: Right-click Blocked",
        description: "Right-click is disabled during the test.",
        variant: "destructive"
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleRightClick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [testStarted, tabSwitchCount, copyAttempts, warningCount]);

  // Timer
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  // Auto-submit on excessive violations
  useEffect(() => {
    if (warningCount >= 5) {
      toast({
        title: "Test Cancelled",
        description: "Too many violations detected. Test will be submitted automatically.",
        variant: "destructive"
      });
      handleSubmitTest();
    }
  }, [warningCount]);

  const enterFullscreen = () => {
    if (testContainerRef.current?.requestFullscreen) {
      testContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const startTest = () => {
    if (assignment?.testTemplate?.timeLimit) {
      setTimeLeft(assignment.testTemplate.timeLimit * 60);
    }
    setTestStarted(true);
    startTimeRef.current = new Date();
    enterFullscreen();
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitTest = () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const timeSpent = startTimeRef.current ? Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000) : 0;
    
    submitTestMutation.mutate({
      answers,
      timeSpent,
      warningCount,
      tabSwitchCount,
      copyAttempts,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="w-5 h-5" />;
      case 'multiple_choice': return <CheckCircle className="w-5 h-5" />;
      case 'multiple_select': return <CheckCircle className="w-5 h-5" />;
      case 'short_answer': return <FileText className="w-5 h-5" />;
      case 'long_answer': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Test Assignment Not Found</h1>
          <p className="text-gray-600">The test assignment you're looking for doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              {assignment.testTemplate.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">{assignment.testTemplate.timeLimit} Minutes</div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">{assignment.testTemplate.passingScore}%</div>
                <div className="text-sm text-gray-600">Passing Score</div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Test Rules:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Test will run in fullscreen mode</li>
                  <li>• Copy/paste is disabled</li>
                  <li>• Tab switching is monitored</li>
                  <li>• Right-click is disabled</li>
                  <li>• 5 violations will auto-submit the test</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button onClick={startTest} size="lg" className="px-8">
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div ref={testContainerRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">{assignment.testTemplate.title}</h1>
              <Badge variant="secondary">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {warningCount > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {warningCount} Warning{warningCount > 1 ? 's' : ''}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-6">
        {currentQ && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getQuestionIcon(currentQ.type)}
                Question {currentQuestion + 1}
                <Badge className="ml-2">{currentQ.points} points</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-lg">{currentQ.question}</p>
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                {currentQ.type === 'multiple_choice' && (
                  <RadioGroup
                    value={answers[currentQ.id]?.toString()}
                    onValueChange={(value) => handleAnswerChange(currentQ.id, parseInt(value))}
                  >
                    {currentQ.options?.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <label htmlFor={`option-${index}`} className="cursor-pointer">
                          {String.fromCharCode(65 + index)}. {option}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQ.type === 'multiple_select' && (
                  <div className="space-y-2">
                    {currentQ.options?.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`option-${index}`}
                          checked={answers[currentQ.id]?.includes(index)}
                          onCheckedChange={(checked) => {
                            const current = answers[currentQ.id] || [];
                            if (checked) {
                              handleAnswerChange(currentQ.id, [...current, index]);
                            } else {
                              handleAnswerChange(currentQ.id, current.filter((i: number) => i !== index));
                            }
                          }}
                        />
                        <label htmlFor={`option-${index}`} className="cursor-pointer">
                          {String.fromCharCode(65 + index)}. {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {currentQ.type === 'true_false' && (
                  <RadioGroup
                    value={answers[currentQ.id]?.toString()}
                    onValueChange={(value) => handleAnswerChange(currentQ.id, value === 'true')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <label htmlFor="true" className="cursor-pointer">True</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <label htmlFor="false" className="cursor-pointer">False</label>
                    </div>
                  </RadioGroup>
                )}

                {['short_answer', 'long_answer', 'coding', 'scenario', 'case_study'].includes(currentQ.type) && (
                  <Textarea
                    placeholder="Enter your answer here..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className={`min-h-${currentQ.type === 'short_answer' ? '24' : '48'}`}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestion < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitTest}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Test"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}