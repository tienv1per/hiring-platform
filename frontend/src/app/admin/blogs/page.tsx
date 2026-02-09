"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus, Edit, Trash2, Eye, FileText, Loader2, Search, Filter, MoreVertical, Globe, EyeOff
} from "lucide-react";
import { blogApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  author_name: string;
  category_name: string;
  status: string;
  read_time: number;
  views_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  archived: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
};

export default function AdminBlogsPage() {
  const { isAuthenticated, userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== "admin")) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, userRole, router]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), page_size: "20" });
        if (statusFilter) params.set("status", statusFilter);
        const res = await blogApi.get(`/api/admin/blogs?${params}`);
        setBlogs(res.data.blogs || []);
        setTotalPages(res.data.total_pages || 1);
        setTotal(res.data.total || 0);
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && userRole === "admin") fetchBlogs();
  }, [page, statusFilter, isAuthenticated, userRole]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setDeletingId(id);
    try {
      await blogApi.delete(`/api/admin/blogs/${id}`);
      setBlogs(blogs.filter(b => b.id !== id));
      setTotal(total - 1);
    } catch {
      alert("Failed to delete blog.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      await blogApi.patch(`/api/admin/blogs/${id}/publish`, { status: newStatus });
      setBlogs(blogs.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch {
      alert("Failed to update blog status.");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filteredBlogs = blogs.filter(b =>
    !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold">Blog Management</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{total} total posts</p>
            </div>
            <Link href="/admin/blogs/new">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                <Plus className="w-4 h-4 mr-2" />
                New Blog Post
              </Button>
            </Link>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blog posts..."
                className="w-full pl-10 pr-4 h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {["", "published", "draft", "archived"].map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-4 py-2 text-sm rounded-xl transition-all ${
                    statusFilter === status
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-500"
                  }`}
                >
                  {status === "" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Blog List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredBlogs.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first blog post to get started.</p>
                <Link href="/admin/blogs/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" /> Create Post
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-xl hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Cover thumbnail */}
                        {blog.cover_image_url ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                            <img src={blog.cover_image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-indigo-500" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{blog.title}</h3>
                            <Badge className={`text-xs border-0 flex-shrink-0 ${STATUS_STYLES[blog.status]}`}>
                              {blog.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {blog.category_name && <span>{blog.category_name}</span>}
                            <span>{formatDate(blog.updated_at)}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {blog.views_count}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleTogglePublish(blog.id, blog.status)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title={blog.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {blog.status === "published" ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Globe className="w-4 h-4 text-emerald-500" />
                            )}
                          </button>
                          <Link href={`/admin/blogs/${blog.id}/edit`}>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                          </Link>
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            disabled={deletingId === blog.id}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            {deletingId === blog.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-xl"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-xl"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
