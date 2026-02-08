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
  Search, Bell, Sparkles, ChevronRight, Bookmark, ArrowUpRight
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

  // Job Seeker Dashboard - RESPONSIVE PREMIUM REDESIGN (Obsidian Dark Mode)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030711] text-gray-900 dark:text-gray-200 selection:bg-blue-500/30 transition-colors duration-300">
        
        {/* Background Ambient Glow (Light Mode: Subtle, Dark Mode: Deep & Rich) */}
        <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-50 via-purple-50/50 to-transparent dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-transparent pointer-events-none z-0" />
        <div className="fixed top-0 right-0 h-[600px] w-1/2 bg-gradient-to-bl from-transparent via-blue-500/5 to-transparent dark:via-cyan-900/10 pointer-events-none z-0" />
        
        {/* Modern Header */}
        <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                     <Badge variant="outline" className="mb-4 border-blue-200 dark:border-indigo-500/30 text-blue-600 dark:text-indigo-300 py-1.5 px-3 bg-blue-50 dark:bg-indigo-500/10 backdrop-blur-md shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 mr-2 fill-current" /> Career Command Center
                     </Badge>
                     <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-400 pb-2">
                         Hello, {user?.name?.split(' ')[0] || "Seeker"}.
                     </h1>
                     <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mt-2 font-light">
                         Your daily briefing: <span className="text-gray-900 dark:text-white font-medium">2 new recommended jobs</span> and <span className="text-gray-900 dark:text-white font-medium">1 interview</span> coming up.
                     </p>
                </div>
                <div className="flex gap-3">
                     <Link href="/profile">
                        <Button variant="outline" className="h-12 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white backdrop-blur-sm transition-all shadow-sm">
                            Edit Profile
                        </Button>
                     </Link>
                     <Link href="/jobs">
                        <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-lg shadow-blue-500/20 dark:shadow-indigo-500/20 transition-all hover:scale-105 border border-blue-500/50 dark:border-indigo-500/50">
                            Find Work <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                     </Link>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                    { label: "Total Applications", value: "5", icon: FileText, color: "text-blue-600 dark:text-indigo-400", bg: "bg-white dark:bg-white/5 border-blue-100 dark:border-white/5" },
                    { label: "Interviews", value: "2", icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-white dark:bg-white/5 border-purple-100 dark:border-white/5" },
                    { label: "Saved Jobs", value: "12", icon: Bookmark, color: "text-pink-600 dark:text-pink-400", bg: "bg-white dark:bg-white/5 border-pink-100 dark:border-white/5" },
                    { label: "Profile Views", value: "28", icon: TrendingUp, color: "text-green-600 dark:text-emerald-400", bg: "bg-white dark:bg-white/5 border-green-100 dark:border-white/5" },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -2 }}
                        className={`p-6 rounded-2xl border shadow-sm backdrop-blur-xl ${stat.bg} relative overflow-hidden group transition-colors hover:border-blue-200 dark:hover:border-white/10`}
                    >
                         {/* Icon watermark */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-[0.03] group-hover:opacity-10 dark:group-hover:opacity-[0.06] transition-opacity">
                            <stat.icon className="h-20 w-20 text-gray-900 dark:text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} /> {stat.label}
                            </div>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Recommended Jobs Section */}
                    <div>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Recommended for you</h2>
                            <Link href="/jobs" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white flex items-center gap-1 transition-colors">
                                View all jobs <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        
                        <div className="grid gap-4">
                            {jobs.length > 0 ? jobs.map((job: any) => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                                    <div className="relative bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-white/10 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-5">
                                                <div className="h-14 w-14 rounded-xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                                    <Building2 className="h-7 w-7 text-gray-400 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors mb-1">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">{job.company_name}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary" className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 border-none transition-colors">
                                                            <MapPin className="h-3 w-3 mr-1" /> {job.location}
                                                        </Badge>
                                                        {job.salary && (
                                                            <Badge variant="secondary" className="bg-green-50 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-300 hover:bg-green-100 dark:hover:bg-emerald-500/20 border-green-200 dark:border-emerald-500/20 transition-colors">
                                                                {job.salary}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400">
                                                            {job.job_type.replace(/-/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-sm">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 mb-4">
                                        <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">No recommendations yet. Update your profile to get matches.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Application Activity</h2>
                        </div>
                        
                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl p-10 text-center relative overflow-hidden shadow-sm backdrop-blur-xl group">
                             <div className="hidden dark:block absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                             
                             {/* Subtle glow effect */}
                             <div className="dark:block hidden absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-1000"></div>

                             <div className="relative z-10 max-w-md mx-auto">
                                 <div className="h-20 w-20 bg-blue-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-100 dark:ring-white/10 shadow-sm">
                                     <Clock className="h-10 w-10 text-blue-600 dark:text-indigo-300" />
                                 </div>
                                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Your journey starts here</h3>
                                 <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                     You haven't applied to any jobs yet. Browse our curated list of opportunities to find your next role.
                                 </p>
                                 <Link href="/jobs">
                                    <Button className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold px-8 py-6 rounded-xl shadow-lg dark:shadow-white/10 transition-all hover:scale-105">
                                        Start Exploring
                                    </Button>
                                 </Link>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Profile Progress Card */}
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-sm backdrop-blur-xl">
                         
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-bold text-lg text-gray-900 dark:text-white">Profile Strength</h3>
                             <span className="text-green-600 dark:text-emerald-400 font-mono text-sm font-semibold">85%</span>
                         </div>
                         
                         <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full mb-6 overflow-hidden">
                             <div className="bg-green-500 dark:bg-emerald-500 h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                         </div>
                         
                         <div className="space-y-4">
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                 <div className="h-6 w-6 rounded-full bg-green-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                     <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-emerald-400" />
                                 </div>
                                 <span>Resume uploaded</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                 <div className="h-6 w-6 rounded-full bg-green-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                     <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-emerald-400" />
                                 </div>
                                 <span>Verified contact info</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                 <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-white/10">
                                     <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                                 </div>
                                 <span>Complete skill assessment</span>
                             </div>
                         </div>
                         
                         <Link href="/profile" className="block mt-6">
                             <Button variant="outline" className="w-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                 Complete Profile
                             </Button>
                         </Link>
                    </div>

                    {/* AI Guide Promo */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-purple-100 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-purple-600 dark:bg-indigo-500 rounded-xl shadow-lg shadow-purple-500/20">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">AI Career Guide</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed relative z-10">
                            Unsure about your next move? Get personalized career advice based on your skills and market trends.
                        </p>
                        <Link href="/ai/career-guide">
                            <Button className="w-full bg-white dark:bg-white/10 hover:bg-purple-50 dark:hover:bg-white/20 text-purple-700 dark:text-white border-purple-200 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-none transition-all">
                                Get AI Insights
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm backdrop-blur-xl">
                         <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-widest text-opacity-50">Quick Links</h3>
                         <div className="space-y-1">
                             <Link href="/applications" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                 <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm font-medium">My Applications</span>
                                 <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-transform group-hover:translate-x-1" />
                             </Link>
                             <Link href="/settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                 <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm font-medium">Account Settings</span>
                                 <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-transform group-hover:translate-x-1" />
                             </Link>
                             <Link href="/alerts" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                 <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm font-medium">Job Alerts</span>
                                 <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-transform group-hover:translate-x-1" />
                             </Link>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
}
