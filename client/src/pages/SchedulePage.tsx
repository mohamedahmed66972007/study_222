import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleForm } from "@/components/ScheduleForm";
import { useAuth } from "@/lib/auth";
import { getSubjectName, weekdays } from "@/lib/subjects";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Loader2, AlertTriangle } from "lucide-react";

export default function SchedulePage() {
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [weekToEdit, setWeekToEdit] = useState<any>(null);
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all exam weeks
  const {
    data: examWeeks,
    isLoading: isWeeksLoading,
    isError: isWeeksError,
  } = useQuery({
    queryKey: ["/api/exams/weeks"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch exam weeks");
      return res.json();
    },
  });

  // Fetch selected week details with days
  const {
    data: selectedWeek,
    isLoading: isWeekDetailsLoading,
    isError: isWeekDetailsError,
  } = useQuery({
    queryKey: [selectedWeekId ? `/api/exams/weeks/${selectedWeekId}` : null],
    queryFn: async ({ queryKey }) => {
      if (!queryKey[0]) return null;
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch week details");
      return res.json();
    },
    enabled: !!selectedWeekId,
  });

  // Set initial selected week when data loads
  if (examWeeks && examWeeks.length > 0 && !selectedWeekId) {
    setSelectedWeekId(examWeeks[0].id.toString());
  }

  // Handle week change
  const handleWeekChange = (value: string) => {
    setSelectedWeekId(value);
  };

  // Handle week delete
  const handleDeleteWeek = async () => {
    try {
      if (!selectedWeekId) return;
      
      if (!window.confirm("هل أنت متأكد من حذف هذا الأسبوع؟")) {
        return;
      }
      
      await apiRequest(
        "DELETE",
        `/api/exams/weeks/${selectedWeekId}`,
        undefined,
        getAuthHeader()
      );
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف جدول الاختبارات بنجاح",
      });
      
      // Refetch weeks
      queryClient.invalidateQueries({ queryKey: ["/api/exams/weeks"] });
      setSelectedWeekId("");
    } catch (error) {
      console.error("Delete week error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف جدول الاختبارات",
        variant: "destructive",
      });
    }
  };

  // Handle week edit
  const handleEditWeek = () => {
    if (selectedWeek) {
      setWeekToEdit(selectedWeek);
      setIsScheduleModalOpen(true);
    }
  };

  // Close modals
  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setWeekToEdit(null);
  };

  // Refresh data after successful save
  const handleScheduleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/exams/weeks"] });
    if (selectedWeekId) {
      queryClient.invalidateQueries({
        queryKey: [`/api/exams/weeks/${selectedWeekId}`],
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    // Handle both date object strings and ISO strings
    try {
      // Try to parse as MM/DD/YYYY format first
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return dateString; // Already in desired format
      }
      
      // Try to parse as YYYY-MM-DD format
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      }
      
      // Try to parse as ISO date
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-EG', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Get day name in Arabic
  const getDayName = (day: string) => {
    const dayInfo = weekdays.find(d => d.id === day);
    return dayInfo ? dayInfo.name : day;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Schedule Section */}
      <section className="mb-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary dark:text-primary-foreground">
                جدول الاختبارات
              </h2>
              {isAuthenticated && (
                <div className="flex gap-2">
                  {selectedWeek && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleEditWeek}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteWeek}
                      >
                        حذف
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setIsScheduleModalOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة جدول جديد
                  </Button>
                </div>
              )}
            </div>

            {/* Week Selector */}
            <div className="mb-6">
              <label
                htmlFor="week-selector"
                className="block text-sm font-medium mb-1"
              >
                اختر الأسبوع
              </label>
              {isWeeksLoading ? (
                <div className="flex items-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري التحميل...
                </div>
              ) : isWeeksError ? (
                <div className="text-red-500 mt-2">
                  حدث خطأ أثناء تحميل الجداول
                </div>
              ) : examWeeks && examWeeks.length > 0 ? (
                <Select
                  value={selectedWeekId.toString()}
                  onValueChange={handleWeekChange}
                >
                  <SelectTrigger id="week-selector" className="w-full md:w-1/3">
                    <SelectValue placeholder="اختر الأسبوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {examWeeks.map((week: any) => (
                      <SelectItem key={week.id} value={week.id.toString()}>
                        {week.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 mt-2">
                  لا توجد جداول متاحة
                </div>
              )}
            </div>

            {/* Schedule Table */}
            {isWeekDetailsLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isWeekDetailsError ? (
              <div className="text-center py-10">
                <p className="text-red-500">
                  حدث خطأ أثناء تحميل تفاصيل الجدول. يرجى المحاولة مرة أخرى.
                </p>
              </div>
            ) : selectedWeek && selectedWeek.days && selectedWeek.days.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اليوم</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المادة</TableHead>
                      <TableHead className="text-right">الدروس المقررة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedWeek.days.map((day: any) => (
                      <TableRow key={day.id}>
                        <TableCell className="font-medium">
                          {getDayName(day.day)}
                        </TableCell>
                        <TableCell>{formatDate(day.date)}</TableCell>
                        <TableCell 
                          className="font-medium"
                          style={{ color: day.subject ? getSubjectName(day.subject, false) : undefined }}
                        >
                          {getSubjectName(day.subject)}
                        </TableCell>
                        <TableCell>{day.lessons}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 flex flex-col items-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  لا توجد اختبارات مجدولة لهذا الأسبوع
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Schedule Modal */}
      <ScheduleForm
        isOpen={isScheduleModalOpen}
        onClose={handleCloseScheduleModal}
        onSuccess={handleScheduleSuccess}
        weekToEdit={weekToEdit}
      />
    </div>
  );
}
