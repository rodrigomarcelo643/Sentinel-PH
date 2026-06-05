import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  MessageCircle,
  Users,
  FileText,
  MapPin,
  Activity,
  Clock,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// Types for notifications
interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export default function BhwNavbar() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dummy notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'New Sentinel Report',
      message: 'Sentinel Maria reported 5 new cases in Barangay San Antonio',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      link: '/bhw/reports'
    },
    {
      id: '2',
      type: 'success',
      title: 'Report Approved',
      message: 'Your weekly health report has been approved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
      link: '/bhw/reports'
    },
    {
      id: '3',
      type: 'info',
      title: 'Upcoming Training',
      message: 'BHW Training Session on July 25, 2024 at 9:00 AM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      read: true,
      link: '/bhw/settings'
    },
    {
      id: '4',
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Medical supplies are running low in your barangay',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      link: '/bhw/dashboard'
    },
    {
      id: '5',
      type: 'alert',
      title: 'Weather Advisory',
      message: 'Heavy rainfall expected. Take necessary precautions.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: true,
      link: '/bhw/map'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Debug log to check if component renders
  useEffect(() => {
    console.log("Navbar rendered, unreadCount:", unreadCount);
  }, [unreadCount]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    setNotificationsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'hover:bg-gray-50';
    switch (type) {
      case 'alert':
        return 'bg-red-50 hover:bg-red-100';
      case 'success':
        return 'bg-green-50 hover:bg-green-100';
      case 'warning':
        return 'bg-yellow-50 hover:bg-yellow-100';
      case 'info':
        return 'bg-blue-50 hover:bg-blue-100';
      default:
        return 'hover:bg-gray-50';
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link to="/bhw/dashboard" className="flex items-center gap-3 group">
            <img src="/logo_main.png" alt="HealthWatch" className="h-10 w-10" />
            <span className="hidden sm:inline-block text-xl font-bold text-gray-900">
              HealthWatch
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-1">
              <Link to="/bhw/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Activity className="inline-block mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <Link to="/bhw/sentinels" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Users className="inline-block mr-2 h-4 w-4" />
                Sentinels
              </Link>
              <Link to="/bhw/reports" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <FileText className="inline-block mr-2 h-4 w-4" />
                Reports
              </Link>
              <Link to="/bhw/map" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <MapPin className="inline-block mr-2 h-4 w-4" />
                Map
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5">

            {/* ── Notification Bell ── */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                  notificationsOpen
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Bell className="h-5 w-5" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Notification Panel */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+10px)] z-50 w-[22rem] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <div className="flex items-center gap-2.5">
                          <Bell className="h-4.5 w-4.5 text-white/80" />
                          <h3 className="text-sm font-semibold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] text-white/80 hover:text-white font-medium transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-[22rem] overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-14 text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                              <Bell className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">All caught up!</p>
                            <p className="text-xs text-gray-400 mt-0.5">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification, i) => {
                            const iconMap = {
                              alert: { icon: AlertCircle, bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500" },
                              success: { icon: CheckCircle2, bg: "bg-emerald-100", text: "text-emerald-600", bar: "bg-emerald-500" },
                              warning: { icon: AlertCircle, bg: "bg-amber-100", text: "text-amber-600", bar: "bg-amber-500" },
                              info: { icon: MessageCircle, bg: "bg-blue-100", text: "text-blue-600", bar: "bg-blue-500" },
                            };
                            const cfg = iconMap[notification.type];
                            const IconComp = cfg.icon;
                            return (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`relative flex gap-3.5 px-4 py-3.5 cursor-pointer transition-colors duration-150 ${
                                  notification.read
                                    ? "hover:bg-gray-50"
                                    : "bg-blue-50/40 hover:bg-blue-50/70"
                                }`}
                              >
                                {/* Left accent bar for unread */}
                                {!notification.read && (
                                  <span className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full ${cfg.bar}`} />
                                )}

                                {/* Icon bubble */}
                                <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                                  <IconComp className={`h-4 w-4 ${cfg.text}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm leading-snug font-semibold ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate("/bhw/dashboard");
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profile Dropdown ── */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl transition-all duration-200 ${
                  profileOpen ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
              >
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                  <AvatarImage src={user?.profilePicture} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                    {getInitials(user?.displayName, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight max-w-[110px] truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">Barangay Health Worker</p>
                </div>
                <ChevronDown
                  className={`hidden md:block h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Profile Panel */}
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      {/* User card */}
                      <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-slate-800 to-slate-900">
                        <Avatar className="h-11 w-11 ring-2 ring-white/20">
                          <AvatarImage src={user?.profilePicture} alt={displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                            {getInitials(user?.displayName, user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-semibold uppercase tracking-wider">
                            BHW
                          </span>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5 space-y-0.5">
                        <button
                          onClick={() => { setProfileOpen(false); navigate("/bhw/profile"); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                        >
                          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">My Profile</p>
                            <p className="text-[10px] text-gray-400">View & edit info</p>
                          </div>
                        </button>

                        <button
                          onClick={() => { setProfileOpen(false); navigate("/bhw/settings"); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                        >
                          <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                            <Settings className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Settings</p>
                            <p className="text-[10px] text-gray-400">Preferences & account</p>
                          </div>
                        </button>
                      </div>

                      <div className="border-t border-gray-100 p-1.5">
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <LogOut className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Sign Out</p>
                            <p className="text-[10px] text-red-400">End your session</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* ── Mobile Menu Sheet ── */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="relative ml-1">
                  <Menu className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72">
                <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
                  <SheetTitle className="text-base">Menu</SheetTitle>
                </SheetHeader>

                {/* User card in mobile sheet */}
                <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-slate-800 to-slate-900">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                      {getInitials(user?.displayName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Nav links */}
                <div className="p-3 space-y-0.5">
                  {[
                    { to: "/bhw/dashboard", icon: Activity, label: "Dashboard" },
                    { to: "/bhw/residents", icon: Users, label: "Residents" },
                    { to: "/bhw/reports", icon: FileText, label: "Reports" },
                    { to: "/bhw/map", icon: MapPin, label: "Map View" },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                    >
                      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-100 p-3 mt-auto">
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}