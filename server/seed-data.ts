import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kenxsakk_db_user:Kenxji%4003999@skill-learn.0ikin8b.mongodb.net/';
const DATABASE_NAME = 'learnflow';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    console.log('Connected to MongoDB for seeding...');
    console.log('Database:', DATABASE_NAME);

    // Seed Achievements (drop and recreate to ensure fresh data)
    const achievements = db.collection('achievements');
    await achievements.deleteMany({});
    
    const achievementData = [
      { name: 'First Steps', description: 'Complete your first lesson', icon: 'rocket', rarity: 'common', xpReward: 50, category: 'learning' },
      { name: 'Quick Learner', description: 'Complete 5 lessons', icon: 'zap', rarity: 'common', xpReward: 100, category: 'learning' },
      { name: 'Knowledge Seeker', description: 'Complete 25 lessons', icon: 'book', rarity: 'rare', xpReward: 250, category: 'learning' },
      { name: 'Scholar', description: 'Complete 50 lessons', icon: 'graduation-cap', rarity: 'epic', xpReward: 500, category: 'learning' },
      { name: 'Quiz Novice', description: 'Pass your first quiz', icon: 'check-circle', rarity: 'common', xpReward: 50, category: 'quiz' },
      { name: 'Quiz Master', description: 'Pass 10 quizzes', icon: 'brain', rarity: 'rare', xpReward: 200, category: 'quiz' },
      { name: 'Perfect Score', description: 'Get 100% on any quiz', icon: 'star', rarity: 'rare', xpReward: 150, category: 'quiz' },
      { name: 'Streak Starter', description: '3-day learning streak', icon: 'flame', rarity: 'common', xpReward: 75, category: 'streak' },
      { name: 'Week Warrior', description: '7-day learning streak', icon: 'flame', rarity: 'rare', xpReward: 200, category: 'streak' },
      { name: 'Dedicated Learner', description: '30-day learning streak', icon: 'flame', rarity: 'epic', xpReward: 1000, category: 'streak' },
      { name: 'Century Streak', description: '100-day learning streak', icon: 'crown', rarity: 'legendary', xpReward: 5000, category: 'streak' },
      { name: 'Path Finder', description: 'Complete your first learning path', icon: 'map', rarity: 'rare', xpReward: 300, category: 'learning' },
      { name: 'Path Master', description: 'Complete 5 learning paths', icon: 'trophy', rarity: 'epic', xpReward: 1000, category: 'learning' },
      { name: 'Certified', description: 'Earn your first certificate', icon: 'award', rarity: 'rare', xpReward: 250, category: 'learning' },
      { name: 'Early Bird', description: 'Study before 8 AM', icon: 'sunrise', rarity: 'common', xpReward: 50, category: 'social' },
      { name: 'Night Owl', description: 'Study after 10 PM', icon: 'moon', rarity: 'common', xpReward: 50, category: 'social' },
      { name: 'Social Learner', description: 'Join a study room', icon: 'users', rarity: 'common', xpReward: 50, category: 'social' },
      { name: 'Flashcard Fan', description: 'Create 50 flashcards', icon: 'layers', rarity: 'rare', xpReward: 150, category: 'learning' },
      { name: 'Level 5', description: 'Reach level 5', icon: 'trending-up', rarity: 'common', xpReward: 100, category: 'level' },
      { name: 'Level 10', description: 'Reach level 10', icon: 'trending-up', rarity: 'rare', xpReward: 300, category: 'level' },
      { name: 'Level 25', description: 'Reach level 25', icon: 'trending-up', rarity: 'epic', xpReward: 750, category: 'level' },
      { name: 'Legend', description: 'Reach level 50', icon: 'crown', rarity: 'legendary', xpReward: 2500, category: 'level' },
    ];
    
    await achievements.insertMany(achievementData);
    console.log('✅ Seeded', achievementData.length, 'achievements');

    // Seed Categories
    const categories = db.collection('categories');
    await categories.deleteMany({});
    
    const categoryData = [
      { name: 'Programming', description: 'Learn coding and software development', icon: 'code', color: '#3B82F6' },
      { name: 'Web Development', description: 'Build websites and web applications', icon: 'globe', color: '#10B981' },
      { name: 'Data Science', description: 'Analyze data and build ML models', icon: 'bar-chart', color: '#8B5CF6' },
      { name: 'Design', description: 'UI/UX and graphic design', icon: 'palette', color: '#F59E0B' },
      { name: 'Business', description: 'Business and entrepreneurship', icon: 'briefcase', color: '#EF4444' },
      { name: 'Languages', description: 'Learn new languages', icon: 'languages', color: '#EC4899' },
      { name: 'Mathematics', description: 'Math and statistics', icon: 'calculator', color: '#06B6D4' },
      { name: 'Science', description: 'Physics, chemistry, biology', icon: 'flask', color: '#84CC16' },
    ];
    
    await categories.insertMany(categoryData);
    console.log('✅ Seeded', categoryData.length, 'categories');

    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
