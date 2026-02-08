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

  // Job Seeker Dashboard - PREMIUM REDESIGN
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
        
        {/* Background Ambient Glow */}
        <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-transparent pointer-events-none z-0" />
        
        {/* Modern Header */}
        <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                     <Badge variant="outline" className="mb-3 border-blue-500/50 text-blue-400 py-1 px-3 bg-blue-500/10 backdrop-blur-md">
                        <Sparkles className="h-3 w-3 mr-2 fill-blue-400" /> Career Command Center
                     </Badge>
                     <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 pb-2">
                         Hello, {user?.name?.split(' ')[0] || "Seeker"}.
                     </h1>
                     <p className="text-gray-400 text-lg max-w-xl">
                         Your daily briefing: <span className="text-white font-medium">2 new recommended jobs</span> and <span className="text-white font-medium">1 interview</span> coming up.
                     </p>
                </div>
                <div className="flex gap-3">
                     <Link href="/profile">
                        <Button variant="outline" className="h-12 border-gray-800 bg-gray-900/50 hover:bg-gray-800 text-gray-300 hover:text-white backdrop-blur-sm transition-all">
                            Edit Profile
                        </Button>
                     </Link>
                     <Link href="/jobs">
                        <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 border border-blue-500/50">
                            Find Work <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                     </Link>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                    { label: "Total Applications", value: "5", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "Interviews", value: "2", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                    { label: "Saved Jobs", value: "12", icon: Bookmark, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
                    { label: "Profile Views", value: "28", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -2 }}
                        className={`p-5 rounded-2xl border backdrop-blur-sm ${stat.bg} relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <stat.icon className="h-16 w-16" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} /> {stat.label}
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
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
                            <h2 className="text-2xl font-semibold text-white">Recommended for you</h2>
                            <Link href="/jobs" className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                View all jobs <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        
                        <div className="grid gap-4">
                            {jobs.length > 0 ? jobs.map((job: any) => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                                    <div className="relative bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-5">
                                                <div className="h-14 w-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                                    <Building2 className="h-7 w-7 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors mb-1">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm font-medium mb-3">{job.company_name}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-none">
                                                            <MapPin className="h-3 w-3 mr-1" /> {job.location}
                                                        </Badge>
                                                        {job.salary && (
                                                            <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">
                                                                {job.salary}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="border-gray-700 text-gray-400">
                                                            {job.job_type.replace(/-/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-700">
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-12 text-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/30">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 mb-4">
                                        <Search className="h-6 w-6 text-gray-500" />
                                    </div>
                                    <p className="text-gray-400">No recommendations yet. Update your profile to get matches.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-semibold text-white">Application Activity</h2>
                        </div>
                        
                        <div className="bg-gradient-to-b from-gray-900 to-gray-900/50 border border-gray-800 rounded-3xl p-8 text-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                             <div className="relative z-10 max-w-md mx-auto">
                                 <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                                     <Clock className="h-10 w-10 text-blue-400" />
                                 </div>
                                 <h3 className="text-xl font-bold text-white mb-2">Your journey starts here</h3>
                                 <p className="text-gray-400 mb-8">
                                     You haven't applied to any jobs yet. Browse our curated list of opportunities to find your next role.
                                 </p>
                                 <Link href="/jobs">
                                    <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-6 rounded-xl">
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
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                         
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-bold text-lg text-white">Profile Strength</h3>
                             <span className="text-green-400 font-mono text-sm">85%</span>
                         </div>
                         
                         <div className="w-full bg-gray-800 h-2 rounded-full mb-6 overflow-hidden">
                             <div className="bg-green-500 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                         </div>
                         
                         <div className="space-y-4">
                             <div className="flex items-center gap-3 text-sm text-gray-300">
                                 <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                     <CheckCircle2 className="h-3 w-3 text-green-400" />
                                 </div>
                                 <span>Resume uploaded</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm text-gray-300">
                                 <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                     <CheckCircle2 className="h-3 w-3 text-green-400" />
                                 </div>
                                 <span>Contact info verified</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm text-gray-400">
                                 <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700">
                                     <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                                 </div>
                                 <span>Add skill assessment</span>
                             </div>
                         </div>
                         
                         <Link href="/profile" className="block mt-6">
                             <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                                 Complete Profile
                             </Button>
                         </Link>
                    </div>

                    {/* AI Guide Promo */}
                    <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/20 rounded-3xl p-6 relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500 rounded-lg shadow-lg shadow-purple-500/30">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-bold text-white">AI Career Guide</h3>
                        </div>
                        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                            Unsure about your next move? Get personalized career advice based on your skills and market trends.
                        </p>
                        <Link href="/ai/career-guide">
                            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md">
                                Get AI Insights
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
                         <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-gray-500">Quick Links</h3>
                         <div className="space-y-2">
                             <Link href="/applications" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors group cursor-pointer">
                                 <span className="text-gray-300 group-hover:text-white transition-colors">My Applications</span>
                                 <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-300" />
                             </Link>
                             <Link href="/settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors group cursor-pointer">
                                 <span className="text-gray-300 group-hover:text-white transition-colors">Account Settings</span>
                                 <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-300" />
                             </Link>
                             <Link href="/alerts" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors group cursor-pointer">
                                 <span className="text-gray-300 group-hover:text-white transition-colors">Job Alerts</span>
                                 <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-300" />
                             </Link>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
}
