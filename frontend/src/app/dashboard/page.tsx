"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { jobApi } from "@/lib/api"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  LayoutDashboard, Plus, Briefcase, FileText, Users, Building2, 
  TrendingUp, Clock, CheckCircle2, ArrowRight, Star, MapPin, 
  Search, Bell, Sparkles, ChevronRight, Bookmark
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userRole, isLoading, user } = useAuth();
  const [stats, setStats] = useState({ applied: 0, saved: 0, viewed: 0 }); // Placeholder stats
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Mock fetch for recommended jobs
  useEffect(() => {
      const fetchJobs = async () => {
          try {
              const res = await jobApi.get("/api/jobs?limit=3");
              setJobs(res.data.jobs || []);
          } catch (e) {
              console.error("Failed to load recommended jobs");
          }
      }
      if (userRole === "job_seeker") fetchJobs();
  }, [userRole]);

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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Recruiter Dashboard (Unchanged for now, focusing on Job Seeker per request)
  if (userRole === "recruiter") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
        </div>
      </div>
    );
  }

  // Job Seeker Dashboard - REDESIGNED
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
        {/* Modern Header with Mesh Gradient */}
        <div className="relative pt-12 pb-20 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 pointer-events-none blur-3xl" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                         <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                             Welcome back, {user?.name || "Job Seeker"}!
                         </h1>
                         <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                             You have <strong>2</strong> pending applications to review today.
                         </p>
                     </div>
                     <div className="flex gap-3">
                         <Link href="/jobs">
                            <Button className="h-12 px-6 shadow-lg shadow-blue-500/20 rounded-full bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105">
                                <Search className="w-4 h-4 mr-2" /> Find Jobs
                            </Button>
                         </Link>
                     </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                             <FileText className="h-5 w-5" />
                         </div>
                         <div>
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">5</div>
                             <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Applications</div>
                         </div>
                     </div>
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                             <Bookmark className="h-5 w-5" />
                         </div>
                         <div>
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                             <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Saved Jobs</div>
                         </div>
                     </div>
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                             <Bell className="h-5 w-5" />
                         </div>
                         <div>
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">2</div>
                             <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Interviews</div>
                         </div>
                     </div>
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                             <TrendingUp className="h-5 w-5" />
                         </div>
                         <div>
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">85%</div>
                             <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Profile Score</div>
                         </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Bento Grid Content */}
        <div className="container mx-auto px-4 py-8 -mt-8 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Recommended Jobs */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Recommended for You
                            </h2>
                            <Link href="/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                View All <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            {jobs.length > 0 ? jobs.map((job: any) => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                                    <Card className="hover:shadow-lg transition-all border-none shadow-sm hover:ring-1 hover:ring-blue-500/20 overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        <Building2 className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-gray-500 text-sm">{job.company_name}</p>
                                                        <div className="flex gap-3 mt-3 text-xs text-gray-500">
                                                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" /> {job.location}
                                                            </span>
                                                            {job.salary && (
                                                                <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-md font-medium">
                                                                    {job.salary}
                                                                </span>
                                                            )}
                                                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                                                {job.job_type.replace(/-/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                                                    <Bookmark className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )) : (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500">Loading recommendations...</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Recent Applications Preview */}
                     <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500" /> Recent Activity
                            </h2>
                            <Link href="/applications" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                View History <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        
                        <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
                            <CardContent className="p-0">
                                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                                    <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                         <Briefcase className="h-10 w-10 text-blue-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start your journey</h3>
                                    <p className="max-w-xs mx-auto mt-2 text-sm">Your application history will appear here once you start applying.</p>
                                    <Link href="/jobs">
                                        <Button className="mt-6" variant="outline">Browse Jobs</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    
                    {/* Profile Card */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                         <CardContent className="p-6 relative z-10">
                             <div className="flex items-center justify-between mb-6">
                                 <h3 className="font-bold text-lg">My Profile</h3>
                                 <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-0">85% Complete</Badge>
                             </div>
                             
                             <div className="space-y-4 mb-6">
                                 <div>
                                     <div className="flex justify-between text-sm mb-2 text-gray-300">
                                         <span>Resume</span>
                                         <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</span>
                                     </div>
                                     <Progress value={100} className="h-1.5 bg-gray-700" />
                                 </div>
                                 <div>
                                     <div className="flex justify-between text-sm mb-2 text-gray-300">
                                         <span>Skills</span>
                                         <span className="text-amber-400 flex items-center gap-1">Missing Info</span>
                                     </div>
                                     <Progress value={60} className="h-1.5 bg-gray-700" />
                                 </div>
                             </div>

                             <Link href="/profile">
                                 <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                                     Update Profile
                                 </Button>
                             </Link>
                         </CardContent>
                    </Card>

                    {/* AI Guide Promo */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="h-12 w-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-4">
                                <Star className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">AI Career Assistant</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                                Not sure where to apply? Let our AI analyze your profile and suggest the perfect roles for you.
                            </p>
                            <Link href="/ai/career-guide">
                                <Button variant="outline" className="w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                                    Try AI Guide
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    </div>
  );
}
