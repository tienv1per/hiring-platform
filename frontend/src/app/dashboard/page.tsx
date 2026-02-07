"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back{userRole === "jobseeker" ? ", Job Seeker" : ", Recruiter"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {userRole === "jobseeker"
              ? "Find your next opportunity and boost your career"
              : "Manage your job postings and review applications"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userRole === "jobseeker" ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Find Jobs</CardTitle>
                  <CardDescription>
                    Browse thousands of job opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/jobs">
                    <Button className="w-full">Search Jobs</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Career Guide</CardTitle>
                  <CardDescription>
                    Get personalized career path suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/ai/career-guide">
                    <Button className="w-full" variant="outline">
                      Get Guidance
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resume Analyzer</CardTitle>
                  <CardDescription>
                    Get AI-powered resume analysis and ATS score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/ai/resume-analyzer">
                    <Button className="w-full" variant="outline">
                      Analyze Resume
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Profile</CardTitle>
                  <CardDescription>
                    Update your skills and resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/profile">
                    <Button className="w-full" variant="outline">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Post a Job</CardTitle>
                  <CardDescription>
                    Create a new job posting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/recruiter/jobs/new">
                    <Button className="w-full">Post Job</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Companies</CardTitle>
                  <CardDescription>
                    Manage your company profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/recruiter/companies">
                    <Button className="w-full" variant="outline">
                      View Companies
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Applications</CardTitle>
                  <CardDescription>
                    Review candidate applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/recruiter/applications">
                    <Button className="w-full" variant="outline">
                      View Applications
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
