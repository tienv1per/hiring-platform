"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, Calendar, Clock, ArrowLeft, Brain, Sparkles,
  Share2, Bookmark, ThumbsUp
} from "lucide-react";

// Tag colors map (pastel colors)
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

// Mock blog content data
const BLOG_CONTENT: Record<string, {
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readTime: string;
  author: string;
  content: string;
}> = {
  "how-ai-revolutionizing-hiring-2026": {
    title: "How AI is Revolutionizing the Hiring Process in 2026",
    excerpt: "Discover how artificial intelligence is transforming recruitment, from resume screening to candidate matching.",
    tags: ["AI", "Machine Learning", "Hiring"],
    date: "Feb 5, 2026",
    readTime: "8 min read",
    author: "Sarah Chen",
    content: `
## I. Introduction

The hiring landscape has undergone a dramatic transformation in the past few years. What was once a manual, time-consuming process of sifting through resumes and conducting countless interviews has evolved into an intelligent, data-driven operation powered by artificial intelligence.

In 2026, AI is no longer a futuristic concept in recruitment—it's the standard. Companies that haven't adopted AI-powered hiring tools find themselves at a significant competitive disadvantage, struggling to identify top talent before their competitors.

### The Scale of the Problem

Consider these numbers:
- The average corporate job posting receives **250+ applications**
- HR teams spend approximately **23 hours** screening resumes for a single hire
- **75%** of resumes never reach human eyes due to keyword-based filtering

This is where AI steps in to transform the process.

## II. Core AI Technologies in Recruitment

### 1. Natural Language Processing (NLP)

Modern AI hiring systems use advanced NLP to understand the \`context\` and \`meaning\` behind job descriptions and resumes, not just keywords. This enables:

- **Semantic matching**: Understanding that "machine learning engineer" and "ML specialist" refer to similar roles
- **Skill inference**: Recognizing that experience with TensorFlow implies knowledge of deep learning
- **Cultural fit analysis**: Analyzing writing style and communication patterns

### 2. Predictive Analytics

AI systems can now predict:
- Candidate success probability
- Time-to-hire optimization
- Retention likelihood scores

\`\`\`
Success Score = f(Skills Match, Experience Relevance, Cultural Fit, Growth Potential)
\`\`\`

### 3. Computer Vision for Resume Parsing

Advanced OCR and computer vision algorithms can:
- Extract information from any resume format (PDF, DOC, image)
- Understand complex layouts and formatting
- Identify key sections automatically

## III. Benefits for Employers

1. **Reduced Time-to-Hire**: From weeks to days
2. **Improved Quality of Hire**: Data-driven decisions
3. **Elimination of Bias**: When properly designed
4. **Cost Savings**: Up to 70% reduction in screening costs

## IV. Benefits for Job Seekers

- **Fairer Evaluation**: Skills-based assessment
- **Faster Feedback**: Automated status updates
- **Better Matches**: More relevant job recommendations
- **Transparent Process**: Clear criteria for selection

## V. The Future Ahead

As we look beyond 2026, the integration of AI in hiring will only deepen. We're seeing early experiments with:

- **AI Interview Assistants**: Real-time coaching during interviews
- **Predictive Career Pathing**: AI suggesting career moves years in advance
- **Continuous Skill Assessment**: Always-on evaluation beyond the resume

The companies that embrace these technologies thoughtfully—balancing efficiency with humanity—will define the future of work.

## VI. References

1. LinkedIn Talent Solutions Study, 2026
2. "AI in HR" - McKinsey Global Report
3. Harvard Business Review - "The Algorithm-Driven Workplace"
    `
  },
  "semantic-job-matching-algorithm": {
    title: "The Science Behind Our Semantic Job Matching Algorithm",
    excerpt: "A deep dive into how our AI understands the nuances of job requirements and candidate profiles.",
    tags: ["NLP", "Algorithms", "Backend"],
    date: "Feb 3, 2026",
    readTime: "12 min read",
    author: "David Park",
    content: `
## I. Introduction

At HireAI, our matching algorithm is the core of what we do. Unlike traditional keyword-based systems, we use semantic understanding to create meaningful connections between candidates and opportunities.

This article provides a technical deep-dive into how our matching system works.

### Preliminary Concepts

Before diving in, let's establish some key concepts:

- **Embedding**: A dense vector representation of text
- **Similarity Score**: A measure of how close two embeddings are
- **Transformer Models**: Neural networks that understand context

## II. The Matching Pipeline

### 1. Document Embedding

We convert both job descriptions and resumes into high-dimensional vectors using transformer-based models:

\`\`\`python
def embed_document(text: str) -> np.ndarray:
    tokens = tokenizer.encode(text)
    embeddings = model.encode(tokens)
    return pooling(embeddings)  # 768-dim vector
\`\`\`

### 2. Semantic Similarity Calculation

We use cosine similarity to measure how well a candidate matches a job:

\`\`\`
similarity(A, B) = (A · B) / (||A|| × ||B||)
\`\`\`

### 3. Multi-Factor Scoring

Our final match score incorporates multiple signals:

| Factor | Weight | Description |
|--------|--------|-------------|
| Skills Match | 40% | Technical skill alignment |
| Experience | 25% | Years and relevance |
| Education | 15% | Degree requirements |
| Culture Fit | 20% | Values alignment |

## III. Version Control and Updates

Our model is continuously improved through:

1. **A/B Testing**: Comparing new models against production
2. **Feedback Loops**: Incorporating hire/reject signals
3. **Bias Monitoring**: Regular fairness audits

## IV. Performance Metrics

Current system performance:

- **Precision@10**: 78% (matching quality)
- **Recall@100**: 92% (coverage)
- **Average Response Time**: <200ms

## V. Conclusion

Semantic matching represents a paradigm shift in recruitment technology. By understanding meaning rather than just keywords, we create more meaningful connections between talent and opportunity.

## VI. References

1. Devlin et al., "BERT: Pre-training of Deep Bidirectional Transformers"
2. Reimers & Gurevych, "Sentence-BERT"
3. Internal HireAI Research Papers
    `
  },
  "optimize-resume-ai-screening": {
    title: "5 Ways to Optimize Your Resume for AI Screening",
    excerpt: "Learn practical tips to ensure your resume stands out when reviewed by AI-powered applicant tracking systems.",
    tags: ["Career Tips", "Resume", "Job Search"],
    date: "Jan 28, 2026",
    readTime: "6 min read",
    author: "Emily Rodriguez",
    content: `
## I. Introduction

In 2026, your resume will almost certainly be reviewed by an AI system before it reaches a human recruiter. Understanding how these systems work is crucial for job seekers who want to advance in their careers.

Here are five proven strategies to optimize your resume for AI screening.

## II. The 5 Key Strategies

### 1. Use Standard Section Headers

AI systems are trained to recognize conventional resume sections:

✅ **Do Use:**
- "Work Experience" or "Professional Experience"
- "Education"
- "Skills"
- "Summary" or "Professional Summary"

❌ **Avoid:**
- "My Journey"
- "Career Highlights"
- "What I Bring to the Table"

### 2. Include Relevant Keywords Naturally

Modern AI can detect keyword stuffing, so integrate terms naturally:

\`\`\`
BAD:  Python Python Python developer with Python
GOOD: Senior Python developer with 5 years experience building scalable applications
\`\`\`

### 3. Quantify Your Achievements

AI systems are excellent at parsing numbers and metrics:

| Weak | Strong |
|------|--------|
| "Improved sales" | "Increased sales by 45% over 6 months" |
| "Managed a team" | "Led a team of 12 engineers across 3 time zones" |

### 4. Use Clean, Simple Formatting

AI parsing works best with:
- Standard fonts (Arial, Calibri, Times New Roman)
- Clear section breaks
- No tables, text boxes, or complex layouts
- PDF or DOCX format

### 5. Tailor for Each Application

Even with AI, customization matters:

1. Read the job description carefully
2. Identify key requirements
3. Mirror relevant language in your resume
4. Highlight matching experiences prominently

## III. Common Mistakes to Avoid

- **Images or graphics**: AI can't parse these
- **Creative layouts**: May confuse the parser
- **Abbreviations without context**: Write "JavaScript (JS)" not just "JS"
- **Multi-column layouts**: Can scramble the reading order

## IV. Testing Your Resume

Use our free AI Resume Analyzer tool to:
- See how AI reads your resume
- Get a match score for specific jobs
- Identify areas for improvement

## V. Conclusion

Optimizing for AI doesn't mean losing your personality. It means presenting your qualifications in a format that machines can understand while still telling your unique story.

## VI. References

1. HireAI Resume Analysis Report, 2026
2. SHRM Best Practices Guide
3. "Getting Past the Bots" - Forbes
    `
  },
  "diverse-teams-ai-recruitment": {
    title: "Building Diverse Teams with AI-Powered Recruitment",
    excerpt: "How companies are using AI to reduce unconscious bias and build more inclusive workplaces.",
    tags: ["DEI", "AI Ethics", "Hiring"],
    date: "Jan 22, 2026",
    readTime: "10 min read",
    author: "Michael Johnson",
    content: `
## I. Introduction

Diversity, Equity, and Inclusion (DEI) has become a strategic priority for organizations worldwide. Yet despite good intentions, unconscious bias continues to permeate traditional hiring processes.

AI offers a promising solution—but only when designed and deployed thoughtfully.

## II. The Bias Problem in Traditional Hiring

Research shows persistent patterns:

- Resumes with "white-sounding" names receive **50% more callbacks**
- Women are **35% less likely** to be referred for executive roles
- Age bias begins affecting candidates as early as **35 years old**

### Sources of Bias

1. **Affinity Bias**: Preferring candidates similar to ourselves
2. **Halo Effect**: One positive trait influencing overall perception
3. **Confirmation Bias**: Seeking information that confirms initial impressions

## III. How AI Can Help

### 1. Blind Resume Screening

AI can evaluate candidates without access to:
- Names
- Photos
- Age indicators
- Address/zip code

\`\`\`
Candidate Profile:
- Skills: [Python, ML, AWS]
- Experience: 7 years
- Education: MS Computer Science
- Match Score: 87%
\`\`\`

### 2. Structured Evaluation

AI enforces consistent criteria across all candidates:

| Criterion | Weight | Assessment |
|-----------|--------|------------|
| Technical Skills | 30% | Code assessment score |
| Problem Solving | 25% | Case study evaluation |
| Communication | 20% | Writing sample analysis |
| Experience Fit | 25% | Role alignment score |

### 3. Bias Detection

Modern AI systems can identify and flag:
- Biased language in job descriptions
- Disparate impact in hiring patterns
- Outlier decisions that may indicate bias

## IV. Responsible AI Implementation

### Key Principles

1. **Audit Regularly**: Test for disparate impact across demographic groups
2. **Human Oversight**: AI should assist, not replace, human judgment
3. **Transparency**: Be clear about how AI is used
4. **Continuous Improvement**: Update models based on outcomes

### Warning Signs

- Models trained on historical biased data
- Lack of diverse representation in AI development teams
- No regular fairness testing

## V. Case Study: TechCorp's Transformation

After implementing AI-powered blind screening:
- **42% increase** in diverse candidates reaching interviews
- **28% improvement** in diverse hires
- **No change** in performance ratings of new hires

## VI. Conclusion

AI is not inherently fair or unfair—it reflects the intentions and data of its creators. When designed with equity in mind, AI can be a powerful tool for building truly inclusive organizations.

## VII. References

1. "Algorithms of Oppression" - Safiya Noble
2. Bertrand & Mullainathan, "Are Emily and Greg More Employable Than Lakisha and Jamal?"
3. HireAI DEI Impact Report, 2025
    `
  },
  "future-remote-work-ai-talent": {
    title: "The Future of Remote Work: AI-Driven Talent Discovery",
    excerpt: "Explore how AI is enabling companies to find the best talent globally, regardless of location.",
    tags: ["Remote Work", "Trends", "Future of Work"],
    date: "Jan 15, 2026",
    readTime: "7 min read",
    author: "Lisa Wang",
    content: `
## I. Introduction

The pandemic of the early 2020s permanently reshaped how we think about work. What started as a necessity became a preference—and now, it's an expectation.

In 2026, AI is the engine powering the global remote work revolution.

## II. The State of Remote Work

### Current Statistics

- **68%** of knowledge workers work remotely at least part-time
- **47%** of companies hire talent internationally
- **$15 trillion** estimated market value of remote work tools

### Geographic Distribution

The traditional tech hubs are giving way to a more distributed workforce:

| Region | Growth in Remote Workers (2020-2026) |
|--------|--------------------------------------|
| Southeast Asia | +340% |
| Latin America | +280% |
| Eastern Europe | +220% |
| Africa | +195% |

## III. AI's Role in Global Talent Discovery

### 1. Cross-Language Matching

AI enables companies to find talent regardless of language:

\`\`\`python
def match_across_languages(job_desc: str, resume: str) -> float:
    job_embedding = universal_encoder.encode(job_desc)
    resume_embedding = universal_encoder.encode(resume)
    return cosine_similarity(job_embedding, resume_embedding)
\`\`\`

### 2. Timezone Optimization

Smart scheduling AI helps distributed teams collaborate:

- Identifies optimal meeting times across zones
- Suggests asynchronous workflows
- Predicts collaboration bottlenecks

### 3. Cultural Context Understanding

AI can assess:
- Communication style preferences
- Work hour expectations
- Holiday and availability patterns

## IV. Challenges and Solutions

### Challenge: Trust at a Distance

**Solution**: AI-powered productivity insights that focus on outcomes, not hours.

### Challenge: Legal Complexity

**Solution**: Automated compliance checking for:
- Tax obligations
- Employment law requirements
- Benefits and contractor classifications

### Challenge: Cultural Misalignment

**Solution**: AI cultural coaching and onboarding personalization.

## V. The Companies Leading the Way

Organizations fully embracing distributed AI-powered hiring:

1. **Automattic** (WordPress): 1,700+ employees, 96 countries
2. **GitLab**: 1,500+ employees, 67 countries
3. **Zapier**: 500+ employees, 40+ countries

## VI. What This Means for You

### For Companies

- Access to 10x larger talent pool
- Reduced real estate costs
- Improved employee satisfaction

### For Professionals

- Location independence
- Global career opportunities
- Work-life integration

## VII. The Future Outlook

By 2030, we predict:
- 80% of companies will have globally distributed teams
- AI will handle 90% of cross-border employment compliance
- "Office-first" will be the minority approach

## VIII. References

1. "Remote Work Revolution" - Harvard Business School
2. FlexJobs Annual Survey, 2026
3. Gartner Future of Work Trends
    `
  }
};

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const article = BLOG_CONTENT[slug];
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
          <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Article Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The article you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative">
      {/* Vignette/Glow Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/2 right-0 w-[400px] h-[400px] bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-[120px] translate-x-1/2" />
      </div>

      {/* Breadcrumbs */}
      <div className="relative z-10 pt-24 pb-4">
        <div className="container mx-auto px-4">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{article.title}</span>
          </motion.nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="relative z-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Article Card with Glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Glow Effect Behind Card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-[2rem] blur-2xl opacity-50" />
              
              <Card className="relative bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 md:p-12">
                  {/* Header */}
                  <header className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          className={`text-xs font-medium border-0 ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700"}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight font-serif">
                      {article.title}
                    </h1>
                    
                    {/* Excerpt */}
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      {article.excerpt}
                    </p>
                    
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{article.author}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {article.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </span>
                    </div>
                  </header>
                  
                  {/* AI Insight Box */}
                  <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">AI Summary</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400/80">
                          This article explores how AI technology is transforming the recruitment industry, 
                          covering key concepts, practical applications, and future implications for both employers and job seekers.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Article Content */}
                  <article className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:font-serif
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed
                    prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-700/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:rounded-xl prose-pre:shadow-lg
                    prose-ul:text-gray-600 dark:prose-ul:text-gray-400
                    prose-ol:text-gray-600 dark:prose-ol:text-gray-400
                    prose-li:marker:text-indigo-500
                    prose-table:border-collapse prose-table:w-full
                    prose-th:bg-gray-100 dark:prose-th:bg-gray-700 prose-th:p-3 prose-th:text-left prose-th:font-semibold
                    prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:p-3
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:rounded-r-xl
                  ">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(article.content) }} />
                  </article>
                  
                  {/* Footer Actions */}
                  <footer className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Helpful
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                      <Link href="/blog">
                        <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Blog
                        </Button>
                      </Link>
                    </div>
                  </footer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper function to format markdown-like content to HTML
function formatContent(content: string): string {
  return content
    // Headers
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    // Tables (simplified)
    .replace(/\|(.*)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => c.trim().match(/^[-]+$/))) return '';
      const isHeader = cells.some(c => c.includes('---'));
      if (isHeader) return '';
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hpuolt])/gm, '<p>')
    // Checkmarks
    .replace(/✅/g, '<span class="text-green-500">✅</span>')
    .replace(/❌/g, '<span class="text-red-500">❌</span>');
}
