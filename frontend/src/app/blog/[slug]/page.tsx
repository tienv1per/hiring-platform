"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, ArrowLeft, Eye, Loader2, User, List
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
  "Vector Search": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "Embeddings": "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "Semantic AI": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "Talent Acquisition": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "Resume AI": "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  "Job Seekers": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "Paper Notes": "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
};

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  author_id: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  tags: string[];
  read_time: number;
  views_count: number;
  published_at: string;
  created_at: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>("");
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await blogApi.get(`/api/blogs/${slug}`);
        setBlog(res.data);
      } catch {
        setError("Blog post not found.");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  // Extract headings from content for TOC
  const tocItems = useMemo<TocItem[]>(() => {
    if (!blog?.content) return [];
    const parser = typeof window !== "undefined" ? new DOMParser() : null;
    if (!parser) return [];
    const doc = parser.parseFromString(blog.content, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3");
    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const text = heading.textContent?.trim() || "";
      if (!text) return;
      const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      const level = parseInt(heading.tagName[1]);
      items.push({ id, text, level });
    });
    return items;
  }, [blog?.content]);

  // Inject IDs into the actual rendered content
  const processedContent = useMemo(() => {
    if (!blog?.content || tocItems.length === 0) return blog?.content || "";
    let content = blog.content;
    const parser = typeof window !== "undefined" ? new DOMParser() : null;
    if (!parser) return content;
    const doc = parser.parseFromString(content, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3");
    let tocIndex = 0;
    headings.forEach((heading) => {
      const text = heading.textContent?.trim() || "";
      if (!text) return;
      if (tocIndex < tocItems.length) {
        heading.setAttribute("id", tocItems[tocIndex].id);
        tocIndex++;
      }
    });
    return doc.body.innerHTML;
  }, [blog?.content, tocItems]);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    // Observe all headings after a small delay (let DOM render)
    const timer = setTimeout(() => {
      tocItems.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.observe(el);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [tocItems]);

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading article...</span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog post not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "The article you're looking for doesn't exist."}</p>
        <Link href="/blog">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const hasToc = tocItems.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative">
      {/* Glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-20">
        <div className={`container mx-auto px-4 ${hasToc ? "max-w-6xl" : "max-w-3xl"}`}>
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Header — full width */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 ${hasToc ? "max-w-3xl" : ""}`}
          >
            {blog.category_name && (
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-0">
                {blog.category_name}
              </Badge>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight tracking-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.published_at || blog.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blog.read_time} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views_count} views</span>
              </div>
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
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
          </motion.header>

          {/* Cover Image — full width */}
          {blog.cover_image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`relative w-full aspect-video rounded-2xl overflow-hidden mb-10 ${hasToc ? "max-w-3xl" : ""}`}
            >
              <Image
                src={blog.cover_image_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Two-column layout: Content + TOC */}
          <div className={`${hasToc ? "flex gap-8" : ""}`}>
            {/* Main content */}
            <motion.article
              ref={articleRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:rounded-xl
                prose-blockquote:border-l-indigo-500
                prose-strong:text-gray-900 dark:prose-strong:text-white
                ${hasToc ? "flex-1 min-w-0" : ""}`}
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Table of Contents — sticky sidebar on the right */}
            {hasToc && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden lg:block w-64 flex-shrink-0"
              >
                <div className="sticky top-28">
                  <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <List className="w-4 h-4 text-indigo-500" />
                      Table of Contents
                    </h3>
                    <nav className="space-y-1">
                      {tocItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToHeading(item.id)}
                          className={`block w-full text-left text-sm transition-all duration-200 rounded-lg px-2 py-1.5 leading-snug ${
                            item.level === 1
                              ? "font-medium"
                              : item.level === 2
                                ? "pl-4"
                                : "pl-7 text-xs"
                          } ${
                            activeId === item.id
                              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-medium"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          {item.text}
                        </button>
                      ))}
                    </nav>

                    {/* Progress indicator */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                        <span>Progress</span>
                        <span>
                          {activeId
                            ? `${Math.round(((tocItems.findIndex((t) => t.id === activeId) + 1) / tocItems.length) * 100)}%`
                            : "0%"}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: activeId
                              ? `${((tocItems.findIndex((t) => t.id === activeId) + 1) / tocItems.length) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </div>

          {/* Back to blog CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
          >
            <Link href="/blog">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to all articles
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
