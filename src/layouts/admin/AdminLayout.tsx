import { Outlet, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Users, MapPin, LogOut, ChevronDown, Building2, MapPinned, UserCog, Shield, Bell, AlertTriangle, Settings, Menu, PanelLeftClose, PanelLeft, User, Globe, CreditCard } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [usersOpen, setUsersOpen] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const regions = [
    "NCR", "CAR", "Region I", "Region II", "Region III", "Region IV-A", 
    "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII",
    "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "BARMM"
  ];

  const handleLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin User';
  const userRole = user?.role || 'System Administrator';

  const NavLink = ({ to, icon: Icon, label, onClick, isDesktop = false }: { to: string; icon: any; label: string; onClick?: () => void; isDesktop?: boolean }) => {
    const active = isActive(to);
    const content = (
      <Link
        to={to}
        className={`flex items-center ${isDesktop && sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-1.5 rounded-lg text-sm transition-colors ${
          active 
            ? "bg-[#1B365D] text-white hover:bg-[#1B365D]/90" 
            : "hover:bg-gray-100 active:bg-gray-200"
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
          className={`transition-all duration-300 ${isDesktop && sidebarCollapsed ? 'h-10 w--auto object-contain' : 'h-30 w-auto'}`} 
        />
      </div>
      <div className="bg-white px-3 py-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          <NavLink to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />

          {isDesktop && sidebarCollapsed ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-center px-3 py-1.5 rounded-lg w-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <Users className="h-4 w-4 flex-shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" className="w-48 p-2">
                <div className="space-y-1">
                  <Link
                    to="/admin/regions"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive("/admin/regions") ? "bg-[#1B365D] text-white hover:bg-[#1B365D]/90" : "hover:bg-gray-100 active:bg-gray-200"}`}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Regions</span>
                  </Link>
                  <Link
                    to="/admin/municipalities"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive("/admin/municipalities") ? "bg-[#1B365D] text-white hover:bg-[#1B365D]/90" : "hover:bg-gray-100 active:bg-gray-200"}`}
                  >
                    <MapPinned className="h-4 w-4" />
                    <span>Municipalities</span>
                  </Link>
                  <Link
                    to="/admin/bhws"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive("/admin/bhws") ? "bg-[#1B365D] text-white hover:bg-[#1B365D]/90" : "hover:bg-gray-100 active:bg-gray-200"}`}
                  >
                    <UserCog className="h-4 w-4" />
                    <span>BHWs</span>
                  </Link>
                  <Link
                    to="/admin/sentinels"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive("/admin/sentinels") ? "bg-[#1B365D] text-white hover:bg-[#1B365D]/90" : "hover:bg-gray-100 active:bg-gray-200"}`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Sentinels</span>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Collapsible open={usersOpen} onOpenChange={setUsersOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Users</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${usersOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-3 mt-1 space-y-1">
                <NavLink to="/admin/regions" icon={Globe} label="Regions" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
                <NavLink to="/admin/municipalities" icon={MapPinned} label="Municipalities" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
                <NavLink to="/admin/bhws" icon={UserCog} label="BHWs" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
                <NavLink to="/admin/sentinels" icon={Shield} label="Sentinels" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
              </CollapsibleContent>
            </Collapsible>
          )}

          <NavLink to="/admin/observations" icon={Bell} label="Observations" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/admin/alerts" icon={AlertTriangle} label="Alerts" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/admin/subscriptions" icon={CreditCard} label="Subscriptions" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/admin/map" icon={MapPin} label="Map" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
          <NavLink to="/admin/settings" icon={Settings} label="Settings" onClick={() => setMobileOpen(false)} isDesktop={isDesktop} />
        </nav>
      </div>
      <div className="border-t p-4 bg-white">
        {isDesktop && sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setLogoutDialogOpen(true)}
                className="flex items-center justify-center px-3 py-1.5 rounded-lg w-full hover:bg-red-50 active:bg-red-100 text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-full hover:bg-red-50 active:bg-red-100 text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
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
              <DropdownMenuTrigger className="flex items-center gap-3 p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors outline-none">
                <Avatar size="default">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt={displayName} />
                  <AvatarFallback>{getInitials(user?.displayName, user?.email)}</AvatarFallback>
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
                <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
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
