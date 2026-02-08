"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Star, Search, Globe } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

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
        // Fetch all companies from the public endpoint
        const response = await jobApi.get("/api/companies/all");
        setCompanies(response.data || []);
        setFilteredCompanies(response.data || []);
      } catch (error) {
        console.error("Failed to load companies:", error);
        // Fallback: try fetching each seeded company by ID
        const seededIds = [
          "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a",
          "2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b",
          "3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c",
          "4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d",
          "5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e",
          "6f6f6f6f-6f6f-6f6f-6f6f-6f6f6f6f6f6f",
          "70707070-7070-7070-7070-707070707070",
          "80808080-8080-8080-8080-808080808080",
          "90909090-9090-9090-9090-909090909090",
          "a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0",
        ];
        const fetchedCompanies: Company[] = [];
        for (const id of seededIds) {
          try {
            const res = await jobApi.get(`/api/companies/${id}`);
            if (res.data) fetchedCompanies.push(res.data);
          } catch {
            // Ignore individual failures
          }
        }
        setCompanies(fetchedCompanies);
        setFilteredCompanies(fetchedCompanies);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Companies</h1>
          <p className="text-lg text-white/80 mb-8">Discover amazing companies and find your dream workplace</p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, industry, or location..."
              className="pl-12 py-6 text-lg bg-white text-gray-900 border-0 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{filteredCompanies.length} Companies</h2>
        </div>

        {filteredCompanies.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No Companies Found</h3>
            <p className="text-muted-foreground mt-1">Try a different search term</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link href={`/companies/${company.id}`} key={company.id}>
                <Card className="h-full hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group overflow-hidden">
                  {/* Card Header with gradient */}
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    <div className="absolute -bottom-8 left-4">
                      <div className="h-16 w-16 rounded-xl border-4 border-white dark:border-gray-800 bg-white shadow-md flex items-center justify-center overflow-hidden">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain p-2" />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-12 pb-6">
                    <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{company.name}</h3>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.industry && (
                        <Badge variant="secondary" className="text-xs">{company.industry}</Badge>
                      )}
                      {company.rating && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {company.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{company.description}</p>

                    <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                      {company.headquarters && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {company.headquarters}
                        </span>
                      )}
                      {company.company_size && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {company.company_size.split(" ")[0]}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
