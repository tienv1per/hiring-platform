"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Brain, Search, Github, Linkedin, Globe, Calendar
} from "lucide-react";

// Mock blog articles with AI-focused content
const BLOG_ARTICLES = [
  {
    id: "1",
    slug: "how-ai-revolutionizing-hiring-2026",
    title: "How AI is Revolutionizing the Hiring Process in 2026",
    excerpt: "Discover how artificial intelligence is transforming recruitment, from resume screening to candidate matching, and what it means for both employers and job seekers.",
    tags: ["AI", "Machine Learning", "Hiring"],
    date: "Feb 5, 2026",
  },
  {
    id: "2",
    slug: "semantic-job-matching-algorithm",
    title: "The Science Behind Our Semantic Job Matching Algorithm",
    excerpt: "A deep dive into how our AI understands the nuances of job requirements and candidate profiles to create perfect matches using natural language processing.",
    tags: ["NLP", "Algorithms", "Backend"],
    date: "Feb 3, 2026",
  },
  {
    id: "3",
    slug: "optimize-resume-ai-screening",
    title: "5 Ways to Optimize Your Resume for AI Screening",
    excerpt: "Learn practical tips to ensure your resume stands out when reviewed by AI-powered applicant tracking systems and get more interview callbacks.",
    tags: ["Career Tips", "Resume", "Job Search"],
    date: "Jan 28, 2026",
  },
  {
    id: "4",
    slug: "diverse-teams-ai-recruitment",
    title: "Building Diverse Teams with AI-Powered Recruitment",
    excerpt: "How companies are using AI to reduce unconscious bias and build more inclusive workplaces through data-driven, fair hiring decisions.",
    tags: ["DEI", "AI Ethics", "Hiring"],
    date: "Jan 22, 2026",
  },
  {
    id: "5",
    slug: "future-remote-work-ai-talent",
    title: "The Future of Remote Work: AI-Driven Talent Discovery",
    excerpt: "Explore how AI is enabling companies to find the best talent globally, regardless of location, and what this means for the future of distributed work.",
    tags: ["Remote Work", "Trends", "Future of Work"],
    date: "Jan 15, 2026",
  }
];

// Tag colors map (pastel colors like reference)
const TAG_COLORS: Record<string, string> = {
  "AI": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "Machine Learning": "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  "Hiring": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "NLP": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "Algorithms": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "Backend": "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  "Career Tips": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "Resume": "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  "Job Search": "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "DEI": "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  "AI Ethics": "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "Remote Work": "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  "Trends": "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300",
  "Future of Work": "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
};

// Get all unique tags with counts
const getAllTags = () => {
  const tagCounts: Record<string, number> = {};
  BLOG_ARTICLES.forEach(article => {
    article.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return tagCounts;
};

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tagCounts = getAllTags();

  const filteredArticles = BLOG_ARTICLES.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || article.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative">
      {/* Vignette/Glow Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Hero Section - Centered */}
      <section className="relative pt-28 pb-12 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Title with serif-style */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              HireAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Blog</span>
            </h1>
            
            {/* Bio */}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Insights on AI-powered recruitment, career tips, and the future of hiring. 
              We share research, experiences, and lessons learned from building intelligent matching systems. 
              Thanks for stopping by!
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Link 
                href="https://github.com" 
                target="_blank"
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm"
              >
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank"
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm"
              >
                <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link 
                href="/" 
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm"
              >
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
            </div>

            {/* Post count */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{BLOG_ARTICLES.length}</span> posts
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="relative z-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Left - Articles */}
            <div className="space-y-6">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/blog/${article.slug}`}>
                    <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all cursor-pointer group backdrop-blur-sm">
                      <CardContent className="p-6">
                        {/* Title */}
                        <h2 className="text-xl font-bold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                          {article.title}
                        </h2>
                        
                        {/* Excerpt */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                          {article.excerpt}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              className={`text-xs font-medium border-0 ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{article.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}

              {filteredArticles.length === 0 && (
                <div className="text-center py-16">
                  <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter.</p>
                </div>
              )}
            </div>

            {/* Right - Sidebar */}
            <div className="space-y-6">
              {/* Search */}
              <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="pl-10 h-11 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags Cloud */}
              <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tagCounts).map(([tag, count]) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                          selectedTag === tag
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                            : TAG_COLORS[tag] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        } hover:scale-105`}
                      >
                        {tag} <span className="opacity-60">({count})</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Archive */}
              <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Archive</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">2026</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {["Jan", "Feb"].map((month) => (
                          <button
                            key={month}
                            className="text-xs font-medium px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Powered Notice */}
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-4 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold">AI-Powered Insights</h3>
                  </div>
                  <p className="text-sm text-white/80">
                    Our blog articles are researched and curated to help you understand the future of AI in recruitment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
