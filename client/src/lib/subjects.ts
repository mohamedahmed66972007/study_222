import { Subject } from "@shared/schema";

export interface SubjectInfo {
  id: Subject;
  name: string;
  arabicName: string;
  color: string;
  icon: string;
}

export const subjects: Record<Subject, SubjectInfo> = {
  arabic: {
    id: "arabic",
    name: "Arabic",
    arabicName: "اللغة العربية",
    color: "text-arabic",
    icon: "BookText"
  },
  english: {
    id: "english",
    name: "English",
    arabicName: "اللغة الإنجليزية",
    color: "text-english",
    icon: "Languages"
  },
  math: {
    id: "math",
    name: "Mathematics",
    arabicName: "الرياضيات",
    color: "text-math",
    icon: "Calculator"
  },
  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    arabicName: "الكيمياء",
    color: "text-chemistry",
    icon: "Atom"
  },
  physics: {
    id: "physics",
    name: "Physics",
    arabicName: "الفيزياء",
    color: "text-physics",
    icon: "Rocket"
  },
  biology: {
    id: "biology",
    name: "Biology",
    arabicName: "الأحياء",
    color: "text-biology",
    icon: "Microscope"
  },
  islamic: {
    id: "islamic",
    name: "Islamic Studies",
    arabicName: "التربية الإسلامية",
    color: "text-islamic",
    icon: "BookMarked"
  },
  constitution: {
    id: "constitution",
    name: "Constitution",
    arabicName: "الدستور",
    color: "text-constitution",
    icon: "Building2"
  }
};

export const subjectsList = Object.values(subjects);

export const getSubjectInfo = (subjectId: Subject | string): SubjectInfo => {
  return subjects[subjectId as Subject] || subjects.arabic;
};

export const getSubjectColor = (subjectId: Subject | string): string => {
  return getSubjectInfo(subjectId).color;
};

export const getSubjectName = (subjectId: Subject | string, arabic = true): string => {
  const info = getSubjectInfo(subjectId);
  return arabic ? info.arabicName : info.name;
};

export const getSubjectIcon = (subjectId: Subject | string): string => {
  return getSubjectInfo(subjectId).icon;
};

export const validSemesters = [
  { id: "first", name: "الفصل الدراسي الأول" },
  { id: "second", name: "الفصل الدراسي الثاني" }
];

export const validGrades = [
  { id: "12", name: "الصف الثاني عشر" }
];

export const weekdays = [
  { id: "sunday", name: "الأحد", nameEn: "Sunday" },
  { id: "monday", name: "الإثنين", nameEn: "Monday" },
  { id: "tuesday", name: "الثلاثاء", nameEn: "Tuesday" },
  { id: "wednesday", name: "الأربعاء", nameEn: "Wednesday" },
  { id: "thursday", name: "الخميس", nameEn: "Thursday" }
];