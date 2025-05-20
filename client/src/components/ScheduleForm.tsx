import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { subjectsList, weekdays } from "@/lib/subjects";
import { SubjectIcon } from "./SubjectIcon";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  weekToEdit?: any;
}

// Schema for a single day in the schedule
const examDaySchema = z.object({
  day: z.string(),
  active: z.boolean().default(false),
  date: z.string().optional(),
  subject: z.string().optional(),
  lessons: z.string().optional(),
});

// Schema for the entire week
const formSchema = z.object({
  name: z.string().min(1, { message: "يرجى إدخال اسم الأسبوع" }),
  days: z.array(examDaySchema),
});

// Generate default form values for each day of the week
const getDefaultDays = () => {
  return weekdays.map(day => ({
    day: day.id,
    active: false,
    date: "",
    subject: "",
    lessons: ""
  }));
};

export function ScheduleForm({
  isOpen,
  onClose,
  onSuccess,
  weekToEdit,
}: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const isEditMode = !!weekToEdit;

  // Prepare form default values
  const defaultValues = isEditMode
    ? {
        name: weekToEdit.name,
        days: weekdays.map(dayType => {
          const existingDay = weekToEdit.days.find((d: any) => d.day === dayType.id);
          return {
            day: dayType.id,
            active: !!existingDay,
            date: existingDay?.date || "",
            subject: existingDay?.subject || "",
            lessons: existingDay?.lessons || "",
          };
        }),
      }
    : {
        name: "",
        days: getDefaultDays(),
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { watch } = form;
  const watchedDays = watch("days");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Format days data - only include active days with complete data
      const formattedDays = values.days
        .filter(day => day.active)
        .map(day => ({
          day: day.day,
          date: day.date || "",
          subject: day.subject || "",
          lessons: day.lessons || "",
          active: true
        }));
      
      if (isEditMode) {
        // Update existing week
        const response = await fetch(`/api/exams/weeks/${weekToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({
            name: values.name,
            days: formattedDays,
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Schedule update error:", errorData);
          throw new Error(errorData.message || "Failed to update schedule");
        }
        
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث جدول الاختبارات بنجاح",
        });
      } else {
        // Create new week
        const response = await fetch("/api/exams/weeks", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({
            name: values.name,
            days: formattedDays,
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Schedule creation error:", errorData);
          throw new Error(errorData.message || "Failed to create schedule");
        }
        
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تم إضافة جدول الاختبارات بنجاح",
        });
      }
      
      // Close dialog and refresh data
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Schedule form submission error:", error);
      toast({
        title: "خطأ",
        description: isEditMode 
          ? "حدث خطأ أثناء تحديث جدول الاختبارات"
          : "حدث خطأ أثناء إضافة جدول الاختبارات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "تعديل جدول اختبارات" : "إضافة جدول اختبارات جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "قم بتعديل جدول الاختبارات"
              : "قم بإضافة جدول اختبارات جديد للأسبوع"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الأسبوع</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثال: الأسبوع الأول (10-14 أكتوبر 2023)"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">أيام الاختبارات</h4>
              
              <Accordion type="multiple" className="w-full">
                {weekdays.map((weekday, index) => (
                  <AccordionItem key={weekday.id} value={weekday.id}>
                    <div className="flex items-center">
                      <FormField
                        control={form.control}
                        name={`days.${index}.active`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-x-reverse mr-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <AccordionTrigger className="py-2">
                        {weekday.name}
                      </AccordionTrigger>
                    </div>
                    
                    <AccordionContent>
                      {watchedDays[index].active && (
                        <div className="grid grid-cols-1 gap-3 mt-2">
                          <FormField
                            control={form.control}
                            name={`days.${index}.date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>التاريخ</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`days.${index}.subject`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>المادة</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر المادة" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subjectsList.map((subject) => (
                                      <SelectItem key={subject.id} value={subject.id}>
                                        <div className="flex items-center">
                                          <SubjectIcon
                                            subject={subject.id}
                                            size={16}
                                            colorClassName={`text-${subject.id}`}
                                          />
                                          <span className="mr-2">{subject.arabicName}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`days.${index}.lessons`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الدروس المقررة</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="مثال: الوحدة الأولى - الاحتمالات والإحصاء (ص 15-42)"
                                    {...field}
                                    dir="rtl"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التنفيذ...
                  </>
                ) : isEditMode ? (
                  "تحديث"
                ) : (
                  "حفظ الجدول"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
