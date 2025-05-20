import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { getSubjectName } from "@/lib/subjects";
import { SubjectIcon } from "@/components/SubjectIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookCopy, Check, Clock, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function TakeQuiz() {
  const [, params] = useRoute("/take-quiz/:code");
  const quizCode = params?.code;
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [takerName, setTakerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  // Fetch quiz by code
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes/code/${quizCode}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }
        
        const data = await response.json();
        setQuiz(data);
        
        // Fetch questions
        const questionsResponse = await fetch(`/api/quizzes/${data.id}/questions`);
        if (!questionsResponse.ok) {
          throw new Error("Failed to fetch questions");
        }
        
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
        
        // Initialize answers object
        const initialAnswers = {};
        questionsData.forEach(question => {
          initialAnswers[question.id] = '';
        });
        setAnswers(initialAnswers);
        
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (quizCode) {
      fetchQuiz();
    }
  }, [quizCode]);
  
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!takerName.trim()) {
      alert("الرجاء إدخال اسمك");
      return;
    }
    
    setCurrentStep('quiz');
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const isQuizComplete = () => {
    return Object.values(answers).every(answer => answer !== '');
  };
  
  const handleSubmitQuiz = async () => {
    if (!isQuizComplete()) {
      const unansweredCount = Object.values(answers).filter(a => a === '').length;
      if (!confirm(`هناك ${unansweredCount} سؤال لم تجب عليه بعد. هل تريد تقديم الاختبار على أي حال؟`)) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer
      }));
      
      const response = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          takerName,
          answers: formattedAnswers
        })
      });
      
      setResult(response);
      setCurrentStep('result');
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("حدث خطأ أثناء تقديم الاختبار، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin mb-4">
            <BookCopy className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">جاري تحميل الاختبار...</p>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="container py-8" dir="rtl">
        <div className="text-center py-12 bg-muted rounded-lg">
          <BookCopy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">لم يتم العثور على الاختبار</h3>
          <p className="text-muted-foreground mb-4">
            الرمز غير صحيح أو لم يتم العثور على الاختبار
          </p>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/quizzes">العودة للاختبارات</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (currentStep === 'intro') {
    return (
      <div className="container py-8" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <SubjectIcon subject={quiz.subject} size={48} />
              </div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <div className="flex justify-center gap-2 text-muted-foreground mt-2">
                <span>{getSubjectName(quiz.subject)}</span>
                <span>•</span>
                <span>منشئ الاختبار: {quiz.creatorName}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-2">تعليمات الاختبار</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>أجب على جميع الأسئلة قبل تقديم الاختبار.</li>
                  <li>يمكنك التنقل بين الأسئلة باستخدام أزرار التالي والسابق.</li>
                  <li>يمكنك تغيير إجاباتك في أي وقت قبل التقديم.</li>
                  <li>بعد تقديم الاختبار، سترى نتيجتك على الفور.</li>
                </ul>
              </div>
              
              <form onSubmit={handleStartQuiz} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input 
                    id="name" 
                    placeholder="أدخل اسمك" 
                    value={takerName}
                    onChange={(e) => setTakerName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    سيظهر اسمك في نتائج الاختبار
                  </p>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/quizzes">إلغاء</Link>
                  </Button>
                  <Button type="submit">بدء الاختبار</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (currentStep === 'quiz') {
    const question = questions[currentQuestion];
    
    return (
      <div className="container py-8" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <div className="flex items-center gap-2">
              <SubjectIcon subject={quiz.subject} size={16} />
              <span className="text-muted-foreground">{getSubjectName(quiz.subject)}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>السؤال {currentQuestion + 1} من {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <Progress value={(currentQuestion + 1) / questions.length * 100} className="h-2" />
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">
                {question.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {question.questionType === "multiple-choice" && (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.map((option, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-reverse space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => handleAnswerChange(question.id, option)}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center">
                          <div className="ml-2 min-w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span>{option}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {question.questionType === "true-false" && (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-3"
                >
                  <div 
                    className="flex items-center space-x-reverse space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent"
                    onClick={() => handleAnswerChange(question.id, "true")}
                  >
                    <RadioGroupItem value="true" id="answer-true" />
                    <Label htmlFor="answer-true" className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <div className="ml-2 min-w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          ص
                        </div>
                        <span>صحيح</span>
                      </div>
                    </Label>
                  </div>
                  <div 
                    className="flex items-center space-x-reverse space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent"
                    onClick={() => handleAnswerChange(question.id, "false")}
                  >
                    <RadioGroupItem value="false" id="answer-false" />
                    <Label htmlFor="answer-false" className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <div className="ml-2 min-w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          خ
                        </div>
                        <span>خطأ</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              السابق
            </Button>
            
            {currentQuestion < questions.length - 1 ? (
              <Button type="button" onClick={handleNextQuestion}>
                التالي
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري التقديم..." : "تقديم الاختبار"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (currentStep === 'result') {
    return (
      <div className="container py-8" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl mb-2">تم تقديم الاختبار بنجاح!</CardTitle>
              <div className="text-muted-foreground">
                شكراً {takerName} على إكمال اختبار {quiz.title}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold mb-2">
                  {result.score}/{result.totalQuestions}
                </div>
                <div className="text-2xl mb-1">
                  {Math.round((result.score / result.totalQuestions) * 100)}%
                </div>
                <div className="text-muted-foreground">
                  {result.score === result.totalQuestions ? (
                    "ممتاز! لقد أجبت على جميع الأسئلة بشكل صحيح"
                  ) : result.score >= result.totalQuestions * 0.7 ? (
                    "جيد جداً! لقد أحرزت نتيجة عالية"
                  ) : result.score >= result.totalQuestions * 0.5 ? (
                    "جيد! يمكنك التحسن أكثر"
                  ) : (
                    "لقد أكملت الاختبار، حاول مرة أخرى لتحسين نتيجتك"
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/quizzes">العودة للاختبارات</Link>
                </Button>
                <Button asChild>
                  <Link href={`/take-quiz/${quizCode}`}>
                    إعادة الاختبار
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return null;
}

function getSubjectName(subject) {
  const subjects = {
    arabic: "اللغة العربية",
    english: "اللغة الإنجليزية",
    math: "الرياضيات",
    chemistry: "الكيمياء",
    physics: "الفيزياء",
    biology: "الأحياء",
    islamic: "التربية الإسلامية",
    constitution: "الدستور",
  };
  
  return subjects[subject] || subject;
}