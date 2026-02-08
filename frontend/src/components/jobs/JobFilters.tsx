"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Brain, Sparkles } from "lucide-react";

interface JobFiltersProps {
  filters: {
    keyword: string;
    location: string;
    job_type: string;
    work_location: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onSearch: () => void;
  isSemantic: boolean;
  onSemanticToggle: (enabled: boolean) => void;
}

export function JobFilters({ filters, onFilterChange, onSearch, isSemantic, onSemanticToggle }: JobFiltersProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 dark:opacity-30" />
        <div className="relative bg-white dark:bg-[#0A0F1C] border border-gray-200 dark:border-white/10 rounded-2xl p-2 flex items-center shadow-xl">
          <div className="p-3">
            <Brain className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <Input
            placeholder="Describe your ideal job... e.g., 'Senior React developer at a fintech startup'"
            value={filters.keyword}
            onChange={(e) => onFilterChange("keyword", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="flex-1 border-0 bg-transparent text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={onSearch}
            className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* AI Toggle + Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Semantic Toggle */}
        <button
          onClick={() => onSemanticToggle(!isSemantic)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isSemantic
              ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
              : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isSemantic ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
          {isSemantic ? "AI Semantic Search Active" : "Enable AI Search"}
        </button>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {/* Location */}
          <div className="w-40">
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
              className="h-10 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-sm"
            />
          </div>

          {/* Job Type */}
          <Select value={filters.job_type} onValueChange={(value) => onFilterChange("job_type", value)}>
            <SelectTrigger className="w-36 h-10 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-sm">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0A0F1C] border-gray-200 dark:border-white/10 rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>

          {/* Work Location */}
          <Select value={filters.work_location} onValueChange={(value) => onFilterChange("work_location", value)}>
            <SelectTrigger className="w-36 h-10 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-sm">
              <SelectValue placeholder="Work Location" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0A0F1C] border-gray-200 dark:border-white/10 rounded-xl">
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
