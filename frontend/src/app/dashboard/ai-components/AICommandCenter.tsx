"use client";

import { motion } from "framer-motion";
import { Sparkles, Search, ArrowRight, Command } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AICommandCenterProps {
  userName: string;
}

export function AICommandCenter({ userName }: AICommandCenterProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 md:py-20 px-4">
      {/* Refined Background Glow - Softer & More Spread Out */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[180%] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 blur-[100px] rounded-full pointer-events-none opacity-60 dark:opacity-40" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center space-y-8"
      >
        {/* AI Greeting / Badge */}
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wide uppercase">
              AI Career Companion
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Unlock your next <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient-x">
              career breakthrough.
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-light leading-relaxed">
            Good morning, {userName}. I've curated <span className="font-semibold text-gray-900 dark:text-gray-100">3 new opportunities</span> fitting your expertise.
          </p>
        </div>

        {/* Premium Input Field (Perplexity/Raycast inspired) */}
        <div className="relative max-w-2xl mx-auto group">
            {/* Animated focus ring */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 transition duration-500 ${isFocused ? 'opacity-30 blur-md' : 'group-hover:opacity-20 blur-sm'}`} />
            
            <div className={`relative flex items-center bg-white dark:bg-gray-900/90 backdrop-blur-2xl border transition-all duration-300 rounded-2xl shadow-xl overflow-hidden p-2 ${isFocused ? 'border-indigo-500/50 dark:border-indigo-400/50 ring-4 ring-indigo-500/10' : 'border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-white/20'}`}>
                
                <div className="pl-4 pr-3 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                    <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-indigo-500 dark:text-indigo-400' : ''}`} />
                </div>
                
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask anything... 'Find high-paying React jobs'"
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-lg px-2 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium h-full"
                />
                
                <div className="hidden md:flex items-center gap-2 px-3">
                     {/* Keyboard shortcut hint */}
                    <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 font-medium border border-gray-200 dark:border-gray-700">
                        <Command className="w-3 h-3" /> K
                    </div>
                </div>

                <Button 
                    size="icon" 
                    className={`h-11 w-11 shrink-0 rounded-xl shadow-lg transition-all duration-300 ${query.length > 0 ? 'bg-blue-600 hover:bg-blue-500 text-white scale-100 opacity-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 scale-95 opacity-80'}`}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
          
          {/* Quick Suggestions - Elegant Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {[
              "Find remote frontend roles",
              "Analyze my resume score",
              "Salary for Senior Devs"
            ].map((suggestion, i) => (
              <button 
                key={i}
                className="px-4 py-2 text-sm font-medium rounded-full bg-white/40 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 text-gray-600 dark:text-gray-400 transition-all backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5"
                onClick={() => setQuery(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
