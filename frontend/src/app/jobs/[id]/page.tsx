"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Building2, MapPin, Briefcase, DollarSign, Calendar, Globe, Clock, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { clsx } from "clsx";
import Link from "next/link";

interface JobDetails {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  work_location: string;
  salary?: string;
  description: string;
  required_skills: string[];
  created_at: string;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "just now";
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch current job
        const response = await jobApi.get(`/api/jobs/${params.id}`);
        setJob(response.data);

        // Fetch related jobs (mocking "Jobs from same company/category" by fetching recent jobs)
        // In a real app, we'd use ?company_id=... or ?category=...
        const relatedResponse = await jobApi.get("/api/jobs?limit=5");
        // Filter out current job
        setRelatedJobs(relatedResponse.data.jobs.filter((j: JobDetails) => j.id !== params.id).slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch job:", error);
        toast.error("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchJobDetails();
    }
  }, [params.id]);

  const handleApply = () => {
    if (!session) {
      toast.error("Please login to apply");
      router.push("/login");
      return;
    }
    router.push(`/jobs/${params.id}/apply`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/jobs")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="gap-2">
                 <Share2 className="h-4 w-4" />
                 Share
               </Button>
               {/* Mobile Apply Button */}
               <Button size="sm" onClick={handleApply} className="md:hidden">Apply Now</Button>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - Related Jobs */}
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          <h3 className="font-semibold text-lg px-1">More Jobs</h3>
          <div className="space-y-3">
             {relatedJobs.map((relatedJob) => (
                <Link href={`/jobs/${relatedJob.id}`} key={relatedJob.id} className="block">
                  <div className={clsx(
                    "p-4 rounded-xl border bg-card hover:bg-accent transition-colors duration-200 cursor-pointer group",
                    relatedJob.id === job.id ? "border-primary ring-1 ring-primary" : "border-border"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
                         {relatedJob.title}
                       </h4>
                       {/* Placeholder for bookmark/save */}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{relatedJob.company_name}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary" className="font-normal bg-secondary/50">
                            {relatedJob.job_type.replace("_", " ")}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                             <Clock className="h-3 w-3" />
                             {timeAgo(relatedJob.created_at)}
                        </span>
                    </div>
                  </div>
                </Link>
             ))}
             {relatedJobs.length === 0 && (
                 <div className="text-muted-foreground text-sm p-4 text-center">No other jobs found.</div>
             )}
          </div>
        </div>

        {/* Main Content - Job Details */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
           {/* Job Header Card */}
           <Card className="overflow-hidden border-none shadow-lg bg-card text-card-foreground">
             <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                   <div className="space-y-4">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 text-lg text-muted-foreground">
                           <Building2 className="h-5 w-5" />
                           <span className="font-medium text-foreground">{job.company_name}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm sm:text-base">
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4.5 w-4.5" />
                            <span>{job.location}</span>
                         </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4.5 w-4.5" />
                            <span className="capitalize">{job.job_type.replace(/_/g, " ")}</span>
                         </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4.5 w-4.5" />
                            <span className="capitalize">{job.work_location.replace(/_/g, " ")}</span>
                         </div>
                         {job.salary && (
                           <div className="flex items-center gap-2 text-foreground font-medium">
                              <DollarSign className="h-4.5 w-4.5" />
                              <span>{job.salary}</span>
                           </div>
                         )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Calendar className="h-4 w-4" />
                        <span>Posted on {formatDate(job.created_at)}</span>
                      </div>
                   </div>

                   <div className="flex-shrink-0">
                      <Button size="lg" onClick={handleApply} className="w-full sm:w-auto px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        Apply Now
                      </Button>
                   </div>
                </div>
             </div>
           </Card>

           {/* Job Description Content */}
           <Card className="border-none shadow-sm">
             <CardContent className="p-6 sm:p-8 space-y-8">
               <div>
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                   <span className="bg-primary/10 p-1.5 rounded-lg text-primary">
                     <Briefcase className="h-6 w-6" />
                   </span>
                   Job Description
                 </h2>
                 <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:underline">
                   <MarkdownRenderer content={job.description} />
                 </div>
               </div>

               {/* Required Skills */}
               {job.required_skills && job.required_skills.length > 0 && (
                 <div>
                   <h3 className="text-xl font-bold mb-4">Required Skills</h3>
                   <div className="flex flex-wrap gap-2">
                     {job.required_skills.map((skill) => (
                       <Badge 
                         key={skill} 
                         variant="secondary" 
                         className="px-4 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary transition-colors"
                       >
                         {skill}
                       </Badge>
                     ))}
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
