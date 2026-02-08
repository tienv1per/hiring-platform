"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, ArrowRight, CheckCircle2, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroAI() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Find a Senior React Developer with Fintech experience...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-[#030711] dark:to-[#050A15] pt-20">
      
      {/* Background Gradients - Light Mode: Softer, Pastel */}
      <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/30 dark:bg-cyan-600/10 rounded-full blur-[100px]" />
          {/* Grid pattern - lighter in light mode */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      </div>

      <div className="container relative z-10 px-4 text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>The First Agentic Hiring Platform</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight"
        >
          Stop Searching. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">
            Start Matching.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12"
        >
          Traditional job boards are broken. Our AI Agents verify skills, schedule interviews, and find your perfect match while you sleep.
        </motion.p>

        {/* AI Input Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-3xl mx-auto mb-12"
        >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 dark:opacity-30" />
            <div className="relative bg-white dark:bg-[#0A0F1C] border border-gray-200 dark:border-white/10 rounded-2xl p-2 flex items-center shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/5">
                <div className="p-3">
                    <Bot className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1 text-left px-2 font-mono text-gray-700 dark:text-gray-300 text-lg border-r-2 border-indigo-500/50 animate-pulse">
                    {typedText}
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 px-6">
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
            
            {/* Floating "Match Found" Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 2.5 }}
                className="absolute -right-8 -bottom-16 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-2xl text-left w-64 hidden md:block"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Perfect Match</div>
                        <div className="text-xs text-green-600 dark:text-green-400">98% Compatibility</div>
                    </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Found 3 candidates matching "Senior React" + "Fintech"</div>
            </motion.div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center"
        >
            <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    Get Started Free
                </Button>
            </Link>
            <Link href="/about">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                    How it works
                </Button>
            </Link>
        </motion.div>

      </div>
    </section>
  );
}
