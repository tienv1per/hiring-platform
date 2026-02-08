"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Star, Search, Globe, ArrowRight, Briefcase, Brain, Sparkles, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  company_size?: string;
  founded_year?: number;
  headquarters?: string;
  rating?: number;
}

export default function CompaniesListPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await jobApi.get("/api/companies/all");
        setCompanies(response.data || []);
        setFilteredCompanies(response.data || []);
      } catch (error) {
        console.error("Failed to load companies:", error);
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCompanies(
        companies.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.industry?.toLowerCase().includes(query) ||
            c.headquarters?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, companies]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto rounded-xl" />
            <Skeleton className="h-4 w-96 mx-auto rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/4 w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/4 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-400/10 dark:bg-cyan-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm font-medium">
            <Brain className="w-4 h-4" />
            <span>AI-Curated Employers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">Companies</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            AI analyzes company culture, growth trajectory, and employee sentiment to match you with inclusive workplaces.
          </p>

          {/* AI Search Bar */}
          <div className="relative max-w-lg mx-auto mt-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 dark:opacity-30" />
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center gap-3 shadow-xl p-2">
              <Brain className="ml-3 h-5 w-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by culture, industry, values..."
                className="flex-1 py-4 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium placeholder:font-normal"
              />
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 h-10">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </motion.div>

        {/* AI Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          {[
            { icon: Building2, value: filteredCompanies.length, label: "Companies", color: "text-indigo-600 dark:text-indigo-400" },
            { icon: TrendingUp, value: "4.2", label: "Avg Rating", color: "text-yellow-600 dark:text-yellow-400" },
            { icon: Shield, value: "100%", label: "Verified", color: "text-green-600 dark:text-green-400" },
            { icon: Sparkles, value: "AI", label: "Matched", color: "text-purple-600 dark:text-purple-400" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters / Stats Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {filteredCompanies.length} Companies Available
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sorted by</span>
            <Badge className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              AI Relevance
            </Badge>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-semibold text-xl">No Companies Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-indigo-600 dark:text-indigo-400"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCompanies.map((company, index) => (
              <motion.div variants={itemVariants} key={company.id}>
                <Link href={`/companies/${company.id}`} className="block h-full">
                  <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group overflow-hidden relative rounded-2xl">
                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                      <div className="h-14 w-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-2 shadow-sm group-hover:shadow-md transition-shadow">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-7 w-7 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {company.rating && (
                            <div className="flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-100 dark:border-yellow-500/20">
                              <Star className="h-3 w-3 fill-current mr-1" />
                              {company.rating.toFixed(1)}
                            </div>
                          )}
                          {company.industry && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              • {company.industry}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 min-h-[60px]">
                        {company.description}
                      </p>

                      <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                        {company.headquarters && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate">{company.headquarters}</span>
                          </div>
                        )}
                        {company.company_size && (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span>{company.company_size.split(" ")[0]}</span>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Globe className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate hover:text-indigo-500 transition-colors">
                              {company.website.replace(/^https?:\/\/(www\.)?/, "")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-700/50 mt-auto">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Insights Available
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
