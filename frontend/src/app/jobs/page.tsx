"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { jobApi } from "@/lib/api";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Brain, Sparkles, Zap, ChevronLeft, ChevronRight } from "lucide-react";

interface Job {
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
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    job_type: "all",
    work_location: "all",
    isSemantic: true, // Default to AI-powered search
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 20,
      };

      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.location) params.location = filters.location;
      if (filters.job_type !== "all") params.job_type = filters.job_type;
      if (filters.work_location !== "all") params.work_location = filters.work_location;

      let response;
      if (filters.isSemantic && filters.keyword) {
        response = await jobApi.get("/api/jobs/semantic", {
          params: { q: filters.keyword },
        });
      } else {
        response = await jobApi.get("/api/jobs", { params });
      }

      setJobs(response.data.jobs || []);
      const total = response.data.count || 0;
      setTotalPages(Math.ceil(total / 20) || 1);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      
      {/* HERO SECTION */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-cyan-200/20 dark:bg-cyan-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="container relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm mb-6">
              <Brain className="w-4 h-4" />
              <span>AI-Powered Job Discovery</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Perfect Match</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our semantic AI understands what you <em>really</em> want—not just keywords.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              isSemantic={filters.isSemantic}
              onSemanticToggle={(enabled) => setFilters((prev) => ({ ...prev, isSemantic: enabled }))}
            />
          </motion.div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      <section className="pb-24 bg-gray-50 dark:bg-transparent">
        <div className="container px-4">
          {/* Results Header */}
          <div className="flex justify-between items-center py-6 border-b border-gray-200 dark:border-white/10 mb-8">
            <div className="flex items-center gap-3">
              {filters.isSemantic && filters.keyword && (
                <span className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Semantic Search Active
                </span>
              )}
              <h2 className="text-2xl font-semibold">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  `${jobs.length} Jobs Found`
                )}
              </h2>
            </div>
          </div>

          {/* Job List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-500/50 border-t-indigo-500 animate-spin" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">AI is analyzing opportunities...</p>
            </div>
          ) : jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10"
            >
              <Zap className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No jobs found matching your criteria</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your filters or use different keywords</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center gap-4 mt-12"
            >
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-11 px-5 rounded-xl border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-gray-600 dark:text-gray-400 font-medium px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-11 px-5 rounded-xl border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
