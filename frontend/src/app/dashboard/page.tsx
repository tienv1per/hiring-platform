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

  // Recruiter Dashboard - AI-POWERED DESIGN
  if (userRole === "recruiter") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Header Section */}
        <section className="relative z-10 pt-28 pb-6">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-1">
                  Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Here&apos;s your AI-powered recruitment overview
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/report">
                  <Button variant="outline" className="rounded-xl border-gray-200 dark:border-gray-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/recruiter/jobs/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="relative z-10 pb-8">
          <div className="container mx-auto px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                { label: "Active Jobs", value: "12", change: "+2", icon: Briefcase, color: "indigo" },
                { label: "Total Applications", value: "48", change: "+15", icon: FileText, color: "purple" },
                { label: "AI Matches", value: "36", change: "+8", icon: Sparkles, color: "cyan" },
                { label: "Interviews", value: "5", change: "+3", icon: Users, color: "emerald" },
              ].map((stat, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          stat.color === "indigo" ? "bg-indigo-100 dark:bg-indigo-500/20" :
                          stat.color === "purple" ? "bg-purple-100 dark:bg-purple-500/20" :
                          stat.color === "cyan" ? "bg-cyan-100 dark:bg-cyan-500/20" :
                          "bg-emerald-100 dark:bg-emerald-500/20"
                        }`}>
                          <stat.icon className={`w-5 h-5 ${
                            stat.color === "indigo" ? "text-indigo-600 dark:text-indigo-400" :
                            stat.color === "purple" ? "text-purple-600 dark:text-purple-400" :
                            stat.color === "cyan" ? "text-cyan-600 dark:text-cyan-400" :
                            "text-emerald-600 dark:text-emerald-400"
                          }`} />
                        </div>
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          {stat.change} this week
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="relative z-10 pb-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Quick Actions & AI Insights */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Insights Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 border-0 rounded-3xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
                    <CardContent className="p-8 relative z-10 text-white">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">AI Recruitment Insights</h3>
                          <p className="text-white/70 text-sm">Powered by HireAI</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <p className="text-white/70 text-sm mb-1">Top Skill in Demand</p>
                          <p className="font-bold text-lg">React.js</p>
                          <p className="text-xs text-white/50 mt-1">78% of applicants</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <p className="text-white/70 text-sm mb-1">Avg. Match Score</p>
                          <p className="font-bold text-lg">82.4%</p>
                          <p className="text-xs text-emerald-300 mt-1">↑ 5% from last month</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <p className="text-white/70 text-sm mb-1">Time to Hire</p>
                          <p className="font-bold text-lg">12.3 days</p>
                          <p className="text-xs text-emerald-300 mt-1">↓ 22% faster</p>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Link href="/report">
                          <Button className="bg-white text-indigo-600 hover:bg-white/90 rounded-xl">
                            View Full Report
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Quick Actions
                  </h2>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-3 gap-4"
                  >
                    {[
                      { 
                        title: "Post a Job", 
                        desc: "Create AI-optimized job posting", 
                        icon: Plus, 
                        href: "/recruiter/jobs/new",
                        gradient: "from-indigo-500 to-purple-500"
                      },
                      { 
                        title: "Review Applications", 
                        desc: "AI-ranked candidates waiting", 
                        icon: FileText, 
                        href: "/recruiter/applications",
                        gradient: "from-purple-500 to-pink-500"
                      },
                      { 
                        title: "Company Profile", 
                        desc: "Manage branding & details", 
                        icon: Building2, 
                        href: "/recruiter/companies",
                        gradient: "from-cyan-500 to-blue-500"
                      }
                    ].map((action, i) => (
                      <motion.div key={i} variants={itemVariants}>
                        <Link href={action.href} className="block h-full">
                          <Card className="h-full bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/10 transition-all group cursor-pointer overflow-hidden">
                            <CardContent className="p-5">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Right Column - Activity & AI Tips */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-4">
                        {[
                          { action: "New application", detail: "Senior React Developer", time: "2 min ago", type: "application" },
                          { action: "AI Match found", detail: "85% match for Full Stack role", time: "15 min ago", type: "match" },
                          { action: "Interview scheduled", detail: "Jane D. - Tomorrow 2PM", time: "1 hour ago", type: "interview" },
                          { action: "Job view spike", detail: "+45% views on ML Engineer", time: "3 hours ago", type: "view" },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              item.type === "application" ? "bg-indigo-100 dark:bg-indigo-500/20" :
                              item.type === "match" ? "bg-purple-100 dark:bg-purple-500/20" :
                              item.type === "interview" ? "bg-emerald-100 dark:bg-emerald-500/20" :
                              "bg-amber-100 dark:bg-amber-500/20"
                            }`}>
                              {item.type === "application" && <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                              {item.type === "match" && <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                              {item.type === "interview" && <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                              {item.type === "view" && <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.action}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.detail}</p>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                          </div>
                        ))}
                      </div>
                      <Link href="/recruiter/applications">
                        <Button variant="ghost" className="w-full mt-4 text-indigo-600 dark:text-indigo-400">
                          View All Activity
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* AI Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">AI Recommendation</h3>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">Based on your hiring patterns</p>
                        </div>
                      </div>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300/80 leading-relaxed">
                        Your &quot;Full Stack Developer&quot; job has received high-quality applications. 
                        Consider scheduling interviews this week to secure top candidates before competitors.
                      </p>
                      <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
                        Review Top Candidates
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
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
