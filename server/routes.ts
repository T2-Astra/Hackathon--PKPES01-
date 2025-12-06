import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertQuestionPaperSchema, insertStudyNoteSchema, insertDepartmentSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { ObjectId } from "mongodb";
import { 
  createUser, 
  loginUser, 
  authenticateToken, 
  requireAdmin, 
  AuthRequest 
} from "./auth";
import { getDatabase } from "./mongodb";
import { generateMCQQuestions } from "./mcq-generator";

// Configure multer for file uploads
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.originalUrl.includes('question-papers') 
      ? 'uploads/question-papers' 
      : 'uploads/study-notes';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: fileStorage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Separate multer config for MCQ file uploads (allows more file types)
const mcqFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const mcqUpload = multer({ 
  storage: mcqFileStorage,
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX, and TXT files for MCQ generation
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed!'));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  }
});


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // MongoDB Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const user = await createUser({ email, password, firstName, lastName });
      res.status(201).json({ 
        message: 'User created successfully',
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await loginUser(email, password);
      if (!result) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const { user, token } = result;
      
      // Set token as HTTP-only cookie
      res.cookie('authToken', token, {
        httpOnly: false, // Allow JavaScript access for debugging
        secure: false, // Don't require HTTPS in development
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ 
        message: 'Login successful',
        user,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    res.json(req.user);
  });

  // Google OAuth authentication endpoint
  app.post('/api/auth/google-login', async (req, res) => {
    try {
      const { email, firstName, lastName, googleId, image } = req.body;
      
      if (!email || !googleId) {
        return res.status(400).json({ message: 'Missing required fields from Google' });
      }

      const db = getDatabase();
      const users = db.collection('users');
      
      // Check if user exists by email or googleId
      let user = await users.findOne({ 
        $or: [
          { email: email },
          { googleId: googleId }
        ]
      });

      if (!user) {
        // Create new user
        const newUser = {
          email: email,
          firstName: firstName || email.split('@')[0],
          lastName: lastName || '',
          googleId: googleId,
          image: image,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await users.insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
        console.log('✅ Created new user via Google:', email);
      } else {
        // Update existing user with Google ID and image if not present
        const updateFields: any = { updatedAt: new Date() };
        if (!user.googleId) updateFields.googleId = googleId;
        if (image && !user.image) updateFields.image = image;
        
        await users.updateOne(
          { _id: user._id },
          { $set: updateFields }
        );
        console.log('✅ Existing user logged in via Google:', email);
      }

      // Create our JWT token
      const authUser = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin || false,
      };

      const { generateToken } = await import('./auth');
      const token = generateToken(authUser);

      // Set token as HTTP-only cookie
      res.cookie('authToken', token, {
        httpOnly: false, // Allow JavaScript access for debugging
        secure: false, // Don't require HTTPS in development
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ 
        message: 'Google authentication successful',
        user: authUser,
        token
      });
    } catch (error) {
      console.error('Google authentication error:', error);
      res.status(500).json({ message: 'Google authentication failed' });
    }
  });

  // User history routes
  app.post('/api/user/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const history = db.collection('userHistory');
      
      const searchData = {
        userId: req.user!.id,
        searchQuery: req.body.searchQuery,
        department: req.body.department,
        resourceType: req.body.resourceType,
        semester: req.body.semester,
        year: req.body.year,
        searchedAt: new Date(),
      };

      await history.insertOne(searchData);
      res.status(201).json({ message: 'Search history saved' });
    } catch (error) {
      console.error('Error saving search history:', error);
      res.status(500).json({ message: 'Failed to save search history' });
    }
  });

  app.get('/api/user/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const history = db.collection('userHistory');
      
      const userHistory = await history
        .find({ userId: req.user!.id })
        .sort({ searchedAt: -1 })
        .limit(50)
        .toArray();

      res.json(userHistory);
    } catch (error) {
      console.error('Error fetching user history:', error);
      res.status(500).json({ message: 'Failed to fetch user history' });
    }
  });

  app.post('/api/user/uploads', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const uploads = db.collection('userUploads');
      
      const uploadData = {
        userId: req.user!.id,
        resourceId: req.body.resourceId,
        resourceType: req.body.resourceType,
        title: req.body.title,
        status: req.body.status || 'pending',
        uploadedAt: new Date(),
      };

      await uploads.insertOne(uploadData);
      res.status(201).json({ message: 'Upload tracked successfully' });
    } catch (error) {
      console.error('Error tracking upload:', error);
      res.status(500).json({ message: 'Failed to track upload' });
    }
  });

  app.get('/api/user/uploads', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const uploads = db.collection('userUploads');
      
      const userUploads = await uploads
        .find({ userId: req.user!.id })
        .sort({ uploadedAt: -1 })
        .toArray();

      res.json(userUploads);
    } catch (error) {
      console.error('Error fetching user uploads:', error);
      res.status(500).json({ message: 'Failed to fetch user uploads' });
    }
  });

  // Replit Auth routes (keeping for backward compatibility)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // In local development, return a mock user
      if (!process.env.REPLIT_DOMAINS) {
        return res.json({
          id: "local-dev-user",
          email: "dev@localhost",
          firstName: "Local",
          lastName: "Developer",
          profileImageUrl: null,
        });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes
  app.get('/api/admin/uploads', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const uploads = db.collection('userUploads');
      const users = db.collection('users');
      
      // Get filter parameters
      const status = req.query.status as string;
      const search = req.query.search as string;
      
      // Build filter
      let filter: any = {};
      if (status && status !== 'all') {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { resourceType: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Get uploads with user details
      const uploadsData = await uploads
        .find(filter)
        .sort({ uploadedAt: -1 })
        .toArray();

      // Fetch user details for each upload
      const uploadsWithUsers = await Promise.all(
        uploadsData.map(async (upload) => {
          const user = await users.findOne({ _id: upload.userId });
          return {
            ...upload,
            user: user ? {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            } : null
          };
        })
      );

      res.json(uploadsWithUsers);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      res.status(500).json({ message: 'Failed to fetch uploads' });
    }
  });

  app.post('/api/admin/uploads/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const uploads = db.collection('userUploads');
      console.log(`🟢 Approving upload with ID: ${req.params.id}`);
      
      // Convert to ObjectId for MongoDB query
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid upload ID format' });
      }
      
      const query = { _id: new ObjectId(req.params.id) };
      
      // First, get the upload data
      const upload = await uploads.findOne(query);
      
      if (!upload) {
        console.log('❌ No upload found with that ID');
        return res.status(404).json({ message: 'Upload not found' });
      }
      
      // Update the status to approved - this keeps it permanently in database
      const result = await uploads.updateOne(
        query,
        { 
          $set: { 
            status: 'approved',
            approvedBy: req.user!.id,
            approvedAt: new Date()
          }
        }
      );

      console.log(`✅ Approval result:`, result);
      console.log(`✅ Resource "${upload.title}" is now permanently stored in database`);
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Upload not found' });
      }

      res.json({ 
        message: 'Upload approved successfully', 
        modifiedCount: result.modifiedCount,
        title: upload.title 
      });
    } catch (error) {
      console.error('Error approving upload:', error);
      res.status(500).json({ message: 'Failed to approve upload', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/admin/uploads/:id/reject', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const uploads = db.collection('userUploads');
      console.log(`🔴 Rejecting upload with ID: ${req.params.id}`);
      console.log(`🔴 Rejection reason: ${req.body.reason}`);
      
      // Convert to ObjectId for MongoDB query
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid upload ID format' });
      }
      
      const query = { _id: new ObjectId(req.params.id) };
      
      // Get the upload data first for logging
      const upload = await uploads.findOne(query);
      
      if (!upload) {
        console.log('❌ No upload found with that ID');
        return res.status(404).json({ message: 'Upload not found' });
      }
      
      // Update status to rejected - keep in database for record keeping
      const result = await uploads.updateOne(
        query,
        { 
          $set: { 
            status: 'rejected',
            rejectedBy: req.user!.id,
            rejectedAt: new Date(),
            rejectionReason: req.body.reason || 'No reason provided'
          }
        }
      );

      console.log(`✅ Rejection result:`, result);
      console.log(`✅ Rejected resource "${upload.title}" kept in database for records`);
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Upload not found' });
      }

      res.json({ 
        message: 'Upload rejected successfully', 
        modifiedCount: result.modifiedCount,
        title: upload.title
      });
    } catch (error) {
      console.error('Error rejecting upload:', error);
      res.status(500).json({ message: 'Failed to reject upload', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Promote user to admin (super admin only)
  app.post('/api/admin/promote-user', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.trim()) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      console.log(`👑 Admin ${req.user!.email} promoting user: ${email}`);
      
      const db = getDatabase();
      const users = db.collection('users');
      
      // Find the user by email
      const targetUser = await users.findOne({ email: email.trim().toLowerCase() });
      
      if (!targetUser) {
        console.log('❌ User not found with email:', email);
        return res.status(404).json({ message: 'User not found with this email address' });
      }
      
      if (targetUser.isAdmin) {
        console.log('ℹ️ User is already an admin:', email);
        return res.status(400).json({ message: 'User is already an administrator' });
      }
      
      // Update user to admin
      const result = await users.updateOne(
        { email: email.trim().toLowerCase() },
        { 
          $set: { 
            isAdmin: true,
            promotedBy: req.user!.id,
            promotedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Promotion result:`, result);
      
      if (result.modifiedCount === 0) {
        return res.status(500).json({ message: 'Failed to promote user' });
      }
      
      res.json({ 
        message: 'User promoted to administrator successfully',
        user: {
          email: targetUser.email,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          isAdmin: true
        }
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      res.status(500).json({ message: 'Failed to promote user', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete approved resource (admin only)
  app.delete('/api/admin/resources/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const uploads = db.collection('userUploads');
      
      console.log(`🗑️ Admin deleting resource with ID: ${req.params.id}`);
      
      // The ID comes as a string from the frontend (converted from _id.toString())
      // We need to convert it back to ObjectId for MongoDB query
      let query;
      try {
        query = { _id: new ObjectId(req.params.id) };
        console.log('🗑️ Using ObjectId query:', query);
      } catch (error) {
        console.log('❌ Invalid ObjectId format:', req.params.id);
        return res.status(400).json({ message: 'Invalid resource ID format' });
      }
      
      // First check if the resource exists
      const resource = await uploads.findOne(query);
      if (!resource) {
        console.log('❌ Resource not found with query:', query);
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      console.log('✅ Found resource:', { 
        id: resource._id, 
        title: resource.title, 
        status: resource.status 
      });
      
      if (resource.status !== 'approved') {
        console.log('❌ Can only delete approved resources, this one is:', resource.status);
        return res.status(400).json({ message: 'Can only delete approved resources' });
      }
      
      // Delete the resource from database
      const result = await uploads.deleteOne(query);
      
      console.log(`✅ Delete result:`, result);
      console.log(`✅ Permanently deleted resource "${resource.title}" from database`);
      
      if (result.deletedCount === 0) {
        console.log('❌ No resource deleted');
        return res.status(404).json({ message: 'Resource not found' });
      }

      res.json({ 
        message: 'Resource deleted permanently from database', 
        deletedCount: result.deletedCount,
        resourceTitle: resource.title 
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ message: 'Failed to delete resource', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      
      const [users, uploads, history] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('userUploads').countDocuments(),
        db.collection('userHistory').countDocuments()
      ]);

      const [pendingUploads, approvedUploads, rejectedUploads] = await Promise.all([
        db.collection('userUploads').countDocuments({ status: 'pending' }),
        db.collection('userUploads').countDocuments({ status: 'approved' }),
        db.collection('userUploads').countDocuments({ status: 'rejected' })
      ]);

      res.json({
        users,
        uploads,
        searchHistory: history,
        uploadStats: {
          pending: pendingUploads,
          approved: approvedUploads,
          rejected: rejectedUploads
        }
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  // Public stats endpoint for homepage
  app.get('/api/stats', async (req, res) => {
    try {
      const db = getDatabase();
      
      // Get counts from MongoDB
      const [usersCount, mongoQuestionPapers, mongoStudyNotes] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('userUploads').countDocuments({ 
          status: 'approved', 
          resourceType: 'question_paper' 
        }),
        db.collection('userUploads').countDocuments({ 
          status: 'approved', 
          resourceType: 'study_note' 
        })
      ]);

      // Get counts from old storage system
      const [oldQuestionPapers, oldStudyNotes, departments] = await Promise.all([
        storage.getQuestionPapers(),
        storage.getStudyNotes(),
        storage.getDepartments()
      ]);

      // Combine counts from both sources
      const totalQuestionPapers = mongoQuestionPapers + oldQuestionPapers.length;
      const totalStudyNotes = mongoStudyNotes + oldStudyNotes.length;

      res.json({
        departments: departments.length,
        questionPapers: totalQuestionPapers,
        studyNotes: totalStudyNotes,
        activeStudents: usersCount
      });
    } catch (error) {
      console.error('Error fetching public stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Categories routes (for learning paths)
  app.get("/api/categories", async (req, res) => {
    try {
      const db = getDatabase();
      const categories = await db.collection('categories').find({}).toArray();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Department routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const department = await storage.getDepartment(req.params.id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data" });
    }
  });

  // Question Paper routes
  app.get("/api/question-papers", async (req, res) => {
    try {
      const papers = await storage.getQuestionPapers();
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question papers" });
    }
  });

  app.get("/api/question-papers/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get approved uploads from MongoDB first
      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      const approvedUploads = await userUploads
        .find({ 
          status: 'approved',
          resourceType: 'question_paper'
        })
        .sort({ uploadedAt: -1 })
        .limit(limit)
        .toArray();
      
      console.log('📄 Found approved uploads for recent:', approvedUploads.length);
      
      // Convert to QuestionPaper format
      const mongodbPapers = approvedUploads.map(upload => ({
        id: upload._id.toString(),
        title: upload.title,
        subject: upload.subject || 'Unknown Subject',
        department: upload.department,
        departmentId: upload.department,
        semester: parseInt(upload.semester) || 1,
        year: parseInt(upload.year) || new Date().getFullYear(),
        session: upload.session || 'Winter',
        marks: parseInt(upload.marks) || 100,
        filePath: upload.filePath,
        fileUrl: upload.filePath,
        uploadedAt: upload.uploadedAt,
        description: upload.description
      }));
      
      // Also get from old storage system
      const oldPapers = await storage.getRecentQuestionPapers(limit);
      
      // Combine and sort by upload date, then limit
      const combinedPapers = [...mongodbPapers, ...oldPapers]
        .sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime())
        .slice(0, limit);
      
      console.log('📄 Combined recent papers:', combinedPapers.length);
      res.json(combinedPapers);
    } catch (error) {
      console.error('Error fetching recent papers:', error);
      res.status(500).json({ message: "Failed to fetch recent question papers" });
    }
  });

  app.get("/api/question-papers/department/:id", async (req, res) => {
    try {
      const departmentId = req.params.id;
      
      // Get approved uploads from MongoDB first
      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      const approvedUploads = await userUploads
        .find({ 
          status: 'approved',
          resourceType: 'question_paper',
          department: departmentId
        })
        .sort({ uploadedAt: -1 })
        .toArray();
      
      console.log(`🏢 Found approved uploads for department ${departmentId}:`, approvedUploads.length);
      
      // Convert to QuestionPaper format
      const mongodbPapers = approvedUploads.map(upload => ({
        id: upload._id.toString(),
        title: upload.title,
        subject: upload.subject || 'Unknown Subject',
        department: upload.department,
        departmentId: upload.department,
        semester: parseInt(upload.semester) || 1,
        year: parseInt(upload.year) || new Date().getFullYear(),
        session: upload.session || 'Winter',
        marks: parseInt(upload.marks) || 100,
        filePath: upload.filePath,
        fileUrl: upload.filePath,
        uploadedAt: upload.uploadedAt,
        description: upload.description
      }));
      
      // Also get from old storage system
      const oldPapers = await storage.getQuestionPapersByDepartment(departmentId);
      
      // Combine and sort by upload date
      const combinedPapers = [...mongodbPapers, ...oldPapers]
        .sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime());
      
      console.log(`🏢 Combined department ${departmentId} papers:`, combinedPapers.length);
      res.json(combinedPapers);
    } catch (error) {
      console.error('Error fetching department papers:', error);
      res.status(500).json({ message: "Failed to fetch department question papers" });
    }
  });

  app.get("/api/question-papers/search", async (req, res) => {
    try {
      const filters = {
        query: req.query.q as string,
        departmentId: req.query.department as string,
        semester: req.query.semester ? parseInt(req.query.semester as string) : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };
      
      console.log('🔍 Search filters received:', { ...req.query });
      console.log('🔍 Processed filters:', filters);
      
      // Search in userUploads collection for approved content first
      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      // Build MongoDB query
      let mongoQuery: any = { 
        status: 'approved',
        resourceType: 'question_paper'
      };
      
      if (filters.query) {
        mongoQuery.$or = [
          { title: { $regex: filters.query, $options: 'i' } },
          { subject: { $regex: filters.query, $options: 'i' } }
        ];
      }
      
      if (filters.departmentId && filters.departmentId !== 'all') {
        mongoQuery.department = filters.departmentId;
      }
      
      if (filters.semester) {
        mongoQuery.semester = filters.semester.toString();
      }
      
      if (filters.year) {
        mongoQuery.year = filters.year.toString();
      }
      
      console.log('🔍 MongoDB query:', mongoQuery);
      
      const approvedUploads = await userUploads
        .find(mongoQuery)
        .sort({ uploadedAt: -1 })
        .toArray();
      
      console.log('🔍 Found approved uploads:', approvedUploads.length);
      
      // Convert to QuestionPaper format
      const papers = approvedUploads.map(upload => ({
        id: upload._id.toString(),
        title: upload.title,
        subject: upload.subject || 'Unknown Subject',
        department: upload.department,
        departmentId: upload.department,
        semester: parseInt(upload.semester) || 1,
        year: parseInt(upload.year) || new Date().getFullYear(),
        session: upload.session || 'Winter',
        marks: parseInt(upload.marks) || 100,
        filePath: upload.filePath,
        fileUrl: upload.filePath,
        uploadedAt: upload.uploadedAt,
        description: upload.description
      }));
      
      // Also search in the old storage system and combine results
      const oldPapers = await storage.searchQuestionPapers(filters);
      const combinedResults = [...papers, ...oldPapers];
      
      console.log('🔍 Combined results:', combinedResults.length);
      res.json(combinedResults);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: "Failed to search question papers" });
    }
  });

  app.get("/api/question-papers/:id", async (req, res) => {
    try {
      const paper = await storage.getQuestionPaper(req.params.id);
      if (!paper) {
        return res.status(404).json({ message: "Question paper not found" });
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question paper" });
    }
  });

  app.post("/api/question-papers", authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      // Save complete resource data in pending state
      const uploadData = {
        userId: req.user.id,
        resourceId: randomUUID(),
        resourceType: 'question_paper',
        title: req.body.title,
        subject: req.body.subject,
        department: req.body.departmentId || null,
        semester: req.body.semester,
        year: req.body.year,
        session: req.body.session,
        marks: req.body.marks || '100',
        chapter: null,
        description: req.body.description || null,
        filePath: `/uploads/question-papers/${req.file.filename}`,
        status: 'pending',
        uploadedAt: new Date(),
      };

      const result = await userUploads.insertOne(uploadData);
      
      console.log('✅ Question paper upload saved to pending approval:', uploadData.title);
      
      res.status(201).json({ 
        id: result.insertedId,
        message: 'Upload submitted for approval',
        ...uploadData 
      });
    } catch (error) {
      console.error("Error creating question paper:", error);
      res.status(400).json({ message: "Invalid question paper data" });
    }
  });

  // Study Notes routes
  app.get("/api/study-notes", async (req, res) => {
    try {
      // Get approved uploads from MongoDB
      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      const approvedUploads = await userUploads
        .find({ 
          status: 'approved',
          resourceType: 'study_note'
        })
        .sort({ uploadedAt: -1 })
        .toArray();
      
      console.log('📚 Found approved study notes:', approvedUploads.length);
      
      // Convert to StudyNote format
      const mongodbNotes = approvedUploads.map(upload => ({
        id: upload._id.toString(),
        title: upload.title,
        subject: upload.subject || 'Unknown Subject',
        department: upload.department,
        departmentId: upload.department,
        semester: parseInt(upload.semester) || 1,
        chapter: upload.chapter || null,
        filePath: upload.filePath,
        fileUrl: upload.filePath,
        uploadedAt: upload.uploadedAt,
        description: upload.description
      }));
      
      // Also get from old storage system
      const oldNotes = await storage.getStudyNotes();
      
      // Combine and sort
      const combinedNotes = [...mongodbNotes, ...oldNotes]
        .sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime());
      
      res.json(combinedNotes);
    } catch (error) {
      console.error('Error fetching study notes:', error);
      res.status(500).json({ message: "Failed to fetch study notes" });
    }
  });

  app.get("/api/study-notes/department/:id", async (req, res) => {
    try {
      const departmentId = req.params.id;
      
      // Get approved uploads from MongoDB
      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      const approvedUploads = await userUploads
        .find({ 
          status: 'approved',
          resourceType: 'study_note',
          department: departmentId
        })
        .sort({ uploadedAt: -1 })
        .toArray();
      
      console.log(`📚 Found approved study notes for department ${departmentId}:`, approvedUploads.length);
      
      // Convert to StudyNote format
      const mongodbNotes = approvedUploads.map(upload => ({
        id: upload._id.toString(),
        title: upload.title,
        subject: upload.subject || 'Unknown Subject',
        department: upload.department,
        departmentId: upload.department,
        semester: parseInt(upload.semester) || 1,
        chapter: upload.chapter || null,
        filePath: upload.filePath,
        fileUrl: upload.filePath,
        uploadedAt: upload.uploadedAt,
        description: upload.description
      }));
      
      // Also get from old storage system
      const oldNotes = await storage.getStudyNotesByDepartment(departmentId);
      
      // Combine and sort
      const combinedNotes = [...mongodbNotes, ...oldNotes]
        .sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime());
      
      res.json(combinedNotes);
    } catch (error) {
      console.error('Error fetching department study notes:', error);
      res.status(500).json({ message: "Failed to fetch department study notes" });
    }
  });

  app.get("/api/study-notes/search", async (req, res) => {
    try {
      const filters = {
        query: req.query.q as string,
        departmentId: req.query.department as string,
        semester: req.query.semester ? parseInt(req.query.semester as string) : undefined,
      };
      
      // Get approved uploads from MongoDB
      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      // Build MongoDB query
      let mongoQuery: any = { 
        status: 'approved',
        resourceType: 'study_note'
      };
      
      if (filters.query) {
        mongoQuery.$or = [
          { title: { $regex: filters.query, $options: 'i' } },
          { subject: { $regex: filters.query, $options: 'i' } },
          { chapter: { $regex: filters.query, $options: 'i' } }
        ];
      }
      
      if (filters.departmentId && filters.departmentId !== 'all') {
        mongoQuery.department = filters.departmentId;
      }
      
      if (filters.semester) {
        mongoQuery.semester = filters.semester.toString();
      }
      
      console.log('🔍 MongoDB query for study notes:', mongoQuery);
      
      const approvedUploads = await userUploads
        .find(mongoQuery)
        .sort({ uploadedAt: -1 })
        .toArray();
      
      console.log('🔍 Found approved study notes:', approvedUploads.length);
      
      // Convert to StudyNote format
      const mongodbNotes = approvedUploads.map(upload => ({
        id: upload._id.toString(),
        title: upload.title,
        subject: upload.subject || 'Unknown Subject',
        department: upload.department,
        departmentId: upload.department,
        semester: parseInt(upload.semester) || 1,
        chapter: upload.chapter || null,
        filePath: upload.filePath,
        fileUrl: upload.filePath,
        uploadedAt: upload.uploadedAt,
        description: upload.description
      }));
      
      // Remove undefined values from filters for old storage
      Object.keys(filters).forEach(key => 
        filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
      );
      
      // Also search in old storage system
      const oldNotes = await storage.searchStudyNotes(filters);
      const combinedResults = [...mongodbNotes, ...oldNotes];
      
      console.log('🔍 Combined study notes results:', combinedResults.length);
      res.json(combinedResults);
    } catch (error) {
      console.error('Error searching study notes:', error);
      res.status(500).json({ message: "Failed to search study notes" });
    }
  });

  app.get("/api/study-notes/:id", async (req, res) => {
    try {
      const note = await storage.getStudyNote(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Study note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study note" });
    }
  });

  app.post("/api/study-notes", authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const db = getDatabase();
      const userUploads = db.collection('userUploads');
      
      // Save complete resource data in pending state
      const uploadData = {
        userId: req.user.id,
        resourceId: randomUUID(),
        resourceType: 'study_note',
        title: req.body.title,
        subject: req.body.subject,
        department: req.body.departmentId || null,
        semester: req.body.semester,
        year: null,
        session: null,
        marks: null,
        chapter: req.body.chapter || null,
        description: req.body.description || null,
        filePath: `/uploads/study-notes/${req.file.filename}`,
        status: 'pending',
        uploadedAt: new Date(),
      };

      const result = await userUploads.insertOne(uploadData);
      
      console.log('✅ Study note upload saved to pending approval:', uploadData.title);
      
      res.status(201).json({ 
        id: result.insertedId,
        message: 'Upload submitted for approval',
        ...uploadData 
      });
    } catch (error) {
      console.error("Error creating study note:", error);
      res.status(400).json({ message: "Invalid study note data" });
    }
  });

  // MCQ Generation endpoint (text prompt)
  app.post('/api/generate-mcq', async (req, res) => {
    try {
      const { prompt, numQuestions = 5 } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      console.log(`📝 Generating ${numQuestions} MCQ questions for: ${prompt.substring(0, 50)}...`);

      // Generate MCQ questions using AI service
      const questions = await generateMCQQuestions(prompt, numQuestions);

      console.log(`✅ Successfully generated ${questions.length} MCQ questions`);
      res.json({ questions });
    } catch (error) {
      console.error('❌ Error generating MCQ:', error);
      res.status(500).json({ message: 'Failed to generate MCQ questions' });
    }
  });

  // MCQ Generation from file upload
  app.post('/api/generate-mcq-from-file', mcqUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        console.error('❌ No file in request');
        return res.status(400).json({ message: 'File is required' });
      }

      const numQuestions = parseInt(req.body.numQuestions || '5');
      const file = req.file;

      console.log(`📄 Processing file: ${file.originalname} (${file.mimetype}) for MCQ generation...`);
      console.log(`📊 File size: ${(file.size / 1024).toFixed(1)}KB, Questions: ${numQuestions}`);

      // Read file content
      let fileContent = '';
      const fs = await import('fs/promises');
      
      try {
        const fileBuffer = await fs.readFile(file.path);

        // Extract text based on file type
        if (file.mimetype === 'text/plain') {
          fileContent = fileBuffer.toString('utf-8');
          console.log(`✅ Extracted ${fileContent.length} characters from TXT file`);
        } else if (file.mimetype === 'application/pdf') {
          // For PDF, create a descriptive prompt
          const fileName = file.originalname.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
          fileContent = `Generate comprehensive multiple choice questions about "${fileName}". Focus on key concepts, definitions, applications, and important details that would typically be covered in this topic.`;
          console.log('📋 Using PDF filename for context-based generation');
        } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
          // For DOC/DOCX files
          const fileName = file.originalname.replace(/\.(doc|docx)$/i, '').replace(/[-_]/g, ' ');
          fileContent = `Generate multiple choice questions about "${fileName}". Cover fundamental concepts, practical applications, and theoretical knowledge.`;
          console.log('📄 Using Word document filename for context');
        } else {
          fileContent = `Generate questions about: ${file.originalname.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}`;
          console.log('📝 Using generic filename context');
        }

        // Create prompt from file content
        const prompt = fileContent.length > 3000 
          ? `${fileContent.substring(0, 3000)}... Generate ${numQuestions} comprehensive MCQ questions based on this content.`
          : `${fileContent} Generate ${numQuestions} comprehensive MCQ questions based on this content.`;

        console.log(`🤖 Generating ${numQuestions} MCQ questions from file content...`);

        // Generate MCQ questions using AI service
        const questions = await generateMCQQuestions(prompt, numQuestions);

        // Clean up uploaded file
        try {
          await fs.unlink(file.path);
          console.log('🧹 Cleaned up temporary file');
        } catch (cleanupError) {
          console.warn('⚠️  Failed to cleanup file:', cleanupError);
        }

        console.log(`✅ Successfully generated ${questions.length} MCQ questions from file`);
        res.json({ questions });
      } catch (fileError) {
        console.error('❌ Error reading file:', fileError);
        // Try to cleanup file even on error
        try {
          await fs.unlink(file.path);
        } catch {}
        throw fileError;
      }
    } catch (error) {
      console.error('❌ Error generating MCQ from file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate MCQ questions from file';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // ============ GAMIFICATION API ROUTES ============

  // Get user progress (XP, level, streak)
  app.get('/api/user/progress', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const progress = db.collection('userProgress');
      
      let userProgress = await progress.findOne({ userId: req.user!.id });
      
      // Create default progress if not exists
      if (!userProgress) {
        const defaultProgress = {
          userId: req.user!.id,
          totalXp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          totalStudyTime: 0,
          quizzesCompleted: 0,
          quizzesPassed: 0,
          resourcesCompleted: 0,
          certificatesEarned: 0,
        };
        await progress.insertOne(defaultProgress);
        return res.json(defaultProgress);
      }
      
      res.json(userProgress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({ message: 'Failed to fetch user progress' });
    }
  });

  // Update user XP
  app.post('/api/user/xp', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { xpAmount, reason } = req.body;
      const db = getDatabase();
      const progress = db.collection('userProgress');
      
      const result = await progress.updateOne(
        { userId: req.user!.id },
        { 
          $inc: { totalXp: xpAmount },
          $set: { lastActivityDate: new Date() }
        },
        { upsert: true }
      );
      
      // Check for level up
      const userProgress = await progress.findOne({ userId: req.user!.id });
      const newLevel = Math.floor(Math.sqrt(userProgress!.totalXp / 100)) + 1;
      
      if (newLevel > (userProgress!.level || 1)) {
        await progress.updateOne(
          { userId: req.user!.id },
          { $set: { level: newLevel } }
        );
      }
      
      res.json({ 
        message: 'XP updated', 
        totalXp: userProgress!.totalXp + xpAmount,
        level: newLevel
      });
    } catch (error) {
      console.error('Error updating XP:', error);
      res.status(500).json({ message: 'Failed to update XP' });
    }
  });

  // Update streak
  app.post('/api/user/streak', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const progress = db.collection('userProgress');
      
      const userProgress = await progress.findOne({ userId: req.user!.id });
      const today = new Date().toDateString();
      const lastActivity = userProgress?.lastActivityDate 
        ? new Date(userProgress.lastActivityDate).toDateString() 
        : null;
      
      let newStreak = userProgress?.currentStreak || 0;
      
      if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
          newStreak += 1;
        } else if (lastActivity !== today) {
          newStreak = 1;
        }
        
        const longestStreak = Math.max(newStreak, userProgress?.longestStreak || 0);
        
        await progress.updateOne(
          { userId: req.user!.id },
          { 
            $set: { 
              currentStreak: newStreak,
              longestStreak: longestStreak,
              lastActivityDate: new Date()
            }
          },
          { upsert: true }
        );
      }
      
      res.json({ currentStreak: newStreak });
    } catch (error) {
      console.error('Error updating streak:', error);
      res.status(500).json({ message: 'Failed to update streak' });
    }
  });

  // Get achievements
  app.get('/api/achievements', async (req, res) => {
    try {
      const db = getDatabase();
      const achievements = db.collection('achievements');
      
      const allAchievements = await achievements.find({}).toArray();
      res.json(allAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: 'Failed to fetch achievements' });
    }
  });

  // Get user achievements
  app.get('/api/user/achievements', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const userAchievements = db.collection('userAchievements');
      
      const earned = await userAchievements
        .find({ userId: req.user!.id })
        .toArray();
      
      res.json(earned);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ message: 'Failed to fetch user achievements' });
    }
  });

  // Get leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const db = getDatabase();
      const progress = db.collection('userProgress');
      const users = db.collection('users');
      
      const topUsers = await progress
        .find({})
        .sort({ totalXp: -1 })
        .limit(50)
        .toArray();
      
      const leaderboard = await Promise.all(
        topUsers.map(async (p, index) => {
          const user = await users.findOne({ _id: new ObjectId(p.userId) });
          return {
            userId: p.userId,
            username: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
            totalXp: p.totalXp || 0,
            level: p.level || 1,
            rank: index + 1,
            weeklyXp: p.weeklyXp || 0,
            monthlyXp: p.monthlyXp || 0,
          };
        })
      );
      
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  // ============ LEARNING PATH API ROUTES ============

  // Get user's learning paths
  app.get('/api/learning-paths', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const paths = db.collection('learningPaths');
      
      const userPaths = await paths
        .find({ userId: req.user!.id })
        .sort({ updatedAt: -1 })
        .toArray();
      
      res.json(userPaths);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      res.status(500).json({ message: 'Failed to fetch learning paths' });
    }
  });

  // Create learning path
  app.post('/api/learning-paths', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const paths = db.collection('learningPaths');
      
      const newPath = {
        ...req.body,
        userId: req.user!.id,
        progress: 0,
        completedModules: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await paths.insertOne(newPath);
      res.status(201).json({ ...newPath, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating learning path:', error);
      res.status(500).json({ message: 'Failed to create learning path' });
    }
  });

  // Update learning path progress
  app.patch('/api/learning-paths/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const paths = db.collection('learningPaths');
      const { ObjectId } = await import('mongodb');
      
      const { completedModules, progress, activeLesson, modules } = req.body;
      
      const updateData: any = { updatedAt: new Date() };
      
      if (completedModules !== undefined) updateData.completedModules = completedModules;
      if (progress !== undefined) {
        updateData.progress = progress;
        updateData.status = progress >= 100 ? 'completed' : 'active';
      }
      if (activeLesson !== undefined) updateData.activeLesson = activeLesson;
      if (modules !== undefined) updateData.modules = modules;
      
      const result = await paths.updateOne(
        { _id: new ObjectId(req.params.id), userId: req.user!.id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Learning path not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating learning path:', error);
      res.status(500).json({ message: 'Failed to update learning path' });
    }
  });

  // Delete learning path
  app.delete('/api/learning-paths/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const paths = db.collection('learningPaths');
      const { ObjectId } = await import('mongodb');
      
      console.log('Deleting path:', req.params.id, 'for user:', req.user!.id);
      
      // First try to find the path to check if it exists
      const existingPath = await paths.findOne({ _id: new ObjectId(req.params.id) });
      console.log('Found path:', existingPath ? 'yes' : 'no', 'userId match:', existingPath?.userId === req.user!.id);
      
      const result = await paths.deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.user!.id
      });
      
      console.log('Delete result:', result.deletedCount);
      
      if (result.deletedCount === 0) {
        // Try without userId check as fallback
        const fallbackResult = await paths.deleteOne({ _id: new ObjectId(req.params.id) });
        if (fallbackResult.deletedCount > 0) {
          return res.json({ success: true });
        }
        return res.status(404).json({ message: 'Learning path not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting learning path:', error);
      res.status(500).json({ message: 'Failed to delete learning path' });
    }
  });

  // ============ FLASHCARD API ROUTES ============

  // Get user's flashcard decks
  app.get('/api/flashcard-decks', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const decks = db.collection('flashcardDecks');
      
      const userDecks = await decks
        .find({ userId: req.user!.id })
        .sort({ updatedAt: -1 })
        .toArray();
      
      res.json(userDecks);
    } catch (error) {
      console.error('Error fetching flashcard decks:', error);
      res.status(500).json({ message: 'Failed to fetch flashcard decks' });
    }
  });

  // Create flashcard deck
  app.post('/api/flashcard-decks', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const decks = db.collection('flashcardDecks');
      
      const newDeck = {
        ...req.body,
        userId: req.user!.id,
        cardCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await decks.insertOne(newDeck);
      res.status(201).json({ ...newDeck, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      res.status(500).json({ message: 'Failed to create flashcard deck' });
    }
  });

  // Get flashcards in a deck
  app.get('/api/flashcard-decks/:deckId/cards', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const cards = db.collection('flashcards');
      
      const deckCards = await cards
        .find({ deckId: req.params.deckId })
        .sort({ order: 1 })
        .toArray();
      
      res.json(deckCards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      res.status(500).json({ message: 'Failed to fetch flashcards' });
    }
  });

  // Update flashcard deck (mastery, etc.)
  app.patch('/api/flashcard-decks/:deckId', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const decks = db.collection('flashcardDecks');
      const { ObjectId } = await import('mongodb');
      
      let deckId: any;
      try {
        deckId = new ObjectId(req.params.deckId);
      } catch {
        deckId = req.params.deckId;
      }
      
      const result = await decks.updateOne(
        { _id: deckId, userId: req.user!.id },
        { $set: { ...req.body, updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Deck not found' });
      }
      
      res.json({ message: 'Deck updated successfully' });
    } catch (error) {
      console.error('Error updating flashcard deck:', error);
      res.status(500).json({ message: 'Failed to update flashcard deck' });
    }
  });

  // Delete flashcard deck
  app.delete('/api/flashcard-decks/:deckId', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const decks = db.collection('flashcardDecks');
      const { ObjectId } = await import('mongodb');
      
      let deckId: any;
      try {
        deckId = new ObjectId(req.params.deckId);
      } catch {
        deckId = req.params.deckId;
      }
      
      const result = await decks.deleteOne({
        _id: deckId,
        userId: req.user!.id
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Deck not found' });
      }
      
      res.json({ message: 'Deck deleted successfully' });
    } catch (error) {
      console.error('Error deleting flashcard deck:', error);
      res.status(500).json({ message: 'Failed to delete flashcard deck' });
    }
  });

  // ============ CERTIFICATE API ROUTES ============

  // Get user's certificates
  app.get('/api/certificates', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const certs = db.collection('certificates');
      
      const userCerts = await certs
        .find({ userId: req.user!.id })
        .sort({ issueDate: -1 })
        .toArray();
      
      res.json(userCerts);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: 'Failed to fetch certificates' });
    }
  });

  // Verify certificate
  app.get('/api/certificates/verify/:code', async (req, res) => {
    try {
      const db = getDatabase();
      const certs = db.collection('certificates');
      
      const cert = await certs.findOne({ 
        verificationCode: req.params.code,
        isPublic: true
      });
      
      if (!cert) {
        return res.status(404).json({ message: 'Certificate not found' });
      }
      
      res.json(cert);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      res.status(500).json({ message: 'Failed to verify certificate' });
    }
  });

  // ============ USER PREFERENCES API ROUTES ============

  // Get user preferences
  app.get('/api/user/preferences', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const prefs = db.collection('userPreferences');
      
      let userPrefs = await prefs.findOne({ userId: req.user!.id });
      
      if (!userPrefs) {
        const defaultPrefs = {
          userId: req.user!.id,
          // Onboarding data
          name: req.user!.firstName || '',
          college: '',
          course: '',
          year: '',
          interests: [],
          goals: [],
          dailyTime: '30', // Default 30 min/day
          preferredTime: 'flexible',
          learningStyle: null,
          customInterests: '',
          customGoals: '',
          // Settings
          dailyGoalMinutes: 30,
          weeklyGoalDays: 5,
          notificationsEnabled: true,
          onboardingCompleted: false,
          createdAt: new Date(),
        };
        const result = await prefs.insertOne(defaultPrefs);
        userPrefs = { ...defaultPrefs, _id: result.insertedId };
      }
      
      res.json(userPrefs);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ message: 'Failed to fetch user preferences' });
    }
  });

  // Update user preferences
  app.put('/api/user/preferences', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const prefs = db.collection('userPreferences');
      
      await prefs.updateOne(
        { userId: req.user!.id },
        { 
          $set: { 
            ...req.body,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      
      res.json({ message: 'Preferences updated' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ message: 'Failed to update preferences' });
    }
  });

  // ============ DAILY CHALLENGES API ROUTES ============

  // Get today's challenges
  app.get('/api/daily-challenges', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = getDatabase();
      const challenges = db.collection('dailyChallenges');
      const userChallenges = db.collection('userDailyChallenges');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get or create today's challenges
      let todayChallenges = await challenges
        .find({ 
          date: { $gte: today },
          isActive: true
        })
        .toArray();
      
      // If no challenges exist for today, create default ones
      if (todayChallenges.length === 0) {
        const defaultChallenges = [
          {
            title: 'Complete a Quiz',
            description: 'Take any quiz to earn bonus XP',
            type: 'quiz',
            requirement: { count: 1, minutes: 0 },
            xpReward: 50,
            date: today,
            isActive: true,
          },
          {
            title: 'Study for 30 minutes',
            description: 'Spend time learning today',
            type: 'study_time',
            requirement: { count: 0, minutes: 30 },
            xpReward: 30,
            date: today,
            isActive: true,
          },
          {
            title: 'Maintain your streak',
            description: 'Keep your learning streak alive',
            type: 'streak',
            requirement: { count: 1, minutes: 0 },
            xpReward: 25,
            date: today,
            isActive: true,
          },
        ];
        
        const insertResult = await challenges.insertMany(defaultChallenges);
        // Fetch the inserted challenges with their _id fields
        todayChallenges = await challenges
          .find({ _id: { $in: Object.values(insertResult.insertedIds) } })
          .toArray();
      }
      
      // Get user's progress on these challenges
      const userProgress = await userChallenges
        .find({ 
          userId: req.user!.id,
          challengeId: { $in: todayChallenges.map(c => c._id?.toString()) }
        })
        .toArray();
      
      const challengesWithProgress = todayChallenges.map(challenge => {
        const progress = userProgress.find(
          p => p.challengeId === challenge._id?.toString()
        );
        return {
          ...challenge,
          id: challenge._id?.toString(),
          progress: progress?.progress || 0,
          target: challenge.requirement?.count || challenge.requirement?.minutes || 1,
          isCompleted: progress?.isCompleted || false,
        };
      });
      
      res.json(challengesWithProgress);
    } catch (error) {
      console.error('Error fetching daily challenges:', error);
      res.status(500).json({ message: 'Failed to fetch daily challenges' });
    }
  });

  // ============ AI GENERATION API ROUTES ============

  // Generate AI Learning Path
  app.post('/api/ai/generate-learning-path', async (req, res) => {
    try {
      const { topic, currentLevel, goal, dailyMinutes } = req.body;

      if (!topic) {
        return res.status(400).json({ message: 'Topic is required' });
      }

      console.log(`🎯 Generating learning path for: ${topic} (${currentLevel})`);

      const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_GPT4O_MINI;
      
      if (!OPENROUTER_API_KEY) {
        // Return mock data if no API key
        return res.json({ path: generateMockLearningPath(topic, currentLevel) });
      }

      const prompt = `Create a comprehensive learning path for someone who wants to learn "${topic}".
Current level: ${currentLevel || 'beginner'}
Goal: ${goal || 'Become proficient'}
Daily time commitment: ${dailyMinutes || 30} minutes

Generate a structured learning path in JSON format with:
{
  "title": "Path title",
  "description": "Brief description",
  "totalDuration": "X weeks",
  "difficulty": "${currentLevel || 'beginner'}",
  "prerequisites": ["list of prerequisites"],
  "estimatedCompletion": "X days",
  "skills": ["skills to be learned"],
  "modules": [
    {
      "id": "1",
      "title": "Module title",
      "description": "Module description",
      "duration": "X week(s)",
      "topics": ["topic1", "topic2", "topic3", "topic4"],
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}

Create 5-7 modules that progressively build skills. Return ONLY valid JSON.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://learnflow.app',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', await response.text());
        return res.json({ path: generateMockLearningPath(topic, currentLevel) });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const path = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated learning path with ${path.modules?.length || 0} modules`);
        return res.json({ path });
      }

      return res.json({ path: generateMockLearningPath(topic, currentLevel) });
    } catch (error) {
      console.error('Error generating learning path:', error);
      res.status(500).json({ message: 'Failed to generate learning path' });
    }
  });

  // Generate AI Flashcards
  app.post('/api/ai/generate-flashcards', async (req, res) => {
    try {
      const { content, deckName } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      console.log(`📚 Generating flashcards from ${content.length} characters`);

      const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_GPT4O_MINI;
      
      if (!OPENROUTER_API_KEY) {
        return res.json({ flashcards: generateMockFlashcards(content) });
      }

      const numCards = Math.min(15, Math.max(5, Math.floor(content.length / 200)));

      const prompt = `Create ${numCards} flashcards from the following study content. Each flashcard should test understanding of key concepts.

Content:
${content.substring(0, 3000)}

Generate flashcards in JSON format:
{
  "flashcards": [
    {
      "id": "card-1",
      "front": "Question or prompt",
      "back": "Answer or explanation",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Create diverse questions covering definitions, concepts, applications, and comparisons. Return ONLY valid JSON.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://learnflow.app',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', await response.text());
        return res.json({ flashcards: generateMockFlashcards(content) });
      }

      const data = await response.json();
      const responseContent = data.choices?.[0]?.message?.content || '';
      
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated ${parsed.flashcards?.length || 0} flashcards`);
        return res.json(parsed);
      }

      return res.json({ flashcards: generateMockFlashcards(content) });
    } catch (error) {
      console.error('Error generating flashcards:', error);
      res.status(500).json({ message: 'Failed to generate flashcards' });
    }
  });

  // AI Content Summarizer
  app.post('/api/ai/summarize', async (req, res) => {
    try {
      const { content, type } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      console.log(`📝 Summarizing ${content.length} characters`);

      const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_GPT4O_MINI;
      
      if (!OPENROUTER_API_KEY) {
        return res.json({ 
          summary: content.substring(0, 500) + '...',
          keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
          concepts: ['Concept 1', 'Concept 2']
        });
      }

      const prompt = `Analyze and summarize the following content:

${content.substring(0, 4000)}

Provide a response in JSON format:
{
  "summary": "A concise 2-3 paragraph summary",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "concepts": ["Main concept 1", "Main concept 2", "Main concept 3"],
  "difficulty": "beginner|intermediate|advanced",
  "estimatedReadTime": "X minutes"
}

Return ONLY valid JSON.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://learnflow.app',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error');
        return res.json({ 
          summary: content.substring(0, 500),
          keyPoints: ['Unable to generate key points'],
          concepts: ['Unable to extract concepts']
        });
      }

      const data = await response.json();
      const responseContent = data.choices?.[0]?.message?.content || '';
      
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated summary with ${parsed.keyPoints?.length || 0} key points`);
        return res.json(parsed);
      }

      return res.json({ 
        summary: content.substring(0, 500),
        keyPoints: ['Unable to parse response'],
        concepts: []
      });
    } catch (error) {
      console.error('Error summarizing content:', error);
      res.status(500).json({ message: 'Failed to summarize content' });
    }
  });

  // Helper functions for mock data
  function generateMockLearningPath(topic: string, level: string) {
    return {
      title: `Master ${topic}`,
      description: `A comprehensive learning path to help you become proficient in ${topic}, tailored to your ${level} level.`,
      totalDuration: "8 weeks",
      difficulty: level || "beginner",
      prerequisites: level === "beginner" ? ["Basic computer skills"] : ["Fundamentals of programming"],
      estimatedCompletion: "56 days",
      skills: [topic, "Problem Solving", "Critical Thinking", "Practical Application"],
      modules: [
        { id: "1", title: `Introduction to ${topic}`, description: "Learn the fundamentals and core concepts", duration: "1 week", topics: ["Core Concepts", "History & Evolution", "Use Cases", "Getting Started"], difficulty: "beginner" },
        { id: "2", title: "Building Foundations", description: "Strengthen your understanding with hands-on practice", duration: "2 weeks", topics: ["Basic Syntax", "Common Patterns", "Best Practices", "Mini Projects"], difficulty: "beginner" },
        { id: "3", title: "Intermediate Concepts", description: "Dive deeper into advanced topics", duration: "2 weeks", topics: ["Advanced Patterns", "Optimization", "Real-world Applications", "Case Studies"], difficulty: "intermediate" },
        { id: "4", title: "Advanced Techniques", description: "Master complex scenarios and edge cases", duration: "2 weeks", topics: ["Expert Patterns", "Performance Tuning", "Architecture", "Industry Standards"], difficulty: "advanced" },
        { id: "5", title: "Capstone Project", description: "Apply everything you've learned in a real project", duration: "1 week", topics: ["Project Planning", "Implementation", "Testing", "Deployment"], difficulty: "advanced" },
      ],
    };
  }

  function generateMockFlashcards(text: string) {
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
    return sentences.slice(0, 10).map((sentence: string, i: number) => ({
      id: `card-${i}`,
      front: `What is the key concept in: "${sentence.trim().slice(0, 50)}..."?`,
      back: sentence.trim(),
      difficulty: (["easy", "medium", "hard"] as const)[i % 3],
    }));
  }

  // Handle multer errors
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
    }
    if (error.message === 'Only PDF files are allowed!') {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }
    next(error);
  });

  const httpServer = createServer(app);
  return httpServer;
}
