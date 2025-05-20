import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Admin authentication middleware
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Get authentication from headers
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }
  
  try {
    // Extract credentials from Basic Auth header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // Validate credentials
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
    }
    
    // Add user to request object
    (req as any).user = { id: user.id, username: user.username };
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
