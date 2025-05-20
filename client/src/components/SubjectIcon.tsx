import { 
  BookText, 
  Languages, 
  Calculator, 
  Atom, 
  Rocket, 
  Microscope, 
  BookMarked, 
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectIconProps {
  subject: string;
  className?: string;
  size?: number;
  colorClassName?: string;
}

export function SubjectIcon({
  subject,
  className,
  size = 16,
  colorClassName
}: SubjectIconProps) {
  const getIcon = () => {
    switch (subject) {
      case 'arabic':
        return <BookText size={size} className={colorClassName || "text-arabic"} />;
      case 'english':
        return <Languages size={size} className={colorClassName || "text-english"} />;
      case 'math':
        return <Calculator size={size} className={colorClassName || "text-math"} />;
      case 'chemistry':
        return <Atom size={size} className={colorClassName || "text-chemistry"} />;
      case 'physics':
        return <Rocket size={size} className={colorClassName || "text-physics"} />;
      case 'biology':
        return <Microscope size={size} className={colorClassName || "text-biology"} />;
      case 'islamic':
        return <BookMarked size={size} className={colorClassName || "text-islamic"} />;
      case 'constitution':
        return <Building2 size={size} className={colorClassName || "text-constitution"} />;
      default:
        return <BookText size={size} className={colorClassName || "text-gray-500"} />;
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {getIcon()}
    </div>
  );
}