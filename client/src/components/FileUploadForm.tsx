import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { subjectsList, validSemesters, validGrades } from "@/lib/subjects";
import { SubjectIcon } from "./SubjectIcon";
import { useToast } from "@/hooks/use-toast";
import { insertFileSchema } from "@shared/schema";

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
import { Upload, Loader2 } from "lucide-react";

interface FileUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fileToEdit?: any;
}

// Extend the insert schema with client-side validation
const formSchema = insertFileSchema.extend({
  file: z.instanceof(FileList).refine(files => files.length === 1, {
    message: "يرجى اختيار ملف واحد",
  }).optional(),
});

export function FileUploadForm({
  isOpen,
  onClose,
  onSuccess,
  fileToEdit,
}: FileUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const { toast } = useToast();
  
  const isEditMode = !!fileToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fileToEdit ? {
      title: fileToEdit.title,
      subject: fileToEdit.subject,
      grade: fileToEdit.grade,
      semester: fileToEdit.semester,
    } : {
      title: "",
      subject: "",
      grade: "12", // Default to 12th grade
      semester: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
      form.setValue("file", files as unknown as FileList);
    } else {
      setSelectedFileName("");
      form.setValue("file", undefined);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        // Update existing file
        await apiRequest(
          "PUT",
          `/api/files/${fileToEdit.id}`,
          {
            title: values.title,
            subject: values.subject,
            grade: values.grade,
            semester: values.semester,
          }
        );
        
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث معلومات الملف بنجاح",
        });
      } else {
        // Create new file with upload
        if (!values.file || values.file.length === 0) {
          toast({
            title: "خطأ",
            description: "يرجى اختيار ملف للرفع",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("subject", values.subject);
        formData.append("grade", values.grade);
        formData.append("semester", values.semester);
        formData.append("file", values.file[0]);
        
        // Fix: Add proper error handling and content-type header removal
        const headers = getAuthHeader();
        // Don't include Content-Type header when using FormData
        delete (headers as any)['Content-Type'];
        
        const response = await fetch("/api/files", {
          method: "POST",
          headers,
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error("Failed to upload file");
        }
        
        toast({
          title: "تم الرفع بنجاح",
          description: "تم رفع الملف بنجاح",
        });
      }
      
      // Close the dialog and refresh files
      onSuccess();
      onClose();
    } catch (error) {
      console.error("File form submission error:", error);
      toast({
        title: "خطأ",
        description: isEditMode 
          ? "حدث خطأ أثناء تحديث الملف"
          : "حدث خطأ أثناء رفع الملف",
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
          <DialogTitle>
            {isEditMode ? "تعديل ملف" : "إضافة ملف جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "قم بتعديل معلومات الملف"
              : "قم برفع ملف جديد للصف الثاني عشر"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الملف</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل عنوان الملف"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصف</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {validGrades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
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
              name="subject"
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
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفصل الدراسي</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفصل الدراسي" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {validSemesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isEditMode && (
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>الملف</FormLabel>
                    <FormControl>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
                        <Input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-primary dark:text-primary-foreground hover:underline"
                        >
                          <Upload className="h-8 w-8 mx-auto mb-2" />
                          <p>انقر لاختيار ملف أو اسحب الملف هنا</p>
                        </label>
                        {selectedFileName && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {selectedFileName}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
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
                  "رفع الملف"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
