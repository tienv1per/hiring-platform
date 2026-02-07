"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, userRole } = useAuth();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-500">
              JobPortal
            </Link>
            {isAuthenticated && (
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/dashboard"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Dashboard
                </Link>
                {userRole === "jobseeker" && (
                  <>
                    <Link
                      href="/jobs"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === "/jobs"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Find Jobs
                    </Link>
                    <Link
                      href="/profile"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === "/profile"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Profile
                    </Link>
                  </>
                )}
                {userRole === "recruiter" && (
                  <>
                    <Link
                      href="/recruiter/companies"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname.startsWith("/recruiter/companies")
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Companies
                    </Link>
                    <Link
                      href="/recruiter/jobs"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname.startsWith("/recruiter/jobs")
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Jobs
                    </Link>
                    <Link
                      href="/recruiter/applications"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname.startsWith("/recruiter/applications")
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Applications
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
