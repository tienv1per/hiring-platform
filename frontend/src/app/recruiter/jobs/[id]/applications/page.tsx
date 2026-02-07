"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, User, Mail, Calendar } from "lucide-react";

interface Application {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  cover_letter: string;
  applied_at: string;
}

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobTitle, setJobTitle] = useState("");
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

    fetchApplications();
  }, [session, params.id, router]);

  const fetchApplications = async () => {
    try {
      // Get job details
      const jobResponse = await jobApi.get(`/api/jobs/${params.id}`);
      setJobTitle(jobResponse.data.title);

      // Get applications for this job
      const appsResponse = await jobApi.get(`/api/jobs/${params.id}/applications`);
      setApplications(appsResponse.data.applications || []);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await jobApi.put(`/api/applications/${applicationId}/status`, {
        status: newStatus,
      });
      toast.success("Application status updated");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "reviewing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
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
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          ← Back to Jobs
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Applications for {jobTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {applications.length} application{applications.length !== 1 ? "s" : ""} received
          </p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <User className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No applications yet
              </p>
              <p className="text-gray-500">
                Applications will appear here when candidates apply
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        {app.applicant_name}
                        <Badge className={getStatusColor(app.status) + " capitalize border-0"}>
                          {app.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4" />
                        {app.applicant_email}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Select
                        value={app.status}
                        onValueChange={(value) => handleStatusChange(app.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cover Letter */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Cover Letter:</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{app.cover_letter}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-2 border-t text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </span>
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
