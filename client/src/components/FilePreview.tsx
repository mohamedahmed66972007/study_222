import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File } from "@shared/schema";
import { getSubjectName } from "@/lib/subjects";
import { Download, X, Loader2 } from "lucide-react";
import { useState } from "react";

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

export function FilePreview({ isOpen, onClose, file }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("لا يمكن عرض هذا الملف. يرجى تحميله لعرضه.");
  };

  // Reset state when dialog opens
  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setIsLoading(true);
      setError(null);
    }
  };

  if (!file) return null;

  // Determine if the file can be previewed
  const canPreview = file.fileType.startsWith("image/") || 
                    file.fileType === "application/pdf" ||
                    file.fileType === "text/plain";

  const previewUrl = `/api/files/preview/${file.fileName}`;
  const downloadUrl = `/api/files/download/${file.fileName}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>{file.title}</DialogTitle>
          <DialogDescription>
            {getSubjectName(file.subject)} - الفصل {file.semester === "first" ? "الأول" : "الثاني"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[40vh] overflow-auto bg-gray-100 dark:bg-gray-800 rounded-md relative mt-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
              <X className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-center text-gray-700 dark:text-gray-300">{error}</p>
            </div>
          )}
          
          {canPreview ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
              <X className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-center text-gray-700 dark:text-gray-300">
                لا يمكن عرض هذا النوع من الملفات. يرجى تحميله لعرضه.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            إغلاق
          </Button>
          <Button asChild>
            <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 ml-2" />
              تحميل الملف
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
