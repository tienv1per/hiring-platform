"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Info } from "lucide-react";

interface AIMatchBadgeProps {
  score: number;
  reasons: string[];
}

export function AIMatchBadge({ score, reasons }: AIMatchBadgeProps) {
  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 90) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
    if (s >= 70) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20";
    return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
  };

  const colorClass = getColor(score);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-help transition-transform hover:scale-105 ${colorClass}`}>
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{score}% Match</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Why this matches</span>
            </div>
            <ul className="space-y-1.5">
              {reasons.map((reason, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
