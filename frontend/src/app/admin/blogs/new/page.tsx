"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Save, Globe, Image as ImageIcon, Loader2, X, Plus, Tag,
  Sparkles, Eye, Clock, FileText, ChevronDown, ChevronUp,
  Wand2, Lightbulb, Zap
} from "lucide-react";
import { blogApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";

const BlogEditor = dynamic(() => import("@/components/BlogEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[500px] bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex items-center justify-center">
      <Sparkles className="w-5 h-5 animate-pulse text-indigo-500" />
      <span className="ml-2 text-gray-400">Initializing AI-powered editor...</span>
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AI_BLOG_TEMPLATES = [
  {
    title: "How AI is Transforming Talent Acquisition in 2025",
    excerpt: "Explore the cutting-edge AI technologies reshaping how companies find, evaluate, and hire top talent.",
    tags: ["AI", "Talent Acquisition", "Machine Learning"],
    content: `<h2>The AI Revolution in Hiring</h2><p>Artificial intelligence has fundamentally transformed how organizations approach talent acquisition. From intelligent resume parsing to predictive candidate scoring, AI tools are enabling recruiters to make faster, more informed hiring decisions.</p><h2>Key AI Technologies in Recruitment</h2><h3>1. Natural Language Processing (NLP)</h3><p>NLP-powered tools can analyze resumes, cover letters, and candidate responses to extract meaningful insights about skills, experience, and cultural fit. Unlike traditional keyword matching, NLP understands context and semantics.</p><h3>2. Predictive Analytics</h3><p>Machine learning models trained on historical hiring data can predict candidate success, time-to-hire, and retention probability — helping recruiters prioritize the most promising applicants.</p><h3>3. Conversational AI</h3><p>AI chatbots and virtual assistants handle initial candidate screening, schedule interviews, and answer FAQ — reducing time-to-contact by up to 80%.</p><h2>Best Practices for AI-Driven Hiring</h2><ul><li><strong>Ensure fairness:</strong> Regularly audit AI models for bias across demographics</li><li><strong>Human oversight:</strong> Use AI as a decision-support tool, not a replacement for human judgment</li><li><strong>Transparency:</strong> Communicate to candidates when AI is involved in the evaluation process</li><li><strong>Continuous learning:</strong> Feed outcomes back into models to improve accuracy over time</li></ul><h2>The Future: Agentic AI in HR</h2><p>The next wave of AI in HR goes beyond tools — it introduces <strong>agentic AI systems</strong> that can autonomously manage hiring workflows, from sourcing to onboarding, while keeping humans in the loop for critical decisions.</p>`,
  },
  {
    title: "Building Smarter Job Matching with Vector Search",
    excerpt: "Deep dive into how vector embeddings and semantic search create more accurate job-candidate matches than traditional keyword systems.",
    tags: ["Vector Search", "Embeddings", "Semantic AI"],
    content: `<h2>Beyond Keywords: Semantic Job Matching</h2><p>Traditional job boards rely on keyword matching — a fundamentally flawed approach. A candidate searching for "software engineer" might miss perfect roles titled "full-stack developer" or "application architect." Vector search solves this.</p><h2>How Vector Embeddings Work</h2><p>Text embeddings convert job descriptions and resumes into high-dimensional numerical vectors that capture <em>meaning</em>, not just words. Similar concepts cluster together in vector space, enabling true semantic matching.</p><h3>The Technical Stack</h3><pre><code>// Example: Generating embeddings with OpenAI
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Senior React developer with TypeScript experience"
});
// Result: [0.023, -0.041, 0.089, ...] (1536 dimensions)</code></pre><h2>Real-World Impact</h2><blockquote><p>"After switching from keyword to vector-based matching, our platform saw a 3.2x increase in successful job placements and a 45% reduction in time-to-hire." — HireAI Engineering Team</p></blockquote><h2>Implementation Architecture</h2><ul><li><strong>Embedding model:</strong> OpenAI text-embedding-3-small or Cohere embed-v3</li><li><strong>Vector database:</strong> pgvector (PostgreSQL extension) for seamless integration</li><li><strong>Similarity metric:</strong> Cosine similarity with configurable thresholds</li><li><strong>Hybrid approach:</strong> Combine vector search with structured filters (location, salary, experience level)</li></ul>`,
  },
  {
    title: "The Rise of AI Resume Analysis: What Job Seekers Need to Know",
    excerpt: "Understanding how AI-powered resume analyzers evaluate your application and tips to optimize your resume for AI screening.",
    tags: ["Resume AI", "Career Tips", "Job Seekers"],
    content: `<h2>AI is Reading Your Resume — Here's How</h2><p>Over 75% of resumes are now processed by AI systems before a human recruiter ever sees them. Understanding how these systems work gives you a significant competitive advantage.</p><h2>How AI Resume Analyzers Work</h2><h3>Step 1: Parsing</h3><p>AI extracts structured data from your resume: contact info, work history, education, skills, and certifications. Modern parsers understand varied formats, layouts, and even handle OCR for scanned documents.</p><h3>Step 2: Skill Extraction & Matching</h3><p>NLP models identify hard skills (Python, AWS, Kubernetes) and soft skills (leadership, communication). These are mapped against the job requirements using semantic similarity — not just exact matches.</p><h3>Step 3: Scoring & Ranking</h3><p>Each candidate receives a compatibility score based on skill overlap, experience relevance, education alignment, and additional factors like career trajectory and industry fit.</p><h2>Tips to Optimize Your Resume for AI</h2><ol><li><strong>Use standard section headers</strong> — "Experience," "Education," "Skills" are easiest for AI to parse</li><li><strong>Include relevant keywords naturally</strong> — Don't stuff, but ensure key technical terms appear</li><li><strong>Quantify achievements</strong> — AI models weight measurable outcomes higher</li><li><strong>Use a clean format</strong> — Avoid tables, columns, and heavy graphics that confuse parsers</li><li><strong>Tailor per application</strong> — Customize your resume to match each job description's language</li></ol>`,
  },
];

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

  // UI state
  const [showMeta, setShowMeta] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== "admin")) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, userRole, router]);

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

  // Word count
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
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

  const applyTemplate = (template: (typeof AI_BLOG_TEMPLATES)[0]) => {
    setTitle(template.title);
    setExcerpt(template.excerpt);
    setTags(template.tags);
    setContent(template.content);
    setShowTemplates(false);
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
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
    } catch {
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
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-400/10 dark:bg-indigo-600/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-400/8 dark:bg-purple-600/6 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-400/5 dark:bg-cyan-600/4 rounded-full blur-[120px]" />
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
                  Create Blog Post
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Share AI insights with the HireAI community
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="rounded-xl border-gray-300 dark:border-gray-600"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave("published")}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </motion.div>

          {/* AI Templates */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors group"
            >
              <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              AI Blog Templates — Start with pre-written AI-focused content
              {showTemplates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    {AI_BLOG_TEMPLATES.map((template, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => applyTemplate(template)}
                        className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {i === 0 && <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                          {i === 1 && <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                          {i === 2 && <Lightbulb className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
                          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {template.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {template.excerpt}
                        </p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              placeholder="Your blog post title..."
              className="w-full text-4xl font-bold bg-transparent border-0 outline-none placeholder-gray-300 dark:placeholder-gray-600 focus:ring-0 tracking-tight"
            />
          </motion.div>

          {/* Meta Fields - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6"
          >
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-white/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm">
                    <CardContent className="p-5 space-y-4">
                      {/* Excerpt */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Excerpt
                        </label>
                        <textarea
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="A compelling summary that hooks readers on the blog listing page..."
                          rows={2}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cover Image */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                            <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
                            Cover Image URL
                          </label>
                          <Input
                            value={coverImageUrl}
                            onChange={(e) => setCoverImageUrl(e.target.value)}
                            placeholder="https://res.cloudinary.com/..."
                            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                            Category
                          </label>
                          <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          <Tag className="w-3.5 h-3.5 inline mr-1.5" />
                          Tags
                        </label>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/15 dark:to-purple-500/15 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium border border-indigo-200/50 dark:border-indigo-500/20"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                            placeholder="Add a tag (e.g. AI, Machine Learning, NLP)..."
                            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl text-sm flex-1 focus:ring-2 focus:ring-indigo-500/50"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addTag}
                            className="rounded-xl border-gray-300 dark:border-gray-600"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Editor Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            {/* Editor label */}
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Content Editor
              </label>
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {wordCount} words
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime} min read
                </span>
                <span>{charCount} chars</span>
              </div>
            </div>

            <BlogEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your blog post... Use the toolbar for formatting, or just start typing to share your AI insights."
            />
          </motion.div>

          {/* Cover Image Preview */}
          <AnimatePresence>
            {coverImageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6"
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Cover Image Preview
                </p>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {title && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-white text-xl font-bold drop-shadow-lg">
                        {title}
                      </h2>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Writing Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-100 dark:border-indigo-800/30 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                      Writing Tips for AI-Focused Content
                    </h4>
                    <ul className="text-xs text-indigo-700/70 dark:text-indigo-400/60 space-y-0.5">
                      <li>• Include concrete examples with code snippets or architectural diagrams</li>
                      <li>• Compare AI approaches (e.g., rule-based vs. ML vs. LLM-based solutions)</li>
                      <li>• Add metrics and benchmarks to support your claims</li>
                      <li>• Reference recent papers or industry reports for credibility</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
