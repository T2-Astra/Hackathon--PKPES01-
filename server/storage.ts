import { Department, QuestionPaper, StudyNote, User, UpsertUser, InsertDepartment, InsertQuestionPaper, InsertStudyNote, departments, questionPapers, studyNotes, users } from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, like, or, desc } from "drizzle-orm";

// Only initialize database connection if DATABASE_URL is provided
let sql: any;
let db: any;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Question Papers
  getQuestionPapers(): Promise<QuestionPaper[]>;
  getQuestionPaper(id: string): Promise<QuestionPaper | undefined>;
  getQuestionPapersByDepartment(departmentId: string): Promise<QuestionPaper[]>;
  searchQuestionPapers(filters: {
    query?: string;
    departmentId?: string;
    semester?: number;
    year?: number;
  }): Promise<QuestionPaper[]>;
  getRecentQuestionPapers(limit?: number): Promise<QuestionPaper[]>;
  createQuestionPaper(paper: InsertQuestionPaper): Promise<QuestionPaper>;

  // Study Notes
  getStudyNotes(): Promise<StudyNote[]>;
  getStudyNote(id: string): Promise<StudyNote | undefined>;
  getStudyNotesByDepartment(departmentId: string): Promise<StudyNote[]>;
  searchStudyNotes(filters: {
    query?: string;
    departmentId?: string;
    semester?: number;
  }): Promise<StudyNote[]>;
  createStudyNote(note: InsertStudyNote): Promise<StudyNote>;
}

class MemStorage implements IStorage {
  private departments: Map<string, Department>;
  private questionPapers: Map<string, QuestionPaper>;
  private studyNotes: Map<string, StudyNote>;
  private users: Map<string, User>;

  constructor() {
    this.departments = new Map();
    this.questionPapers = new Map();
    this.studyNotes = new Map();
    this.users = new Map();

    // Initialize with sample departments
    this.initializeDepartments();
    this.initializeSampleData();
  }

  private initializeDepartments() {
    const departments: Department[] = [
      {
        id: "ai",
        name: "Artificial Intelligence",
        shortName: "AI & ML Technologies",
        description: "Machine Learning, Deep Learning, Neural Networks, and cutting-edge AI applications.",
        accentColor: "hsl(220, 100%, 50%)",
        resourceCount: 45,
      },
      {
        id: "civil",
        name: "Civil Engineering",
        shortName: "Infrastructure & Construction",
        description: "Structural Engineering, Environmental Engineering, Transportation, and Construction Management.",
        accentColor: "hsl(25, 100%, 45%)",
        resourceCount: 62,
      },
      {
        id: "mechanical",
        name: "Mechanical Engineering",
        shortName: "Manufacturing & Design",
        description: "Thermodynamics, Machine Design, Manufacturing Processes, and Automation Systems.",
        accentColor: "hsl(120, 60%, 40%)",
        resourceCount: 58,
      },
      {
        id: "computer",
        name: "Computer Engineering",
        shortName: "Software & Systems",
        description: "Programming, Data Structures, Web Development, and Computer Networks fundamentals.",
        accentColor: "hsl(270, 80%, 55%)",
        resourceCount: 72,
      },
      {
        id: "electrical",
        name: "Electrical Engineering",
        shortName: "Power & Control Systems",
        description: "Power Systems, Control Theory, Electric Machines, and Renewable Energy Technologies.",
        accentColor: "hsl(45, 90%, 50%)",
        resourceCount: 54,
      },
      {
        id: "electronics",
        name: "Electronics Engineering",
        shortName: "Circuits & Communication",
        description: "Digital Electronics, Communication Systems, Microprocessors, and Signal Processing.",
        accentColor: "hsl(340, 75%, 50%)",
        resourceCount: 49,
      },
      {
        id: "bigdata",
        name: "Big Data",
        shortName: "Data Analytics & Processing",
        description: "Big Data Analytics, Data Mining, Hadoop, Spark, and Large-scale Data Processing Systems.",
        accentColor: "hsl(200, 85%, 45%)",
        resourceCount: 32,
      },
    ];

    departments.forEach(dept => {
      this.departments.set(dept.id, dept);
    });
  }

  private initializeSampleData() {
    // Sample Question Papers
    const samplePapers: Omit<QuestionPaper, 'id' | 'uploadedAt'>[] = [
      {
        title: "Data Structures & Algorithms",
        subject: "Data Structures",
        departmentId: "computer",
        semester: 3,
        year: 2023,
        session: "Winter",
        marks: 100,
        fileUrl: "/sample-papers/dsa-winter-2023.pdf",
        uploadedBy: null,
        approved: null,
        approvedBy: null,
        approvedAt: null,
      },
      {
        title: "Engineering Mathematics III",
        subject: "Mathematics",
        departmentId: null,
        semester: 3,
        year: 2023,
        session: "Summer",
        marks: 80,
        fileUrl: "/sample-papers/math3-summer-2023.pdf",
        uploadedBy: null,
        approved: null,
        approvedBy: null,
        approvedAt: null,
      },
      {
        title: "Machine Learning Fundamentals",
        subject: "Machine Learning",
        departmentId: "ai",
        semester: 5,
        year: 2023,
        session: "Winter",
        marks: 80,
        fileUrl: "/sample-papers/ml-winter-2023.pdf",
        uploadedBy: null,
        approved: null,
        approvedBy: null,
        approvedAt: null,
      },
      {
        title: "Structural Analysis",
        subject: "Structural Engineering",
        departmentId: "civil",
        semester: 4,
        year: 2023,
        session: "Summer",
        marks: 80,
        fileUrl: "/sample-papers/structural-summer-2023.pdf",
        uploadedBy: null,
        approved: null,
        approvedBy: null,
        approvedAt: null,
      },
      {
        title: "Thermodynamics",
        subject: "Thermal Engineering",
        departmentId: "mechanical",
        semester: 4,
        year: 2023,
        session: "Winter",
        marks: 80,
        fileUrl: "/sample-papers/thermo-winter-2023.pdf",
        uploadedBy: null,
        approved: null,
        approvedBy: null,
        approvedAt: null,
      },
      {
        title: "Power Systems",
        subject: "Electrical Power",
        departmentId: "electrical",
        semester: 5,
        year: 2023,
        session: "Summer",
        marks: 80,
        fileUrl: "/sample-papers/power-summer-2023.pdf",
        uploadedBy: null,
      approved: null,
      approvedBy: null,
      approvedAt: null,
      },
    ];

    // Add Big Data sample paper
    samplePapers.push({
      title: "Big Data Analytics",
      subject: "Data Analytics",
      departmentId: "bigdata",
      semester: 4,
      year: 2023,
      session: "Winter",
      marks: 80,
      fileUrl: "/sample-papers/bigdata-winter-2023.pdf",
      uploadedBy: null,
      approved: null,
      approvedBy: null,
      approvedAt: null,
    });

    // Add AI ML Algorithm question paper
    samplePapers.push({
      title: "AI ML Algorithm",
      subject: "Machine Learning Algorithms",
      departmentId: "ai",
      semester: 5,
      year: 2024,
      session: "Summer",
      marks: 70,
      fileUrl: "https://pdflink.to/ee3c0640/",
      uploadedBy: null,
      approved: null,
      approvedBy: null,
      approvedAt: null,
    });

    samplePapers.forEach(paper => {
      const id = randomUUID();
      this.questionPapers.set(id, {
        ...paper,
        id,
        uploadedAt: new Date(),
      });
    });

    // Sample Study Notes
    const sampleNotes: Omit<StudyNote, 'id' | 'uploadedAt'>[] = [
      {
        title: "Introduction to Algorithms",
        subject: "Data Structures",
        departmentId: "computer",
        semester: 3,
        chapter: "Chapter 1: Basic Concepts",
        fileUrl: "/sample-notes/dsa-intro.pdf",
        uploadedBy: null,
      approved: null,
      approvedBy: null,
      approvedAt: null,
      },
      {
        title: "Neural Networks Basics",
        subject: "Machine Learning",
        departmentId: "ai",
        semester: 5,
        chapter: "Chapter 3: Neural Networks",
        fileUrl: "/sample-notes/neural-networks.pdf",
        uploadedBy: null,
      approved: null,
      approvedBy: null,
      approvedAt: null,
      },
      {
        title: "Concrete Technology",
        subject: "Construction Materials",
        departmentId: "civil",
        semester: 3,
        chapter: "Chapter 2: Concrete",
        fileUrl: "/sample-notes/concrete-tech.pdf",
        uploadedBy: null,
      approved: null,
      approvedBy: null,
      approvedAt: null,
      },
    ];

    // Add Big Data sample note
    sampleNotes.push({
      title: "Introduction to Hadoop",
      subject: "Big Data Technologies",
      departmentId: "bigdata",
      semester: 4,
      chapter: "Chapter 1: Hadoop Ecosystem",
      fileUrl: "/sample-notes/hadoop-intro.pdf",
      uploadedBy: null,
      approved: null,
      approvedBy: null,
      approvedAt: null,
    });

    sampleNotes.forEach(note => {
      const id = randomUUID();
      this.studyNotes.set(id, {
        ...note,
        id,
        uploadedAt: new Date(),
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const existingUser = this.users.get(id);
    
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Department methods
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const department: Department = {
      ...insertDepartment,
      resourceCount: 0,
    };
    this.departments.set(department.id, department);
    return department;
  }

  // Question Paper methods
  async getQuestionPapers(): Promise<QuestionPaper[]> {
    return Array.from(this.questionPapers.values()).sort(
      (a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime()
    );
  }

  async getQuestionPaper(id: string): Promise<QuestionPaper | undefined> {
    return this.questionPapers.get(id);
  }

  async getQuestionPapersByDepartment(departmentId: string): Promise<QuestionPaper[]> {
    return Array.from(this.questionPapers.values())
      .filter(paper => paper.departmentId === departmentId)
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async searchQuestionPapers(filters: {
    query?: string;
    departmentId?: string;
    semester?: number;
    year?: number;
  }): Promise<QuestionPaper[]> {
    let papers = Array.from(this.questionPapers.values());
    console.log('🗂️ Total papers in storage:', papers.length);
    console.log('🗂️ Searching with filters:', filters);

    if (filters.query) {
      const query = filters.query.toLowerCase();
      papers = papers.filter(paper => 
        paper.title.toLowerCase().includes(query) ||
        paper.subject.toLowerCase().includes(query)
      );
      console.log('🗂️ After query filter:', papers.length);
    }

    if (filters.departmentId) {
      console.log('🗂️ Filtering by departmentId:', filters.departmentId);
      papers = papers.filter(paper => {
        console.log('🗂️ Paper:', paper.title, 'has departmentId:', paper.departmentId);
        return paper.departmentId === filters.departmentId;
      });
      console.log('🗂️ After department filter:', papers.length);
    }

    if (filters.semester) {
      console.log('🗂️ Filtering by semester:', filters.semester);
      papers = papers.filter(paper => paper.semester === filters.semester);
      console.log('🗂️ After semester filter:', papers.length);
    }

    if (filters.year) {
      papers = papers.filter(paper => paper.year === filters.year);
      console.log('🗂️ After year filter:', papers.length);
    }

    return papers.sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async getRecentQuestionPapers(limit = 10): Promise<QuestionPaper[]> {
    return Array.from(this.questionPapers.values())
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime())
      .slice(0, limit);
  }

  async createQuestionPaper(insertPaper: InsertQuestionPaper): Promise<QuestionPaper> {
    const id = randomUUID();
    const paper: QuestionPaper = {
      ...insertPaper,
      id,
      uploadedAt: new Date(),
      departmentId: insertPaper.departmentId ?? null,
      approved: insertPaper.approved ?? null,
      uploadedBy: insertPaper.uploadedBy ?? null,
      approvedBy: insertPaper.approvedBy ?? null,
      approvedAt: insertPaper.approvedAt ?? null,
    };
    this.questionPapers.set(id, paper);
    return paper;
  }

  // Study Note methods
  async getStudyNotes(): Promise<StudyNote[]> {
    return Array.from(this.studyNotes.values()).sort(
      (a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime()
    );
  }

  async getStudyNote(id: string): Promise<StudyNote | undefined> {
    return this.studyNotes.get(id);
  }

  async getStudyNotesByDepartment(departmentId: string): Promise<StudyNote[]> {
    return Array.from(this.studyNotes.values())
      .filter(note => note.departmentId === departmentId)
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async searchStudyNotes(filters: {
    query?: string;
    departmentId?: string;
    semester?: number;
  }): Promise<StudyNote[]> {
    let notes = Array.from(this.studyNotes.values());

    if (filters.query) {
      const query = filters.query.toLowerCase();
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.subject.toLowerCase().includes(query) ||
        note.chapter?.toLowerCase().includes(query)
      );
    }

    if (filters.departmentId) {
      notes = notes.filter(note => note.departmentId === filters.departmentId);
    }

    if (filters.semester) {
      notes = notes.filter(note => note.semester === filters.semester);
    }

    return notes.sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async createStudyNote(insertNote: InsertStudyNote): Promise<StudyNote> {
    const id = randomUUID();
    const note: StudyNote = {
      ...insertNote,
      id,
      uploadedAt: new Date(),
      departmentId: insertNote.departmentId ?? null,
      chapter: insertNote.chapter ?? null,
      approved: insertNote.approved ?? null,
      uploadedBy: insertNote.uploadedBy ?? null,
      approvedBy: insertNote.approvedBy ?? null,
      approvedAt: insertNote.approvedAt ?? null,
    };
    this.studyNotes.set(id, note);
    return note;
  }
}

// Database Storage Implementation  
export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }
  
  // Department methods
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const result = await db.select().from(departments).where(eq(departments.id, id));
    return result[0];
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const result = await db.insert(departments).values(insertDepartment).returning();
    return result[0];
  }

  // Question Paper methods
  async getQuestionPapers(): Promise<QuestionPaper[]> {
    return await db.select().from(questionPapers).orderBy(desc(questionPapers.uploadedAt));
  }

  async getQuestionPaper(id: string): Promise<QuestionPaper | undefined> {
    const result = await db.select().from(questionPapers).where(eq(questionPapers.id, id));
    return result[0];
  }

  async getQuestionPapersByDepartment(departmentId: string): Promise<QuestionPaper[]> {
    return await db.select().from(questionPapers)
      .where(eq(questionPapers.departmentId, departmentId))
      .orderBy(desc(questionPapers.uploadedAt));
  }

  async searchQuestionPapers(filters: {
    query?: string;
    departmentId?: string;
    semester?: number;
    year?: number;
  }): Promise<QuestionPaper[]> {
    console.log('🔍 Database search filters:', filters);
    
    const conditions = [];
    
    if (filters.query) {
      conditions.push(
        or(
          like(questionPapers.title, `%${filters.query.toLowerCase()}%`),
          like(questionPapers.subject, `%${filters.query.toLowerCase()}%`)
        )
      );
    }
    
    if (filters.departmentId) {
      conditions.push(eq(questionPapers.departmentId, filters.departmentId));
    }
    
    if (filters.semester) {
      conditions.push(eq(questionPapers.semester, filters.semester));
    }
    
    if (filters.year) {
      conditions.push(eq(questionPapers.year, filters.year));
    }
    
    let query = db.select().from(questionPapers);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const result = await query.orderBy(desc(questionPapers.uploadedAt));
      
    console.log('🔍 Database search results:', result.length);
    return result;
  }

  async getRecentQuestionPapers(limit = 10): Promise<QuestionPaper[]> {
    return await db.select().from(questionPapers)
      .orderBy(desc(questionPapers.uploadedAt))
      .limit(limit);
  }

  async createQuestionPaper(insertPaper: InsertQuestionPaper): Promise<QuestionPaper> {
    const result = await db.insert(questionPapers).values(insertPaper).returning();
    return result[0];
  }

  // Study Note methods
  async getStudyNotes(): Promise<StudyNote[]> {
    return await db.select().from(studyNotes).orderBy(desc(studyNotes.uploadedAt));
  }

  async getStudyNote(id: string): Promise<StudyNote | undefined> {
    const result = await db.select().from(studyNotes).where(eq(studyNotes.id, id));
    return result[0];
  }

  async getStudyNotesByDepartment(departmentId: string): Promise<StudyNote[]> {
    return await db.select().from(studyNotes)
      .where(eq(studyNotes.departmentId, departmentId))
      .orderBy(desc(studyNotes.uploadedAt));
  }

  async searchStudyNotes(filters: {
    query?: string;
    departmentId?: string;
    semester?: number;
  }): Promise<StudyNote[]> {
    const conditions = [];
    
    if (filters.query) {
      conditions.push(
        or(
          like(studyNotes.title, `%${filters.query.toLowerCase()}%`),
          like(studyNotes.subject, `%${filters.query.toLowerCase()}%`),
          like(studyNotes.chapter, `%${filters.query.toLowerCase()}%`)
        )
      );
    }
    
    if (filters.departmentId) {
      conditions.push(eq(studyNotes.departmentId, filters.departmentId));
    }
    
    if (filters.semester) {
      conditions.push(eq(studyNotes.semester, filters.semester));
    }
    
    let query = db.select().from(studyNotes);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(studyNotes.uploadedAt));
  }

  async createStudyNote(insertNote: InsertStudyNote): Promise<StudyNote> {
    const result = await db.insert(studyNotes).values(insertNote).returning();
    return result[0];
  }

  // Initialize database with sample data
  async initializeDatabase(): Promise<void> {
    // Check if departments already exist
    const existingDepartments = await this.getDepartments();
    if (existingDepartments.length > 0) {
      console.log('Database already initialized');
      return;
    }

    console.log('Initializing database with sample data...');
    
    // Insert departments
    const deptData: InsertDepartment[] = [
      {
        id: "ai",
        name: "Artificial Intelligence",
        shortName: "AI & ML Technologies",
        description: "Machine Learning, Deep Learning, Neural Networks, and cutting-edge AI applications.",
        accentColor: "hsl(220, 100%, 50%)",
      },
      {
        id: "civil",
        name: "Civil Engineering",
        shortName: "Infrastructure & Construction",
        description: "Structural Engineering, Environmental Engineering, Transportation, and Construction Management.",
        accentColor: "hsl(25, 100%, 45%)",
      },
      {
        id: "mechanical",
        name: "Mechanical Engineering",
        shortName: "Manufacturing & Design",
        description: "Thermodynamics, Machine Design, Manufacturing Processes, and Automation Systems.",
        accentColor: "hsl(120, 60%, 40%)",
      },
      {
        id: "computer",
        name: "Computer Engineering",
        shortName: "Software & Systems",
        description: "Programming, Data Structures, Web Development, and Computer Networks fundamentals.",
        accentColor: "hsl(270, 80%, 55%)",
      },
      {
        id: "electrical",
        name: "Electrical Engineering",
        shortName: "Power & Control Systems",
        description: "Power Systems, Control Theory, Electric Machines, and Renewable Energy Technologies.",
        accentColor: "hsl(45, 90%, 50%)",
      },
      {
        id: "electronics",
        name: "Electronics Engineering",
        shortName: "Circuits & Communication",
        description: "Digital Electronics, Communication Systems, Microprocessors, and Signal Processing.",
        accentColor: "hsl(340, 75%, 50%)",
      },
      {
        id: "bigdata",
        name: "Big Data",
        shortName: "Data Analytics & Processing",
        description: "Big Data Analytics, Data Mining, Hadoop, Spark, and Large-scale Data Processing Systems.",
        accentColor: "hsl(200, 85%, 45%)",
      },
    ];

    await db.insert(departments).values(deptData);

    // Insert sample question papers
    const paperData: InsertQuestionPaper[] = [
      {
        title: "Data Structures & Algorithms",
        subject: "Data Structures",
        departmentId: "computer",
        semester: 3,
        year: 2023,
        session: "Winter",
        marks: 100,
        fileUrl: "/sample-papers/dsa-winter-2023.pdf",
      },
      {
        title: "Engineering Mathematics III",
        subject: "Mathematics",
        departmentId: null,
        semester: 3,
        year: 2023,
        session: "Summer",
        marks: 80,
        fileUrl: "/sample-papers/math3-summer-2023.pdf",
      },
      {
        title: "Machine Learning Fundamentals",
        subject: "Machine Learning",
        departmentId: "ai",
        semester: 5,
        year: 2023,
        session: "Winter",
        marks: 80,
        fileUrl: "/sample-papers/ml-winter-2023.pdf",
      },
      {
        title: "Structural Analysis",
        subject: "Structural Engineering",
        departmentId: "civil",
        semester: 4,
        year: 2023,
        session: "Summer",
        marks: 80,
        fileUrl: "/sample-papers/structural-summer-2023.pdf",
      },
      {
        title: "Thermodynamics",
        subject: "Thermal Engineering",
        departmentId: "mechanical",
        semester: 4,
        year: 2023,
        session: "Winter",
        marks: 80,
        fileUrl: "/sample-papers/thermo-winter-2023.pdf",
      },
      {
        title: "Power Systems",
        subject: "Electrical Power",
        departmentId: "electrical",
        semester: 5,
        year: 2023,
        session: "Summer",
        marks: 80,
        fileUrl: "/sample-papers/power-summer-2023.pdf",
      },
    ];

    // Add Big Data sample paper
    paperData.push({
      title: "Big Data Analytics",
      subject: "Data Analytics",
      departmentId: "bigdata",
      semester: 4,
      year: 2023,
      session: "Winter",
      marks: 80,
      fileUrl: "/sample-papers/bigdata-winter-2023.pdf",
    });

    // Add AI ML Algorithm question paper
    paperData.push({
      title: "AI ML Algorithm",
      subject: "Machine Learning Algorithms",
      departmentId: "ai",
      semester: 6,
      year: 2024,
      session: "Summer",
      marks: 100,
      fileUrl: "https://pdflink.to/ee3c0640/",
    });

    await db.insert(questionPapers).values(paperData);

    // Insert sample study notes
    const noteData: InsertStudyNote[] = [
      {
        title: "Introduction to Algorithms",
        subject: "Data Structures",
        departmentId: "computer",
        semester: 3,
        chapter: "Chapter 1: Basic Concepts",
        fileUrl: "/sample-notes/dsa-intro.pdf",
      },
      {
        title: "Neural Networks Basics",
        subject: "Machine Learning",
        departmentId: "ai",
        semester: 5,
        chapter: "Chapter 3: Neural Networks",
        fileUrl: "/sample-notes/neural-networks.pdf",
      },
      {
        title: "Concrete Technology",
        subject: "Construction Materials",
        departmentId: "civil",
        semester: 3,
        chapter: "Chapter 2: Concrete",
        fileUrl: "/sample-notes/concrete-tech.pdf",
      },
    ];

    // Add Big Data sample note
    noteData.push({
      title: "Introduction to Hadoop",
      subject: "Big Data Technologies",
      departmentId: "bigdata",
      semester: 4,
      chapter: "Chapter 1: Hadoop Ecosystem",
      fileUrl: "/sample-notes/hadoop-intro.pdf",
    });

    await db.insert(studyNotes).values(noteData);
    
    console.log('Database initialization complete!');
  }
}

// Create storage instance and initialize
// Use MemStorage if DATABASE_URL is not available, otherwise use DatabaseStorage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

// Initialize database on startup only if using DatabaseStorage
if (process.env.DATABASE_URL && storage instanceof DatabaseStorage) {
  storage.initializeDatabase().catch(console.error);
}

// Keep MemStorage for backward compatibility if needed
export { MemStorage };
