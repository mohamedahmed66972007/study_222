import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubjectIcon } from "@/components/SubjectIcon";
import { getSubjectInfo, getSubjectName } from "@/lib/subjects";
import { Eye, Download, Trash, Edit } from "lucide-react";
import { Subject } from "@shared/schema";
import { useAuth } from "@/lib/auth";

interface SubjectCardProps {
  id: number;
  title: string;
  subject: Subject;
  grade: string;
  semester: string;
  uploadDate: string;
  filePath: string;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onPreview?: (id: number) => void;
}

export function SubjectCard({
  id,
  title,
  subject,
  grade,
  semester,
  uploadDate,
  filePath,
  onDelete,
  onEdit,
  onPreview,
}: SubjectCardProps) {
  const { isAuthenticated } = useAuth();
  const subjectInfo = getSubjectInfo(subject);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(date);
  };

  // Get semester name
  const getSemesterName = (sem: string) => {
    return sem === 'first' ? 'الأول' : 'الثاني';
  };

  // Get grade name
  const getGradeName = (g: string) => {
    return g === '12' ? 'الثاني عشر' : g;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-40 relative overflow-hidden" 
        style={{ backgroundColor: subjectInfo.color }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-20">
          <SubjectIcon subject={subject} size={48} />
          <h3 className="text-white font-bold text-xl mt-2">
            {subjectInfo.arabicName}
          </h3>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-semibold mb-2 text-lg">{title}</h4>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          <p className="mb-1"><span className="font-medium">الصف:</span> {getGradeName(grade)}</p>
          <p className="mb-1"><span className="font-medium">الفصل الدراسي:</span> {getSemesterName(semester)}</p>
          <p><span className="font-medium">تاريخ الرفع:</span> {formatDate(uploadDate)}</p>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800"
            onClick={() => onPreview && onPreview(id)}
          >
            <Eye className="h-4 w-4 ml-1" />
            عرض
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-800"
            asChild
          >
            <a href={filePath} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 ml-1" />
              تحميل
            </a>
          </Button>
          
          {isAuthenticated && (
            <div className="ml-auto flex space-x-2 space-x-reverse">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-800/50"
                onClick={() => onDelete && onDelete(id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
                onClick={() => onEdit && onEdit(id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
