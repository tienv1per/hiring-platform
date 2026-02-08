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
  Search, Bell, Sparkles, ChevronRight, Bookmark, ArrowUpRight, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { AICommandCenter } from "./ai-components/AICommandCenter";
import { AIMatchBadge } from "./ai-components/AIMatchBadge";

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
      if (userRole === "jobseeker") fetchJobs();
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#030711]">
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

  // Job Seeker Dashboard - AI-FIRST DESIGN
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030711] text-gray-900 dark:text-gray-200 selection:bg-purple-500/30 transition-colors duration-300">
        
        {/* Ambient AI Glow (Purple/Blue theme) */}
        <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-purple-50/50 via-blue-50/30 to-transparent dark:from-purple-900/10 dark:via-blue-900/10 dark:to-transparent pointer-events-none z-0" />
        
        {/* AI Command Center (Hero) */}
        <AICommandCenter userName={user?.name?.split(' ')[0] || "Seeker"} />

        <div className="relative z-10 container mx-auto px-4 pb-20">
            
            {/* AI Curated Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column (8 cols) - Job Feed */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Recommended Jobs Section */}
                    <div>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    AI Curated Matches
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Based on your skills and search history</p>
                            </div>
                            <Link href="/jobs" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white flex items-center gap-1 transition-colors">
                                View all jobs <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        
                        <div className="grid gap-4">
                            {jobs.length > 0 ? jobs.map((job: any, index) => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                                    <div className="relative bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-purple-100 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-purple-500/5">
                                        
                                        {/* AI Match Badge - Mock Data for Demo */}
                                        <div className="absolute top-6 right-6 z-10">
                                            <AIMatchBadge 
                                                score={98 - (index * 5)} 
                                                reasons={["Skills match: React, TypeScript", "Preferred Location", "Salary in range"]} 
                                            />
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-5">
                                                <div className="h-14 w-14 rounded-xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                                    <Building2 className="h-7 w-7 text-gray-400 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-white transition-colors" />
                                                </div>
                                                <div className="pr-20"> {/* Padding for badge */}
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors mb-1">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">{job.company_name}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary" className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-none">
                                                            <MapPin className="h-3 w-3 mr-1" /> {job.location}
                                                        </Badge>
                                                        {job.salary && (
                                                            <Badge variant="secondary" className="bg-green-50 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-300 border-green-200 dark:border-emerald-500/20">
                                                                {job.salary}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-sm">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-white/5 mb-4 animate-pulse">
                                        <Sparkles className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-medium">AI is analyzing current job openings...</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Check back in a few moments or update your skills.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Daily Briefing */}
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                         {/* Abstract shapes */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                         <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                         <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                             <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-2 text-purple-200 font-medium text-sm uppercase tracking-wider">
                                     <Zap className="h-4 w-4" /> Daily Briefing
                                 </div>
                                 <h3 className="text-2xl font-bold mb-4">Your profile is trending!</h3>
                                 <ul className="space-y-3">
                                     <li className="flex items-start gap-3 text-purple-100">
                                         <div className="w-1.5 h-1.5 rounded-full bg-white mt-2"></div>
                                         <p className="text-sm leading-relaxed"><span className="font-bold text-white">Google</span> and <span className="font-bold text-white">2 others</span> viewed your profile today.</p>
                                     </li>
                                     <li className="flex items-start gap-3 text-purple-100">
                                         <div className="w-1.5 h-1.5 rounded-full bg-white mt-2"></div>
                                         <p className="text-sm leading-relaxed">Your resume score increased by <span className="font-bold text-green-300">+5 points</span> after your update.</p>
                                     </li>
                                 </ul>
                             </div>
                             <div className="shrink-0">
                                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full max-w-xs">
                                     <div className="flex items-center gap-4 mb-3">
                                         <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center font-bold text-white text-sm">
                                             AI
                                         </div>
                                         <div>
                                             <p className="text-xs text-purple-200">Career Coach</p>
                                             <p className="font-medium text-sm">Action Item</p>
                                         </div>
                                     </div>
                                     <p className="text-sm text-white/90 mb-3">
                                         "Adding 'System Design' to your skills could increase your match rate by 15% for Senior roles."
                                     </p>
                                     <Button size="sm" variant="secondary" className="w-full bg-white text-purple-900 hover:bg-purple-50">
                                         Add Skill
                                     </Button>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Compact Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-white/5 border border-purple-100 dark:border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Applied</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                        </div>
                        <div className="bg-white dark:bg-white/5 border border-purple-100 dark:border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Interviews</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                        </div>
                    </div>

                    {/* AI Resume Analyzer */}
                    <div className="bg-white dark:bg-white/5 border border-purple-100 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-sm backdrop-blur-xl group hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors">
                         <div className="flex items-center gap-3 mb-4">
                             <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                 <FileText className="h-5 w-5" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-900 dark:text-white">Resume Score</h3>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini AI</p>
                             </div>
                             <div className="ml-auto text-xl font-bold text-blue-600 dark:text-blue-400">85</div>
                         </div>
                         
                         <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full mb-6 overflow-hidden">
                             <div className="bg-blue-500 h-full w-[85%] rounded-full"></div>
                         </div>
                         
                        <Link href="/profile">
                            <Button variant="outline" className="w-full border-blue-200 dark:border-white/10 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 group-hover:border-blue-400 transition-all">
                                Optimization Tips
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Access */}
                    <div className="space-y-3">
                         <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest text-opacity-50 ml-1">Quick Access</h3>
                         <Link href="/jobs" className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-white/10">
                             <Bookmark className="h-5 w-5 text-pink-500" />
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Saved Jobs</span>
                         </Link>
                         <Link href="/alerts" className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-white/10">
                             <Bell className="h-5 w-5 text-amber-500" />
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Job Alerts</span>
                         </Link>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
}
