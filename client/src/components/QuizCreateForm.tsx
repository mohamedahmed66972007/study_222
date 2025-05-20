import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { subjectsList } from "@/lib/subjects";

interface QuizCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "العنوان يجب أن يكون 3 أحرف على الأقل" }).max(100),
  subject: z.string({ required_error: "يرجى اختيار المادة" }),
  creatorName: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
  isPublic: z.boolean().default(true),
});

export function QuizCreateForm({ isOpen, onClose, onSuccess }: QuizCreateFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCode, setQuizCode] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      creatorName: "",
      isPublic: true,
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create quiz");
      }
      
      const data = await response.json();
      setQuizCode(data.quizCode);
      
      toast({
        title: "تم إنشاء الاختبار",
        description: "تم إنشاء الاختبار بنجاح ويمكنك الآن إضافة أسئلة إليه.",
      });
      
      onSuccess();
      
      // Navigate to created quiz
      window.location.href = `/quizzes/${data.id}`;
      
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الاختبار",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle dialog close - reset the form
  const handleClose = () => {
    form.reset();
    setQuizCode(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء اختبار جديد</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الاختبار</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان الاختبار" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المادة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjectsList.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.arabicName}
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
              name="creatorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المنشئ</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسمك أو اسم المعلم" {...field} />
                  </FormControl>
                  <FormDescription>
                    سيظهر هذا الاسم للطلاب عند البحث عن الاختبار
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      اختبار عام
                    </FormLabel>
                    <FormDescription>
                      الاختبارات العامة تظهر في قائمة البحث ويمكن للجميع الوصول إليها
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإنشاء..." : "إنشاء اختبار"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}