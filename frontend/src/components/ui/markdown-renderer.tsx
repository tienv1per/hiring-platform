"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      <style jsx global>{`
        .markdown-content {
          font-size: 1rem;
          line-height: 1.75;
          color: inherit;
        }

        /* Headings */
        .markdown-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 0;
          color: hsl(var(--foreground));
          letter-spacing: -0.025em;
        }

        .markdown-content h2 {
          font-size: 1.375rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground));
          padding-bottom: 0.5rem;
          border-bottom: 1px solid hsl(var(--border));
        }

        .markdown-content h2:first-child {
          margin-top: 0;
        }

        .markdown-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        /* Paragraphs */
        .markdown-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: hsl(var(--muted-foreground));
        }

        .markdown-content p:last-child {
          margin-bottom: 0;
        }

        /* Lists */
        .markdown-content ul {
          list-style-type: disc;
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .markdown-content ol {
          list-style-type: decimal;
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .markdown-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          color: hsl(var(--muted-foreground));
          padding-left: 0.25rem;
        }

        .markdown-content li::marker {
          color: hsl(var(--primary));
          font-weight: 500;
        }

        /* Nested lists */
        .markdown-content li ul,
        .markdown-content li ol {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
          margin-left: 0.5rem;
        }

        /* Links */
        .markdown-content a {
          color: hsl(212 100% 50%);
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.15s;
        }

        .markdown-content a:hover {
          text-decoration: underline;
          opacity: 0.8;
        }

        /* Bold & Italic */
        .markdown-content strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .markdown-content em {
          font-style: italic;
        }

        /* Blockquotes */
        .markdown-content blockquote {
          margin: 1.5rem 0;
          padding: 0.75rem 1rem;
          padding-left: 1.25rem;
          border-left: 4px solid hsl(var(--primary));
          background-color: hsl(var(--muted));
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .markdown-content blockquote p {
          margin: 0;
          font-style: italic;
        }

        /* Code */
        .markdown-content code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.875em;
          background-color: hsl(var(--muted));
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
        }

        .markdown-content pre {
          background-color: hsl(var(--muted));
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.25rem 0;
        }

        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
        }

        /* Horizontal rule */
        .markdown-content hr {
          margin: 2rem 0;
          border: none;
          border-top: 1px solid hsl(var(--border));
        }

        /* Tables */
        .markdown-content table {
          width: 100%;
          margin: 1.5rem 0;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .markdown-content th,
        .markdown-content td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid hsl(var(--border));
        }

        .markdown-content th {
          font-weight: 600;
          background-color: hsl(var(--muted));
        }

        /* First/Last element margin fixes */
        .markdown-content > *:first-child {
          margin-top: 0;
        }

        .markdown-content > *:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
