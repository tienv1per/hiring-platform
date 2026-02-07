"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Briefcase, Building2, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
  cover_letter: string;
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await jobApi.get("/api/applications/my");
        setApplications(response.data.applications || []);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [session, router]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status.toLowerCase() === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your job applications and their status
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "pending", "reviewing", "accepted", "rejected"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
              {status === "all" && (
                <span className="ml-2 text-xs">({applications.length})</span>
              )}
            </Button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No applications found
              </p>
              <p className="text-gray-500 mb-6">
                {filter === "all"
                  ? "Start applying to jobs to see them here"
                  : `No ${filter} applications`}
              </p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {app.job_title}
                        <Link href={`/jobs/${app.job_id}`} target="_blank">
                          <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {app.company_name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(app.status) + " capitalize border-0"}>
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Cover Letter Preview */}
                    <div>
                      <p className="text-sm font-medium mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {app.cover_letter}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Applied on {formatDate(app.applied_at)}
                      </span>
                      <Link href={`/jobs/${app.job_id}`}>
                        <Button variant="outline" size="sm">
                          View Job
                        </Button>
                      </Link>
                    </div>
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
