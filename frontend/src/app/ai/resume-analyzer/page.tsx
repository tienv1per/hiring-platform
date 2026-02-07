"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { utilityApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, FileSearch, CheckCircle2, AlertCircle } from "lucide-react";

interface AnalysisResult {
  ats_score: number;
  feedback: string;
  suggestions: string[];
}

export default function ResumeAnalyzerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [formData, setFormData] = useState({
    resume_text: "",
    job_description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await utilityApi.post("/api/ai/resume-analyze", formData);
      setResult(response.data);
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to analyze resume");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <FileSearch className="h-10 w-10 text-purple-600" />
            AI Resume Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get ATS score and feedback for your resume
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Resume Input */}
          <Card>
            <CardHeader>
              <CardTitle>Your Resume</CardTitle>
              <CardDescription>Paste your resume text here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.resume_text}
                onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
                rows={20}
                placeholder="Paste your resume text here..."
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Job Description Input */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Paste the job description you're applying for</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.job_description}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                rows={20}
                placeholder="Paste the job description here..."
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.resume_text || !formData.job_description}
            size="lg"
            className="w-full lg:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <FileSearch className="mr-2 h-5 w-5" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* ATS Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  ATS Score
                  <Badge className={getScoreColor(result.ats_score) + " text-2xl py-2 px-4 border-0"}>
                    {result.ats_score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      result.ats_score >= 80
                        ? "bg-green-600"
                        : result.ats_score >= 60
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${result.ats_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {result.feedback}
                </p>
              </CardContent>
            </Card>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
