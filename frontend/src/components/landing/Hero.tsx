"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-20 lg:pt-32 pb-16">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -ml-[40rem] -mt-[20rem] h-[60rem] w-[80rem] opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-normal animate-pulse" />
      </div>
      <div className="absolute top-0 right-0 -mr-[20rem] -mt-[10rem] h-[50rem] w-[60rem] opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-cyan-400 to-emerald-400 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-normal" />
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              <span>AI-Powered Job Matching v2.0</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Future of Hiring is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
              Intelligent
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Stop searching, start matching. Our AI analyzes your skills and preferences
            to connect you with opportunities that actually fit.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-shadow">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto bg-background/50 backdrop-blur-sm">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats / Social Proof */}
          <motion.div
            className="pt-12 grid grid-cols-2 gap-8 md:grid-cols-4 text-center w-full max-w-4xl border-t border-border/50 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              { label: "Active Jobs", value: "10k+" },
              { label: "Companies", value: "500+" },
              { label: "Matches Made", value: "50k+" },
              { label: "Success Rate", value: "92%" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
