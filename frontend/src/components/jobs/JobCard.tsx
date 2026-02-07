"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Briefcase, DollarSign, Clock } from "lucide-react";
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

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl hover:text-blue-600">
              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Building2 className="h-4 w-4" />
              {job.company_name}
            </CardDescription>
          </div>
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Location & Job Type */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="capitalize">{job.job_type.replace("-", " ")}</span>
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </span>
            )}
          </div>

          {/* Work Location Badge */}
          <div>
            <Badge variant={job.work_location === "remote" ? "default" : "secondary"} className="capitalize">
              {job.work_location}
            </Badge>
          </div>

          {/* Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.required_skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.required_skills.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-500">{formatDate(job.created_at)}</span>
            <Link href={`/jobs/${job.id}`}>
              <Button size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
