"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Building2, MapPin, Briefcase, DollarSign, Calendar, Globe, Clock,
  ArrowLeft, Share2, CheckCircle2, Star, Zap, Brain, Sparkles, ArrowUpRight, Shield
} from "lucide-react";
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
        const response = await jobApi.get(`/api/jobs/${params.id}`);
        setJob(response.data);

        const relatedResponse = await jobApi.get("/api/jobs?limit=4");
        setRelatedJobs(relatedResponse.data.jobs.filter((j: JobDetails) => j.id !== params.id).slice(0, 3));
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
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-[#030711]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-500/50 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-white dark:bg-[#030711]">
        <Zap className="w-12 h-12 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Not Found</h2>
        <Button onClick={() => router.push("/jobs")} className="bg-indigo-600 hover:bg-indigo-500 text-white">Back to Jobs</Button>
      </div>
    );
  }

  const matchScore = job.similarity ? Math.round(job.similarity * 100) : 94; // Mock score for demo

  return (
    <div className="min-h-screen bg-white dark:bg-[#030711] text-gray-900 dark:text-white pb-16">
      
      {/* HERO HEADER */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/10">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/jobs")}
              className="mb-6 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
            </Button>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 max-w-3xl"
            >
              {/* Title & Company */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg mt-1">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{job.company_name}</span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <Link href="#" className="text-gray-500 dark:text-gray-400 text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline decoration-dashed underline-offset-4">
                      View Company Profile
                    </Link>
                  </div>
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-sm font-normal">
                  <Briefcase className="h-4 w-4 mr-1.5 text-gray-500" />
                  <span className="capitalize">{job.job_type.replace(/-/g, " ")}</span>
                </Badge>
                <Badge className={`px-3 py-1.5 rounded-lg text-sm font-normal ${
                  job.work_location === "remote"
                    ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                    : job.work_location === "hybrid"
                    ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
                }`}>
                  <Globe className="h-4 w-4 mr-1.5" />
                  <span className="capitalize">{job.work_location}</span>
                </Badge>
                <Badge className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-sm font-normal">
                  <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                  {job.location}
                </Badge>
                {job.salary && (
                  <Badge className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary}
                  </Badge>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 px-2">
                  <Clock className="h-4 w-4" />
                  Posted {timeAgo(job.created_at)}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3 shrink-0"
            >
              <Button
                size="lg"
                onClick={handleApply}
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
              >
                Apply Now <Zap className="ml-2 h-4 w-4 fill-current" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-6 rounded-xl border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-1 lg:col-span-8 space-y-8"
        >
          <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
            <CardContent className="p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Job Description
                </h2>
                <div className="prose prose-lg prose-gray dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                  prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-li:text-gray-600 dark:prose-li:text-gray-300
                  prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                  prose-a:text-indigo-600 hover:prose-a:underline">
                  <MarkdownRenderer content={job.description} />
                </div>
              </div>

              <Separator className="bg-gray-100 dark:bg-white/10" />

              {/* Skills Section */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="px-3 py-1.5 text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 lg:col-span-4 space-y-6"
        >
          {/* AI Match Score Card */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">AI Match Score</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Based on your profile</p>
                </div>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{matchScore}%</span>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium pb-1">Excellent Match</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Skills alignment: 95%
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Experience level: Match
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Location preference: Compatible
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Card */}
          <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">About {job.company_name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Leading the way in innovation and technology. Join a team that values growth and impact.
              </p>
              <Button variant="link" className="px-0 text-indigo-600 dark:text-indigo-400 h-auto font-medium">
                View Company Page <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">AI Recommended Jobs</h3>
            <div className="space-y-3">
              {relatedJobs.map((relatedJob, i) => (
                <Link href={`/jobs/${relatedJob.id}`} key={relatedJob.id} className="block group">
                  <div className="p-4 rounded-xl border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
                      {relatedJob.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{relatedJob.company_name}</p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="font-normal text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 rounded-lg">
                        {relatedJob.job_type.replace(/-/g, " ")}
                      </Badge>
                      {relatedJob.salary && (
                        <span className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-lg text-xs font-medium">
                          {relatedJob.salary}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {relatedJobs.length === 0 && (
                <div className="text-gray-500 text-sm p-4 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl">No similar jobs found.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
