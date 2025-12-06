import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { useAuth } from "@/hooks/useAuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4" data-testid="header-logo">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-sans text-lg font-semibold">PolyLearnHub</h1>
                <p className="text-xs text-muted-foreground">Student Portal</p>
              </div>
            </div>
          </Link>

          {/* Navigation and Auth Section */}
          <div className="flex items-center space-x-6">
            {/* Desktop Navigation - moved to right side */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" data-testid="nav-home">
                <span className={`transition-colors font-medium ${
                  isActive("/") ? "text-foreground" : "text-muted-foreground hover:text-primary"
                }`}>
                  Home
                </span>
              </Link>
              <Link href="/search" data-testid="nav-search">
                <span className={`transition-colors ${
                  isActive("/search") ? "text-foreground" : "text-muted-foreground hover:text-primary"
                }`}>
                  Search
                </span>
              </Link>
            </nav>
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden p-2" 
              onClick={toggleMobileMenu}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} data-testid="mobile-nav-home">
                <span className={`block transition-colors font-medium ${
                  isActive("/") ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Home
                </span>
              </Link>
              <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} data-testid="mobile-nav-search">
                <span className={`block transition-colors ${
                  isActive("/search") ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Search
                </span>
              </Link>
              
              {user && (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="block transition-colors text-muted-foreground">
                      Profile
                    </span>
                  </Link>
                  <Link href="/history" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="block transition-colors text-muted-foreground">
                      Home
                    </span>
                  </Link>
                  <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="block transition-colors text-muted-foreground">
                      Upload Content
                    </span>
                  </Link>
                  {user.isAdmin && (
                    <>
                      <Link href="/admin/uploads" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="block transition-colors text-muted-foreground">
                          Admin Panel
                        </span>
                      </Link>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="self-start"
                  >
                    Logout
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
