"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Briefcase } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  work_location: string;
  salary: string;
  created_at: string;
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
      // Get jobs posted by this recruiter
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
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Job Postings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your job listings
            </p>
          </div>
          <Link href="/recruiter/jobs/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No job postings yet
              </p>
              <p className="text-gray-500 mb-6">
                Create your first job posting to attract candidates
              </p>
              <Link href="/recruiter/jobs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                        <CardTitle className="text-xl cursor-pointer">{job.title}</CardTitle>
                      </Link>
                      <CardDescription>{job.company_name} · {job.location}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </Link>
                      <Link href={`/recruiter/jobs/${job.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/recruiter/jobs/${job.id}/applications`}>
                        <Button size="sm">
                          Applications
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="capitalize">{job.job_type.replace("-", " ")}</span>
                    <span>·</span>
                    <span className="capitalize">{job.work_location}</span>
                    {job.salary && (
                      <>
                        <span>·</span>
                        <span>{job.salary}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
