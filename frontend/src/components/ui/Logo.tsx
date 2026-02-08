import { Brain } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", container: "w-8 h-8", text: "text-lg" },
    md: { icon: "w-8 h-8", container: "w-10 h-10", text: "text-xl" },
    lg: { icon: "w-10 h-10", container: "w-14 h-14", text: "text-2xl" },
  };

  const { icon, container, text } = sizes[size];

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className={`${container} rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
        <Brain className={`${icon} text-white`} />
      </div>
      {showText && (
        <span className={`${text} font-bold text-gray-900 dark:text-white`}>
          Hire<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">AI</span>
        </span>
      )}
    </Link>
  );
}
