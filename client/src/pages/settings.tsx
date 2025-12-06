import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useLanguageContext } from '@/hooks/useLanguageContext';
import { 
  Settings,
  Bell,
  User,
  Shield,
  Database,
  Palette,
  Monitor,
  Sun,
  Moon,
  Laptop,
  Volume2,
  Globe,
  Eye,
  Download,
  Upload,
  Trash2,
  X
} from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguageContext();
  const [activeTab, setActiveTab] = useState('general');

  // Settings state
  const [accentColor, setAccentColor] = useState('default');
  const [notifications, setNotifications] = useState<{
    email: boolean;
    push: boolean;
    updates: boolean;
    reminders: boolean;
  }>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      email: false,
      push: false,
      updates: true,
      reminders: false
    };
  });
  const [storageData, setStorageData] = useState({
    downloadedMaterials: 0,
    cache: 0,
    userData: 0,
    total: 0
  });
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const getInitials = () => {
    if (!user) return "G";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Calculate real storage usage
  const calculateStorageUsage = async () => {
    try {
      setIsLoadingStorage(true);
      
      // Calculate localStorage usage
      let localStorageSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += localStorage[key].length + key.length;
        }
      }

      // Calculate sessionStorage usage
      let sessionStorageSize = 0;
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          sessionStorageSize += sessionStorage[key].length + key.length;
        }
      }

      // Estimate cache size (IndexedDB, Cache API if available)
      let cacheSize = 0;
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            cacheSize += requests.length * 1024; // Rough estimate
          }
        } catch (error) {
          console.log('Cache API not available or error:', error);
        }
      }

      // Convert bytes to more readable format
      const bytesToSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
      };

      const userData = localStorageSize + sessionStorageSize;
      const cache = cacheSize;
      const downloadedMaterials = 0; // This would need to be tracked separately
      const total = userData + cache + downloadedMaterials;

      setStorageData({
        downloadedMaterials: downloadedMaterials,
        cache: cache,
        userData: userData,
        total: total
      });
    } catch (error) {
      console.error('Error calculating storage:', error);
    } finally {
      setIsLoadingStorage(false);
    }
  };

  // Clear cache function
  const clearCache = async () => {
    try {
      setIsClearingCache(true);
      
      // Clear browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear sessionStorage
      sessionStorage.clear();

      // Recalculate storage after clearing
      await calculateStorageUsage();
      
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache. Please try again.');
    } finally {
      setIsClearingCache(false);
    }
  };

  // Export user data function
  const exportUserData = () => {
    try {
      const userData = {
        profile: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          isAdmin: user?.isAdmin,
          id: user?.id
        },
        settings: {
          theme,
          language,
          notifications,
          accentColor
        },
        localStorage: { ...localStorage },
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `polylearn-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Load storage data on component mount and tab change
  useEffect(() => {
    if (activeTab === 'data') {
      calculateStorageUsage();
    }
  }, [activeTab]);

  // Apply saved appearance settings on component mount
  useEffect(() => {
    // Apply saved font size
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      document.documentElement.style.fontSize = 
        savedFontSize === 'small' ? '14px' : 
        savedFontSize === 'large' ? '18px' : '16px';
    }

    // Apply saved animation preference
    const reduceAnimations = localStorage.getItem('reduceAnimations');
    if (reduceAnimations === 'true') {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }

    // Restore study reminders if enabled
    if (notifications.reminders) {
      const reminderInterval = setInterval(() => {
        if (notifications.push && Notification.permission === 'granted') {
          new Notification('Study Break Reminder', {
            body: 'Time for a 5-minute break! Rest your eyes and stretch.',
            icon: '/favicon.ico'
          });
        }
      }, 30 * 60 * 1000); // 30 minutes
      
      localStorage.setItem('studyReminderInterval', reminderInterval.toString());
    }
  }, [notifications.reminders, notifications.push]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 md:bg-black/50 md:flex md:items-center md:justify-center md:p-4"
      onClick={(e) => {
        // Close modal when clicking on the backdrop (only on desktop)
        if (e.target === e.currentTarget && window.innerWidth >= 768) {
          onClose();
        }
      }}
    >
      <div className="bg-background md:settings-modal-border md:rounded-lg w-full md:max-w-3xl h-full md:h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="hidden md:block p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold">{t.settings.title}</h2>
          </div>
          {/* Desktop close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hidden md:flex rounded-full hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row w-full h-full">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-muted/30 flex flex-col flex-shrink-0">
              <TabsList className="flex-row md:flex-col h-auto bg-transparent p-3 md:p-2 gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible">
                <TabsTrigger 
                  value="general" 
                  className="flex-shrink-0 w-auto md:w-full justify-center md:justify-start gap-2 md:gap-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs md:text-sm px-4 py-3 md:px-4 md:py-1.5"
                >
                  <Settings className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{t.settings.general}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex-shrink-0 w-auto md:w-full justify-center md:justify-start gap-2 md:gap-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs md:text-sm px-4 py-3 md:px-4 md:py-1.5"
                >
                  <Bell className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{t.settings.notifications}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="flex-shrink-0 w-auto md:w-full justify-center md:justify-start gap-2 md:gap-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs md:text-sm px-4 py-3 md:px-4 md:py-1.5"
                >
                  <Palette className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{t.settings.appearance}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="flex-shrink-0 w-auto md:w-full justify-center md:justify-start gap-2 md:gap-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs md:text-sm px-4 py-3 md:px-4 md:py-1.5"
                >
                  <Shield className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{t.settings.privacy}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="flex-shrink-0 w-auto md:w-full justify-center md:justify-start gap-2 md:gap-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs md:text-sm px-4 py-3 md:px-4 md:py-1.5"
                >
                  <Database className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{t.settings.data}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto min-w-0">
              {/* General Settings */}
              <TabsContent value="general" className="m-0 p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t.settings.general} Settings</h3>
                  
                  <div className="space-y-4 md:space-y-6">
                    {/* Theme */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <Label className="text-sm md:text-base">{t.settings.theme}</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">{t.settings.themeDescription}</p>
                      </div>
                      <Select value={theme} onValueChange={(value) => setTheme(value as 'system' | 'light' | 'dark')}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Laptop className="w-4 h-4" />
                              {t.settings.system}
                            </div>
                          </SelectItem>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              {t.settings.light}
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              {t.settings.dark}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Language */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <Label className="text-sm md:text-base">{t.settings.language}</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">{t.settings.languageDescription}</p>
                      </div>
                      <Select value={language} onValueChange={(value) => setLanguage(value as 'auto' | 'en' | 'hi' | 'mr')}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">{t.settings.autoDetect}</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                          <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Auto-save */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <Label className="text-sm md:text-base">{t.settings.autoSave}</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">{t.settings.autoSaveDescription}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Notifications */}
              <TabsContent value="notifications" className="m-0 p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Browser notifications</Label>
                        <p className="text-sm text-muted-foreground">Show desktop notifications for important updates</p>
                      </div>
                      <Switch 
                        checked={notifications.push}
                        onCheckedChange={async (checked) => {
                          if (checked) {
                            // Request notification permission
                            if ('Notification' in window) {
                              const permission = await Notification.requestPermission();
                              if (permission === 'granted') {
                                setNotifications(prev => ({ ...prev, push: true }));
                                localStorage.setItem('notifications', JSON.stringify({ ...notifications, push: true }));
                                // Show test notification
                                new Notification('PolyLearnHub', {
                                  body: 'Browser notifications enabled successfully!',
                                  icon: '/favicon.ico'
                                });
                              } else {
                                alert('Notification permission denied. Please enable in browser settings.');
                              }
                            } else {
                              alert('Browser notifications not supported.');
                            }
                          } else {
                            setNotifications(prev => ({ ...prev, push: false }));
                            localStorage.setItem('notifications', JSON.stringify({ ...notifications, push: false }));
                          }
                        }}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Sound notifications</Label>
                        <p className="text-sm text-muted-foreground">Play sound for new messages and updates</p>
                      </div>
                      <Switch 
                        checked={notifications.email}
                        onCheckedChange={(checked) => {
                          setNotifications(prev => ({ ...prev, email: checked }));
                          localStorage.setItem('notifications', JSON.stringify({ ...notifications, email: checked }));
                          if (checked) {
                            // Play test sound
                            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
                            audio.play().catch(() => {});
                          }
                        }}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Study reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded to take study breaks</p>
                      </div>
                      <Switch 
                        checked={notifications.reminders}
                        onCheckedChange={(checked) => {
                          setNotifications(prev => ({ ...prev, reminders: checked }));
                          localStorage.setItem('notifications', JSON.stringify({ ...notifications, reminders: checked }));
                          if (checked) {
                            // Set up study reminder (example: every 30 minutes)
                            const reminderInterval = setInterval(() => {
                              if (notifications.push && Notification.permission === 'granted') {
                                new Notification('Study Break Reminder', {
                                  body: 'Time for a 5-minute break! Rest your eyes and stretch.',
                                  icon: '/favicon.ico'
                                });
                              }
                            }, 30 * 60 * 1000); // 30 minutes
                            
                            // Store interval ID to clear later if needed
                            localStorage.setItem('studyReminderInterval', reminderInterval.toString());
                          } else {
                            // Clear existing reminder
                            const intervalId = localStorage.getItem('studyReminderInterval');
                            if (intervalId) {
                              clearInterval(parseInt(intervalId));
                              localStorage.removeItem('studyReminderInterval');
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Appearance */}
              <TabsContent value="appearance" className="m-0 p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Appearance & Display</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Font size</Label>
                        <p className="text-sm text-muted-foreground">Adjust text size for better readability</p>
                      </div>
                      <Select 
                        defaultValue={localStorage.getItem('fontSize') || 'medium'}
                        onValueChange={(value) => {
                          localStorage.setItem('fontSize', value);
                          document.documentElement.style.fontSize = 
                            value === 'small' ? '14px' : 
                            value === 'large' ? '18px' : '16px';
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Reduce animations</Label>
                        <p className="text-sm text-muted-foreground">Minimize motion for better performance</p>
                      </div>
                      <Switch 
                        defaultChecked={localStorage.getItem('reduceAnimations') === 'true'}
                        onCheckedChange={(checked) => {
                          localStorage.setItem('reduceAnimations', checked.toString());
                          if (checked) {
                            document.documentElement.style.setProperty('--animation-duration', '0.1s');
                          } else {
                            document.documentElement.style.removeProperty('--animation-duration');
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Privacy & Security */}
              <TabsContent value="privacy" className="m-0 p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Remember login</Label>
                        <p className="text-sm text-muted-foreground">Stay logged in across browser sessions</p>
                      </div>
                      <Switch 
                        defaultChecked={localStorage.getItem('rememberLogin') === 'true'}
                        onCheckedChange={(checked) => {
                          localStorage.setItem('rememberLogin', checked.toString());
                        }}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Usage analytics</Label>
                        <p className="text-sm text-muted-foreground">Help improve the platform with anonymous usage data</p>
                      </div>
                      <Switch 
                        defaultChecked={localStorage.getItem('allowAnalytics') !== 'false'}
                        onCheckedChange={(checked) => {
                          localStorage.setItem('allowAnalytics', checked.toString());
                        }}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Clear all data</Label>
                        <p className="text-sm text-muted-foreground">Reset all settings and clear stored data</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const confirmed = confirm('This will clear all your settings and data. Continue?');
                          if (confirmed) {
                            localStorage.clear();
                            sessionStorage.clear();
                            alert('All data cleared successfully!');
                            window.location.reload();
                          }
                        }}
                      >
                        Clear Data
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Data & Storage */}
              <TabsContent value="data" className="m-0 p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Data & Storage</h3>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Storage Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isLoadingStorage ? (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Calculating...</span>
                              <div className="w-16 h-4 bg-muted animate-pulse rounded"></div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Please wait...</span>
                              <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Downloaded materials</span>
                              <span>{storageData.downloadedMaterials > 0 ? 
                                `${(storageData.downloadedMaterials / 1024 / 1024).toFixed(1)} MB` : 
                                '0 B'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cache & temporary files</span>
                              <span>{storageData.cache > 0 ? 
                                `${(storageData.cache / 1024).toFixed(1)} KB` : 
                                '0 B'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>User data & settings</span>
                              <span>{storageData.userData > 0 ? 
                                `${(storageData.userData / 1024).toFixed(1)} KB` : 
                                '0 B'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>Total</span>
                              <span>{storageData.total > 0 ? 
                                `${(storageData.total / 1024).toFixed(1)} KB` : 
                                '0 B'}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={exportUserData}
                      >
                        <Download className="w-4 h-4" />
                        Export my data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={clearCache}
                        disabled={isClearingCache}
                      >
                        <Trash2 className="w-4 h-4" />
                        {isClearingCache ? 'Clearing cache...' : 'Clear cache'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={calculateStorageUsage}
                        disabled={isLoadingStorage}
                      >
                        <Database className="w-4 h-4" />
                        {isLoadingStorage ? 'Calculating...' : 'Refresh storage info'}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

