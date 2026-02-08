"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Briefcase, DollarSign, Clock, Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    work_location: string;
    salary?: string;
    required_skills: string[];
    created_at: string;
    similarity?: number;
  };
}

export function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const matchScore = job.similarity ? Math.round(job.similarity * 100) : null;

  return (
    <Card className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              {job.company_name}
            </CardDescription>
          </div>

          {/* AI Match Badge */}
          {matchScore && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {matchScore}% Match
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="capitalize">{job.job_type.replace("-", " ")}</span>
            </span>
            {job.salary && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                {job.salary}
              </span>
            )}
          </div>

          {/* Work Location Badge */}
          <div className="flex gap-2">
            <Badge
              className={`capitalize rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                job.work_location === "remote"
                  ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                  : job.work_location === "hybrid"
                  ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                  : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
              }`}
            >
              {job.work_location}
            </Badge>
          </div>

          {/* Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.required_skills.slice(0, 5).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-xs bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-lg"
                >
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 5 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-500 rounded-lg"
                >
                  +{job.required_skills.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(job.created_at)}
            </span>
            <Link href={`/jobs/${job.id}`}>
              <Button
                size="sm"
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all"
              >
                View Details
                <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-70" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
