"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Brain, Search, Github, Linkedin, Globe, Calendar, Clock, Eye, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { blogApi } from "@/lib/api";

// Tag colors map
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

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  tags: string[];
  read_time: number;
  views_count: number;
  published_at: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const endpoint = selectedCategory
          ? `/api/blogs/category/${selectedCategory}?page=${page}&page_size=10`
          : `/api/blogs?page=${page}&page_size=10`;
        const res = await blogApi.get(endpoint);
        setBlogs(res.data.blogs || []);
        setTotalPages(res.data.total_pages || 1);
        setTotal(res.data.total || 0);
      } catch {
        // Fallback: use empty array if service unavailable
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page, selectedCategory]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await blogApi.get("/api/categories");
        setCategories(res.data.categories || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Client-side search filter
  const filteredBlogs = blogs.filter((blog) => {
    if (!searchQuery) return true;
    return (
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative">
      {/* Vignette/Glow Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              HireAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Blog</span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Insights on AI-powered recruitment, career tips, and the future of hiring. 
              We share research, experiences, and lessons learned from building intelligent matching systems.
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

            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{total}</span> posts
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
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <span className="ml-3 text-gray-500">Loading articles...</span>
                </div>
              ) : filteredBlogs.length > 0 ? (
                <>
                  {filteredBlogs.map((blog, index) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/blog/${blog.slug}`}>
                        <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all cursor-pointer group backdrop-blur-sm">
                          {blog.cover_image_url && (
                            <div className="relative w-full h-48 overflow-hidden">
                              <Image
                                src={blog.cover_image_url}
                                alt={blog.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardContent className="p-6">
                            {/* Category badge */}
                            {blog.category_name && (
                              <Badge className="mb-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-0 text-xs">
                                {blog.category_name}
                              </Badge>
                            )}

                            {/* Title */}
                            <h2 className="text-xl font-bold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                              {blog.title}
                            </h2>
                            
                            {/* Excerpt */}
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                              {blog.excerpt}
                            </p>
                            
                            {/* Tags */}
                            {blog.tags && blog.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {blog.tags.map((tag) => (
                                  <Badge 
                                    key={tag} 
                                    className={`text-xs font-medium border-0 ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Meta info */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(blog.published_at || blog.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{blog.read_time} min read</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{blog.views_count} views</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="rounded-xl"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                      </Button>
                      <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="rounded-xl"
                      >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
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

              {/* Categories */}
              {categories.length > 0 && (
                <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Categories</h3>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { setSelectedCategory(null); setPage(1); }}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                          !selectedCategory
                            ? "bg-indigo-600 text-white"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        All Posts
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                            selectedCategory === cat.slug
                              ? "bg-indigo-600 text-white"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
