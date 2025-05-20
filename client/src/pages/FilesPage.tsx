import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectCard } from "@/components/ui/subject-card";
import { FileUploadForm } from "@/components/FileUploadForm";
import { FilePreview } from "@/components/FilePreview";
import { useAuth } from "@/lib/auth";
import { subjectsList, validSemesters, validGrades } from "@/lib/subjects";
import { File } from "@shared/schema";
import { Plus, SearchIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";

export default function FilesPage() {
  const [grade, setGrade] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [semester, setSemester] = useState<string>("all");
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileToEdit, setFileToEdit] = useState<File | null>(null);
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build query key with filters
  const filesQueryKey = `/api/files?grade=${grade}&subject=${subject}&semester=${semester}`;

  // Fetch files with filters
  const {
    data: files,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [filesQueryKey],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Handle file delete
  const handleDeleteFile = async (id: number) => {
    try {
      if (!window.confirm("هل أنت متأكد من حذف هذا الملف؟")) {
        return;
      }
      
      await apiRequest("DELETE", `/api/files/${id}`, undefined, getAuthHeader());
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الملف بنجاح",
      });
      
      // Refetch files
      queryClient.invalidateQueries({ queryKey: [filesQueryKey] });
    } catch (error) {
      console.error("Delete file error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الملف",
        variant: "destructive",
      });
    }
  };

  // Handle file edit
  const handleEditFile = (id: number) => {
    const file = files.find((f: File) => f.id === id);
    if (file) {
      setFileToEdit(file);
      setIsUploadModalOpen(true);
    }
  };

  // Handle file preview
  const handlePreviewFile = (id: number) => {
    const file = files.find((f: File) => f.id === id);
    if (file) {
      setSelectedFile(file);
      setIsPreviewModalOpen(true);
    }
  };

  // Close modals
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setFileToEdit(null);
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setSelectedFile(null);
  };

  // Refresh files after successful upload/edit
  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [filesQueryKey] });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="mb-10">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary dark:text-primary-foreground">
              مرحباً بك في منصة دفعة 2026
            </h2>
            <p className="mb-4">
              هذه المنصة توفر المواد التعليمية وجداول الاختبارات للصف الثاني عشر.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full ml-4">
                  <SearchIcon className="text-blue-500 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold">الملفات التعليمية</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    تصفح الملفات حسب المادة والفصل الدراسي
                  </p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full ml-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-green-500 dark:text-green-300"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">جدول الاختبارات</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    اطلع على مواعيد الاختبارات والدروس المقررة
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Files Section */}
      <section className="mb-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary dark:text-primary-foreground">
                الملفات التعليمية
              </h2>
              {isAuthenticated && (
                <div>
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة ملف
                  </Button>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label
                  htmlFor="grade-filter"
                  className="block text-sm font-medium mb-1"
                >
                  الصف
                </label>
                <Select
                  defaultValue="all"
                  onValueChange={(value) => setGrade(value)}
                >
                  <SelectTrigger id="grade-filter" className="w-full">
                    <SelectValue placeholder="جميع الصفوف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الصفوف</SelectItem>
                    {validGrades.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/3">
                <label
                  htmlFor="subject-filter"
                  className="block text-sm font-medium mb-1"
                >
                  المادة
                </label>
                <Select
                  defaultValue="all"
                  onValueChange={(value) => setSubject(value)}
                >
                  <SelectTrigger id="subject-filter" className="w-full">
                    <SelectValue placeholder="جميع المواد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المواد</SelectItem>
                    {subjectsList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.arabicName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/3">
                <label
                  htmlFor="semester-filter"
                  className="block text-sm font-medium mb-1"
                >
                  الفصل الدراسي
                </label>
                <Select
                  defaultValue="all"
                  onValueChange={(value) => setSemester(value)}
                >
                  <SelectTrigger id="semester-filter" className="w-full">
                    <SelectValue placeholder="جميع الفصول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفصول</SelectItem>
                    {validSemesters.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Files Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-red-500">
                  حدث خطأ أثناء تحميل الملفات. يرجى المحاولة مرة أخرى.
                </p>
              </div>
            ) : files && files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file: File) => (
                  <SubjectCard
                    key={file.id}
                    id={file.id}
                    title={file.title}
                    subject={file.subject}
                    grade={file.grade}
                    semester={file.semester}
                    uploadDate={file.uploadDate}
                    filePath={file.filePath}
                    onDelete={handleDeleteFile}
                    onEdit={handleEditFile}
                    onPreview={handlePreviewFile}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  لا توجد ملفات متاحة بالمعايير المحددة.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* File Upload Modal */}
      <FileUploadForm
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onSuccess={handleUploadSuccess}
        fileToEdit={fileToEdit}
      />

      {/* File Preview Modal */}
      <FilePreview
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        file={selectedFile}
      />
    </div>
  );
}
