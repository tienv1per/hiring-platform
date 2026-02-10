"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Sparkles, Send, X, Plus, Zap
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

const JD_TEMPLATE = `# Job Overview

Provide a brief but compelling summary of the role and your team.

## Responsibilities

- Lead architecture and development of key features
- Collaborate with cross-functional teams to define product roadmap
- Mentor junior engineers and conduct code reviews
- Ensure code quality through testing and CI/CD best practices

## Requirements

- 5+ years of experience in software engineering
- Strong proficiency in JavaScript/TypeScript, React, and Node.js
- Experience with cloud services (AWS/GCP) and containerization
- Excellent problem-solving and communication skills

## Nice to Have

- Experience with AI/ML integration in production systems
- Contributions to open-source projects
- Previous experience in a startup environment

## Benefits

- Competitive salary and equity package
- Flexible remote/hybrid work options
- Health, dental, and vision insurance
- Professional development budget
- Generous PTO policy
`;

export default function CreateJobPage() {
  const { data: session } = useSession();
  const router = useRouter();
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
    description: JD_TEMPLATE,
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
    } catch {
      toast.error("Failed to load companies");
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

    if (!formData.description.trim()) {
      toast.error("Job description is required");
      return;
    }

    setIsSubmitting(true);

    try {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Companies Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">You need to create a company first before posting jobs</p>
        <Button
          onClick={() => router.push("/recruiter/companies")}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
        >
          Go to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background effects */}
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
                  <Zap className="w-6 h-6 text-indigo-500" />
                  Post a New Job
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Create a job listing to attract top AI talent
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Job
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
                    <Label htmlFor="title" className="text-sm font-medium mb-1.5 block">
                      <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />
                      Job Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="e.g. Senior AI Engineer, ML Platform Lead"
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  {/* Company & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Company *</Label>
                      <Select
                        value={formData.company_id}
                        onValueChange={(val) => setFormData({ ...formData, company_id: val })}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl">
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
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

                  {/* Job Type & Work Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Job Type *</Label>
                      <Select
                        value={formData.job_type}
                        onValueChange={(val) => setFormData({ ...formData, job_type: val })}
                      >
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
                      <Select
                        value={formData.work_location}
                        onValueChange={(val) => setFormData({ ...formData, work_location: val })}
                      >
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
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/15 dark:to-purple-500/15 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium border border-indigo-200/50 dark:border-indigo-500/20"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="Add a skill (e.g. Python, TensorFlow, React)..."
                        className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSkill}
                        className="rounded-xl border-gray-300 dark:border-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description Editor */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Job Description *
                </Label>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Supports Markdown formatting
                </span>
              </div>
              <JobDescriptionEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Describe the role, responsibilities, requirements, and benefits..."
              />
            </motion.div>

            {/* Bottom action bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex gap-3"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0 h-11"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post Job
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="rounded-xl border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}
