"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Star, Search, Globe, ArrowRight, Briefcase } from "lucide-react";
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Background Gradients (Subtle) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
          <Badge variant="outline" className="px-4 py-1 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 mb-4">
            Top Employers
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">Companies</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Discover inclusive workplaces, read employee reviews, and find your next opportunity at the world's best companies.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto mt-8 shadow-lg shadow-blue-500/10 rounded-xl transition-shadow focus-within:shadow-blue-500/20">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name, industry..."
              className="pl-12 py-6 text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:font-normal"
            />
          </div>
        </div>

        {/* Filters / Stats Bar (Simple) */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {filteredCompanies.length} Companies Available
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            Showing all registered companies
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">No Companies Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            <Button 
              variant="link" 
              onClick={() => setSearchQuery("")}
              className="mt-4 text-blue-600"
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
            {filteredCompanies.map((company) => (
              <motion.div variants={itemVariants} key={company.id}>
                <Link href={`/companies/${company.id}`} className="block h-full">
                  <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 group overflow-hidden relative">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                      <div className="h-16 w-16 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-2 shadow-sm group-hover:shadow-md transition-shadow">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors truncate">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {company.rating && (
                            <div className="flex items-center text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
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
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 min-h-[60px]">
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
                            <span className="truncate hover:text-blue-500 transition-colors">
                              {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-6 flex justify-between items-center border-t border-gray-50 dark:border-gray-800/50 mt-auto">
                      <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 -translate-x-2 group-hover:translate-x-0">
                        View Profile <ArrowRight className="h-3 w-3" />
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
