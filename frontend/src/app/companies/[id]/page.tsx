"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, MapPin, Globe, Users, Calendar, 
  Star, Briefcase, Share2, ArrowLeft, CheckCircle2,
  FileText, Newspaper, Image as ImageIcon, Play, Heart, MessageCircle, MoreHorizontal
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

// Placeholder data for Posts and Articles (would be fetched from API in production)
const PLACEHOLDER_POSTS = [
  {
    id: "1",
    author: "HR Team",
    avatar: null,
    content: "We're excited to announce our new office opening in Singapore! 🎉 Join us as we expand our presence in Southeast Asia.",
    image: null,
    likes: 245,
    comments: 32,
    timestamp: "2 days ago"
  },
  {
    id: "2", 
    author: "Engineering",
    avatar: null,
    content: "Our engineering team just shipped a major update! Check out the new features that will revolutionize how you work.",
    image: null,
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

        const jobsRes = await jobApi.get(`/api/jobs/company/${params.id}`);
        setJobs(jobsRes.data || []);
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
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <Building2 className="h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold">Company Not Found</h2>
        <p className="text-muted-foreground">The company you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image / Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
      </div>

      {/* Company Header */}
      <div className="container mx-auto max-w-6xl px-4 -mt-24 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="h-28 w-28 md:h-32 md:w-32 rounded-xl border-4 border-white dark:border-gray-700 bg-white shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 -mt-16 md:-mt-20">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain p-3" />
              ) : (
                <Building2 className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {company.name}
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  </h1>
                  <p className="text-muted-foreground mt-1">{company.industry || "Technology Company"}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    {company.rating && (
                      <div className="flex items-center gap-1 text-yellow-600 font-medium">
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
                      <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm" className="px-6">+ Follow</Button>
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
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{tab.count}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {/* About Tab */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {company.description || "No description available."}
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                    <div className="text-sm text-muted-foreground">Open Jobs</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-green-600">{company.founded_year || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Founded</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-purple-600">{company.company_size?.split(" ")[0] || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Employees</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-current" />
                      {company.rating?.toFixed(1) || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </Card>
                </div>

                {/* Featured Jobs Preview */}
                {jobs.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Featured Jobs</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("jobs")}>
                        View All →
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {jobs.slice(0, 3).map((job) => (
                        <Link href={`/jobs/${job.id}`} key={job.id}>
                          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer group">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                                  <span className="capitalize">{job.job_type.replace(/_/g, " ")}</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">Apply</Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Company Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {company.industry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium">{company.industry}</span>
                      </div>
                    )}
                    {company.company_size && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company Size</span>
                        <span className="font-medium">{company.company_size}</span>
                      </div>
                    )}
                    {company.founded_year && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founded</span>
                        <span className="font-medium">{company.founded_year}</span>
                      </div>
                    )}
                    {company.headquarters && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Headquarters</span>
                        <span className="font-medium">{company.headquarters}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Website</span>
                        <a href={company.website} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline truncate max-w-[180px]">
                          {company.website.replace(/(^\w+:|^)\/\//, '')}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Similar Companies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Similar Companies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Google", "Meta", "Amazon"].filter(n => n !== company.name).slice(0, 3).map((name) => (
                      <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{name}</div>
                          <div className="text-xs text-muted-foreground">Technology</div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs">View</Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{jobs.length} Open Positions</h2>
              </div>
              {jobs.length > 0 ? (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <Link href={`/jobs/${job.id}`} key={job.id}>
                      <Card className="hover:border-blue-500 transition-all cursor-pointer group">
                        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{job.title}</h3>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /><span className="capitalize">{job.job_type.replace(/_/g, " ")}</span></span>
                                {job.salary && <span className="text-green-600 font-medium">{job.salary}</span>}
                              </div>
                            </div>
                          </div>
                          <Button className="w-full md:w-auto">Apply Now</Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No Open Positions</h3>
                  <p className="text-muted-foreground mt-1">Check back later for new opportunities!</p>
                </Card>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="max-w-2xl mx-auto space-y-4">
              {PLACEHOLDER_POSTS.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{company.name} · {post.author}</div>
                            <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                          </div>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                        <p className="mt-3 text-gray-700 dark:text-gray-300">{post.content}</p>
                        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4" /> {post.likes}
                          </button>
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                            <MessageCircle className="h-4 w-4" /> {post.comments}
                          </button>
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors">
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
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-white/50" />
                  </div>
                  <CardContent className="p-5">
                    <div className="text-xs text-muted-foreground mb-2">{article.date} · {article.readTime}</div>
                    <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === "photos" && (
            <Card className="p-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No Photos Yet</h3>
              <p className="text-muted-foreground mt-1">Photos from {company.name} will appear here.</p>
            </Card>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <Card className="p-12 text-center">
              <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No Videos Yet</h3>
              <p className="text-muted-foreground mt-1">Videos from {company.name} will appear here.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
