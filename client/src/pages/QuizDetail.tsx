import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getSubjectName } from "@/lib/subjects";
import { SubjectIcon } from "@/components/SubjectIcon";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  BookCopy, 
  Clock, 
  Share, 
  Download, 
  Copy, 
  ChevronRight, 
  Plus, 
  FileText, 
  Files,
  Printer,
  Users
} from "lucide-react";

export default function QuizDetail() {
  const [, params] = useRoute("/quizzes/:id");
  const quizId = params?.id;
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch quiz details
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
    queryFn: async () => {
      const quizResponse = await fetch(`/api/quizzes/${quizId}`);
      if (!quizResponse.ok) {
        throw new Error("Failed to fetch quiz");
      }
      const quizData = await quizResponse.json();

      const questionsResponse = await fetch(`/api/quizzes/${quizId}/questions`);
      if (!questionsResponse.ok) {
        throw new Error("Failed to fetch questions");
      }
      const questionsData = await questionsResponse.json();

      const attemptsResponse = await fetch(`/api/quizzes/${quizId}/attempts`);
      let attemptsData = [];
      if (attemptsResponse.ok) {
        attemptsData = await attemptsResponse.json();
      }

      return {
        quiz: quizData,
        questions: questionsData,
        attempts: attemptsData
      };
    }
  });
  
  const quiz = data?.quiz;
  const questions = data?.questions || [];
  const attempts = data?.attempts || [];
  
  // Handle copying quiz code
  const copyQuizCode = () => {
    if (quiz) {
      navigator.clipboard.writeText(quiz.quizCode);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رمز الاختبار إلى الحافظة",
      });
    }
  };
  
  // Handle exporting quiz as PDF
  const exportQuizAsPDF = async () => {
    if (quiz) {
      try {
        window.open(`/api/quizzes/${quizId}/pdf`, '_blank');
      } catch (error) {
        console.error("Error exporting quiz:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تصدير الاختبار",
          variant: "destructive",
        });
      }
    }
  };

  const timeSince = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
  
    if (interval > 1) return Math.floor(interval) + " سنة";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " شهر";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " يوم";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ساعة";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " دقيقة";
    return Math.floor(seconds) + " ثانية";
  };

  if (isLoading) {
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
      <div className="container py-8">
        <div className="text-center py-12 bg-muted rounded-lg">
          <BookCopy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">لم يتم العثور على الاختبار</h3>
          <p className="text-muted-foreground mb-4">
            الاختبار غير موجود أو تم حذفه
          </p>
          <Button asChild>
            <a href="/quizzes">العودة إلى الاختبارات</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <a href="/quizzes" className="text-muted-foreground hover:text-foreground transition-colors">
              الاختبارات
            </a>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.title}</span>
          </div>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <SubjectIcon subject={quiz.subject} size={18} />
            <span className="text-muted-foreground">{getSubjectName(quiz.subject)}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              تم الإنشاء منذ {timeSince(quiz.createdAt)}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              بواسطة {quiz.creatorName}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportQuizAsPDF}>
            <Download className="h-4 w-4 ml-2" />
            تصدير PDF
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/take-quiz/${quiz.quizCode}`} target="_blank">
              <FileText className="h-4 w-4 ml-2" />
              معاينة الاختبار
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">رمز الاختبار</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-bold">{quiz.quizCode}</span>
              <Button variant="ghost" size="sm" onClick={copyQuizCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <p className="text-sm text-muted-foreground">عدد الأسئلة</p>
            <p className="text-xl font-bold">{questions.length}</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <p className="text-sm text-muted-foreground">عدد المحاولات</p>
            <p className="text-xl font-bold">{attempts.length}</p>
          </div>
        </div>
        <div>
          <Button variant="default" onClick={() => setIsAddQuestionModalOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة سؤال
          </Button>
        </div>
      </div>

      <Tabs defaultValue="questions" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="questions">
            <Files className="h-4 w-4 ml-2" />
            الأسئلة
          </TabsTrigger>
          <TabsTrigger value="results">
            <Users className="h-4 w-4 ml-2" />
            النتائج
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <Files className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد أسئلة</h3>
              <p className="text-muted-foreground mb-4">
                هذا الاختبار لا يحتوي على أي أسئلة بعد، أضف أسئلة ليتمكن الطلاب من الإجابة عليها
              </p>
              <Button onClick={() => setIsAddQuestionModalOpen(true)}>
                إضافة سؤال
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">سؤال {index + 1}</CardTitle>
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {question.questionType === "multiple-choice" ? "اختيار من متعدد" : "صح أم خطأ"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="mb-4">{question.questionText}</p>
                    
                    {question.questionType === "multiple-choice" && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex} 
                            className={`p-3 rounded-md border ${
                              option === question.correctAnswer 
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="ml-2 min-w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <span>{option}</span>
                              {option === question.correctAnswer && (
                                <span className="mr-auto text-green-600 text-sm">✓ الإجابة الصحيحة</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.questionType === "true-false" && (
                      <div className="space-y-2">
                        <div 
                          className={`p-3 rounded-md border ${
                            question.correctAnswer === "true" 
                              ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="ml-2 min-w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              ص
                            </div>
                            <span>صحيح</span>
                            {question.correctAnswer === "true" && (
                              <span className="mr-auto text-green-600 text-sm">✓ الإجابة الصحيحة</span>
                            )}
                          </div>
                        </div>
                        <div 
                          className={`p-3 rounded-md border ${
                            question.correctAnswer === "false" 
                              ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="ml-2 min-w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              خ
                            </div>
                            <span>خطأ</span>
                            {question.correctAnswer === "false" && (
                              <span className="mr-auto text-green-600 text-sm">✓ الإجابة الصحيحة</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results">
          {attempts.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد محاولات</h3>
              <p className="text-muted-foreground mb-4">
                لم يقم أي طالب بمحاولة هذا الاختبار بعد
              </p>
              <Button asChild>
                <a href={`/take-quiz/${quiz.quizCode}`} target="_blank">
                  معاينة الاختبار
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">إحصائيات</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">عدد المحاولات</p>
                      <p className="text-2xl font-bold">{attempts.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">متوسط العلامة</p>
                      <p className="text-2xl font-bold">
                        {attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / attempts.length}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">أعلى علامة</p>
                      <p className="text-2xl font-bold">
                        {Math.max(...attempts.map(attempt => (attempt.score / attempt.totalQuestions) * 100))}%
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mt-6 mb-4">نتائج الطلاب</h3>
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 flex gap-4 font-medium">
                  <div className="w-12 text-center">#</div>
                  <div className="flex-1">الاسم</div>
                  <div className="w-32 text-center">النتيجة</div>
                  <div className="w-40 text-center">التاريخ</div>
                </div>
                
                {attempts.map((attempt, index) => (
                  <div key={attempt.id} className="px-4 py-3 flex gap-4 border-t">
                    <div className="w-12 text-center text-muted-foreground">{index + 1}</div>
                    <div className="flex-1 font-medium">{attempt.takerName}</div>
                    <div className="w-32 text-center">
                      <span className={`font-medium ${
                        (attempt.score / attempt.totalQuestions) >= 0.7 
                          ? "text-green-600" 
                          : (attempt.score / attempt.totalQuestions) >= 0.5 
                            ? "text-amber-600" 
                            : "text-red-600"
                      }`}>
                        {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                      </span>
                    </div>
                    <div className="w-40 text-center text-muted-foreground">
                      {new Date(attempt.submittedAt).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AddQuestionModal 
        isOpen={isAddQuestionModalOpen} 
        onClose={() => setIsAddQuestionModalOpen(false)} 
        quizId={quizId} 
        onSuccess={refetch} 
      />
    </div>
  );
}

function AddQuestionModal({ isOpen, onClose, quizId, onSuccess }) {
  const { toast } = useToast();
  const [type, setType] = useState("multiple-choice");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setType("multiple-choice");
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
    }
  }, [isOpen]);
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (questionText.trim() === "") {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص السؤال",
        variant: "destructive",
      });
      return;
    }
    
    if (type === "multiple-choice") {
      // Check if at least 2 options are provided
      const validOptions = options.filter(opt => opt.trim() !== "");
      if (validOptions.length < 2) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال خيارين على الأقل",
          variant: "destructive",
        });
        return;
      }
      
      // Check if a correct answer is selected
      if (!correctAnswer) {
        toast({
          title: "خطأ",
          description: "يرجى اختيار الإجابة الصحيحة",
          variant: "destructive",
        });
        return;
      }
    } else if (type === "true-false") {
      // Check if a correct answer is selected for true/false
      if (!correctAnswer) {
        toast({
          title: "خطأ",
          description: "يرجى اختيار الإجابة الصحيحة",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText,
          questionType: type,
          options: type === "multiple-choice" ? options.filter(opt => opt.trim() !== "") : [],
          correctAnswer,
          order: 0, // The order will be set on the server
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add question");
      }
      
      toast({
        title: "تم إضافة السؤال",
        description: "تم إضافة السؤال بنجاح",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة السؤال",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة سؤال جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="questionType">نوع السؤال</Label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-reverse space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="multiple-choice"
                  checked={type === "multiple-choice"}
                  onChange={(e) => setType(e.target.value)}
                  className="w-4 h-4"
                />
                <span>اختيار من متعدد</span>
              </label>
              <label className="flex items-center space-x-reverse space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="true-false"
                  checked={type === "true-false"}
                  onChange={(e) => setType(e.target.value)}
                  className="w-4 h-4"
                />
                <span>صح أم خطأ</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="questionText">نص السؤال</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="اكتب نص السؤال هنا..."
              required
            />
          </div>
          
          {type === "multiple-choice" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الخيارات</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="min-w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`الخيار ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label>الإجابة الصحيحة</Label>
                <RadioGroup 
                  value={correctAnswer} 
                  onValueChange={setCorrectAnswer}
                  className="flex flex-col space-y-2"
                >
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-reverse space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} disabled={!option.trim()} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option || `الخيار ${index + 1}`}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
          
          {type === "true-false" && (
            <div className="space-y-2">
              <Label>الإجابة الصحيحة</Label>
              <RadioGroup 
                value={correctAnswer} 
                onValueChange={setCorrectAnswer}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-reverse space-x-2">
                  <RadioGroupItem value="true" id="answer-true" />
                  <Label htmlFor="answer-true" className="cursor-pointer">صحيح</Label>
                </div>
                <div className="flex items-center space-x-reverse space-x-2">
                  <RadioGroupItem value="false" id="answer-false" />
                  <Label htmlFor="answer-false" className="cursor-pointer">خطأ</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإضافة..." : "إضافة السؤال"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
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