"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, userRole } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const navLinkClass = (path: string) => `
    relative px-3 py-2 text-sm font-medium transition-colors
    ${pathname === path 
      ? "text-indigo-600 dark:text-indigo-400" 
      : "text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white"}
  `;

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="md" />
            
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                  Dashboard
                  {pathname === "/dashboard" && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
                
                {userRole === "jobseeker" && (
                  <>
                    <Link href="/jobs" className={navLinkClass("/jobs")}>
                      Find Jobs
                      {pathname === "/jobs" && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        />
                      )}
                    </Link>
                    <Link href="/profile" className={navLinkClass("/profile")}>
                      Profile
                      {pathname === "/profile" && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        />
                      )}
                    </Link>
                  </>
                )}
                
                <Link href="/companies" className={navLinkClass("/companies")}>
                  Companies
                  {pathname.startsWith("/companies") && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                    />
                  )}
                </Link>

                {userRole === "recruiter" && (
                  <>
                    <Link href="/recruiter/jobs" className={navLinkClass("/recruiter/jobs")}>
                      Jobs
                      {pathname.startsWith("/recruiter/jobs") && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        />
                      )}
                    </Link>
                    <Link href="/recruiter/applications" className={navLinkClass("/recruiter/applications")}>
                      Applications
                      {pathname.startsWith("/recruiter/applications") && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        />
                      )}
                    </Link>
                    <Link href="/report" className={navLinkClass("/report")}>
                      Report
                      {pathname === "/report" && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        />
                      )}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
