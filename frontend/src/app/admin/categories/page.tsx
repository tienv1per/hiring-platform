"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Edit, Trash2, Loader2, FolderOpen, ArrowLeft, Save, X
} from "lucide-react";
import { blogApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function AdminCategoriesPage() {
  const { isAuthenticated, userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== "admin")) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, userRole, router]);

  const fetchCategories = async () => {
    try {
      const res = await blogApi.get("/api/categories");
      setCategories(res.data.categories || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userRole === "admin") fetchCategories();
  }, [isAuthenticated, userRole]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName("");
    setFormDescription("");
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormDescription(cat.description || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      alert("Category name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await blogApi.put(`/api/admin/categories/${editingId}`, {
          name: formName,
          description: formDescription,
        });
        setCategories(categories.map(c => c.id === editingId ? res.data : c));
      } else {
        const res = await blogApi.post("/api/admin/categories", {
          name: formName,
          description: formDescription,
        });
        setCategories([...categories, res.data]);
      }
      resetForm();
    } catch {
      alert("Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Blogs in this category will lose their category assignment.")) return;
    setDeletingId(id);
    try {
      await blogApi.delete(`/api/admin/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch {
      alert("Failed to delete category.");
    } finally {
      setDeletingId(null);
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
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/admin/blogs")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Blog Categories</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{categories.length} categories</p>
              </div>
            </div>
            {!showForm && (
              <Button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4 mr-2" /> New Category
              </Button>
            )}
          </motion.div>

          {/* Create/Edit Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl mb-6">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{editingId ? "Edit Category" : "New Category"}</h3>
                    <button onClick={resetForm} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Name</label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Category name"
                        className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Brief description..."
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {editingId ? "Update" : "Create"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Categories List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : categories.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-2xl">
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Create your first category to organize blog posts.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50 rounded-xl hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{cat.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {cat.description || "No description"} • /{cat.slug}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={deletingId === cat.id}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            {deletingId === cat.id ? (
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
        </div>
      </div>
    </div>
  );
}
