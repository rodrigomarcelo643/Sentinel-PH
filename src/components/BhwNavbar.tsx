import { Link } from "react-router-dom";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings } from "lucide-react";

export default function BhwNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link to="/bhw/dashboard" className="flex items-center gap-3">
            <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-15 w-30" />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/bhw/residents">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Residents
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/bhw/dashboard">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/bhw/reports">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Reports
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/bhw/map">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Map
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Profile Dropdown - Right */}
          <div className="hidden lg:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px]">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-15 w-30" />
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-1">
                <Link
                  to="/bhw/residents"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Residents
                </Link>
                <Link
                  to="/bhw/dashboard"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/bhw/reports"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Reports
                </Link>
                <Link
                  to="/bhw/map"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Map
                </Link>

                {/* Mobile Profile Section */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <Link
                    to="/bhw/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/bhw/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
