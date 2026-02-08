"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Loader2, Plus, Briefcase, MapPin, DollarSign, Calendar, 
  MoreVertical, Edit, FileText, Trash2, Eye, Users, ChevronRight 
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
  status?: string; // status might not be in API yet, but useful for UI
}

export default function RecruiterJobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Job Postings</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your active job listings.</p>
            </div>
            <Link href="/recruiter/jobs/create">
              <Button className="shadow-lg shadow-blue-500/20 gap-2">
                <Plus className="h-4 w-4" /> Post New Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {jobs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">No job postings yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Create your first job posting to attract top talent and grow your team.</p>
            <Link href="/recruiter/jobs/create">
              <Button className="mt-6" variant="outline">
                Create First Job
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {jobs.map((job) => (
              <motion.div variants={itemVariants} key={job.id}>
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link href={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                            <h3 className="text-xl font-bold truncate">{job.title}</h3>
                          </Link>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </Badge>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          {job.company_name}
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">{job.job_type.replace("-", " ")}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            <span className="capitalize">{job.work_location}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                        <div className="flex flex-col items-center mr-4 px-4 hidden sm:flex">
                         {/* Placeholder stats */}
                          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">0</span>
                          <span className="text-xs text-gray-500 uppercase font-medium">Applicants</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/recruiter/jobs/${job.id}/applications`}>
                            <Button size="sm" className="hidden sm:flex gap-2">
                              <Users className="h-4 w-4" /> View Apps
                            </Button>
                          </Link>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
