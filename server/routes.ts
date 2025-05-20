import type { Express, Request, Response, NextFunction } from "express";
// Added explicit type definitions for multer file uploads
interface MulterRequest extends Request {
  file?: {
    filename: string;
    size: number;
    mimetype: string;
    path: string;
    destination: string;
    originalname: string;
  };
}
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateAdmin } from "./auth";
import { upload, getFilePath, getFileUrl } from "./fileUtils";
import { z } from "zod";
import { insertFileSchema, insertExamWeekSchema, insertExamDaySchema, validSubjects } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // --- Authentication routes ---
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      return res.status(200).json({ 
        message: 'Login successful',
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // --- File routes ---
  // Get all files or filter by query params
  app.get('/api/files', async (req: Request, res: Response) => {
    try {
      const grade = req.query.grade as string || 'all';
      const subject = req.query.subject as string || 'all';
      const semester = req.query.semester as string || 'all';
      
      const files = await storage.getFilesByFilters(grade, subject, semester);
      
      return res.status(200).json(files);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch files' });
    }
  });

  // Get file by ID
  app.get('/api/files/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid file ID' });
      }
      
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch file' });
    }
  });

  // Download file
  app.get('/api/files/download/:fileName', async (req: Request, res: Response) => {
    try {
      const fileName = req.params.fileName;
      const filePath = getFilePath(fileName);
      
      try {
        // Check if file exists
        await fs.access(filePath);
      } catch (err) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      return res.download(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to download file' });
    }
  });

  // Preview file
  app.get('/api/files/preview/:fileName', async (req: Request, res: Response) => {
    try {
      const fileName = req.params.fileName;
      const filePath = getFilePath(fileName);
      
      try {
        // Check if file exists
        await fs.access(filePath);
      } catch (err) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Stream file for preview
      const fileExtension = path.extname(fileName).toLowerCase();
      
      // Set appropriate content type
      let contentType = 'application/octet-stream';
      if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
      } else if (['.png', '.jpg', '.jpeg', '.gif'].includes(fileExtension)) {
        contentType = `image/${fileExtension.substring(1)}`;
      } else if (fileExtension === '.txt') {
        contentType = 'text/plain';
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      
      const fileStream = fs.readFile(filePath);
      return (await fileStream).forEach(chunk => res.write(chunk));
    } catch (error) {
      return res.status(500).json({ message: 'Failed to preview file' });
    }
  });

  // Upload file (admin only)
  app.post('/api/files', authenticateAdmin, upload.single('file'), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileData = {
        title: req.body.title,
        subject: req.body.subject,
        grade: req.body.grade,
        semester: req.body.semester,
        filePath: getFileUrl(req.file.filename),
        fileName: req.file.filename,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      };
      
      // Validate file data
      try {
        insertFileSchema.parse(fileData);
      } catch (error) {
        // Delete the uploaded file if validation fails
        await fs.unlink(getFilePath(req.file.filename)).catch(console.error);
        return res.status(400).json({ message: 'Invalid file data', errors: error });
      }
      
      // Create file record
      const file = await storage.createFile(fileData);
      
      return res.status(201).json(file);
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Update file (admin only)
  app.put('/api/files/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid file ID' });
      }
      
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      const updateData = {
        title: req.body.title,
        subject: req.body.subject,
        grade: req.body.grade,
        semester: req.body.semester
      };
      
      // Update file
      const updatedFile = await storage.updateFile(id, updateData);
      
      return res.status(200).json(updatedFile);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update file' });
    }
  });

  // Delete file (admin only)
  app.delete('/api/files/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid file ID' });
      }
      
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Delete file
      const deleted = await storage.deleteFile(id);
      
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete file' });
      }
      
      return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete file' });
    }
  });

  // --- Exam schedule routes ---
  // Get all exam weeks
  app.get('/api/exams/weeks', async (_req: Request, res: Response) => {
    try {
      const examWeeks = await storage.getExamWeeks();
      return res.status(200).json(examWeeks);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch exam weeks' });
    }
  });

  // Get single exam week with days
  app.get('/api/exams/weeks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid week ID' });
      }
      
      const week = await storage.getExamWeekById(id);
      
      if (!week) {
        return res.status(404).json({ message: 'Exam week not found' });
      }
      
      const days = await storage.getExamDaysByWeekId(id);
      
      return res.status(200).json({
        ...week,
        days
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch exam week' });
    }
  });

  // Create exam week (admin only)
  app.post('/api/exams/weeks', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      // Validate week data
      const weekData = {
        name: req.body.name
      };
      
      try {
        insertExamWeekSchema.parse(weekData);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid exam week data', errors: error });
      }
      
      // Create exam week
      const week = await storage.createExamWeek(weekData);
      
      // Process exam days
      const days = req.body.days || [];
      const createdDays = [];
      
      for (const day of days) {
        if (!day.active) continue;
        
        const dayData = {
          weekId: week.id,
          day: day.day,
          date: day.date,
          subject: day.subject,
          lessons: day.lessons
        };
        
        try {
          insertExamDaySchema.parse(dayData);
          const createdDay = await storage.createExamDay(dayData);
          createdDays.push(createdDay);
        } catch (error) {
          console.error('Failed to create exam day:', error);
        }
      }
      
      return res.status(201).json({
        ...week,
        days: createdDays
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create exam week' });
    }
  });

  // Update exam week (admin only)
  app.put('/api/exams/weeks/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid week ID' });
      }
      
      const week = await storage.getExamWeekById(id);
      
      if (!week) {
        return res.status(404).json({ message: 'Exam week not found' });
      }
      
      // Update week name
      const weekData = {
        name: req.body.name
      };
      
      const updatedWeek = await storage.updateExamWeek(id, weekData);
      
      // Handle days updates
      const existingDays = await storage.getExamDaysByWeekId(id);
      const daysById = new Map(existingDays.map(day => [day.id, day]));
      
      // Process updated days
      const updatedDays = [];
      
      if (req.body.days && Array.isArray(req.body.days)) {
        for (const day of req.body.days) {
          if (!day.active) {
            // Delete day if it exists and is now inactive
            if (day.id) {
              await storage.deleteExamDay(day.id);
            }
            continue;
          }
          
          const dayData = {
            weekId: id,
            day: day.day,
            date: day.date,
            subject: day.subject,
            lessons: day.lessons
          };
          
          if (day.id && daysById.has(day.id)) {
            // Update existing day
            const updatedDay = await storage.updateExamDay(day.id, dayData);
            if (updatedDay) updatedDays.push(updatedDay);
          } else {
            // Create new day
            const newDay = await storage.createExamDay(dayData);
            updatedDays.push(newDay);
          }
        }
      }
      
      return res.status(200).json({
        ...updatedWeek,
        days: updatedDays
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update exam week' });
    }
  });

  // Delete exam week (admin only)
  app.delete('/api/exams/weeks/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid week ID' });
      }
      
      const week = await storage.getExamWeekById(id);
      
      if (!week) {
        return res.status(404).json({ message: 'Exam week not found' });
      }
      
      // Delete week (will also delete related days)
      const deleted = await storage.deleteExamWeek(id);
      
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete exam week' });
      }
      
      return res.status(200).json({ message: 'Exam week deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete exam week' });
    }
  });

  // Quiz System Routes
  
  // Generate a unique 6-character quiz code
  const generateQuizCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };
  
  // Get all quizzes
  app.get('/api/quizzes', async (_req: Request, res: Response) => {
    try {
      const quizzes = await storage.getQuizzes();
      return res.status(200).json(quizzes);
    } catch (error) {
      console.error('Get quizzes error:', error);
      return res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
  });
  
  // Get a quiz by ID
  app.get('/api/quizzes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const quiz = await storage.getQuizById(id);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Get questions for the quiz
      const questions = await storage.getQuestionsByQuizId(id);
      
      return res.status(200).json({ quiz, questions });
    } catch (error) {
      console.error('Get quiz error:', error);
      return res.status(500).json({ message: 'Failed to fetch quiz' });
    }
  });
  
  // Get a quiz by code
  app.get('/api/quizzes/code/:code', async (req: Request, res: Response) => {
    try {
      const code = req.params.code.toUpperCase();
      
      const quiz = await storage.getQuizByCode(code);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Get questions for the quiz
      const questions = await storage.getQuestionsByQuizId(quiz.id);
      
      return res.status(200).json({ quiz, questions });
    } catch (error) {
      console.error('Get quiz by code error:', error);
      return res.status(500).json({ message: 'Failed to fetch quiz by code' });
    }
  });
  
  // Create a new quiz
  app.post('/api/quizzes', async (req: Request, res: Response) => {
    try {
      const { title, subject, creatorName, isPublic = true } = req.body;
      
      // Generate a unique code
      const quizCode = generateQuizCode();
      
      // Create quiz
      const quiz = await storage.createQuiz({
        title,
        subject,
        creatorName,
        quizCode,
        isPublic
      });
      
      return res.status(201).json(quiz);
    } catch (error) {
      console.error('Create quiz error:', error);
      return res.status(500).json({ message: 'Failed to create quiz' });
    }
  });
  
  // Add a question to a quiz
  app.post('/api/quizzes/:id/questions', async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      
      if (isNaN(quizId)) {
        return res.status(400).json({ message: 'Invalid quiz ID format' });
      }
      
      const quiz = await storage.getQuizById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      const { questionText, questionType, options, correctAnswer, order } = req.body;
      
      // Create question
      const question = await storage.createQuizQuestion({
        quizId,
        questionText,
        questionType,
        options,
        correctAnswer,
        order
      });
      
      return res.status(201).json(question);
    } catch (error) {
      console.error('Add question error:', error);
      return res.status(500).json({ message: 'Failed to add question to quiz' });
    }
  });
  
  // Submit a quiz attempt
  app.post('/api/quizzes/:id/attempts', async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      
      if (isNaN(quizId)) {
        return res.status(400).json({ message: 'Invalid quiz ID format' });
      }
      
      const quiz = await storage.getQuizById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      const { takerName, answers } = req.body;
      
      // Get questions to calculate score
      const questions = await storage.getQuestionsByQuizId(quizId);
      
      // Calculate score
      let score = 0;
      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (question && question.correctAnswer === answer.answer) {
          score++;
        }
      }
      
      // Create attempt
      const attempt = await storage.createQuizAttempt({
        quizId,
        takerName,
        score,
        totalQuestions: questions.length,
        answers
      });
      
      return res.status(201).json(attempt);
    } catch (error) {
      console.error('Submit attempt error:', error);
      return res.status(500).json({ message: 'Failed to submit quiz attempt' });
    }
  });
  
  // Get attempts for a quiz
  app.get('/api/quizzes/:id/attempts', async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      
      if (isNaN(quizId)) {
        return res.status(400).json({ message: 'Invalid quiz ID format' });
      }
      
      const quiz = await storage.getQuizById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      const attempts = await storage.getAttemptsByQuizId(quizId);
      
      return res.status(200).json(attempts);
    } catch (error) {
      console.error('Get attempts error:', error);
      return res.status(500).json({ message: 'Failed to fetch quiz attempts' });
    }
  });
  
  // Delete a quiz (admin or creator)
  app.delete('/api/quizzes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { creatorName } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const quiz = await storage.getQuizById(id);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Check if admin or creator
      const isAdmin = req.headers.authorization?.startsWith('Basic');
      const isCreator = quiz.creatorName === creatorName;
      
      if (!isAdmin && !isCreator) {
        return res.status(403).json({ message: 'Unauthorized: Only the creator or an admin can delete this quiz' });
      }
      
      const deleted = await storage.deleteQuiz(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      return res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Delete quiz error:', error);
      return res.status(500).json({ message: 'Failed to delete quiz' });
    }
  });
  
  // Export quiz to PDF
  app.get('/api/quizzes/:id/pdf', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const quiz = await storage.getQuizById(id);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Get questions for the quiz
      const questions = await storage.getQuestionsByQuizId(id);
      
      // Create HTML content for PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>${quiz.title}</title>
          <style>
            body {
              font-family: 'Cairo', 'Arial', sans-serif;
              padding: 20px;
              direction: rtl;
            }
            h1 {
              text-align: center;
              color: #333;
            }
            .quiz-info {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .question {
              margin-bottom: 15px;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .options {
              margin-top: 10px;
              list-style-type: none;
              padding-right: 0;
            }
            .option {
              margin-bottom: 5px;
              padding: 5px;
            }
          </style>
        </head>
        <body>
          <h1>${quiz.title}</h1>
          <div class="quiz-info">
            <p><strong>المادة:</strong> ${quiz.subject}</p>
            <p><strong>المنشئ:</strong> ${quiz.creatorName}</p>
            <p><strong>رمز الاختبار:</strong> ${quiz.quizCode}</p>
          </div>
          <div class="questions">
      `;
      
      questions.forEach((question, index) => {
        htmlContent += `
          <div class="question">
            <h3>${index + 1}. ${question.questionText}</h3>
            <ul class="options">
        `;
        
        question.options.forEach((option) => {
          htmlContent += `<li class="option">□ ${option}</li>`;
        });
        
        htmlContent += `
            </ul>
          </div>
        `;
      });
      
      htmlContent += `
          </div>
        </body>
        </html>
      `;
      
      // Set response headers
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="quiz-${quiz.quizCode}.html"`);
      
      return res.status(200).send(htmlContent);
    } catch (error) {
      console.error('Export quiz to PDF error:', error);
      return res.status(500).json({ message: 'Failed to export quiz to PDF' });
    }
  });

  return httpServer;
}
