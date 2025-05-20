import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Educational files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  semester: text("semester").notNull(),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadDate: true,
});

// Exam schedule schema
export const examWeeks = pgTable("exam_weeks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertExamWeekSchema = createInsertSchema(examWeeks).omit({
  id: true,
});

export const examDays = pgTable("exam_days", {
  id: serial("id").primaryKey(),
  weekId: integer("week_id").notNull(),
  day: text("day").notNull(),
  date: text("date").notNull(),
  subject: text("subject").notNull(),
  lessons: text("lessons").notNull(),
});

export const insertExamDaySchema = createInsertSchema(examDays).omit({
  id: true,
});

// Quiz system schema
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  creatorName: text("creator_name").notNull(),
  quizCode: text("quiz_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  quizCode: true,
  createdAt: true,
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // 'multiple-choice', 'true-false'
  options: json("options").$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  order: integer("order").notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  takerName: text("taker_name").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: json("answers").$type<{questionId: number, answer: string}[]>().notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  submittedAt: true,
});

// Subject lookup for valid subjects
export const validSubjects = [
  "arabic",
  "english",
  "math",
  "chemistry",
  "physics",
  "biology",
  "islamic",
  "constitution"
];

export const subjectSchema = z.enum([
  "arabic",
  "english",
  "math",
  "chemistry",
  "physics",
  "biology",
  "islamic",
  "constitution"
]);

export const semesterSchema = z.enum(["first", "second"]);
export const daySchema = z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday"]);
export const questionTypeSchema = z.enum(["multiple-choice", "true-false"]);

// Types for our schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertExamWeek = z.infer<typeof insertExamWeekSchema>;
export type ExamWeek = typeof examWeeks.$inferSelect;

export type InsertExamDay = z.infer<typeof insertExamDaySchema>;
export type ExamDay = typeof examDays.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export type Subject = z.infer<typeof subjectSchema>;
export type Semester = z.infer<typeof semesterSchema>;
export type Day = z.infer<typeof daySchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
