"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus, Link as LinkIcon,
  Eye, Edit3, Maximize2, Minimize2
} from "lucide-react";

interface JobDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function JobDescriptionEditor({
  value,
  onChange,
  placeholder,
}: JobDescriptionEditorProps) {
  const [mode, setMode] = useState<"write" | "preview" | "split">("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && mode !== "preview") {
      textarea.style.height = "auto";
      textarea.style.height = Math.max(400, textarea.scrollHeight) + "px";
    }
  }, [value, mode]);

  const wrapSelection = useCallback(
    (before: string, after: string = before) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const newValue =
        value.substring(0, start) + before + selected + after + value.substring(end);
      onChange(newValue);
      // Restore cursor
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = end + before.length;
      }, 0);
    },
    [value, onChange]
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const newValue = value.substring(0, start) + text + value.substring(start);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
      }, 0);
    },
    [value, onChange]
  );

  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
      }, 0);
    },
    [value, onChange]
  );

  // Simple markdown to HTML for preview
  const renderMarkdown = (md: string) => {
    let html = md
      // Headings
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2 text-gray-900 dark:text-white">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-3 text-gray-900 dark:text-white">$1</h1>')
      // Bold & italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 dark:text-indigo-400 underline">$1</a>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-4 border-gray-200 dark:border-gray-700" />')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-indigo-400 pl-4 py-1 my-2 text-gray-600 dark:text-gray-400 italic">$1</blockquote>');

    // Unordered lists
    html = html.replace(
      /^(- .+\n?)+/gm,
      (match) => {
        const items = match
          .trim()
          .split("\n")
          .map((line) => `<li class="ml-4 list-disc text-gray-700 dark:text-gray-300 leading-relaxed">${line.replace(/^- /, "")}</li>`)
          .join("");
        return `<ul class="my-2 space-y-1">${items}</ul>`;
      }
    );

    // Ordered lists
    html = html.replace(
      /^(\d+\. .+\n?)+/gm,
      (match) => {
        const items = match
          .trim()
          .split("\n")
          .map((line) => `<li class="ml-4 list-decimal text-gray-700 dark:text-gray-300 leading-relaxed">${line.replace(/^\d+\. /, "")}</li>`)
          .join("");
        return `<ol class="my-2 space-y-1">${items}</ol>`;
      }
    );

    // Paragraphs — wrap remaining loose lines
    html = html
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        if (
          trimmed.startsWith("<h") ||
          trimmed.startsWith("<ul") ||
          trimmed.startsWith("<ol") ||
          trimmed.startsWith("<li") ||
          trimmed.startsWith("<hr") ||
          trimmed.startsWith("<blockquote") ||
          trimmed.startsWith("</")
        )
          return line;
        return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">${line}</p>`;
      })
      .join("\n");

    return html;
  };

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col"
    : "rounded-2xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 overflow-hidden shadow-sm";

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/50 px-3 py-2">
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* Text formatting */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => wrapSelection("**")}
              title="Bold (⌘B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => wrapSelection("*")}
              title="Italic (⌘I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => wrapSelection("`")}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => insertLinePrefix("# ")}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertLinePrefix("## ")}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertLinePrefix("### ")}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Lists & blocks */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => insertLinePrefix("- ")}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertLinePrefix("1. ")}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertLinePrefix("> ")}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertAtCursor("\n---\n")}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Link */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt("Enter URL:");
                if (url) wrapSelection("[", `](${url})`);
              }}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>
        </div>

        {/* Mode toggles */}
        <div className="flex items-center gap-1 ml-3">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              mode === "write"
                ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 inline mr-1" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all hidden md:flex items-center ${
              mode === "split"
                ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              mode === "preview"
                ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            Preview
          </button>
          <ToolbarDivider />
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className={`flex ${isFullscreen ? "flex-1 overflow-hidden" : ""}`}>
        {/* Write pane */}
        {mode !== "preview" && (
          <div className={`${mode === "split" ? "w-1/2 border-r border-gray-200 dark:border-gray-700/50" : "w-full"} ${isFullscreen ? "overflow-auto" : ""}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "Write your job description using Markdown..."}
              className={`w-full px-5 py-4 bg-transparent text-sm font-mono leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none ${
                isFullscreen ? "h-full" : "min-h-[400px]"
              }`}
              onKeyDown={(e) => {
                // Tab indentation
                if (e.key === "Tab") {
                  e.preventDefault();
                  insertAtCursor("  ");
                }
                // Auto list continuation
                if (e.key === "Enter") {
                  const textarea = textareaRef.current;
                  if (!textarea) return;
                  const pos = textarea.selectionStart;
                  const currentLine = value.substring(
                    value.lastIndexOf("\n", pos - 1) + 1,
                    pos
                  );
                  const bulletMatch = currentLine.match(/^(\s*)(- )/);
                  const numberMatch = currentLine.match(/^(\s*)(\d+)\. /);
                  if (bulletMatch && currentLine.trim() !== "-") {
                    e.preventDefault();
                    insertAtCursor("\n" + bulletMatch[1] + "- ");
                  } else if (numberMatch && currentLine.trim() !== `${numberMatch[2]}.`) {
                    e.preventDefault();
                    const nextNum = parseInt(numberMatch[2]) + 1;
                    insertAtCursor("\n" + numberMatch[1] + nextNum + ". ");
                  }
                }
              }}
            />
          </div>
        )}

        {/* Preview pane */}
        {(mode === "preview" || mode === "split") && (
          <div
            className={`${mode === "split" ? "w-1/2" : "w-full"} px-5 py-4 overflow-auto ${
              isFullscreen ? "h-full" : "min-h-[400px]"
            }`}
          >
            {value.trim() ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                Nothing to preview yet. Start writing in the editor...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="border-t border-gray-200 dark:border-gray-700/50 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30">
        <span>Markdown supported</span>
        <div className="flex gap-3">
          <span>{value.split(/\s+/).filter(Boolean).length} words</span>
          <span>{value.length} chars</span>
          <span>{value.split("\n").length} lines</span>
        </div>
      </div>
    </div>
  );
}

// ---- Toolbar sub-components ----

function ToolbarButton({
  children,
  onClick,
  isActive,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-150 ${
        isActive
          ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1.5" />;
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}
