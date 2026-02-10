"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, Users, Search, Loader2, Sparkles, Brain, Zap, Shield,
  ArrowRight, ChevronDown, CheckCircle2, AlertTriangle,
  TrendingUp, Globe, Briefcase, X, UserCheck, Link2
} from "lucide-react";
import { jobApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_pic_url: string;
  company_count: number;
}

interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  logo_url: string;
  industry: string;
  company_size: string;
  headquarters: string;
  rating: number;
  recruiter_id: string;
  recruiter_name: string;
  recruiter_email: string;
  job_count: number;
  created_at: string;
}

interface Stats {
  total_users: number;
  total_recruiters: number;
  total_companies: number;
  unassigned_companies: number;
  total_jobs: number;
}

export default function AdminCompaniesPage() {
  const { isAuthenticated, userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "unassigned">("all");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [recruiterSearch, setRecruiterSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== "admin")) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, userRole, router]);

  useEffect(() => {
    if (isAuthenticated && userRole === "admin") {
      fetchAll();
    }
  }, [isAuthenticated, userRole]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, companiesRes, recruitersRes] = await Promise.all([
        jobApi.get("/api/admin/stats"),
        jobApi.get("/api/admin/companies"),
        jobApi.get("/api/admin/recruiters"),
      ]);
      setStats(statsRes.data);
      setCompanies(companiesRes.data?.companies || []);
      setRecruiters(recruitersRes.data?.recruiters || []);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCompany || !selectedRecruiter) return;
    setAssigning(true);
    try {
      await jobApi.put(`/api/admin/companies/${selectedCompany.id}/assign`, {
        recruiter_id: selectedRecruiter,
      });
      toast.success(`Company "${selectedCompany.name}" assigned successfully!`);
      setAssignModalOpen(false);
      setSelectedCompany(null);
      setSelectedRecruiter("");
      fetchAll();
    } catch (error) {
      console.error("Assignment failed:", error);
      toast.error("Failed to assign company");
    } finally {
      setAssigning(false);
    }
  };

  const openAssignModal = (company: Company) => {
    setSelectedCompany(company);
    setSelectedRecruiter(company.recruiter_id || "");
    setRecruiterSearch("");
    setAssignModalOpen(true);
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.recruiter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "assigned" && c.recruiter_id) ||
      (filterStatus === "unassigned" && !c.recruiter_id);
    return matchesSearch && matchesFilter;
  });

  const filteredRecruiters = recruiters.filter(
    (r) =>
      !recruiterSearch ||
      r.name.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(recruiterSearch.toLowerCase())
  );

  const unassignedCount = companies.filter((c) => !c.recruiter_id).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated || userRole !== "admin") return null;

  const statCards = [
    {
      label: "Total Companies",
      value: stats?.total_companies || 0,
      icon: Building2,
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-100 dark:bg-indigo-500/10",
    },
    {
      label: "Active Recruiters",
      value: stats?.total_recruiters || 0,
      icon: Users,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      label: "Unassigned",
      value: stats?.unassigned_companies || 0,
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-100 dark:bg-amber-500/10",
    },
    {
      label: "Total Jobs",
      value: stats?.total_jobs || 0,
      icon: Briefcase,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-300/15 dark:bg-cyan-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  AI Company Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Intelligent recruiter-company matching & assignment
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stat Cards */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              {statCards.map((stat, i) => (
                <div
                  key={stat.label}
                  className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 group hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                      <stat.icon
                        className="w-4 h-4"
                        style={{
                          color: i === 0 ? "#6366f1" : i === 1 ? "#10b981" : i === 2 ? "#f59e0b" : "#8b5cf6",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* AI Suggestions Banner */}
          {!loading && unassignedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25 flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Smart Suggestion
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      {unassignedCount} {unassignedCount === 1 ? "company has" : "companies have"} no recruiter assigned.
                      Review and assign them to ensure all companies are actively managed.
                    </p>
                    <button
                      onClick={() => setFilterStatus("unassigned")}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                    >
                      View unassigned companies <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies, recruiters, industries..."
                className="w-full pl-10 pr-4 h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "assigned", "unassigned"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 text-sm rounded-xl transition-all ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-500"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === "unassigned" && unassignedCount > 0 && (
                    <span className="ml-1.5 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                      {unassignedCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Company List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
                  <Brain className="absolute inset-0 m-auto w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI is analyzing company data...</p>
              </div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No companies found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try changing your search or filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-xl hover:shadow-lg hover:shadow-indigo-500/5 transition-all group overflow-hidden">
                    {/* Gradient accent line based on assignment status */}
                    <div
                      className={`h-0.5 ${
                        company.recruiter_id
                          ? "bg-gradient-to-r from-emerald-500 to-green-400"
                          : "bg-gradient-to-r from-amber-500 to-orange-400"
                      }`}
                    />
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        {/* Company Logo */}
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-2" />
                          ) : (
                            <Building2 className="w-6 h-6 text-indigo-500" />
                          )}
                        </div>

                        {/* Company Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{company.name}</h3>
                            {company.recruiter_id ? (
                              <Badge className="text-xs border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Assigned
                              </Badge>
                            ) : (
                              <Badge className="text-xs border-0 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 flex-shrink-0">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Unassigned
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            {company.industry && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" /> {company.industry}
                              </span>
                            )}
                            {company.company_size && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {company.company_size}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {company.job_count} jobs
                            </span>
                            {company.headquarters && (
                              <span className="truncate max-w-[150px]">📍 {company.headquarters}</span>
                            )}
                          </div>
                        </div>

                        {/* Recruiter Assignment */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right hidden md:block">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Recruiter</p>
                            <p className={`text-sm font-medium ${company.recruiter_id ? "" : "text-amber-600 dark:text-amber-400"}`}>
                              {company.recruiter_id ? company.recruiter_name : "None"}
                            </p>
                            {company.recruiter_email && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">
                                {company.recruiter_email}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openAssignModal(company)}
                            className={`rounded-xl text-xs gap-1.5 ${
                              company.recruiter_id
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 border border-gray-200 dark:border-gray-600"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            {company.recruiter_id ? "Reassign" : "Assign"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assignModalOpen && selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAssignModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        {selectedCompany.recruiter_id ? "Reassign" : "Assign"} Company
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a recruiter for <span className="font-medium text-gray-700 dark:text-gray-300">{selectedCompany.name}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssignModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Company Info */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                    {selectedCompany.logo_url ? (
                      <img src={selectedCompany.logo_url} alt="" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <Building2 className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedCompany.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedCompany.industry || "No industry"} · {selectedCompany.job_count} jobs
                    </p>
                  </div>
                </div>
              </div>

              {/* Recruiter Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={recruiterSearch}
                    onChange={(e) => setRecruiterSearch(e.target.value)}
                    placeholder="Search recruiters..."
                    className="w-full pl-10 pr-4 h-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Recruiter List */}
              <div className="overflow-y-auto max-h-[300px] p-2">
                {filteredRecruiters.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No recruiters found</p>
                  </div>
                ) : (
                  filteredRecruiters.map((recruiter) => (
                    <button
                      key={recruiter.id}
                      onClick={() => setSelectedRecruiter(recruiter.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        selectedRecruiter === recruiter.id
                          ? "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {recruiter.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{recruiter.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{recruiter.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {recruiter.company_count} {recruiter.company_count === 1 ? "company" : "companies"}
                        </span>
                        {selectedRecruiter === recruiter.id && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Action logged by AI audit system</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignModalOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAssign}
                    disabled={!selectedRecruiter || assigning}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 gap-1.5"
                  >
                    {assigning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {assigning ? "Assigning..." : "Confirm Assignment"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
