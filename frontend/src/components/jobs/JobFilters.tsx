"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by job title, skills, or keywords..."
            value={filters.keyword}
            onChange={(e) => onFilterChange("keyword", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={onSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Location</label>
          <Input
            placeholder="City or remote"
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Job Type</label>
          <Select value={filters.job_type} onValueChange={(value) => onFilterChange("job_type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Work Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Work Location</label>
          <Select value={filters.work_location} onValueChange={(value) => onFilterChange("work_location", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
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
