"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { 
  Building2, MapPin, Briefcase, DollarSign, Calendar, Globe, Clock, 
  ArrowLeft, Share2, CheckCircle2, Star, Zap 
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { clsx } from "clsx";
import Link from "next/link";
import { motion } from "framer-motion";

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
  similarity?: number;
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

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch current job
        const response = await jobApi.get(`/api/jobs/${params.id}`);
        setJob(response.data);

        // Fetch related jobs
        const relatedResponse = await jobApi.get("/api/jobs?limit=4");
        setRelatedJobs(relatedResponse.data.jobs.filter((j: JobDetails) => j.id !== params.id).slice(0, 4));
      } catch (error) {
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
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Immersive Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-900/10 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Button variant="ghost" size="sm" onClick={() => router.push("/jobs")} className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-700 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <Building2 className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {job.company_name}
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-gray-500 dark:text-gray-400 text-base font-normal underline decoration-dashed underline-offset-4 cursor-pointer hover:text-blue-600 transition-colors">
                      View Company Profile
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="capitalize">{job.job_type.replace(/-/g, " ")}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="capitalize">{job.work_location}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-medium">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-gray-500 px-2 py-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Posted {timeAgo(job.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
              <Button size="lg" onClick={handleApply} className="w-full sm:w-auto shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all font-semibold text-lg h-12">
                Apply Now <Zap className="ml-2 h-4 w-4 fill-current" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
           {/* Description Card */}
           <Card className="border-none shadow-sm overflow-hidden">
             <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
             <CardContent className="p-8 space-y-8">
               <div>
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                   Job Description
                 </h2>
                 <div className="prose prose-lg prose-gray dark:prose-invert max-w-none 
                   prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                   prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                   prose-li:text-gray-600 dark:prose-li:text-gray-300
                   prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                   prose-a:text-blue-600 hover:prose-a:underline">
                   <MarkdownRenderer content={job.description} />
                 </div>
               </div>

               <Separator className="bg-gray-100 dark:bg-gray-800" />

               {/* Skills Section */}
               {job.required_skills && job.required_skills.length > 0 && (
                 <div>
                   <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                     <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Required Skills
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {job.required_skills.map((skill) => (
                       <Badge 
                         key={skill} 
                         variant="secondary" 
                         className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 border border-blue-100 dark:border-blue-800"
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

        {/* Right Sidebar */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          {/* Company Snapshot (Placeholder for future) */}
          <Card className="border shadow-none bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">About {job.company_name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Leading the way in innovation and technology. Join a team that values growth and impact.
              </p>
              <Button variant="link" className="px-0 text-blue-600 h-auto font-medium">
                View Company Page &rarr;
              </Button>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">Similar Jobs</h3>
            <div className="space-y-3">
               {relatedJobs.map((relatedJob) => (
                  <Link href={`/jobs/${relatedJob.id}`} key={relatedJob.id} className="block group">
                    <div className={clsx(
                      "p-4 rounded-xl border bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 cursor-pointer",
                      relatedJob.id === job.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    )}>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                        {relatedJob.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{relatedJob.company_name}</p>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline" className="font-normal text-gray-500 border-gray-200 dark:border-gray-700">
                              {relatedJob.job_type.replace(/-/g, " ")}
                          </Badge>
                          {relatedJob.salary && (
                            <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs font-medium">
                                {relatedJob.salary}
                            </span>
                          )}
                      </div>
                    </div>
                  </Link>
               ))}
               {relatedJobs.length === 0 && (
                   <div className="text-gray-500 text-sm p-4 text-center border border-dashed rounded-xl">No similar jobs found.</div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
