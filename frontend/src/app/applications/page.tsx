"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Briefcase, Calendar, Building2, MapPin, ArrowRight, Clock, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role === "recruiter") {
      router.push("/recruiter/applications");
      return;
    }

    fetchApplications();
  }, [session, router]);

  const fetchApplications = async () => {
    try {
      const response = await jobApi.get("/api/applications/my");
      setApplications(response.data || []);
    } catch (error) {
      console.error("Failed to load applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "interviewing":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "offered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case "interviewing":
        return <Calendar className="h-3.5 w-3.5 mr-1" />;
      case "offered":
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case "rejected":
        return <XCircle className="h-3.5 w-3.5 mr-1" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 mr-1" />;
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
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Applications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track the status of your job applications.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {applications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">No applications yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">You haven't applied to any jobs yet. Start browsing thousands of opportunities!</p>
            <Link href="/jobs">
              <Button className="mt-6">
                Browse Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
          >
            {applications.map((app) => (
              <motion.div variants={itemVariants} key={app.id}>
                <Card className="hover:shadow-md transition-shadow group overflow-hidden border-l-4 border-l-blue-500">
                  <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                    {/* Icon/Logo Placeholder */}
                    <div className="hidden md:flex h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors truncate">
                          <Link href={`/jobs/${app.job_id}`}>
                            {app.job_title}
                          </Link>
                        </h3>
                        <Badge variant="outline" className={`w-fit px-2.5 py-0.5 text-xs font-semibold capitalize border ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4" />
                          <span>{app.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                      <Link href={`/jobs/${app.job_id}`}>
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          View Job
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
