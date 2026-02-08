"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Import MD Editor dynamically to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Company {
  id: string;
  name: string;
}

export default function CreateJobPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company_id: "",
    location: "",
    job_type: "full-time",
    work_location: "onsite",
    salary: "",
    openings: 1,
    description: "# Job Description\n\n## Responsibilities\n\n- \n\n## Requirements\n\n- \n\n## Benefits\n\n- \n",
    required_skills: "",
  });

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

    fetchCompanies();
  }, [session, router]);

  const fetchCompanies = async () => {
    try {
      const response = await jobApi.get("/api/companies");
      setCompanies(response.data.companies || []);
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_id) {
      toast.error("Please select a company");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse skills from comma-separated string
      const skills = formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await jobApi.post("/api/jobs", {
        ...formData,
        required_skills: skills,
      });

      toast.success("Job posted successfully!");
      router.push("/recruiter/jobs");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">No Companies Found</h2>
        <p className="text-gray-600 mb-6">You need to create a company first before posting jobs</p>
        <Button onClick={() => router.push("/recruiter/companies")}>
          Go to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Post a New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              {/* Job Type & Work Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_location">Work Location *</Label>
                  <Select
                    value={formData.work_location}
                    onValueChange={(value) => setFormData({ ...formData, work_location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary & Openings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. $100,000 - $150,000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openings">Number of Openings *</Label>
                  <Input
                    id="openings"
                    type="number"
                    min={1}
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  placeholder="e.g. JavaScript, React, Node.js, TypeScript"
                />
                <p className="text-xs text-gray-500">Separate skills with commas</p>
              </div>

              {/* Job Description (Markdown) */}
              <div className="space-y-2">
                <Label>Job Description (Markdown) *</Label>
                <div data-color-mode="light">
                  <MDEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value || "" })}
                    height={400}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Use markdown to format your job description
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
