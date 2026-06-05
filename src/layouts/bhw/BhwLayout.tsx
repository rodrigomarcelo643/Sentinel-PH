import { Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPinned,
  LogOut,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Settings,
  Telescope,
  PanelLeftClose,
  PanelLeft,
  User,
  AlertTriangle,
  Megaphone,
  QrCode,
  Bell,
  Menu,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { NavLinkProps, SidebarContentProps } from '@/@types/layouts/common';

// Navigation categories
const NAV_CATEGORIES = [
  {
    title: "MAIN",
    items: [
      { to: "/bhw/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/bhw/residents", icon: Users, label: "Residents" },
      { to: "/bhw/map", icon: MapPinned, label: "Map View" },
    ]
  },
  {
    title: "MONITORING",
    items: [
      { to: "/bhw/observations", icon: Telescope, label: "Observations" },
      { to: "/bhw/reports", icon: ShieldAlert, label: "Health Reports" },
      { to: "/bhw/outbreak-response", icon: AlertTriangle, label: "Outbreak Response" },
    ]
  },
  {
    title: "COMMUNICATION",
    items: [
      { to: "/bhw/announcements", icon: Megaphone, label: "Announcements" },
      { to: "/bhw/qr-scanner", icon: QrCode, label: "QR Scanner" },
    ]
  }
];

export default function BhwLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Notification state
  interface NavNotification {
    id: string;
    type: 'alert' | 'success' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    link?: string;
  }
  const [notifications, setNotifications] = useState<NavNotification[]>([
    { id: '1', type: 'alert',   title: 'New Symptom Report', message: 'Resident Maria Santos reported 5 new cases in Brgy San Antonio', timestamp: new Date(Date.now() - 1000*60*5),  read: false, link: '/bhw/reports' },
    { id: '2', type: 'success', title: 'Report Approved',    message: 'Your weekly health report has been approved by the MHO',       timestamp: new Date(Date.now() - 1000*60*60), read: false, link: '/bhw/reports' },
    { id: '3', type: 'warning', title: 'Outbreak Threshold', message: '3-resident rule triggered in Brgy San Pedro — please verify',  timestamp: new Date(Date.now() - 1000*60*60*3), read: false, link: '/bhw/outbreak-response' },
    { id: '4', type: 'info',    title: 'Training Reminder',  message: 'BHW Training on July 25 at 9:00 AM — confirm attendance',     timestamp: new Date(Date.now() - 1000*60*60*6), read: true },
    { id: '5', type: 'alert',   title: 'Weather Advisory',   message: 'Heavy rainfall expected — advise residents to stay indoors',   timestamp: new Date(Date.now() - 1000*60*60*24), read: true, link: '/bhw/map' },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const handleNotifClick  = (n: NavNotification) => {
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    setNotifOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
    navigate("/signin");
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (fullName?: string | null) => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "BH";
  };

  const displayName = user?.displayName || user?.fullName || "BHW User";
  const userRole =
    user?.role === "bhw" ? "Barangay Health Worker" : user?.role || "User";
  const userAvatar = user?.profilePicture;

  const NavLink = ({
    to,
    icon: Icon,
    label,
    onClick,
    isDesktop = false,
  }: NavLinkProps) => {
    const active = isActive(to);
    const isReallyCollapsed = isDesktop && sidebarCollapsed && !isSidebarHovered;
    const content = (
      <Link
        to={to}
        className={`flex items-center ${isReallyCollapsed ? "justify-center" : "gap-2.5"} px-2.5 py-2  text-sm transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium shadow-sm border-l-2 border-blue-500"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        }`}
        onClick={onClick}
      >
        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-blue-600" : ""}`} />
        {!isReallyCollapsed && (
          <span className="text-sm font-medium leading-tight">{label}</span>
        )}
      </Link>
    );

    if (isReallyCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-sm">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  const SidebarContent = ({ isDesktop = false }: SidebarContentProps) => {
    const isReallyCollapsed = isDesktop && sidebarCollapsed && !isSidebarHovered;
    return (
      <>
      <div className="border-b px-3 py-3 flex items-center justify-center min-h-[56px]">
        <img
          src="/logo_main.png"
          alt="HealthWatch"
          className={`transition-all duration-300 rounded-[5px] ${isReallyCollapsed ? "h-8 w-auto object-contain" : "h-10 w-auto"}`}
        />
        {(!isReallyCollapsed) && (
          <span className="font-semibold text-base bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-300 ml-2">
            HealthWatch
          </span>
        )}
        </div>
        <div className="bg-white dark:bg-gray-800 px-2 py-2 flex-1 overflow-y-auto">
          <nav className="space-y-1.5">
            {NAV_CATEGORIES.map((category, idx) => (
              <div key={idx} className="space-y-0.5">
                {!isReallyCollapsed && (
                  <div className="px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {category.title}
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {category.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      onClick={() => setMobileOpen(false)}
                      isDesktop={isDesktop}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-800">
          {isReallyCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center px-2 py-1.5 rounded-[5px] w-full hover:bg-gray-50 transition-colors relative"
                >
                  <Avatar className="h-8 w-8 ">
                    <AvatarImage src={userAvatar} alt={displayName} />
                    <AvatarFallback className="text-sm dark:text-white bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[5px]">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{displayName}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="relative" ref={menuRef}>
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-[5px] shadow-lg border border-gray-100 dark:bg-gray-800 py-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
                  <button
                    onClick={() => {
                      navigate("/bhw/settings");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setLogoutDialogOpen(true);
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-[5px] w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Avatar className="h-8 w-8 ring-1 ring-gray-200 dark:ring-gray-600 ">
                  <AvatarImage src={userAvatar} alt={displayName}  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-[5px]">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{userRole}</p>
                </div>
                <div className="flex flex-col gap-0">
                  <ChevronUp
                    className={`h-3 w-3 transition-colors ${userMenuOpen ? "text-gray-900" : "text-gray-400"}`}
                  />
                  <ChevronDown
                    className={`h-3 w-3 transition-colors ${!userMenuOpen ? "text-gray-900" : "text-gray-400"}`}
                  />
                </div>
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block relative transition-all duration-300 shrink-0 ${sidebarCollapsed ? "w-[4.5rem]" : "w-60"}`}>
          <aside
            onMouseEnter={() => sidebarCollapsed && setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
            className={`flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg transition-all duration-300 absolute left-0 top-0 bottom-0 z-40 h-full ${
              sidebarCollapsed
                ? isSidebarHovered
                  ? "w-60 shadow-2xl"
                  : "w-[4.5rem]"
                : "w-60"
            }`}
          >
            <SidebarContent isDesktop={true} />
          </aside>
        </div>

        {/* Mobile Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent isDesktop={false} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b dark:border-gray-700 px-6 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 active:bg-gray-200 rounded-[5px] transition-all duration-200"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-white" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-[5px] transition-all duration-200"
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-4 w-4 text-gray-600 dark:text-white" />
                ) : (
                  <PanelLeftClose className="h-4 w-4 text-gray-600 dark:text-white" />
                )}
              </button>
              <div className="hidden md:block">
                <h1 className="text-md font-semibold text-gray-800 dark:text-white">
                  Barangay Health Worker Portal
                </h1>
              </div>
            </div>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-1">

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                  className={`relative p-2.5 rounded-full transition-all duration-200 ${
                    notifOpen ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-gray-800 px-1"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute right-0 top-[calc(100%+8px)] z-50 w-[22rem] bg-white dark:bg-gray-900 rounded-[5px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                      >
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-white/80" />
                            <span className="text-sm font-semibold text-white">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-[5px] bg-white/20 text-white text-[10px] font-bold">{unreadCount}</span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-[11px] text-white/80 hover:text-white font-medium transition-colors">
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="h-12 w-12 rounded-[5px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                <Bell className="h-5 w-5 text-gray-400" />
                              </div>
                              <p className="text-sm font-medium text-gray-500">All caught up!</p>
                            </div>
                          ) : notifications.map((n, i) => {
                            const cfg = {
                              alert:   { Icon: AlertCircle,  bg: 'bg-red-100 dark:bg-red-950',     text: 'text-red-600',     bar: 'bg-red-500' },
                              success: { Icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-600', bar: 'bg-emerald-500' },
                              warning: { Icon: AlertCircle,  bg: 'bg-amber-100 dark:bg-amber-950',  text: 'text-amber-600',  bar: 'bg-amber-500' },
                              info:    { Icon: MessageCircle,bg: 'bg-blue-100 dark:bg-blue-950',    text: 'text-blue-600',   bar: 'bg-blue-500' },
                            }[n.type];
                            return (
                              <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => handleNotifClick(n)}
                                className={`relative flex gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                  n.read ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                         : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                }`}
                              >
                                {!n.read && <span className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-[5px] ${cfg.bar}`} />}
                                <div className={`shrink-0 h-8 w-8 rounded-[5px] flex items-center justify-center ${cfg.bg}`}>
                                  <cfg.Icon className={`h-4 w-4 ${cfg.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className={`text-sm font-semibold leading-snug ${
                                      n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                                    }`}>{n.title}</p>
                                    {!n.read && <span className="mt-1 h-2 w-2 rounded-[5px] bg-blue-500 shrink-0" />}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                          <button
                            onClick={() => setNotifOpen(false)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-[5px] transition-colors"
                          >
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                  className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-[5px] transition-all duration-200 ${
                    profileOpen ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-600 ">
                    <AvatarImage src={userAvatar} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-[5px]">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight max-w-[120px] truncate">{displayName}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{userRole}</p>
                  </div>
                  <ChevronDown className={`hidden md:block h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 bg-white dark:bg-gray-900 rounded-[5px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                      >
                        {/* User card */}
                        <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-slate-800 to-slate-900">
                          <Avatar className="h-11 w-11 ring-2 ring-white/20 ">
                            <AvatarImage src={userAvatar} alt={displayName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-[5px]">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-[5px] bg-blue-500/20 text-blue-300 text-[9px] font-semibold uppercase tracking-wider">BHW</span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="p-1.5 space-y-0.5">
                          {[
                            { icon: User,     label: 'My Profile', sub: 'View & edit info',        path: '/bhw/profile',   bg: 'bg-blue-50 dark:bg-blue-950', ic: 'text-blue-600 dark:text-blue-400' },
                            { icon: Settings, label: 'Settings',   sub: 'Preferences & account',  path: '/bhw/settings',  bg: 'bg-gray-50 dark:bg-gray-800',  ic: 'text-gray-600 dark:text-gray-400' },
                          ].map(({ icon: Icon, label, sub, path, bg, ic }) => (
                            <button
                              key={path}
                              onClick={() => { setProfileOpen(false); navigate(path); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className={`h-8 w-8 rounded-[5px] flex items-center justify-center shrink-0 ${bg}`}>
                                <Icon className={`h-4 w-4 ${ic}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                                <p className="text-[10px] text-gray-400">{sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 p-1.5">
                          <button
                            onClick={() => { setProfileOpen(false); setLogoutDialogOpen(true); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-left hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-[5px] bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                              <LogOut className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-600">Sign Out</p>
                              <p className="text-[10px] text-red-400">End your session</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-3">
            <Outlet />
          </main>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <AlertDialogContent className="rounded-[5px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Are you sure you want to logout? You will need to sign in again
                to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-base">Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleLogout} className="text-base">
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}