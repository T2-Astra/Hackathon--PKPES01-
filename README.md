# 🚀 LearnFlow...

> **AI-Powered Personalized Learning Platform for Everyone**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-green.svg)](https://nodejs.org/)

## 🌟 Overview

LearnFlow is a comprehensive AI-powered learning platform designed to provide personalized education experiences for everyone. Built with modern web technologies, it offers adaptive learning paths, gamification, skill assessments, and collaborative features.

### 🎯 Key Features

#### 🤖 AI-Powered Learning
- **Adaptive Learning Paths** - AI generates personalized curriculum based on your goals
- **Smart Content Summarizer** - Upload PDFs and get AI-generated summaries
- **AI Tutor Chatbot** - 24/7 intelligent assistance for your learning journey
- **Auto Flashcard Generator** - AI creates flashcards from any content

#### 🎮 Gamification System
- **XP & Leveling** - Earn experience points for every activity
- **Achievement Badges** - Unlock common, rare, epic, and legendary badges
- **Daily Challenges** - Complete challenges for bonus rewards
- **Leaderboards** - Compete with learners globally
- **Streak System** - Maintain daily learning streaks

#### 📚 Learning Features
- **Learning Paths** - Structured courses with progress tracking
- **Flashcards** - Spaced repetition for effective memorization
- **MCQ Tests** - AI-generated quizzes with explanations
- **Skill Assessments** - Track your skill levels with radar charts
- **Certificates** - Earn shareable credentials

#### 👥 Social & Collaboration
- **Study Rooms** - Virtual rooms for collaborative learning
- **Peer Tutoring** - Help others and earn rewards
- **Discussion Forums** - Topic-wise Q&A

#### 📊 Progress Tracking
- **Smart Dashboard** - Visual analytics of your learning
- **Weekly Progress** - Track study time and goals
- **Skill Radar Chart** - Visualize your skill development

### 🌍 Accessibility
- **Multi-Language Support** - English, Hindi, Marathi
- **Theme Support** - Light/Dark mode with system preference
- **Mobile-First Design** - Works on all devices
- **Offline Support** - PWA capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js (Latest LTS version)
- npm or yarn
- PostgreSQL database (Neon DB recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/LearnFlow.git
   cd LearnFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   SESSION_SECRET=your_session_secret
   LOVABLE_API_KEY=your_ai_api_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **TanStack Query** for server state
- **Framer Motion** for animations

#### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database
- **JWT** for authentication

#### Database
- **PostgreSQL** (Primary)
- **MongoDB** (Secondary)

## 📋 Features Guide

### 🎯 Adaptive Learning Engine
1. Complete the onboarding quiz
2. Set your learning goals
3. AI generates personalized learning path
4. Track progress with smart analytics

### 🎮 Gamification
- Earn XP for completing lessons, quizzes, and challenges
- Level up and unlock new features
- Compete on leaderboards
- Collect achievement badges

### 📚 Flashcards
- Create custom decks
- Generate flashcards with AI
- Spaced repetition algorithm
- Track mastery progress

### 🏆 Certificates
- Earn certificates on completion
- Shareable credentials
- QR verification codes
- LinkedIn integration

## 🛡️ Security Features

- JWT Authentication with HTTP-only cookies
- Role-based Access Control
- Input Sanitization with Zod
- Password Hashing with bcrypt
- CORS Protection

## 📱 Mobile Support

- Responsive Design
- Touch-Friendly
- Progressive Web App
- Offline Support

## 🗺️ Roadmap

- [ ] Video Lectures Integration
- [ ] Real-time Study Rooms
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics Dashboard
- [ ] API Documentation
- [ ] Mentorship System

---

**Made with ❤️ for learners everywhere**

*LearnFlow - AI-Powered Personalized Learning for Everyone*
