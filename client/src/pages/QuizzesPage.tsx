import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { getSubjectName, getSubjectColor } from "@/lib/subjects";
import { SubjectIcon } from "@/components/SubjectIcon";
import { QuizCreateForm } from "@/components/QuizCreateForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookCopy,
  Plus,
  Search,
  PenLine,
  Users,
  ChevronRight,
  Clock,
  Trash2,
} from "lucide-react";

export default function QuizzesPage() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [codeQuery, setCodeQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Fetch all public quizzes
  const { data: quizzes = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const response = await fetch("/api/quizzes");
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      return response.json();
    }
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCodeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeQuery(e.target.value);
  };
  
  const handleSearchByCode = async () => {
    if (!codeQuery.trim()) return;
    
    try {
      window.location.href = `/take-quiz/${codeQuery.trim()}`;
    } catch (error) {
      console.error("Error searching for quiz by code:", error);
    }
  };
  
  const filteredQuizzes = Array.isArray(quizzes) 
    ? quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSubjectName(quiz.subject, false).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  return (
    <div className="container py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الاختبارات</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء اختبار</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="available" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="available">الاختبارات المتاحة</TabsTrigger>
          <TabsTrigger value="find">البحث برمز الاختبار</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <div className="relative mb-6">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن اختبار..."
              className="pr-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin mb-4">
                <BookCopy className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">جاري تحميل الاختبارات...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <BookCopy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد اختبارات متاحة</h3>
              <p className="text-muted-foreground mb-4">
                لم يتم العثور على اختبارات عامة، يمكنك إنشاء اختبار جديد أو البحث برمز اختبار محدد
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                إنشاء اختبار جديد
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuizzes.map(quiz => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onSuccess={refetch} 
                  showControls={isAuthenticated}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="find">
          <div className="rounded-lg p-6 bg-muted mb-6">
            <h3 className="text-lg font-medium mb-2">البحث برمز الاختبار</h3>
            <p className="text-muted-foreground mb-4">
              إذا كان لديك رمز اختبار، أدخله هنا للوصول إلى الاختبار مباشرة
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="أدخل رمز الاختبار..."
                value={codeQuery}
                onChange={handleCodeSearch}
                className="text-center text-lg font-mono tracking-wider"
              />
              <Button onClick={handleSearchByCode}>
                بحث
              </Button>
            </div>
          </div>
          
          <div className="text-center py-6 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              سيتم توجيهك مباشرة إلى صفحة الاختبار إذا كان الرمز صحيحًا
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <QuizCreateForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}

function QuizCard({ quiz, onSuccess, showControls = false }) {
  const timeSince = (date: Date) => {
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

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الاختبار؟")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        onSuccess();
      } else {
        throw new Error("Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <SubjectIcon 
                subject={quiz.subject} 
                size={16} 
                colorClassName={getSubjectColor(quiz.subject)}
              />
              <span>{getSubjectName(quiz.subject)}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <PenLine size={14} />
          <span>{quiz.creatorName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Clock size={14} />
          <span>منذ {timeSince(quiz.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-muted p-1 px-2 rounded text-xs font-mono">
            {quiz.quizCode}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/quizzes/${quiz.id}`}>
            <span className="flex items-center gap-1">
              إدارة الاختبار
              <ChevronRight size={16} />
            </span>
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/take-quiz/${quiz.quizCode}`}>
            <span className="flex items-center gap-1">
              بدء الاختبار
              <ChevronRight size={16} />
            </span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function getSubjectColor(subject) {
  const colors = {
    arabic: "text-arabic",
    english: "text-english",
    math: "text-math",
    chemistry: "text-chemistry",
    physics: "text-physics",
    biology: "text-biology",
    islamic: "text-islamic",
    constitution: "text-constitution",
  };
  
  return colors[subject] || "text-primary";
}