import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Create uploads directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    console.log(`Uploads directory created at ${UPLOADS_DIR}`);
  } catch (error) {
    console.error('Failed to create uploads directory:', error);
  }
})();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Create a unique filename by combining timestamp and original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fileName = `file-${uniqueSuffix}${ext}`;
    cb(null, fileName);
  },
});

// Create multer instance with file size limits
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow common file types for educational materials
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Please upload a PDF, Word, Excel, PowerPoint, image, or text file.'));
    }
  },
});

// Get file path for serving
export function getFilePath(fileName: string): string {
  return path.join(UPLOADS_DIR, fileName);
}

// Get file URL for frontend
export function getFileUrl(fileName: string): string {
  return `/api/files/download/${fileName}`;
}
