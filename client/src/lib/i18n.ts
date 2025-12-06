// Internationalization system for LearnFlow
export type Language = 'auto' | 'en' | 'hi' | 'mr';

export interface Translations {
  // Navigation & Layout
  navigation: {
    home: string;
    search: string;
    chatbot: string;
    profile: string;
    history: string;
    videos: string;
    upload: string;
    admin: string;
    help: string;
    settings: string;
    learningPath: string;
    achievements: string;
    leaderboard: string;
    flashcards: string;
    studyRooms: string;
    certificates: string;
  };
  
  // Common UI Elements
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    clear: string;
    submit: string;
    upload: string;
    download: string;
  };
  
  // Settings Page
  settings: {
    title: string;
    general: string;
    notifications: string;
    appearance: string;
    privacy: string;
    data: string;
    account: string;
    theme: string;
    themeDescription: string;
    language: string;
    languageDescription: string;
    autoSave: string;
    autoSaveDescription: string;
    system: string;
    light: string;
    dark: string;
    nature: string;
    autoDetect: string;
  };
  
  // Home Page
  home: {
    welcome: string;
    subtitle: string;
    searchPlaceholder: string;
    recentUploads: string;
    quickAccess: string;
    departments: string;
    categories: string;
    continuelearning: string;
    dailyChallenge: string;
    yourProgress: string;
  };
  
  // Categories (replacing departments)
  categories: {
    programming: string;
    webDev: string;
    datascience: string;
    ai: string;
    design: string;
    business: string;
    languages: string;
    allCategories: string;
  };
  
  // Departments (kept for backward compatibility)
  departments: {
    ai: string;
    civil: string;
    mechanical: string;
    computer: string;
    electrical: string;
    electronics: string;
    bigdata: string;
    allDepartments: string;
  };
  
  // Search & Filters
  search: {
    title: string;
    placeholder: string;
    results: string;
    noResults: string;
    filters: string;
    department: string;
    resourceType: string;
    semester: string;
    year: string;
    questionPapers: string;
    studyNotes: string;
    videos: string;
    allTypes: string;
    skillLevel: string;
    category: string;
  };
  
  // Chatbot
  chatbot: {
    title: string;
    placeholder: string;
    askAnything: string;
    listening: string;
    speechRecognized: string;
    voiceInputError: string;
    selectModel: string;
    hexa: string;
    omnia: string;
  };
  
  // Voice Input
  voice: {
    startListening: string;
    stopListening: string;
    listening: string;
    speechRecognized: string;
    notSupported: string;
    permissionDenied: string;
    networkError: string;
    noSpeechDetected: string;
  };
  
  // Footer
  footer: {
    description: string;
    quickLinks: string;
    support: string;
    searchResources: string;
    questionPapers: string;
    studyNotes: string;
    helpCenter: string;
    contactUs: string;
    reportIssue: string;
    feedback: string;
    copyright: string;
  };
  
  // Auth
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    forgotPassword: string;
    rememberMe: string;
  };
  
  // Gamification
  gamification: {
    xp: string;
    level: string;
    streak: string;
    achievements: string;
    dailyChallenge: string;
    leaderboard: string;
    badges: string;
    rank: string;
    progress: string;
  };
  
  // Learning Path
  learningPath: {
    title: string;
    createNew: string;
    continue: string;
    completed: string;
    inProgress: string;
    estimatedTime: string;
    modules: string;
    skills: string;
  };
}

export const translations: Record<Language, Translations> = {
  auto: {} as Translations, // Will use detected language
  
  en: {
    navigation: {
      home: 'Home',
      search: 'Resources',
      chatbot: 'AI Tutor',
      profile: 'Profile',
      history: 'History',
      videos: 'Videos',
      upload: 'Upload',
      admin: 'Admin',
      help: 'Help',
      settings: 'Settings',
      learningPath: 'Learning Path',
      achievements: 'Achievements',
      leaderboard: 'Leaderboard',
      flashcards: 'Flashcards',
      studyRooms: 'Study Rooms',
      certificates: 'Certificates',
    },
    
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      submit: 'Submit',
      upload: 'Upload',
      download: 'Download',
    },
    
    settings: {
      title: 'Settings',
      general: 'General',
      notifications: 'Notifications',
      appearance: 'Appearance',
      privacy: 'Privacy & Security',
      data: 'Data & Storage',
      account: 'Account',
      theme: 'Theme',
      themeDescription: 'Choose your preferred theme',
      language: 'Language',
      languageDescription: 'Select your preferred language',
      autoSave: 'Auto-save progress',
      autoSaveDescription: 'Automatically save your study progress',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      nature: 'Syntra',
      autoDetect: 'Auto-detect',
    },
    
    home: {
      welcome: 'Welcome to LearnFlow',
      subtitle: 'Your AI-powered personalized learning platform. Master any skill with adaptive learning paths, smart assessments, and gamified progress tracking.',
      searchPlaceholder: 'Search for courses, topics, skills...',
      recentUploads: 'Recent Uploads',
      quickAccess: 'Quick Access',
      departments: 'Categories',
      categories: 'Categories',
      continuelearning: 'Continue Learning',
      dailyChallenge: 'Daily Challenge',
      yourProgress: 'Your Progress',
    },
    
    categories: {
      programming: 'Programming',
      webDev: 'Web Development',
      datascience: 'Data Science',
      ai: 'AI & Machine Learning',
      design: 'Design',
      business: 'Business',
      languages: 'Languages',
      allCategories: 'All Categories',
    },
    
    departments: {
      ai: 'AI & Machine Learning',
      civil: 'Civil Engineering',
      mechanical: 'Mechanical Engineering',
      computer: 'Computer Science',
      electrical: 'Electrical Engineering',
      electronics: 'Electronics',
      bigdata: 'Data Science',
      allDepartments: 'All Categories',
    },
    
    search: {
      title: 'Search Resources',
      placeholder: 'Search for courses, topics...',
      results: 'Search Results',
      noResults: 'No results found',
      filters: 'Filter Options',
      department: 'Category',
      resourceType: 'Resource Type',
      semester: 'Level',
      year: 'Year',
      questionPapers: 'Practice Tests',
      studyNotes: 'Study Notes',
      videos: 'Videos',
      allTypes: 'All Types',
      skillLevel: 'Skill Level',
      category: 'Category',
    },
    
    chatbot: {
      title: 'AI Tutor',
      placeholder: 'Ask me anything...',
      askAnything: 'Ask me anything about your learning journey',
      listening: 'Listening...',
      speechRecognized: 'Speech recognized!',
      voiceInputError: 'Voice input error',
      selectModel: 'Select AI Model',
      hexa: 'Hexa',
      omnia: 'Omnia',
    },
    
    voice: {
      startListening: 'Click to start voice input',
      stopListening: 'Click to stop listening',
      listening: 'Listening...',
      speechRecognized: 'Speech recognized!',
      notSupported: 'Voice input not supported in this browser',
      permissionDenied: 'Microphone permission denied. Please allow microphone access.',
      networkError: 'Network error. Please check your connection.',
      noSpeechDetected: 'No speech detected. Please try again.',
    },
    
    footer: {
      description: 'Empowering learners worldwide with AI-powered personalized education, adaptive learning paths, and skill-based certifications.',
      quickLinks: 'Quick Links',
      support: 'Support',
      searchResources: 'Search Resources',
      questionPapers: 'Practice Tests',
      studyNotes: 'Study Notes',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      reportIssue: 'Report Issue',
      feedback: 'Feedback',
      copyright: '© 2025 LearnFlow. All rights reserved. | Made with ❤️ for learners',
    },
    
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
    },
    
    gamification: {
      xp: 'XP',
      level: 'Level',
      streak: 'Day Streak',
      achievements: 'Achievements',
      dailyChallenge: 'Daily Challenge',
      leaderboard: 'Leaderboard',
      badges: 'Badges',
      rank: 'Rank',
      progress: 'Progress',
    },
    
    learningPath: {
      title: 'Learning Path',
      createNew: 'Create New Path',
      continue: 'Continue Learning',
      completed: 'Completed',
      inProgress: 'In Progress',
      estimatedTime: 'Estimated Time',
      modules: 'Modules',
      skills: 'Skills',
    },
  },
  
  hi: {
    navigation: {
      home: 'होम',
      search: 'संसाधन',
      chatbot: 'AI ट्यूटर',
      profile: 'प्रोफाइल',
      history: 'इतिहास',
      videos: 'वीडियो',
      upload: 'अपलोड',
      admin: 'एडमिन',
      help: 'सहायता',
      settings: 'सेटिंग्स',
      learningPath: 'लर्निंग पाथ',
      achievements: 'उपलब्धियां',
      leaderboard: 'लीडरबोर्ड',
      flashcards: 'फ्लैशकार्ड्स',
      studyRooms: 'स्टडी रूम्स',
      certificates: 'प्रमाणपत्र',
    },
    
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सेव करें',
      delete: 'डिलीट करें',
      edit: 'संपादित करें',
      close: 'बंद करें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      search: 'खोजें',
      filter: 'फिल्टर',
      clear: 'साफ करें',
      submit: 'जमा करें',
      upload: 'अपलोड करें',
      download: 'डाउनलोड करें',
    },
    
    settings: {
      title: 'सेटिंग्स',
      general: 'सामान्य',
      notifications: 'सूचनाएं',
      appearance: 'दिखावट',
      privacy: 'गोपनीयता और सुरक्षा',
      data: 'डेटा और स्टोरेज',
      account: 'खाता',
      theme: 'थीम',
      themeDescription: 'अपनी पसंदीदा थीम चुनें',
      language: 'भाषा',
      languageDescription: 'अपनी पसंदीदा भाषा चुनें',
      autoSave: 'ऑटो-सेव प्रगति',
      autoSaveDescription: 'अपनी अध्ययन प्रगति को स्वचालित रूप से सेव करें',
      system: 'सिस्टम',
      light: 'लाइट',
      dark: 'डार्क',
      nature: 'Syntra',
      autoDetect: 'ऑटो-डिटेक्ट',
    },
    
    home: {
      welcome: 'LearnFlow में आपका स्वागत है',
      subtitle: 'AI-संचालित व्यक्तिगत शिक्षण मंच। अनुकूली पाठ्यक्रम और गेमिफाइड प्रगति के साथ कोई भी कौशल सीखें।',
      searchPlaceholder: 'कोर्स, विषय, कौशल खोजें...',
      recentUploads: 'हाल की अपलोड',
      quickAccess: 'त्वरित पहुंच',
      departments: 'श्रेणियां',
      categories: 'श्रेणियां',
      continuelearning: 'सीखना जारी रखें',
      dailyChallenge: 'दैनिक चुनौती',
      yourProgress: 'आपकी प्रगति',
    },
    
    categories: {
      programming: 'प्रोग्रामिंग',
      webDev: 'वेब डेवलपमेंट',
      datascience: 'डेटा साइंस',
      ai: 'AI और मशीन लर्निंग',
      design: 'डिज़ाइन',
      business: 'व्यापार',
      languages: 'भाषाएं',
      allCategories: 'सभी श्रेणियां',
    },
    
    departments: {
      ai: 'AI और मशीन लर्निंग',
      civil: 'सिविल इंजीनियरिंग',
      mechanical: 'मैकेनिकल इंजीनियरिंग',
      computer: 'कंप्यूटर साइंस',
      electrical: 'इलेक्ट्रिकल इंजीनियरिंग',
      electronics: 'इलेक्ट्रॉनिक्स',
      bigdata: 'डेटा साइंस',
      allDepartments: 'सभी श्रेणियां',
    },
    
    search: {
      title: 'संसाधन खोजें',
      placeholder: 'कोर्स, विषय खोजें...',
      results: 'खोज परिणाम',
      noResults: 'कोई परिणाम नहीं मिला',
      filters: 'फिल्टर विकल्प',
      department: 'श्रेणी',
      resourceType: 'संसाधन प्रकार',
      semester: 'स्तर',
      year: 'वर्ष',
      questionPapers: 'अभ्यास परीक्षा',
      studyNotes: 'अध्ययन नोट्स',
      videos: 'वीडियो',
      allTypes: 'सभी प्रकार',
      skillLevel: 'कौशल स्तर',
      category: 'श्रेणी',
    },
    
    chatbot: {
      title: 'AI ट्यूटर',
      placeholder: 'मुझसे कुछ भी पूछें...',
      askAnything: 'अपनी सीखने की यात्रा के बारे में कुछ भी पूछें',
      listening: 'सुन रहा है...',
      speechRecognized: 'आवाज पहचानी गई!',
      voiceInputError: 'आवाज इनपुट त्रुटि',
      selectModel: 'AI मॉडल चुनें',
      hexa: 'हेक्सा',
      omnia: 'ओम्निया',
    },
    
    voice: {
      startListening: 'आवाज इनपुट शुरू करने के लिए क्लिक करें',
      stopListening: 'सुनना बंद करने के लिए क्लिक करें',
      listening: 'सुन रहा है...',
      speechRecognized: 'आवाज पहचानी गई!',
      notSupported: 'इस ब्राउज़र में आवाज इनपुट समर्थित नहीं है',
      permissionDenied: 'माइक्रोफोन की अनुमति अस्वीकृत। कृपया माइक्रोफोन एक्सेस की अनुमति दें।',
      networkError: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
      noSpeechDetected: 'कोई आवाज नहीं मिली। कृपया फिर से कोशिश करें।',
    },
    
    footer: {
      description: 'AI-संचालित व्यक्तिगत शिक्षा, अनुकूली पाठ्यक्रम और कौशल-आधारित प्रमाणपत्रों के साथ दुनिया भर के शिक्षार्थियों को सशक्त बनाना।',
      quickLinks: 'त्वरित लिंक',
      support: 'सहायता',
      searchResources: 'संसाधन खोजें',
      questionPapers: 'अभ्यास परीक्षा',
      studyNotes: 'अध्ययन नोट्स',
      helpCenter: 'सहायता केंद्र',
      contactUs: 'संपर्क करें',
      reportIssue: 'समस्या रिपोर्ट करें',
      feedback: 'फीडबैक',
      copyright: '© 2025 LearnFlow. सभी अधिकार सुरक्षित। | शिक्षार्थियों के लिए ❤️ के साथ बनाया गया',
    },
    
    auth: {
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      register: 'रजिस्टर',
      email: 'ईमेल',
      password: 'पासवर्ड',
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      forgotPassword: 'पासवर्ड भूल गए?',
      rememberMe: 'मुझे याद रखें',
    },
    
    gamification: {
      xp: 'XP',
      level: 'स्तर',
      streak: 'दिन स्ट्रीक',
      achievements: 'उपलब्धियां',
      dailyChallenge: 'दैनिक चुनौती',
      leaderboard: 'लीडरबोर्ड',
      badges: 'बैज',
      rank: 'रैंक',
      progress: 'प्रगति',
    },
    
    learningPath: {
      title: 'लर्निंग पाथ',
      createNew: 'नया पाथ बनाएं',
      continue: 'सीखना जारी रखें',
      completed: 'पूर्ण',
      inProgress: 'प्रगति में',
      estimatedTime: 'अनुमानित समय',
      modules: 'मॉड्यूल',
      skills: 'कौशल',
    },
  },
  
  mr: {
    navigation: {
      home: 'होम',
      search: 'संसाधने',
      chatbot: 'AI ट्यूटर',
      profile: 'प्रोफाइल',
      history: 'इतिहास',
      videos: 'व्हिडिओ',
      upload: 'अपलोड',
      admin: 'अॅडमिन',
      help: 'मदत',
      settings: 'सेटिंग्ज',
      learningPath: 'लर्निंग पाथ',
      achievements: 'उपलब्धी',
      leaderboard: 'लीडरबोर्ड',
      flashcards: 'फ्लॅशकार्ड्स',
      studyRooms: 'स्टडी रूम्स',
      certificates: 'प्रमाणपत्रे',
    },
    
    common: {
      loading: 'लोड होत आहे...',
      error: 'त्रुटी',
      success: 'यश',
      cancel: 'रद्द करा',
      save: 'सेव्ह करा',
      delete: 'डिलीट करा',
      edit: 'संपादित करा',
      close: 'बंद करा',
      back: 'परत',
      next: 'पुढे',
      previous: 'मागे',
      search: 'शोधा',
      filter: 'फिल्टर',
      clear: 'साफ करा',
      submit: 'सबमिट करा',
      upload: 'अपलोड करा',
      download: 'डाउनलोड करा',
    },
    
    settings: {
      title: 'सेटिंग्ज',
      general: 'सामान्य',
      notifications: 'सूचना',
      appearance: 'दिसणे',
      privacy: 'गोपनीयता आणि सुरक्षा',
      data: 'डेटा आणि स्टोरेज',
      account: 'खाते',
      theme: 'थीम',
      themeDescription: 'तुमची आवडती थीम निवडा',
      language: 'भाषा',
      languageDescription: 'तुमची आवडती भाषा निवडा',
      autoSave: 'ऑटो-सेव्ह प्रगती',
      autoSaveDescription: 'तुमची अभ्यास प्रगती आपोआप सेव्ह करा',
      system: 'सिस्टम',
      light: 'लाइट',
      dark: 'डार्क',
      nature: 'Syntra',
      autoDetect: 'ऑटो-डिटेक्ट',
    },
    
    home: {
      welcome: 'LearnFlow मध्ये आपले स्वागत आहे',
      subtitle: 'AI-संचालित वैयक्तिक शिक्षण व्यासपीठ. अनुकूली अभ्यासक्रम आणि गेमिफाइड प्रगतीसह कोणतेही कौशल्य शिका.',
      searchPlaceholder: 'कोर्स, विषय, कौशल्ये शोधा...',
      recentUploads: 'अलीकडील अपलोड',
      quickAccess: 'त्वरित प्रवेश',
      departments: 'श्रेण्या',
      categories: 'श्रेण्या',
      continuelearning: 'शिकणे सुरू ठेवा',
      dailyChallenge: 'दैनिक आव्हान',
      yourProgress: 'तुमची प्रगती',
    },
    
    categories: {
      programming: 'प्रोग्रामिंग',
      webDev: 'वेब डेव्हलपमेंट',
      datascience: 'डेटा सायन्स',
      ai: 'AI आणि मशीन लर्निंग',
      design: 'डिझाइन',
      business: 'व्यवसाय',
      languages: 'भाषा',
      allCategories: 'सर्व श्रेण्या',
    },
    
    departments: {
      ai: 'AI आणि मशीन लर्निंग',
      civil: 'सिव्हिल इंजिनिअरिंग',
      mechanical: 'मेकॅनिकल इंजिनिअरिंग',
      computer: 'कॉम्प्युटर सायन्स',
      electrical: 'इलेक्ट्रिकल इंजिनिअरिंग',
      electronics: 'इलेक्ट्रॉनिक्स',
      bigdata: 'डेटा सायन्स',
      allDepartments: 'सर्व श्रेण्या',
    },
    
    search: {
      title: 'संसाधने शोधा',
      placeholder: 'कोर्स, विषय शोधा...',
      results: 'शोध परिणाम',
      noResults: 'कोणतेही परिणाम सापडले नाहीत',
      filters: 'फिल्टर पर्याय',
      department: 'श्रेणी',
      resourceType: 'संसाधन प्रकार',
      semester: 'स्तर',
      year: 'वर्ष',
      questionPapers: 'सराव परीक्षा',
      studyNotes: 'अभ्यास नोट्स',
      videos: 'व्हिडिओ',
      allTypes: 'सर्व प्रकार',
      skillLevel: 'कौशल्य स्तर',
      category: 'श्रेणी',
    },
    
    chatbot: {
      title: 'AI ट्यूटर',
      placeholder: 'मला काहीही विचारा...',
      askAnything: 'तुमच्या शिक्षण प्रवासाबद्दल काहीही विचारा',
      listening: 'ऐकत आहे...',
      speechRecognized: 'आवाज ओळखला गेला!',
      voiceInputError: 'आवाज इनपुट त्रुटी',
      selectModel: 'AI मॉडेल निवडा',
      hexa: 'हेक्सा',
      omnia: 'ओम्निया',
    },
    
    voice: {
      startListening: 'आवाज इनपुट सुरू करण्यासाठी क्लिक करा',
      stopListening: 'ऐकणे थांबवण्यासाठी क्लिक करा',
      listening: 'ऐकत आहे...',
      speechRecognized: 'आवाज ओळखला गेला!',
      notSupported: 'या ब्राउझरमध्ये आवाज इनपुट समर्थित नाही',
      permissionDenied: 'मायक्रोफोन परवानगी नाकारली. कृपया मायक्रोफोन प्रवेशाची परवानगी द्या.',
      networkError: 'नेटवर्क त्रुटी. कृपया तुमचे कनेक्शन तपासा.',
      noSpeechDetected: 'कोणताही आवाज आढळला नाही. कृपया पुन्हा प्रयत्न करा.',
    },
    
    footer: {
      description: 'AI-संचालित वैयक्तिक शिक्षण, अनुकूली अभ्यासक्रम आणि कौशल्य-आधारित प्रमाणपत्रांसह जगभरातील शिक्षार्थ्यांना सक्षम बनवणे.',
      quickLinks: 'त्वरित दुवे',
      support: 'समर्थन',
      searchResources: 'संसाधने शोधा',
      questionPapers: 'सराव परीक्षा',
      studyNotes: 'अभ्यास नोट्स',
      helpCenter: 'मदत केंद्र',
      contactUs: 'आमच्याशी संपर्क साधा',
      reportIssue: 'समस्या कळवा',
      feedback: 'फीडबॅक',
      copyright: '© 2025 LearnFlow. सर्व हक्क राखीव. | शिक्षार्थ्यांसाठी ❤️ सह बनवले',
    },
    
    auth: {
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      register: 'नोंदणी करा',
      email: 'ईमेल',
      password: 'पासवर्ड',
      firstName: 'पहिले नाव',
      lastName: 'आडनाव',
      forgotPassword: 'पासवर्ड विसरलात?',
      rememberMe: 'मला लक्षात ठेवा',
    },
    
    gamification: {
      xp: 'XP',
      level: 'स्तर',
      streak: 'दिवस स्ट्रीक',
      achievements: 'उपलब्धी',
      dailyChallenge: 'दैनिक आव्हान',
      leaderboard: 'लीडरबोर्ड',
      badges: 'बॅज',
      rank: 'रँक',
      progress: 'प्रगती',
    },
    
    learningPath: {
      title: 'लर्निंग पाथ',
      createNew: 'नवीन पाथ तयार करा',
      continue: 'शिकणे सुरू ठेवा',
      completed: 'पूर्ण',
      inProgress: 'प्रगतीत',
      estimatedTime: 'अंदाजित वेळ',
      modules: 'मॉड्यूल्स',
      skills: 'कौशल्ये',
    },
  },
};

// Helper function to get translations for current language
export function getTranslations(language: Language): Translations {
  if (language === 'auto') {
    // Auto-detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('hi')) {
      return translations.hi;
    } else if (browserLang.startsWith('mr')) {
      return translations.mr;
    } else {
      return translations.en;
    }
  }
  
  return translations[language] || translations.en;
}

// Hook for using translations in components
export function useTranslations() {
  // This will be implemented with the language context
  return translations.en; // Default fallback
}
