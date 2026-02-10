"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus, Briefcase, DollarSign, Calendar,
  MoreVertical, Edit, Trash2, Eye, Users, Sparkles, Zap, Brain, Search, LayoutGrid, List as ListIcon,
  ArrowUpRight, Bot, Rocket
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  work_location: string;
  salary: string;
  created_at: string;
  status?: string;
  applications_count?: number;
}

export default function RecruiterJobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "closed">("all");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "recruiter") {
      toast.error("Access denied");
      router.push("/");
      return;
    }
    fetchJobs();
  }, [session, router]);

  const fetchJobs = async () => {
    try {
      const response = await jobApi.get("/api/jobs", {
        params: { recruiter_id: session?.user?.id },
      });
      setJobs(response.data.jobs || []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await jobApi.delete(`/api/jobs/${id}`);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete job");
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || (job.status || "active") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = jobs.filter((j) => (j.status || "active") === "active").length;
    const totalApps = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
    return {
      total: jobs.length,
      active,
      totalApps,
      avgApps: jobs.length > 0 ? Math.round(totalApps / jobs.length) : 0,
    };
  }, [jobs]);

  const getDaysAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "inactive":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      case "closed":
        return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const getWorkLocationIcon = (wl: string) => {
    switch (wl) {
      case "remote": return "🌍";
      case "hybrid": return "🏢";
      default: return "📍";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-400">Loading your job postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-indigo-400/8 dark:bg-indigo-600/6 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-400/6 dark:bg-purple-600/4 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    AI-Powered Recruiting
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Job Postings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  Manage listings, track AI-matched candidates, and optimize your hiring pipeline.
                </p>
              </div>
              <Link href="/recruiter/jobs/create">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0 gap-2 h-11 px-6">
                  <Plus className="h-4 w-4" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* AI Insights row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          >
            {[
              {
                label: "Total Jobs",
                value: stats.total,
                icon: Briefcase,
                color: "from-blue-500 to-indigo-600",
                bgColor: "bg-blue-50 dark:bg-blue-500/10",
              },
              {
                label: "Active Listings",
                value: stats.active,
                icon: Rocket,
                color: "from-emerald-500 to-teal-600",
                bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
              },
              {
                label: "Total Applicants",
                value: stats.totalApps,
                icon: Users,
                color: "from-violet-500 to-purple-600",
                bgColor: "bg-violet-50 dark:bg-violet-500/10",
              },
              {
                label: "AI Match Score",
                value: "—",
                icon: Brain,
                color: "from-amber-500 to-orange-600",
                bgColor: "bg-amber-50 dark:bg-amber-500/10",
                badge: "Coming Soon",
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 group hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {stat.badge && (
                      <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-4 h-4`} style={{ color: i === 0 ? "#6366f1" : i === 1 ? "#10b981" : i === 2 ? "#8b5cf6" : "#f59e0b" }} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* AI tip banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-indigo-200/30 dark:border-indigo-500/10"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Hiring Assistant</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Our AI engine analyzes candidate profiles using semantic matching to find the best-fit applicants. Candidates are ranked by skill overlap, experience relevance, and cultural alignment with your job descriptions.
                </p>
              </div>
              <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-0 text-[10px] flex-shrink-0">
                <Sparkles className="w-3 h-3 mr-1" />
                AI
              </Badge>
            </div>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company or location..."
                className="pl-10 bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 rounded-xl h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["all", "active", "inactive", "closed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl transition-all capitalize ${
                    statusFilter === s
                      ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {s}
                </button>
              ))}
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Job listings */}
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white/80 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/15 dark:to-purple-500/15 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="font-bold text-xl mb-2">
                {searchQuery || statusFilter !== "all" ? "No matching jobs" : "No job postings yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Create your first AI-powered job listing to start attracting top candidates matched by our AI engine."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link href="/recruiter/jobs/create">
                  <Button className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl border-0 gap-2">
                    <Plus className="w-4 h-4" /> Create First Job
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : viewMode === "list" ? (
            /* LIST VIEW */
            <div
              key={`list-${statusFilter}-${searchQuery}`}
              className="space-y-3"
            >
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm hover:shadow-lg hover:border-indigo-300/50 dark:hover:border-indigo-500/30 transition-all group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Gradient accent line */}
                        <div className={`w-1 flex-shrink-0 rounded-l-2xl ${
                          (job.status || "active") === "active"
                            ? "bg-gradient-to-b from-emerald-400 to-teal-500"
                            : (job.status || "active") === "closed"
                              ? "bg-gradient-to-b from-red-400 to-red-500"
                              : "bg-gradient-to-b from-amber-400 to-orange-500"
                        }`} />

                        <div className="flex-1 p-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Left: Job info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1.5">
                                <Link href={`/jobs/${job.id}`} className="group/title">
                                  <h3 className="text-lg font-bold truncate group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors flex items-center gap-1.5">
                                    {job.title}
                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/title:opacity-100 transition-opacity text-indigo-500" />
                                  </h3>
                                </Link>
                                <Badge className={`text-[10px] font-semibold uppercase tracking-wide border-0 ${getStatusColor(job.status || "active")}`}>
                                  {job.status || "active"}
                                </Badge>
                              </div>

                              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2.5">
                                {job.company_name}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50">
                                  <Briefcase className="w-3 h-3" />
                                  <span className="capitalize">{job.job_type.replace("-", " ")}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50">
                                  {getWorkLocationIcon(job.work_location)}
                                  <span className="capitalize">{job.work_location}</span>
                                </span>
                                {job.salary && (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50">
                                    <DollarSign className="w-3 h-3" />
                                    {job.salary}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 text-gray-400">
                                  <Calendar className="w-3 h-3" />
                                  {getDaysAgo(job.created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Right: Stats & Actions */}
                            <div className="flex items-center gap-4 md:border-l md:border-gray-100 md:dark:border-gray-700/50 md:pl-5">
                              {/* Applicants stat */}
                              <Link
                                href={`/recruiter/jobs/${job.id}/applications`}
                                className="flex flex-col items-center min-w-[72px] px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                              >
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                  {job.applications_count || 0}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                                  Applicants
                                </span>
                              </Link>

                              {/* AI match placeholder */}
                              <div className="flex flex-col items-center min-w-[72px] px-3 py-2 rounded-xl">
                                <div className="flex items-center gap-1">
                                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">—</span>
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                                  AI Score
                                </span>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1.5">
                                <Link href={`/recruiter/jobs/${job.id}/applications`}>
                                  <Button
                                    size="sm"
                                    className="hidden sm:flex bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl border-0 gap-1.5 text-xs font-medium"
                                  >
                                    <Users className="h-3.5 w-3.5" /> View
                                  </Button>
                                </Link>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/jobs/${job.id}`} className="flex items-center cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4" /> View Public Page
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/recruiter/jobs/${job.id}/edit`} className="flex items-center cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" /> Edit Job
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/recruiter/jobs/${job.id}/applications`} className="flex items-center sm:hidden cursor-pointer">
                                        <Users className="mr-2 h-4 w-4" /> View Applications
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600 cursor-pointer"
                                      onClick={() => handleDelete(job.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* GRID VIEW */
            <div
              key={`grid-${statusFilter}-${searchQuery}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm hover:shadow-lg hover:border-indigo-300/50 dark:hover:border-indigo-500/30 transition-all group overflow-hidden h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Top: Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 mr-2">
                          <Link href={`/jobs/${job.id}`} className="group/title">
                            <h3 className="text-base font-bold truncate group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                              {job.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{job.company_name}</p>
                        </div>
                        <Badge className={`text-[10px] font-semibold uppercase tracking-wide border-0 flex-shrink-0 ${getStatusColor(job.status || "active")}`}>
                          {job.status || "active"}
                        </Badge>
                      </div>

                      {/* Meta tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400 capitalize">
                          <Briefcase className="w-3 h-3" />
                          {job.job_type.replace("-", " ")}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
                          {getWorkLocationIcon(job.work_location)} {job.work_location}
                        </span>
                        {job.salary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-3 h-3" /> {job.salary}
                          </span>
                        )}
                      </div>

                      {/* Bottom: Stats & actions */}
                      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{job.applications_count || 0}</span>
                            applicants
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {getDaysAgo(job.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link href={`/recruiter/jobs/${job.id}/applications`}>
                            <Button size="sm" className="h-7 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg border-0 text-[11px]">
                              View
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl">
                              <DropdownMenuItem asChild>
                                <Link href={`/jobs/${job.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/recruiter/jobs/${job.id}/edit`} className="flex items-center cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => handleDelete(job.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Results count */}
          {filteredJobs.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6"
            >
              Showing {filteredJobs.length} of {jobs.length} job{jobs.length !== 1 ? "s" : ""}
              {searchQuery || statusFilter !== "all" ? " (filtered)" : ""}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
