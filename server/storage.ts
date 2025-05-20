import { users, files, examWeeks, examDays, quizzes, quizQuestions, quizAttempts, 
  type User, type InsertUser, type File, type InsertFile, 
  type ExamWeek, type InsertExamWeek, type ExamDay, type InsertExamDay,
  type Quiz, type InsertQuiz, type QuizQuestion, type InsertQuizQuestion,
  type QuizAttempt, type InsertQuizAttempt
} from "@shared/schema";
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Create uploads directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create uploads directory:', error);
  }
})();

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File methods
  getFiles(): Promise<File[]>;
  getFileById(id: number): Promise<File | undefined>;
  getFilesByFilters(grade: string, subject: string, semester: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Exam schedule methods
  getExamWeeks(): Promise<ExamWeek[]>;
  getExamWeekById(id: number): Promise<ExamWeek | undefined>;
  createExamWeek(examWeek: InsertExamWeek): Promise<ExamWeek>;
  updateExamWeek(id: number, examWeek: Partial<InsertExamWeek>): Promise<ExamWeek | undefined>;
  deleteExamWeek(id: number): Promise<boolean>;
  
  // Exam days methods
  getExamDaysByWeekId(weekId: number): Promise<ExamDay[]>;
  createExamDay(examDay: InsertExamDay): Promise<ExamDay>;
  updateExamDay(id: number, examDay: Partial<InsertExamDay>): Promise<ExamDay | undefined>;
  deleteExamDay(id: number): Promise<boolean>;
  
  // Quiz methods
  getQuizzes(): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  getQuizByCode(code: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz & { quizCode: string }): Promise<Quiz>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;
  
  // Quiz question methods
  getQuestionsByQuizId(quizId: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  updateQuizQuestion(id: number, question: Partial<InsertQuizQuestion>): Promise<QuizQuestion | undefined>;
  deleteQuizQuestion(id: number): Promise<boolean>;
  
  // Quiz attempt methods
  getAttemptsByQuizId(quizId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private examWeeks: Map<number, ExamWeek>;
  private examDays: Map<number, ExamDay>;
  private quizzes: Map<number, Quiz>;
  private quizQuestions: Map<number, QuizQuestion>;
  private quizAttempts: Map<number, QuizAttempt>;
  private currentUserId: number;
  private currentFileId: number;
  private currentExamWeekId: number;
  private currentExamDayId: number;
  private currentQuizId: number;
  private currentQuizQuestionId: number;
  private currentQuizAttemptId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.examWeeks = new Map();
    this.examDays = new Map();
    this.quizzes = new Map();
    this.quizQuestions = new Map();
    this.quizAttempts = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
    this.currentExamWeekId = 1;
    this.currentExamDayId = 1;
    this.currentQuizId = 1;
    this.currentQuizQuestionId = 1;
    this.currentQuizAttemptId = 1;
    
    // Add the default admin user
    this.createUser({
      username: 'mohamed_admen_mo2025',
      password: 'mohamed_admen_mo2025#'
    }).catch(console.error);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    
    this.users.set(id, user);
    
    return user;
  }
  
  // File methods
  async getFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }
  
  async getFileById(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  async getFilesByFilters(grade: string, subject: string, semester: string): Promise<File[]> {
    let filteredFiles = Array.from(this.files.values());
    
    if (grade) {
      filteredFiles = filteredFiles.filter(file => file.grade === grade);
    }
    
    if (subject) {
      filteredFiles = filteredFiles.filter(file => file.subject === subject);
    }
    
    if (semester) {
      filteredFiles = filteredFiles.filter(file => file.semester === semester);
    }
    
    return filteredFiles;
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const now = new Date();
    const file: File = { ...insertFile, id, uploadDate: now };
    
    this.files.set(id, file);
    
    return file;
  }
  
  async updateFile(id: number, updateData: Partial<InsertFile>): Promise<File | undefined> {
    const file = this.files.get(id);
    
    if (!file) {
      return undefined;
    }
    
    const updatedFile = { ...file, ...updateData };
    this.files.set(id, updatedFile);
    
    return updatedFile;
  }
  
  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }
  
  // Exam Week methods
  async getExamWeeks(): Promise<ExamWeek[]> {
    return Array.from(this.examWeeks.values());
  }
  
  async getExamWeekById(id: number): Promise<ExamWeek | undefined> {
    return this.examWeeks.get(id);
  }
  
  async createExamWeek(examWeek: InsertExamWeek): Promise<ExamWeek> {
    const id = this.currentExamWeekId++;
    const newExamWeek: ExamWeek = { ...examWeek, id };
    
    this.examWeeks.set(id, newExamWeek);
    
    return newExamWeek;
  }
  
  async updateExamWeek(id: number, updateData: Partial<InsertExamWeek>): Promise<ExamWeek | undefined> {
    const examWeek = this.examWeeks.get(id);
    
    if (!examWeek) {
      return undefined;
    }
    
    const updatedExamWeek = { ...examWeek, ...updateData };
    this.examWeeks.set(id, updatedExamWeek);
    
    return updatedExamWeek;
  }
  
  async deleteExamWeek(id: number): Promise<boolean> {
    if (!this.examWeeks.has(id)) {
      return false;
    }
    
    // Also delete related exam days
    for (const [dayId, day] of this.examDays.entries()) {
      if (day.weekId === id) {
        this.examDays.delete(dayId);
      }
    }
    
    this.examWeeks.delete(id);
    return true;
  }
  
  async getExamDaysByWeekId(weekId: number): Promise<ExamDay[]> {
    const days: ExamDay[] = [];
    
    for (const day of this.examDays.values()) {
      if (day.weekId === weekId) {
        days.push(day);
      }
    }
    
    return days;
  }
  
  async createExamDay(examDay: InsertExamDay): Promise<ExamDay> {
    const id = this.currentExamDayId++;
    const newExamDay: ExamDay = { ...examDay, id };
    
    this.examDays.set(id, newExamDay);
    
    return newExamDay;
  }
  
  async updateExamDay(id: number, updateData: Partial<InsertExamDay>): Promise<ExamDay | undefined> {
    const examDay = this.examDays.get(id);
    if (!examDay) return undefined;
    
    const updatedExamDay = { ...examDay, ...updateData };
    this.examDays.set(id, updatedExamDay);
    return updatedExamDay;
  }

  async deleteExamDay(id: number): Promise<boolean> {
    return this.examDays.delete(id);
  }
  
  // Quiz methods
  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }
  
  async getQuizById(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }
  
  async getQuizByCode(code: string): Promise<Quiz | undefined> {
    for (const quiz of this.quizzes.values()) {
      if (quiz.quizCode === code) {
        return quiz;
      }
    }
    return undefined;
  }
  
  async createQuiz(quiz: InsertQuiz & { quizCode: string }): Promise<Quiz> {
    const id = this.currentQuizId++;
    const now = new Date();
    // Make sure isPublic has a default value
    const quizWithDefaults = {
      ...quiz,
      isPublic: quiz.isPublic ?? true
    };
    const newQuiz: Quiz = { ...quizWithDefaults, id, createdAt: now };
    
    this.quizzes.set(id, newQuiz);
    
    return newQuiz;
  }
  
  async updateQuiz(id: number, updateData: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    
    if (!quiz) {
      return undefined;
    }
    
    const updatedQuiz = { ...quiz, ...updateData };
    this.quizzes.set(id, updatedQuiz);
    
    return updatedQuiz;
  }
  
  async deleteQuiz(id: number): Promise<boolean> {
    if (!this.quizzes.has(id)) {
      return false;
    }
    
    // Also delete related questions and attempts
    for (const [questionId, question] of this.quizQuestions.entries()) {
      if (question.quizId === id) {
        this.quizQuestions.delete(questionId);
      }
    }
    
    for (const [attemptId, attempt] of this.quizAttempts.entries()) {
      if (attempt.quizId === id) {
        this.quizAttempts.delete(attemptId);
      }
    }
    
    this.quizzes.delete(id);
    return true;
  }
  
  // Quiz Question methods
  async getQuestionsByQuizId(quizId: number): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];
    
    for (const question of this.quizQuestions.values()) {
      if (question.quizId === quizId) {
        questions.push(question);
      }
    }
    
    // Sort by order
    questions.sort((a, b) => a.order - b.order);
    
    return questions;
  }
  
  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.currentQuizQuestionId++;
    const newQuestion: QuizQuestion = { ...question, id };
    
    this.quizQuestions.set(id, newQuestion);
    
    return newQuestion;
  }
  
  async updateQuizQuestion(id: number, updateData: Partial<InsertQuizQuestion>): Promise<QuizQuestion | undefined> {
    const question = this.quizQuestions.get(id);
    
    if (!question) {
      return undefined;
    }
    
    const updatedQuestion = { ...question, ...updateData };
    this.quizQuestions.set(id, updatedQuestion);
    
    return updatedQuestion;
  }
  
  async deleteQuizQuestion(id: number): Promise<boolean> {
    if (!this.quizQuestions.has(id)) {
      return false;
    }
    
    this.quizQuestions.delete(id);
    return true;
  }
  
  // Quiz Attempt methods
  async getAttemptsByQuizId(quizId: number): Promise<QuizAttempt[]> {
    const attempts: QuizAttempt[] = [];
    
    for (const attempt of this.quizAttempts.values()) {
      if (attempt.quizId === quizId) {
        attempts.push(attempt);
      }
    }
    
    // Sort by submitted date, newest first
    attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    
    return attempts;
  }
  
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.currentQuizAttemptId++;
    const now = new Date();
    const newAttempt: QuizAttempt = { ...attempt, id, submittedAt: now };
    
    this.quizAttempts.set(id, newAttempt);
    
    return newAttempt;
  }
}

export const storage = new MemStorage();