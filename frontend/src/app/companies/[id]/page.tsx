"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, MapPin, Globe, Users, Calendar,
  Star, Briefcase, Share2, ArrowLeft, CheckCircle2,
  FileText, Newspaper, Image as ImageIcon, Play, Heart, MessageCircle, MoreHorizontal,
  Brain, Sparkles, TrendingUp, Shield, Target, Zap, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { clsx } from "clsx";

interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  company_size?: string;
  founded_year?: number;
  headquarters?: string;
  rating?: number;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  salary?: string;
  created_at: string;
}

const PLACEHOLDER_POSTS = [
  {
    id: "1",
    author: "HR Team",
    content: "We're excited to announce our new office opening in Singapore! 🎉 Join us as we expand our presence in Southeast Asia.",
    likes: 245,
    comments: 32,
    timestamp: "2 days ago"
  },
  {
    id: "2",
    author: "Engineering",
    content: "Our engineering team just shipped a major update! Check out the new features that will revolutionize how you work.",
    likes: 189,
    comments: 28,
    timestamp: "1 week ago"
  }
];

const PLACEHOLDER_ARTICLES = [
  {
    id: "1",
    title: "How We Built a Scalable Microservices Architecture",
    excerpt: "Learn about our journey from monolith to microservices and the lessons we learned along the way.",
    readTime: "8 min read",
    date: "Jan 15, 2026"
  },
  {
    id: "2",
    title: "Our Approach to Remote Work Culture",
    excerpt: "Discover how we maintain team cohesion and productivity with our distributed workforce.",
    readTime: "5 min read",
    date: "Dec 28, 2025"
  },
  {
    id: "3",
    title: "Diversity & Inclusion: Our 2025 Report",
    excerpt: "A comprehensive look at our initiatives and progress in building a more inclusive workplace.",
    readTime: "12 min read",
    date: "Dec 10, 2025"
  }
];

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const companyRes = await jobApi.get(`/api/companies/${params.id}`);
        setCompany(companyRes.data);

        // Fetch jobs for this company using search endpoint with company_id filter
        try {
          const jobsRes = await jobApi.get(`/api/jobs`, {
            params: { company_id: params.id, limit: 100 },
          });
          const jobsData = jobsRes.data;
          if (Array.isArray(jobsData)) {
            setJobs(jobsData);
          } else if (jobsData?.jobs) {
            setJobs(jobsData.jobs);
          } else {
            setJobs([]);
          }
        } catch {
          setJobs([]);
        }
      } catch (error) {
        console.error("Failed to load company data:", error);
        toast.error("Failed to load company information");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center gap-4">
        <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Company Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400">The company you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/companies")} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">Browse Companies</Button>
      </div>
    );
  }

  const tabs = [
    { id: "about", label: "About", icon: Building2 },
    { id: "jobs", label: "Jobs", icon: Briefcase, count: jobs.length },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "articles", label: "Articles", icon: Newspaper },
    { id: "photos", label: "Photos", icon: ImageIcon },
    { id: "videos", label: "Videos", icon: Play },
  ];

  // Mock AI scores
  const aiCultureScore = 92;
  const aiGrowthScore = 88;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/4 w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/4 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Cover Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
      </div>

      {/* Company Header */}
      <div className="container mx-auto max-w-6xl px-4 -mt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl border-4 border-white dark:border-gray-700 bg-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 -mt-16 md:-mt-20">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain p-3" />
              ) : (
                <Building2 className="h-12 w-12 text-indigo-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    {company.name}
                    <CheckCircle2 className="h-6 w-6 text-indigo-500" />
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{company.industry || "Technology Company"}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {company.rating && (
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
                        <Star className="h-4 w-4 fill-current" />
                        {company.rating.toFixed(1)}
                      </div>
                    )}
                    {company.headquarters && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {company.headquarters}
                      </div>
                    )}
                    {company.company_size && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {company.company_size}
                      </div>
                    )}
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-300 dark:border-gray-600">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm" className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">+ Follow</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 -mx-6 px-6 border-t border-gray-200 dark:border-gray-700 pt-4 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <Badge className="ml-1 text-xs h-5 px-1.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-0">{tab.count}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {/* About Tab */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        About {company.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                        {company.description || "No description available."}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* AI Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="text-center p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{jobs.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Open Jobs</div>
                    </Card>
                    <Card className="text-center p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{company.founded_year || "N/A"}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Founded</div>
                    </Card>
                    <Card className="text-center p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{company.company_size?.split(" ")[0] || "N/A"}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Employees</div>
                    </Card>
                    <Card className="text-center p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-1">
                        <Star className="h-5 w-5 fill-current" />
                        {company.rating?.toFixed(1) || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                    </Card>
                  </div>
                </motion.div>

                {/* Featured Jobs Preview */}
                {jobs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          AI-Matched Jobs
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("jobs")} className="text-indigo-600 dark:text-indigo-400">
                          View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {jobs.slice(0, 3).map((job) => (
                          <Link href={`/jobs/${job.id}`} key={job.id}>
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h4>
                                  <div className="flex gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                                    <span className="capitalize">{job.job_type.replace(/_/g, " ")}</span>
                                  </div>
                                </div>
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">Apply</Button>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Culture Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                          <Brain className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold">AI Culture Score</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Based on sentiment analysis</p>
                        </div>
                      </div>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{aiCultureScore}%</span>
                        <span className="text-green-600 dark:text-green-400 text-sm font-medium pb-1">Excellent</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Work-life balance: 95%
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Career growth: 90%
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Team collaboration: 88%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Company Details Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Company Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      {company.industry && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Industry</span>
                          <span className="font-medium">{company.industry}</span>
                        </div>
                      )}
                      {company.company_size && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Company Size</span>
                          <span className="font-medium">{company.company_size}</span>
                        </div>
                      )}
                      {company.founded_year && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Founded</span>
                          <span className="font-medium">{company.founded_year}</span>
                        </div>
                      )}
                      {company.headquarters && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Headquarters</span>
                          <span className="font-medium">{company.headquarters}</span>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Website</span>
                          <a href={company.website} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[180px]">
                            {company.website.replace(/(^\w+:|^)\/\//, '')}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* AI-Recommended Similar Companies */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        AI-Recommended
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {["Google", "Meta", "Amazon"].filter(n => n !== company.name).slice(0, 3).map((name) => (
                        <div key={name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Technology</div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-xs text-indigo-600 dark:text-indigo-400">View</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{jobs.length} Open Positions</h2>
                <Badge className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Matched
                </Badge>
              </div>
              {jobs.length > 0 ? (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <Link href={`/jobs/${job.id}`} key={job.id}>
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all cursor-pointer group rounded-2xl">
                        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /><span className="capitalize">{job.job_type.replace(/_/g, " ")}</span></span>
                                {job.salary && <span className="text-green-600 dark:text-green-400 font-medium">{job.salary}</span>}
                              </div>
                            </div>
                          </div>
                          <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">Apply Now</Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                  <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No Open Positions</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Check back later for new opportunities!</p>
                </Card>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="max-w-2xl mx-auto space-y-4">
              {PLACEHOLDER_POSTS.map((post) => (
                <Card key={post.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{company.name} · {post.author}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{post.timestamp}</div>
                          </div>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                        <p className="mt-3 text-gray-700 dark:text-gray-300">{post.content}</p>
                        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4" /> {post.likes}
                          </button>
                          <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">
                            <MessageCircle className="h-4 w-4" /> {post.comments}
                          </button>
                          <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
                            <Share2 className="h-4 w-4" /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === "articles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLACEHOLDER_ARTICLES.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
                  <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-600 flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-white/50" />
                  </div>
                  <CardContent className="p-5">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{article.date} · {article.readTime}</div>
                    <h3 className="font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{article.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === "photos" && (
            <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
              <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No Photos Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Photos from {company.name} will appear here.</p>
            </Card>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
              <Play className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No Videos Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Videos from {company.name} will appear here.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
