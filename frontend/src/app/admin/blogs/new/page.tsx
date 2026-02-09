"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Save, Globe, Image as ImageIcon, Loader2, X, Plus, Tag
} from "lucide-react";
import { blogApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  EditorRoot,
  EditorContent,
  type JSONContent,
  StarterKit,
} from "novel";
import Placeholder from "@tiptap/extension-placeholder";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreateBlogPage() {
  const { isAuthenticated, userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== "admin")) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, userRole, router]);

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

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!content.trim()) {
      alert("Content is required");
      return;
    }

    setSaving(true);
    try {
      await blogApi.post("/api/admin/blogs", {
        title,
        content,
        excerpt,
        cover_image_url: coverImageUrl,
        category_id: categoryId || undefined,
        tags,
        status,
      });
      router.push("/admin/blogs");
    } catch (err) {
      alert("Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated || userRole !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-300/15 dark:bg-indigo-600/10 rounded-full blur-[150px]" />
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
              <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">Create New Blog Post</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="rounded-xl"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave("published")}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                Publish
              </Button>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog post title..."
              className="w-full text-3xl font-bold bg-transparent border-0 outline-none placeholder-gray-300 dark:placeholder-gray-600 focus:ring-0"
            />
          </motion.div>

          {/* Meta fields */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl mb-6">
              <CardContent className="p-5 space-y-4">
                {/* Excerpt */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary for blog listing..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cover Image URL */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Cover Image URL
                    </label>
                    <Input
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    <Tag className="w-3.5 h-3.5 inline mr-1" /> Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Add a tag..."
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addTag} className="rounded-xl">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Novel Editor */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="novel-editor-wrapper">
                  <EditorRoot>
                    <EditorContent
                      extensions={[
                        StarterKit,
                        Placeholder.configure({
                          placeholder: "Start writing your blog post...",
                        }),
                      ]}
                      initialContent={{
                        type: "doc",
                        content: [{ type: "paragraph" }],
                      }}
                      onUpdate={({ editor }) => {
                        if (editor) {
                          setContent(editor.getHTML());
                        }
                      }}
                      className="min-h-[500px] w-full border-0 p-4"
                    />
                  </EditorRoot>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cover Image Preview */}
          {coverImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Cover Image Preview:</p>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
