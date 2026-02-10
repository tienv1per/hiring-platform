"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
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
import { motion } from "framer-motion";
import {
  Loader2, ArrowLeft, Briefcase, MapPin, DollarSign, Users,
  Sparkles, Save, X, Plus
} from "lucide-react";
import dynamic from "next/dynamic";

const JobDescriptionEditor = dynamic(
  () => import("@/components/JobDescriptionEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[400px] bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex items-center justify-center">
        <Sparkles className="w-5 h-5 animate-pulse text-indigo-500" />
        <span className="ml-2 text-gray-400">Loading editor...</span>
      </div>
    ),
  }
);

interface Company {
  id: string;
  name: string;
}

interface JobData {
  id: string;
  title: string;
  company_id: string;
  location: string;
  job_type: string;
  work_location: string;
  salary?: string;
  openings: number;
  description: string;
  required_skills: string[];
  status: string;
}

export default function EditJobPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    company_id: "",
    location: "",
    job_type: "full-time",
    work_location: "onsite",
    salary: "",
    openings: 1,
    description: "",
    status: "active",
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
    fetchData();
  }, [session, router, jobId]);

  const fetchData = async () => {
    try {
      const [jobResponse, companiesResponse] = await Promise.all([
        jobApi.get(`/api/jobs/${jobId}`),
        jobApi.get("/api/companies"),
      ]);
      const job: JobData = jobResponse.data;
      setCompanies(companiesResponse.data.companies || []);
      setSkills(job.required_skills || []);
      setFormData({
        title: job.title || "",
        company_id: job.company_id || "",
        location: job.location || "",
        job_type: job.job_type || "full-time",
        work_location: job.work_location || "onsite",
        salary: job.salary || "",
        openings: job.openings || 1,
        description: job.description || "",
        status: job.status || "active",
      });
    } catch {
      toast.error("Failed to load job details");
      router.push("/recruiter/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_id) {
      toast.error("Please select a company");
      return;
    }

    setIsSubmitting(true);

    try {
      await jobApi.put(`/api/jobs/${jobId}`, {
        ...formData,
        required_skills: skills,
      });

      toast.success("Job updated successfully!");
      router.push("/recruiter/jobs");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update job");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-400">Loading job data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-400/10 dark:bg-indigo-600/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-400/8 dark:bg-purple-600/6 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-indigo-500" />
                  Edit Job
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {formData.status === "active" ? (
                    <span className="text-green-500">● Active</span>
                  ) : formData.status === "closed" ? (
                    <span className="text-red-500">● Closed</span>
                  ) : (
                    <span className="text-amber-500">● Inactive</span>
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* Job Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-6"
            >
              <Card className="bg-white/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />
                      Job Title *
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="e.g. Senior AI Engineer"
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                    />
                  </div>

                  {/* Company & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Company *</Label>
                      <Select value={formData.company_id} onValueChange={(val) => setFormData({ ...formData, company_id: val })}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl">
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
                        Location *
                      </Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        placeholder="e.g. San Francisco, CA"
                        className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Job Type, Work Location, Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Job Type *</Label>
                      <Select value={formData.job_type} onValueChange={(val) => setFormData({ ...formData, job_type: val })}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl">
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
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Work Location *</Label>
                      <Select value={formData.work_location} onValueChange={(val) => setFormData({ ...formData, work_location: val })}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="onsite">Onsite</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Status</Label>
                      <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Salary & Openings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        <DollarSign className="w-3.5 h-3.5 inline mr-1.5" />
                        Salary Range
                      </Label>
                      <Input
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g. $150,000 - $200,000"
                        className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        <Users className="w-3.5 h-3.5 inline mr-1.5" />
                        Number of Openings *
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.openings}
                        onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                        required
                        className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                      Required Skills
                    </Label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/15 dark:to-purple-500/15 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium border border-indigo-200/50 dark:border-indigo-500/20">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add a skill..." className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm flex-1" />
                      <Button type="button" variant="outline" size="sm" onClick={addSkill} className="rounded-xl"><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description Editor */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Job Description *
                </Label>
                <span className="text-xs text-gray-400 dark:text-gray-500">Supports Markdown formatting</span>
              </div>
              <JobDescriptionEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
              />
            </motion.div>

            {/* Bottom action bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0 h-11"
              >
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="mr-2 h-4 w-4" />Save Changes</>)}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="rounded-xl border-gray-300 dark:border-gray-600">
                Cancel
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}
