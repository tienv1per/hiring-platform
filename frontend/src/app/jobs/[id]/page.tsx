"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Building2, MapPin, Briefcase, DollarSign, Calendar, Globe } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await jobApi.get(`/api/jobs/${params.id}`);
        setJob(response.data);
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

    // Navigate to apply page/modal
    router.push(`/jobs/${params.id}/apply`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          ← Back to Jobs
        </Button>

        {/* Job Header Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  {job.company_name}
                </CardDescription>
              </div>
              <Button size="lg" onClick={handleApply} disabled={isApplying}>
                Apply Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span className="capitalize">{job.job_type.replace("-", " ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="capitalize">{job.work_location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Posted on {formatDate(job.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <MarkdownRenderer content={job.description} />
          </CardContent>
        </Card>

        {/* Required Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Apply Button (Bottom) */}
        <div className="flex justify-center">
          <Button size="lg" onClick={handleApply} className="w-full md:w-auto" disabled={isApplying}>
            Apply for this Position
          </Button>
        </div>
      </div>
    </div>
  );
}
