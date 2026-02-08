"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, MapPin, Globe, Users, Calendar, DollarSign, 
  Star, Briefcase, Share2, ArrowLeft, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { clsx } from "clsx";

// Defined locally to match backend updates
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

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch company details
        const companyRes = await jobApi.get(`/api/companies/${params.id}`);
        setCompany(companyRes.data);

        // Fetch company jobs
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
        <div className="container mx-auto max-w-6xl space-y-8">
           <Skeleton className="h-40 w-full rounded-xl" />
           <div className="grid grid-cols-3 gap-8">
             <Skeleton className="h-96 col-span-2 rounded-xl" />
             <Skeleton className="h-96 col-span-1 rounded-xl" />
           </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl font-bold">Company Not Found</h2>
        <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header Banner Area */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-6xl px-4 py-8">
           <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
           </Button>

           <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex gap-6 items-center">
                 <div className="h-24 w-24 rounded-xl border-2 border-gray-100 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                    {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain p-2" />
                    ) : (
                        <Building2 className="h-10 w-10 text-gray-400" />
                    )}
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                       {company.name}
                       {/* Placeholder verification badge */}
                       <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/10" />
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                       {company.rating && (
                         <div className="flex items-center text-yellow-500 font-medium">
                            <span className="text-lg mr-1">{company.rating}</span>
                           <div className="flex">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={clsx("h-4 w-4", i < Math.round(company.rating!) ? "fill-current" : "text-gray-300")} />
                             ))}
                           </div>
                         </div>
                       )}
                       {company.industry && (
                          <div className="flex items-center gap-1">
                             <Briefcase className="h-4 w-4" />
                             {company.industry}
                          </div>
                       )}
                       {company.headquarters && (
                          <div className="flex items-center gap-1">
                             <MapPin className="h-4 w-4" />
                             {company.headquarters}
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
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                 <Button variant="outline" className="flex-1 md:flex-none gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                 </Button>
                 <Button className="flex-1 md:flex-none px-8">Follow</Button>
              </div>
           </div>

           {/* Navigation Tabs */}
           <div className="mt-10 overflow-x-auto">
             <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 min-w-max">
                {["Overview", "Jobs", "Reviews", "Salaries", "Interviews"].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab.toLowerCase())}
                     className={clsx(
                       "pb-3 text-sm font-medium border-b-2 transition-colors",
                       activeTab === tab.toLowerCase() 
                         ? "border-blue-600 text-blue-600" 
                         : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                     )}
                   >
                     {tab}
                     {tab === "Jobs" && <Badge variant="secondary" className="ml-2 text-xs py-0 h-5">{jobs.length}</Badge>}
                   </button>
                ))}
             </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {activeTab === "overview" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                 {/* Introduction / About */}
                 <section>
                    <h2 className="text-xl font-bold mb-4">About {company.name}</h2>
                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                       <p className="whitespace-pre-line">{company.description}</p>
                    </div>
                 </section>

                 {/* Jobs Snippet */}
                 {jobs.length > 0 && (
                   <section>
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-bold">Open Positions</h2>
                         <Button variant="link" onClick={() => setActiveTab("jobs")} className="text-blue-600">View all jobs</Button>
                      </div>
                      <div className="grid gap-4">
                         {jobs.slice(0, 3).map((job) => (
                            <Link href={`/jobs/${job.id}`} key={job.id}>
                              <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-600">
                                 <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                       <h3 className="font-bold text-lg">{job.title}</h3>
                                       <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                                          <span>{job.location}</span>
                                          <span>•</span>
                                          <span>{job.salary || "Negotiable"}</span>
                                       </div>
                                    </div>
                                    <Button size="sm" variant="secondary">Apply</Button>
                                 </CardContent>
                              </Card>
                            </Link>
                         ))}
                      </div>
                   </section>
                 )}
              </div>

              {/* Right Column - Sidebar Stats */}
              <div className="space-y-6">
                 {/* Company Stats */}
                 <Card>
                    <CardHeader className="pb-3">
                       <CardTitle className="text-base font-semibold">Company Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {company.founded_year && (
                          <div className="flex justify-between items-center text-sm">
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Founded</span>
                             </div>
                             <span className="font-medium">{company.founded_year}</span>
                          </div>
                       )}
                       {company.company_size && (
                          <div className="flex justify-between items-center text-sm">
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>Employees</span>
                             </div>
                             <span className="font-medium">{company.company_size}</span>
                          </div>
                       )}
                       {company.industry && (
                          <div className="flex justify-between items-center text-sm">
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                <span>Industry</span>
                             </div>
                             <span className="font-medium">{company.industry}</span>
                          </div>
                       )}
                    </CardContent>
                 </Card>
              </div>
           </div>
        )}

        {activeTab === "jobs" && (
           <div className="grid gap-4">
              <h2 className="text-xl font-bold mb-4">{jobs.length} Open Positions</h2>
              {jobs.map((job) => (
                 <Link href={`/jobs/${job.id}`} key={job.id}>
                    <Card className="hover:border-blue-500 transition-colors cursor-pointer group">
                       <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                             <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{job.title}</h3>
                             <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                   <MapPin className="h-3.5 w-3.5" />
                                   {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                   <Briefcase className="h-3.5 w-3.5" />
                                   <span className="capitalize">{job.job_type.replace(/_/g, " ")}</span>
                                </div>
                                {job.salary && (
                                   <div className="flex items-center gap-1">
                                      <DollarSign className="h-3.5 w-3.5" />
                                      {job.salary}
                                   </div>
                                )}
                             </div>
                          </div>
                          <Button>View Details</Button>
                       </CardContent>
                    </Card>
                 </Link>
              ))}
              {jobs.length === 0 && (
                 <div className="text-center py-12 text-muted-foreground bg-white dark:bg-gray-800 rounded-xl border border-dashed">
                    No open positions found.
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}
