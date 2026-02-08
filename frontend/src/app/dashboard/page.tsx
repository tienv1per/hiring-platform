"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  LayoutDashboard, Plus, Briefcase, FileText, Users, Building2, 
  TrendingUp, Clock, CheckCircle2, ArrowRight, Star
} from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Recruiter Dashboard
  if (userRole === "recruiter") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Recruiter Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Recruiter Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome back, Recruiter!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Here's what's happening with your job postings today.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/recruiter/jobs/new">
                  <Button className="gap-2 shadow-lg shadow-blue-500/20">
                    <Plus className="h-4 w-4" /> Post New Job
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Quick Stats Row */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Active Jobs", value: "12", icon: Briefcase, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
              { label: "Total Applications", value: "48", icon: FileText, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
              { label: "Interviews Scheduled", value: "5", icon: Users, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
              { label: "Company Views", value: "1.2k", icon: TrendingUp, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{stat.value}</h3>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Actions Grid */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              { 
                title: "Post a Job", 
                desc: "Create a new job opportunity to find expected candidates.", 
                icon: Plus, 
                href: "/recruiter/jobs/new",
                cta: "Create Job",
                variant: "default" as const
              },
              { 
                title: "My Companies", 
                desc: "Manage your company profile, branding, and details.", 
                icon: Building2, 
                href: "/recruiter/companies",
                cta: "Manage Profile",
                variant: "outline" as const
              },
              { 
                title: "Review Applications", 
                desc: "View and manage candidate applications for your active jobs.", 
                icon: FileText, 
                href: "/recruiter/applications",
                cta: "View Applications",
                variant: "outline" as const
              }
            ].map((action, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Link href={action.href} className="block h-full">
                  <Card className="h-full hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                      <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <action.icon className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">{action.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">{action.desc}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button variant={action.variant} className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        {action.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Jobs Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Job Postings</h2>
              <Link href="/recruiter/jobs" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold">
                          FS
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">Full Stack Engineer</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Posted 2 days ago</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 12 Applicants</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Job Seeker Dashboard (Simplified redesign)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-24 pt-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, Job Seeker!</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Ready to take the next step in your career? Browse thousands of opportunities or get AI-powered guidance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 pb-16">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Main Cards */}
          <motion.div variants={itemVariants}>
            <Link href="/jobs" className="block h-full">
              <Card className="h-full hover:shadow-xl transition-all border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <CardTitle>Find Jobs</CardTitle>
                  <CardDescription>Browse 10,000+ active job listings matched to your skills.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Search Jobs</Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/ai/career-guide" className="block h-full">
              <Card className="h-full hover:shadow-xl transition-all border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6" />
                  </div>
                  <CardTitle>AI Career Guide</CardTitle>
                  <CardDescription>Get personalized career path suggestions and skill gap analysis.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">Get Guidance</Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/profile" className="block h-full">
              <Card className="h-full hover:shadow-xl transition-all border-none shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <CardTitle>My Profile</CardTitle>
                  <CardDescription>Update your skills, resume, and preferences to get better matches.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full hover:bg-gray-50">Update Profile</Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        {/* Recent Applications Section Placeholder */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" /> Recent Applications
          </h2>
          <Card className="bg-white/50 backdrop-blur-sm border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium">No active applications</p>
              <p className="text-sm mt-1">Start applying to jobs to track them here!</p>
              <Button variant="link" className="mt-2 text-blue-600">Browse Jobs</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
