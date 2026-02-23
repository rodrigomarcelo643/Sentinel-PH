import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Menu, ChevronDown, MapPin } from "lucide-react";
import LoginDialog from "@/components/auth/LoginDialog";

const regions = [
  "NCR", "CAR", "Region I", "Region II", "Region III", "Region IV-A", 
  "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII",
  "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "BARMM"
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/" className="flex items-center gap-3 z-10">
              <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-15 w-30" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block absolute left-1/2 -translate-x-1/2"
          >
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/about">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      About Us
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/pricing">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/map">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Map
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Regions</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-4 gap-2 p-4 w-[600px]">
                      {regions.map((region) => (
                        <NavigationMenuLink key={region} asChild>
                          <Link
                            to={`/region/${region.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            {region}
                          </Link>
                        </NavigationMenuLink>
                      ))}
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
            className="hidden lg:flex items-center gap-3"
          >
            <Button 
              variant="ghost" 
              onClick={() => setLoginOpen(true)}
              className="border border-[#1B365D]/20 shadow-sm shadow-[#1B365D]/10"
            >
              Sign In
            </Button>
            <Button asChild className="shadow-lg shadow-[#1B365D]/30">
              <Link to="/register">Register</Link>
            </Button>
          </motion.div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="relative z-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-15 w-30" />
           </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  About Us 
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/map"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Map
                </Link>
                
                {/* Mobile Regions Collapsible */}
                <Collapsible open={regionsOpen} onOpenChange={setRegionsOpen} className="mt-2">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Regions
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${regionsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1 max-h-[300px] overflow-y-auto">
                      {regions.map((region) => (
                        <Link
                          key={region}
                          to={`/region/${region.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => setOpen(false)}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                        >
                          {region}
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Mobile Auth Buttons */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setLoginOpen(true);
                    }}
                    className="w-full border-[#1B365D]/20 shadow-sm shadow-[#1B365D]/10"
                  >
                    Sign In
                  </Button>
                  <Button 
                    asChild 
                    className="w-full shadow-lg shadow-[#1B365D]/30"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </nav>
  );
}
