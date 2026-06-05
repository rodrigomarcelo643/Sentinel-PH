import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Menu, ChevronDown, MapPin, LogOut, LayoutDashboard, Home, Info, Map, UserPlus, LogIn, Download } from "lucide-react";

const regionGroups = [
  {
    label: "Luzon",
    color: "blue",
    accent: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-100 dark:border-blue-900/30",
    regions: [
      { name: "NCR", full: "National Capital Region" },
      { name: "CAR", full: "Cordillera Admin. Region" },
      { name: "Region I", full: "Ilocos Region" },
      { name: "Region II", full: "Cagayan Valley" },
      { name: "Region III", full: "Central Luzon" },
      { name: "Region IV-A", full: "CALABARZON" },
      { name: "Region IV-B", full: "MIMAROPA" },
      { name: "Region V", full: "Bicol Region" },
    ],
  },
  {
    label: "Visayas",
    color: "teal",
    accent: "bg-teal-500",
    textColor: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-100 dark:border-teal-900/30",
    regions: [
      { name: "Region VI", full: "Western Visayas" },
      { name: "Region VII", full: "Central Visayas" },
      { name: "Region VIII", full: "Eastern Visayas" },
    ],
  },
  {
    label: "Mindanao",
    color: "emerald",
    accent: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-100 dark:border-emerald-900/30",
    regions: [
      { name: "Region IX", full: "Zamboanga Peninsula" },
      { name: "Region X", full: "Northern Mindanao" },
      { name: "Region XI", full: "Davao Region" },
      { name: "Region XII", full: "SOCCSKSARGEN" },
      { name: "Region XIII", full: "Caraga Region" },
    ],
  },
  {
    label: "Special",
    color: "violet",
    accent: "bg-violet-500",
    textColor: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-100 dark:border-violet-900/30",
    regions: [
      { name: "BARMM", full: "Bangsamoro Autonomous Region" },
    ],
  },
];

// Flat list for mobile
const allRegions = regionGroups.flatMap(g => g.regions);

// Framer Motion Stagger Variants
const menuContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const menuItemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 15,
    },
  }
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the home page
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") {
      return "/admin/dashboard";
    }
    if (user?.role === "regional_admin") {
      return "/regional/dashboard";
    }
    if (user?.role === "municipal_admin") {
      return "/municipal/dashboard";
    }
    if (user?.role === "bhw") {
      return "/bhw/dashboard";
    }
    if (user?.role === "doh_region_vii") {
      return "/doh-r7/dashboard";
    }
    return "/dashboard";
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
  const getRoleLabel = () => {
    switch (user?.role) {
      case "admin": return "Admin";
      case "regional_admin": return "Regional Admin";
      case "municipal_admin": return "Municipal Admin";
      case "bhw": return "Barangay Health Worker";
      case "doh_region_vii": return "DOH Region VII";
      default: return "Member";
    }
  };
  const userRole = getRoleLabel();

  // Check if navbar should use transparent/white styling
  const useTransparentStyle = isHomePage && !scrolled;

  // Active state helpers
  const isActive = (path: string) => location.pathname === path;
  const isRegionsActive = location.pathname.startsWith("/region/");

  // Updated classes with tracking (letter-spacing) added
  const getNavLinkClass = (path: string) => {
    const active = isActive(path);
    return `relative px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-200 group rounded-[5px] ${
      active 
        ? useTransparentStyle
          ? "text-white font-bold" // Active link stays white on home page when transparent
          : "text-emerald-600 dark:text-emerald-400 font-bold"
        : useTransparentStyle
          ? "text-white/90 hover:text-black dark:hover:text-white transition-colors" // Hover turns BLACK on home page
          : "text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400"
    }`;
  };

  const getIndicatorClass = (path: string) => {
    const active = isActive(path);
    return `absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-transform duration-300 origin-center ${
      active ? "scale-x-100" : "scale-x-0"
    }`;
  };

  const getRegionsTriggerClass = () => {
    const active = isRegionsActive;
    return `relative group bg-transparent hover:bg-transparent font-semibold text-sm tracking-wide transition-colors px-4 py-2 rounded-[5px] ${
      active 
        ? useTransparentStyle
          ? "text-white font-bold"
          : "text-emerald-600 dark:text-emerald-400 font-bold"
        : useTransparentStyle
          ? "text-white/90 hover:text-black dark:hover:text-white data-[state=open]:text-white" // Hover turns BLACK on home page
          : "text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 data-[state=open]:text-emerald-600"
    }`;
  };

  const getRegionsIndicatorClass = () => {
    const active = isRegionsActive;
    return `absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-transform duration-300 origin-center ${
      active ? "scale-x-100" : "scale-x-0"
    }`;
  };

  // Mobile nav link classes with tracking added
  const getMobileNavLinkClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold tracking-wide rounded-[5px] transition-all duration-300 group border ${
      active 
        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-400/5 border-emerald-500/10 dark:border-emerald-400/10 shadow-sm shadow-emerald-500/5" 
        : "text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border-transparent hover:border-emerald-100/50 dark:hover:border-emerald-900/30"
    }`;
  };

  const getMobileIconContainerClass = (path: string) => {
    const active = isActive(path);
    return `p-1.5 rounded-[5px] transition-colors ${
      active 
        ? "bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-500 dark:text-emerald-400" 
        : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500"
    }`;
  };

  const getMobileRegionsTriggerClass = () => {
    const active = isRegionsActive;
    return `flex items-center justify-between w-full px-4 py-3.5 text-base font-semibold tracking-wide rounded-[5px] transition-all duration-300 group border ${
      active 
        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-400/5 border-emerald-500/10 dark:border-emerald-400/10 shadow-sm shadow-emerald-500/5" 
        : "text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border-transparent hover:border-emerald-100/50 dark:hover:border-emerald-900/30"
    }`;
  };

  const getMobileRegionsIconContainerClass = () => {
    const active = isRegionsActive;
    return `p-1.5 rounded-[5px] transition-colors ${
      active 
        ? "bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-500 dark:text-emerald-400" 
        : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500"
    }`;
  };
  
  // Download App handler
  const handleDownloadApp = () => {
    // Replace with your actual download link
    window.open("https://your-app-download-link.com", "_blank");
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled || !isHomePage
        ? "bg-white dark:bg-gray-900/80 py-3" 
        : "bg-transparent py-3"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="flex items-center gap-1.5 group">
              <div className="relative flex items-center justify-center">
                <img src="/logo_main.png" alt="HealthWatch" className="h-15 w-15 object-contain" />
              </div>
              {/* HealthWatch text - NOW ALWAYS GRADIENT (never white) */}
              <span className="font-bold text-xl tracking-tight transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-blue-300 dark:to-teal-300 group-hover:opacity-90 transition-opacity">
                HealthWatch
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block flex-1 max-w-md mx-auto"
          >
            <NavigationMenu className="mx-auto">
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <Link to="/" className="tracking-wide">
                    <NavigationMenuLink className={getNavLinkClass("/")}>
                      HOME
                      <span className={getIndicatorClass("/")} />
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/about" className="tracking-wide">
                    <NavigationMenuLink className={getNavLinkClass("/about")}>
                      ABOUT US
                      <span className={getIndicatorClass("/about")} />
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/map" className="tracking-wide">
                    <NavigationMenuLink className={getNavLinkClass("/map")}>
                      MAP
                      <span className={getIndicatorClass("/map")} />
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={getRegionsTriggerClass()}>
                    REGIONS
                    <span className={getRegionsIndicatorClass()} />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-5 w-[680px] bg-white dark:bg-gray-950 rounded-[5px] shadow-xl">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-[5px] bg-emerald-500/10">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Philippine Regions</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Browse health data by region</p>
                          </div>
                        </div>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/map"
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          >
                            <Map className="h-3.5 w-3.5" />
                            View full map
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      {/* Grouped Columns */}
                      <div className="grid grid-cols-4 gap-3">
                        {regionGroups.map((group) => (
                          <div key={group.label}>
                            <div className={`flex items-center gap-1.5 mb-2 pb-1.5 border-b ${group.borderColor}`}>
                              <span className={`w-2 h-2 rounded-full ${group.accent} flex-shrink-0`} />
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${group.textColor}`}>{group.label}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              {group.regions.map(({ name, full }) => (
                                <NavigationMenuLink key={name} asChild>
                                  <Link
                                    to={`/region/${name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="group/item flex flex-col select-none rounded-[5px] px-2.5 py-2 no-underline outline-none transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                  >
                                    <span className={`text-xs font-bold leading-none transition-colors group-hover/item:${group.textColor.split(' ')[0].replace('text-', 'text-')} text-gray-800 dark:text-gray-100`}>{name}</span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{full}</span>
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </motion.div>

          {/* Desktop Auth Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden lg:flex items-center gap-3 flex-shrink-0"
          >
            {/* Download App Button with Separator */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleDownloadApp}
                className={`h-10 px-5 rounded-[5px] transition-all duration-300 font-semibold text-sm tracking-wide ${
                  useTransparentStyle
                    ? "text-white hover:text-white dark:hover:text-white border border-white/30 hover:border-white/50 hover:bg-white/10"
                    : "border border-gray-200/60 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/20 dark:hover:border-emerald-400/20 shadow-sm"
                }`}
              >
                <Download className=" h-4 w-4" />
                Download App
              </Button>
              
              {/* Separator */}
              <div className={`h-6 w-px ${
                useTransparentStyle
                  ? "bg-white/30"
                  : "bg-gray-200 dark:bg-gray-700"
              }`} />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2.5 p-1.5 rounded-[5px] transition-all outline-none group cursor-pointer ${
                    useTransparentStyle
                      ? "hover:bg-white/10 border border-white/10 hover:border-white/20"
                      : "hover:bg-gray-100/80 dark:hover:bg-gray-800/80 border border-transparent hover:border-gray-200/20 dark:hover:border-gray-700/30"
                  }`}>
                    <div className="relative">
                      <Avatar size="default" className={`h-9 w-9 transition-all duration-300  ${
                        useTransparentStyle
                          ? "ring-2 ring-white/30 group-hover:ring-white/50"
                          : "ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40"
                      }`}>
                        <AvatarImage src={user?.profilePicture ?? undefined} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-[5px]">
                          {getInitials(user?.displayName, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                    </div>
                    <div className="hidden xl:flex flex-col items-start  text-left">
                      <span className={`text-sm font-semibold transition-colors leading-none mb-0.5 ${
                        useTransparentStyle
                          ? "text-white group-hover:text-white/90"
                          : "text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      }`}>
                        {displayName}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border leading-none ${
                        useTransparentStyle
                          ? "bg-white/20 backdrop-blur-sm text-white border-white/30"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/20"
                      }`}>
                        {userRole}
                      </span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 transition-colors ${
                      useTransparentStyle
                        ? "text-white/70 group-hover:text-white"
                        : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    }`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-[5px] border border-gray-100 dark:border-gray-800 bg-white/20 dark:bg-gray-950/95 backdrop-blur-xl shadow-2xl">
                  <DropdownMenuLabel className="p-3 mb-1">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-white dark:text-white">{displayName}</p>
                      <p className="text-xs text-white dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())} className="flex items-center gap-2 p-2.5 text-sm font-semibold rounded-[5px] text-white dark:text-gray-200 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 text-emerald-500" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 p-2.5 text-sm font-semibold rounded-[5px] text-red-600 hover:text-gray-500  dark:hover:bg-red-950/20 transition-all cursor-pointer mt-1">
                    <LogOut className="h-4 w-4 text-white hover:text-gray-500" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className={`h-10 px-5 rounded-[5px] transition-all duration-300 font-semibold text-sm tracking-wide ${
                    useTransparentStyle
                      ? "text-white hover:text-white dark:hover:text-white border border-white/30 hover:border-white/50 hover:bg-white/10"
                      : "border border-gray-200/60 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/20 dark:hover:border-emerald-400/20 shadow-sm"
                  }`}
                >
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="h-11 px-5 rounded-md font-medium text-sm bg-cyan-600 hover:bg-cyan-700 text-white transition-all duration-300"
                >
                  <Link to="/resident/register">Register</Link>
                </Button>
              </>
            )}
          </motion.div>

          {/* Mobile Hamburger Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative z-10 rounded-[5px] transition-all duration-300 ${
                  useTransparentStyle
                    ? "text-white hover:bg-white/10 border border-white/20 hover:border-white/40"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/80 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                }`}
              >
                <Menu className={`h-6 w-6 ${useTransparentStyle && "text-white"}`} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[340px] sm:w-[400px] overflow-y-auto bg-white/98 dark:bg-gray-950/98 backdrop-blur-xl border-l border-gray-200/40 dark:border-gray-800/40 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <SheetHeader className="text-left pb-4 border-b border-gray-100 dark:border-gray-800">
                  <SheetTitle>
                    <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                      <div className="relative p-1">
                        <img src="/logo_main.png" alt="HealthWatch" className="h-15 w-15 object-contain" />
                      </div>
                      <span className="font-bold text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                        HealthWatch
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                
                {user && (
                  <div className="my-5 p-4 rounded-[5px] bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10 dark:border-emerald-400/5 flex items-center gap-3 shadow-sm shadow-emerald-500/5">
                    <Avatar size="lg" className="h-11 w-11 border-2 border-emerald-500/20 shadow-sm">
                      <AvatarImage src={user?.profilePicture ?? undefined} alt={displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-[5px]">
                        {getInitials(user?.displayName, user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{user.email}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20">
                        {userRole}
                      </span>
                    </div>
                  </div>
                )}
                
                <motion.nav 
                  variants={menuContainerVariants}
                  initial="hidden"
                  animate={open ? "show" : "hidden"}
                  className="flex flex-col gap-1.5 mt-5"
                >
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/"
                      onClick={() => setOpen(false)}
                      className={getMobileNavLinkClass("/")}
                    >
                      <div className={getMobileIconContainerClass("/")}>
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="flex-1 tracking-wide">HOME</span>
                    </Link>
                  </motion.div>

                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/about"
                      onClick={() => setOpen(false)}
                      className={getMobileNavLinkClass("/about")}
                    >
                      <div className={getMobileIconContainerClass("/about")}>
                        <Info className="h-4 w-4" />
                      </div>
                      <span className="flex-1 tracking-wide">ABOUT US </span>
                    </Link>
                  </motion.div>

                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/map"
                      onClick={() => setOpen(false)}
                      className={getMobileNavLinkClass("/map")}
                    >
                      <div className={getMobileIconContainerClass("/map")}>
                        <Map className="h-4 w-4" />
                      </div>
                      <span className="flex-1 tracking-wide">MAP </span>
                    </Link>
                  </motion.div>
                  
                  <motion.div variants={menuItemVariants}>
                    <Collapsible open={regionsOpen} onOpenChange={setRegionsOpen}>
                      <CollapsibleTrigger className={getMobileRegionsTriggerClass()}>
                        <span className="flex items-center gap-3.5">
                          <div className={getMobileRegionsIconContainerClass()}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span className="tracking-wide">REGIONS</span>
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${regionsOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 pl-4">
                        <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/60 dark:border-gray-800/80 rounded-[5px] p-3 flex flex-col gap-1 max-h-64 overflow-y-auto">
                          {allRegions.map(({ name, full }) => (
                            <Link
                              key={name}
                              to={`/region/${name.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[5px] hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/40 hover:shadow-sm group/r"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 flex-shrink-0 group-hover/r:bg-emerald-500 transition-colors" />
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-bold text-gray-800 dark:text-gray-100 group-hover/r:text-emerald-600 dark:group-hover/r:text-emerald-400 transition-colors tracking-wide">{name}</span>
                                <span className="block text-[10px] text-gray-400 dark:text-gray-500 truncate">{full}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.div>

               {/* Mobile Download App Button */}
                  <motion.div variants={menuItemVariants} className="mt-2 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        handleDownloadApp();
                      }}
                      className="w-full h-11 border-gray-200/80 flex justify-center dark:border-gray-800 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:bg-emerald-400/5 dark:hover:text-emerald-400 text-gray-700 dark:text-gray-200 rounded-[5px] font-semibold tracking-wide shadow-sm transition-all justify-center"
                    >
                      <Download className="mr-2 h-4 w-4 text-emerald-500" />
                      Download App
                    </Button>
                  </motion.div>

                  <motion.div 
                    variants={menuItemVariants} 
                    className="mt-6 pt-6  border-t border-gray-100 dark:border-gray-800"
                  >
                    {user ? (
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setOpen(false);
                            navigate(getDashboardLink());
                          }}
                          className="w-full h-11 border-gray-200/80 dark:border-gray-800 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:bg-emerald-400/5 dark:hover:text-emerald-400 text-gray-700 dark:text-gray-200 rounded-[5px] font-semibold tracking-wide shadow-sm transition-all"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4 text-emerald-500" />
                          Go to Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setOpen(false);
                            handleLogout();
                          }}
                          className="w-full h-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-[5px] font-semibold tracking-wide transition-all"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full h-11 border-gray-200/80 dark:border-gray-800 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:bg-emerald-400/5 dark:hover:text-emerald-400 text-gray-700 dark:text-gray-200 rounded-[5px] font-semibold tracking-wide shadow-sm transition-all"
                        >
                          <Link
                            to="/signin"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center"
                          >
                            <LogIn className="mr-2 h-4 w-4 text-emerald-500" />
                            Sign In
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium transition-all duration-300"
                          onClick={() => setOpen(false)}
                        >
                          <Link to="/resident/register" className="flex items-center justify-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Register
                          </Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </motion.nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}