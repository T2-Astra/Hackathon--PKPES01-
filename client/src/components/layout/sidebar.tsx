import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Upload, 
  Video, 
  User, 
  Shield, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  LogIn,
  MessageSquare,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronUp,
  BookOpen,
  TrendingUp,
  X,
  ClipboardList,
  Menu,
  Package,
  Trophy,
  Zap,
  Target,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuthContext";
import { useSidebar } from "@/hooks/useSidebar";
import { useLanguageContext } from "@/hooks/useLanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import SettingsDialog from "@/pages/settings";
import { cn } from "@/lib/utils";

// Navigation item component with animation
const NavItem = ({ 
  path, 
  label, 
  icon: Icon, 
  active, 
  collapsed, 
  onClick,
  badge
}: { 
  path: string; 
  label: string; 
  icon: any; 
  active: boolean; 
  collapsed: boolean;
  onClick?: () => void;
  badge?: string;
}) => {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={path}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-center h-11",
                active && "bg-primary/10 text-primary"
              )}
              onClick={onClick}
            >
              <Icon className="h-5 w-5" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={path}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-start text-sm h-11 px-3 group",
          active && "bg-primary/10 text-primary font-medium"
        )}
        onClick={onClick}
      >
        <Icon className={cn(
          "h-5 w-5 mr-3 transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {badge}
          </Badge>
        )}
      </Button>
    </Link>
  );
};

// Section header
const SectionHeader = ({ title, collapsed }: { title: string; collapsed: boolean }) => {
  if (collapsed) return null;
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4">
      {title}
    </p>
  );
};

export default function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();
  const { t } = useLanguageContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getInitials = () => {
    if (!user) return "G";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  // Main navigation items
  const mainNavItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: TrendingUp, requireAuth: true },
  ];

  // Learning section
  const learningItems = [
    { path: "/learning-paths", label: "Learning Paths", icon: BookOpen, requireAuth: true },
    { path: "/ai-tools", label: "Summarizer", icon: Zap, badge: "New" },
    { path: "/mock-test", label: "Practice Quiz", icon: Target, requireAuth: true },
    { path: "/flashcards", label: "Flashcards", icon: ClipboardList, requireAuth: true },
  ];

  // Progress section
  const progressItems = [
    { path: "/achievements", label: "Achievements", icon: Trophy, requireAuth: true },
    { path: "/certificates", label: "Certificates", icon: Award, requireAuth: true },
  ];

  // Resources section
  const resourceItems = [
    { path: "/chatbot", label: "AI Tutor", icon: MessageSquare },
    { path: "/videos", label: "Videos", icon: Video, requireAuth: true },
    { path: "/upload", label: "Upload", icon: Upload, requireAuth: true },
  ];

  const renderNavSection = (items: any[], title?: string) => (
    <>
      {title && <SectionHeader title={title} collapsed={isCollapsed} />}
      {items.map((item) => {
        if (item.requireAuth && !user) return null;
        return (
          <NavItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            active={isActive(item.path)}
            collapsed={isCollapsed}
            onClick={() => setIsMobileMenuOpen(false)}
            badge={item.badge}
          />
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 72 : 256,
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -256 : 0)
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-card/95 backdrop-blur-xl border-r border-border z-50 flex flex-col shadow-xl"
      >
        {/* Header - GPT Style */}
        <div className={cn(
          "h-14 flex items-center px-3",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link 
              href="/" 
              aria-label="Home"
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted focus:outline-none transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </Link>
          )}
          
          <div className="flex">
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close sidebar"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted focus:outline-none text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Desktop Collapse/Expand Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggle}
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted focus:outline-none text-muted-foreground"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                    <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>



        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {renderNavSection(mainNavItems)}
          {renderNavSection(learningItems, "Learn")}
          {renderNavSection(progressItems, "Progress")}
          {renderNavSection(resourceItems, "Resources")}
          
          {/* Admin Section */}
          {user?.isAdmin && (
            <>
              <SectionHeader title="Admin" collapsed={isCollapsed} />
              <NavItem
                path="/admin/uploads"
                label="Admin Panel"
                icon={Shield}
                active={isActive("/admin")}
                collapsed={isCollapsed}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </>
          )}
        </nav>

        {/* Footer */}
        {!user && !loading && (
          <div className="border-t border-border p-3">
            <Link href="/auth">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className={cn(
                    "w-full gap-2 shadow-lg shadow-primary/25",
                    isCollapsed && "px-0"
                  )}
                >
                  <LogIn className="h-4 w-4" />
                  {!isCollapsed && "Sign In"}
                </Button>
              </motion.div>
            </Link>
          </div>
        )}

        {loading && (
          <div className="border-t border-border p-4">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse mx-auto" />
          </div>
        )}

        {/* User Profile */}
        {user && (
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <motion.div 
                whileHover={{ backgroundColor: "hsl(var(--muted))" }}
                className="border-t border-border p-3 cursor-pointer"
              >
                <div className={cn(
                  "flex items-center gap-3 p-2 rounded-xl transition-colors",
                  isCollapsed && "justify-center"
                )}>
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                </div>
              </motion.div>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setIsUserMenuOpen(false);
                  setIsSettingsOpen(true);
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {user?.isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Admin</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/uploads">
                      <Package className="mr-2 h-4 w-4" />
                      Review Uploads
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.aside>

      {/* Settings Dialog */}
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}
