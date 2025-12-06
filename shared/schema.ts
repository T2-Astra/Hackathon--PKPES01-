import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories (replacing departments - now universal)
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").default("BookOpen"),
  accentColor: text("accent_color").notNull(),
  resourceCount: integer("resource_count").default(0),
  parentId: varchar("parent_id"),
  order: integer("order").default(0),
});

// Keep departments for backward compatibility
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  description: text("description").notNull(),
  accentColor: text("accent_color").notNull(),
  resourceCount: integer("resource_count").default(0),
});

// ============ LEARNING PATH & ADAPTIVE LEARNING ============

// Learning paths - AI generated personalized curriculum
export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id"),
  skillLevel: varchar("skill_level").default("beginner"), // beginner, intermediate, advanced
  estimatedDuration: integer("estimated_duration"), // in minutes
  totalModules: integer("total_modules").default(0),
  completedModules: integer("completed_modules").default(0),
  progress: real("progress").default(0),
  isAiGenerated: boolean("is_ai_generated").default(true),
  status: varchar("status").default("active"), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning path modules
export const learningModules = pgTable("learning_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pathId: varchar("path_id").references(() => learningPaths.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  resourceType: varchar("resource_type"), // video, article, quiz, practice
  resourceUrl: text("resource_url"),
  order: integer("order").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  score: real("score"),
});

// User skill assessments
export const skillAssessments = pgTable("skill_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  categoryId: varchar("category_id"),
  skillName: text("skill_name").notNull(),
  currentLevel: real("current_level").default(0), // 0-100
  targetLevel: real("target_level").default(100),
  assessedAt: timestamp("assessed_at").defaultNow(),
  nextAssessmentAt: timestamp("next_assessment_at"),
});

// ============ GAMIFICATION ============

// User XP and levels
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").unique().notNull(),
  totalXp: integer("total_xp").default(0),
  level: integer("level").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  totalStudyTime: integer("total_study_time").default(0), // in minutes
  quizzesCompleted: integer("quizzes_completed").default(0),
  quizzesPassed: integer("quizzes_passed").default(0),
  resourcesCompleted: integer("resources_completed").default(0),
  certificatesEarned: integer("certificates_earned").default(0),
});

// Achievements/Badges
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: varchar("category").notNull(), // streak, quiz, learning, social
  requirement: text("requirement").notNull(),
  xpReward: integer("xp_reward").default(0),
  rarity: varchar("rarity").default("common"), // common, rare, epic, legendary
});

// User earned achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: real("progress").default(100),
});

// Daily challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // quiz, study_time, streak, resource
  requirement: jsonb("requirement").notNull(),
  xpReward: integer("xp_reward").default(50),
  date: timestamp("date").notNull(),
  isActive: boolean("is_active").default(true),
});

// User daily challenge progress
export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  challengeId: varchar("challenge_id").references(() => dailyChallenges.id).notNull(),
  progress: real("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
});

// Leaderboard entries (cached for performance)
export const leaderboard = pgTable("leaderboard", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").unique().notNull(),
  username: text("username").notNull(),
  totalXp: integer("total_xp").default(0),
  level: integer("level").default(1),
  rank: integer("rank"),
  weeklyXp: integer("weekly_xp").default(0),
  monthlyXp: integer("monthly_xp").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ CERTIFICATES ============

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id"),
  skillName: text("skill_name"),
  score: real("score"),
  issueDate: timestamp("issue_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  certificateUrl: text("certificate_url"),
  verificationCode: varchar("verification_code").unique(),
  isPublic: boolean("is_public").default(true),
});

// ============ STUDY SESSIONS & COLLABORATION ============

export const studyRooms = pgTable("study_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  hostId: varchar("host_id").notNull(),
  categoryId: varchar("category_id"),
  topic: text("topic"),
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  isActive: boolean("is_active").default(true),
  isPrivate: boolean("is_private").default(false),
  roomCode: varchar("room_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  endsAt: timestamp("ends_at"),
});

export const studyRoomParticipants = pgTable("study_room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => studyRooms.id).notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  role: varchar("role").default("participant"), // host, moderator, participant
});

// ============ FLASHCARDS & SPACED REPETITION ============

export const flashcardDecks = pgTable("flashcard_decks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id"),
  isPublic: boolean("is_public").default(false),
  isAiGenerated: boolean("is_ai_generated").default(false),
  cardCount: integer("card_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deckId: varchar("deck_id").references(() => flashcardDecks.id).notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  hint: text("hint"),
  imageUrl: text("image_url"),
  order: integer("order").default(0),
  // Spaced repetition fields
  easeFactor: real("ease_factor").default(2.5),
  interval: integer("interval").default(1), // days
  repetitions: integer("repetitions").default(0),
  nextReviewAt: timestamp("next_review_at"),
  lastReviewedAt: timestamp("last_reviewed_at"),
});

// ============ GOALS & REMINDERS ============

export const userGoals = pgTable("user_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id"),
  targetDate: timestamp("target_date"),
  targetValue: integer("target_value"), // e.g., complete 5 courses
  currentValue: integer("current_value").default(0),
  goalType: varchar("goal_type").notNull(), // skill_mastery, course_completion, study_time, streak
  status: varchar("status").default("active"), // active, completed, abandoned
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const studyReminders = pgTable("study_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  reminderTime: text("reminder_time").notNull(), // HH:MM format
  daysOfWeek: jsonb("days_of_week"), // [0,1,2,3,4,5,6] for days
  isActive: boolean("is_active").default(true),
  lastSentAt: timestamp("last_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ USER PREFERENCES & LEARNING STYLE ============

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").unique().notNull(),
  learningStyle: varchar("learning_style"), // visual, auditory, reading, kinesthetic
  preferredStudyTime: text("preferred_study_time"), // morning, afternoon, evening, night
  dailyGoalMinutes: integer("daily_goal_minutes").default(30),
  weeklyGoalDays: integer("weekly_goal_days").default(5),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  emailDigestEnabled: boolean("email_digest_enabled").default(true),
  soundEnabled: boolean("sound_enabled").default(true),
  interests: jsonb("interests"), // array of category IDs
  difficultyPreference: varchar("difficulty_preference").default("adaptive"), // easy, medium, hard, adaptive
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ AI CONTENT FEATURES ============

export const aiSummaries = pgTable("ai_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sourceType: varchar("source_type").notNull(), // pdf, note, url
  sourceUrl: text("source_url"),
  originalContent: text("original_content"),
  summary: text("summary").notNull(),
  keyPoints: jsonb("key_points"),
  flashcardsGenerated: boolean("flashcards_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  quizType: varchar("quiz_type").notNull(), // mcq, adaptive, skill_assessment
  categoryId: varchar("category_id"),
  topic: text("topic"),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  score: real("score").default(0),
  timeTaken: integer("time_taken"), // in seconds
  difficulty: varchar("difficulty").default("medium"),
  xpEarned: integer("xp_earned").default(0),
  answers: jsonb("answers"), // detailed answer data
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const questionPapers = pgTable("question_papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  departmentId: varchar("department_id").references(() => departments.id),
  semester: integer("semester").notNull(),
  year: integer("year").notNull(),
  session: text("session").notNull(), // "Winter" or "Summer"
  marks: integer("marks").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => mongoUsers.id),
  approved: boolean("approved").default(false),
  approvedBy: varchar("approved_by").references(() => mongoUsers.id),
  approvedAt: timestamp("approved_at"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const studyNotes = pgTable("study_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  departmentId: varchar("department_id").references(() => departments.id),
  semester: integer("semester").notNull(),
  chapter: text("chapter"),
  fileUrl: text("file_url").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => mongoUsers.id),
  approved: boolean("approved").default(false),
  approvedBy: varchar("approved_by").references(() => mongoUsers.id),
  approvedAt: timestamp("approved_at"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  resourceCount: true,
});

export const insertQuestionPaperSchema = createInsertSchema(questionPapers).omit({
  id: true,
  uploadedAt: true,
});

export const insertStudyNoteSchema = createInsertSchema(studyNotes).omit({
  id: true,
  uploadedAt: true,
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// MongoDB User authentication table
export const mongoUsers = pgTable("mongo_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  clerkId: varchar("clerk_id").unique(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User search history
export const userHistory = pgTable("user_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => mongoUsers.id).notNull(),
  searchQuery: text("search_query").notNull(),
  department: varchar("department"),
  resourceType: varchar("resource_type"),
  semester: integer("semester"),
  year: integer("year"),
  searchedAt: timestamp("searched_at").defaultNow(),
});

// User upload history - stores complete resource data until approved
export const userUploads = pgTable("user_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => mongoUsers.id).notNull(),
  resourceId: varchar("resource_id").notNull(),
  resourceType: varchar("resource_type").notNull(), // "question_paper" or "study_note"
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  department: varchar("department"),
  semester: varchar("semester"),
  year: varchar("year"),
  session: varchar("session"),
  marks: varchar("marks"),
  chapter: text("chapter"),
  description: text("description"),
  filePath: text("file_path").notNull(),
  status: varchar("status").default("pending"), // "pending", "approved", "rejected"
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectedBy: varchar("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// User storage table for Replit Auth (keeping for backward compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ TYPE EXPORTS ============

export type Category = typeof categories.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type QuestionPaper = typeof questionPapers.$inferSelect;
export type StudyNote = typeof studyNotes.$inferSelect;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type MongoUser = typeof mongoUsers.$inferSelect;
export type InsertMongoUser = typeof mongoUsers.$inferInsert;
export type UserHistory = typeof userHistory.$inferSelect;
export type InsertUserHistory = typeof userHistory.$inferInsert;
export type UserUpload = typeof userUploads.$inferSelect;
export type InsertUserUpload = typeof userUploads.$inferInsert;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertQuestionPaper = z.infer<typeof insertQuestionPaperSchema>;
export type InsertStudyNote = z.infer<typeof insertStudyNoteSchema>;

// New types for winning features
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;
export type LearningModule = typeof learningModules.$inferSelect;
export type SkillAssessment = typeof skillAssessments.$inferSelect;
export type UserProgressType = typeof userProgress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type StudyRoom = typeof studyRooms.$inferSelect;
export type FlashcardDeck = typeof flashcardDecks.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type UserGoal = typeof userGoals.$inferSelect;
export type StudyReminder = typeof studyReminders.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;
export type AiSummary = typeof aiSummaries.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;

// Insert schemas for new tables
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, issueDate: true });
export const insertStudyRoomSchema = createInsertSchema(studyRooms).omit({ id: true, createdAt: true });
export const insertFlashcardDeckSchema = createInsertSchema(flashcardDecks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true });
export const insertUserGoalSchema = createInsertSchema(userGoals).omit({ id: true, createdAt: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, startedAt: true });
