import { Outlet, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Users, MapPin, LogOut, ChevronDown, ChevronUp, ShieldAlert, Eye, Settings, Menu, PanelLeftClose, PanelLeft, User, AlertTriangle, Megaphone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BhwLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (fullName?: string | null) => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'BH';
  };

  const displayName = user?.displayName || 'BHW User';
  const userRole = user?.role === 'bhw' ? 'Barangay Health Worker' : user?.role || 'User';
  const userAvatar = user?.documents?.selfieUrl;

  const NavLink = ({ to, icon: Icon, label, onClick, isDesktop = false }: { to: string; icon: any; label: string; onClick?: () => void; isDesktop?: boolean }) => {
    const active = isActive(to);
    const content = (
      <Link
        to={to}
        className={`flex items-center ${isDesktop && sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-1.5 rounded-[2px] text-sm transition-colors border-l-4 ${
          active 
            ? "border-l-[#1B365D] bg-blue-200 text-[#1B365D] font-medium" 
            : "border-l-transparent hover:bg-gray-50 active:bg-gray-100"
        }`}
        onClick={onClick}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!(isDesktop && sidebarCollapsed) && <span className="text-sm">{label}</span>}
      </Link>
    );

    if (isDesktop && sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  const SidebarContent = ({ isDesktop = false }: { isDesktop?: boolean }) => (
    <>
      <div className="border-b bg-white p-2 flex items-center justify-center">
        <img 
          src="/sentinel_ph_logo.png" 
          alt="SentinelPH" 
          className={`transition-all duration-300 ${isDesktop && sidebarCollapsed ? 'h-10 w-auto object-contain' : 'h-30 w-auto'}`} 
        />
      </div>
      <div className="bg-white px-3 py-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          <NavLink to="/bhw/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/bhw/sentinels" icon={Users} label="Sentinels" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/bhw/observations" icon={Eye} label="Observations" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/bhw/reports" icon={ShieldAlert } label="Reports" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/bhw/map" icon={MapPin} label="Map" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/bhw/outbreak-response" icon={AlertTriangle} label="Outbreak Response" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/bhw/announcements" icon={Megaphone} label="Announcements" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          {/*<NavLink to="/bhw/settings" icon={Settings} label="Settings" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} /> */} 
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4 bg-white">
        {isDesktop && sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center justify-center px-3 py-1.5 rounded-lg w-full hover:bg-gray-50 transition-colors relative"
              >
                <Avatar size="sm">
                  <AvatarImage src={userAvatar} alt={displayName} />
                  <AvatarFallback className="text-xs">{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{displayName}</TooltipContent>
          </Tooltip>
        ) : (
          <div className="relative" ref={menuRef}>
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button
                  onClick={() => {
                    navigate('/bhw/settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <button
                  onClick={() => {
                    setLogoutDialogOpen(true);
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-destructive text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg w-full hover:bg-gray-50 transition-colors"
            >
              <Avatar size="sm">
                <AvatarImage src={userAvatar} alt={displayName} />
                <AvatarFallback className="text-xs">{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{userRole}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <ChevronUp className={`h-3 w-3 transition-colors ${userMenuOpen ? 'text-gray-900' : 'text-gray-400'}`} />
                <ChevronDown className={`h-3 w-3 transition-colors ${!userMenuOpen ? 'text-gray-900' : 'text-gray-400'}`} />
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col bg-white border-r transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
          <SidebarContent isDesktop={true} />
        </aside>

        {/* Mobile Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent isDesktop={false} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b px-4 bg-white">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1.5 hover:bg-gray-100 active:bg-gray-200 active:scale-95 rounded-lg transition-all duration-150"
              >
                <PanelLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-1.5 hover:bg-gray-100 active:bg-gray-200 active:scale-95 rounded-lg transition-all duration-150"
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-5 w-5 text-gray-600" />
                ) : (
                  <PanelLeftClose className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors outline-none">
                <Avatar size="default">
                  <AvatarImage src={userAvatar} alt={displayName} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">{displayName}</span>
                  <span className="text-xs text-gray-500">{userRole}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/bhw/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/bhw/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setLogoutDialogOpen(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You will need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleLogout}>
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
