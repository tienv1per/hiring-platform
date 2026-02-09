"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Save, Globe, Image as ImageIcon, Loader2, X, Plus, Tag,
  Sparkles, Eye, Clock, FileText, ChevronDown, ChevronUp
} from "lucide-react";
import { blogApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";

const BlogEditor = dynamic(() => import("@/components/BlogEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[500px] bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex items-center justify-center">
      <Sparkles className="w-5 h-5 animate-pulse text-indigo-500" />
      <span className="ml-2 text-gray-400">Loading editor...</span>
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditBlogPage() {
  const { isAuthenticated, userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [currentStatus, setCurrentStatus] = useState("draft");

  const [showMeta, setShowMeta] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== "admin")) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, userRole, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, catRes] = await Promise.all([
          blogApi.get(`/api/admin/blogs?page=1&page_size=100`),
          blogApi.get("/api/categories"),
        ]);

        setCategories(catRes.data.categories || []);

        const blogs = blogRes.data.blogs || [];
        const blog = blogs.find((b: any) => b.id === blogId);

        if (blog) {
          setTitle(blog.title || "");
          setExcerpt(blog.excerpt || "");
          setCoverImageUrl(blog.cover_image_url || "");
          setCategoryId(blog.category_id || "");
          setTags(blog.tags || []);
          setCurrentStatus(blog.status || "draft");

          if (blog.slug) {
            try {
              const contentRes = await blogApi.get(`/api/blogs/${blog.slug}`);
              setContent(contentRes.data.content || "");
            } catch {
              setContent("");
            }
          }
        }
      } catch {
        alert("Failed to load blog data.");
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated && userRole === "admin" && blogId) fetchData();
  }, [blogId, isAuthenticated, userRole]);

  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  }, [content]);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async (status?: string) => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        title,
        content,
        excerpt,
        cover_image_url: coverImageUrl,
        tags,
      };
      if (categoryId) payload.category_id = categoryId;
      if (status) payload.status = status;

      await blogApi.put(`/api/admin/blogs/${blogId}`, payload);
      router.push("/admin/blogs");
    } catch {
      alert("Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-400">Loading blog data...</span>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-400/10 dark:bg-indigo-600/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-400/8 dark:bg-purple-600/6 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  Edit Blog Post
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {currentStatus === "published" ? (
                    <span className="text-green-500">● Published</span>
                  ) : (
                    <span className="text-amber-500">● Draft</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave()}
                disabled={saving}
                className="rounded-xl border-gray-300 dark:border-gray-600"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
              {currentStatus !== "published" && (
                <Button
                  onClick={() => handleSave("published")}
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0"
                >
                  <Globe className="w-4 h-4 mr-2" /> Publish
                </Button>
              )}
            </div>
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog post title..."
              className="w-full text-4xl font-bold bg-transparent border-0 outline-none placeholder-gray-300 dark:placeholder-gray-600 focus:ring-0 tracking-tight"
            />
          </motion.div>

          {/* Meta Fields */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-3"
            >
              <FileText className="w-4 h-4" />
              Post Settings
              {showMeta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showMeta && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <Card className="bg-white/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm">
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Excerpt</label>
                        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="A compelling summary..." rows={2} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"><ImageIcon className="w-3.5 h-3.5 inline mr-1.5" /> Cover Image URL</label>
                          <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Category</label>
                          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                            <option value="">Select category</option>
                            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"><Tag className="w-3.5 h-3.5 inline mr-1.5" /> Tags</label>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/15 dark:to-purple-500/15 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium border border-indigo-200/50 dark:border-indigo-500/20">
                              {tag}
                              <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add a tag..." className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm flex-1" />
                          <Button variant="outline" size="sm" onClick={addTag} className="rounded-xl"><Plus className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Editor */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Content Editor
              </label>
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{wordCount} words</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime} min read</span>
              </div>
            </div>
            <BlogEditor content={content} onChange={setContent} />
          </motion.div>

          {/* Cover Image Preview */}
          <AnimatePresence>
            {coverImageUrl && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mt-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Cover Image Preview</p>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                  <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {title && (<div className="absolute bottom-4 left-4 right-4"><h2 className="text-white text-xl font-bold drop-shadow-lg">{title}</h2></div>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
