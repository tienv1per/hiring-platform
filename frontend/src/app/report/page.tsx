"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain, TrendingUp, Users, Target, Zap, ArrowUp, ArrowDown,
  Sparkles, BarChart3, PieChart, Activity, Calendar, Download, RefreshCw,
  Eye, Clock, FileText, Building2, ShieldAlert, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock company name for recruiter
const MOCK_COMPANY = {
  name: "TechVision Labs",
  logo: "T",
};

// Mock data for metrics - company specific
const METRICS = [
  {
    id: "total-applications",
    title: "Total Applications",
    value: "847",
    change: "+18.2%",
    trend: "up" as const,
    icon: FileText,
    description: "Applications received this period",
    color: "indigo",
  },
  {
    id: "ai-matches",
    title: "AI Matches",
    value: "634",
    change: "+24.7%",
    trend: "up" as const,
    icon: Brain,
    description: "Candidates matched by AI",
    color: "purple",
  },
  {
    id: "avg-match-score",
    title: "Avg Match Score",
    value: "82.4%",
    change: "+3.2%",
    trend: "up" as const,
    icon: Target,
    description: "Average AI matching accuracy",
    color: "cyan",
  },
  {
    id: "time-to-hire",
    title: "Time to Hire",
    value: "12.3 days",
    change: "-22.1%",
    trend: "down" as const,
    icon: Clock,
    description: "Average days from apply to hire",
    color: "emerald",
  },
  {
    id: "interview-rate",
    title: "Interview Rate",
    value: "41.2%",
    change: "+8.5%",
    trend: "up" as const,
    icon: Users,
    description: "Matched candidates interviewed",
    color: "amber",
  },
];

// Mock data for charts - company specific
const APPLICATION_TREND = [
  { month: "Aug", applications: 82, matches: 54 },
  { month: "Sep", applications: 105, matches: 72 },
  { month: "Oct", applications: 128, matches: 89 },
  { month: "Nov", applications: 152, matches: 112 },
  { month: "Dec", applications: 138, matches: 98 },
  { month: "Jan", applications: 189, matches: 134 },
  { month: "Feb", applications: 215, matches: 162 },
];

const MATCH_DISTRIBUTION = [
  { label: "90-100%", value: 22, color: "bg-emerald-500" },
  { label: "80-89%", value: 38, color: "bg-indigo-500" },
  { label: "70-79%", value: 25, color: "bg-purple-500" },
  { label: "60-69%", value: 11, color: "bg-amber-500" },
  { label: "<60%", value: 4, color: "bg-gray-400" },
];

const TOP_SKILLS = [
  { skill: "React", count: 234, percentage: 78 },
  { skill: "TypeScript", count: 189, percentage: 63 },
  { skill: "Node.js", count: 172, percentage: 57 },
  { skill: "AWS", count: 154, percentage: 51 },
  { skill: "Python", count: 138, percentage: 46 },
];

const RECENT_INSIGHTS = [
  {
    type: "trend",
    message: "Application volume for Senior Engineer roles increased 32% this week",
    time: "2 hours ago",
  },
  {
    type: "anomaly",
    message: "Unusually high match rate for Full Stack Developer positions",
    time: "5 hours ago",
  },
  {
    type: "recommendation",
    message: "Consider adding remote work options to attract more qualified candidates",
    time: "1 day ago",
  },
];

export default function ReportPage() {
  const { isAuthenticated, userRole, isLoading, user } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const maxApplications = Math.max(...APPLICATION_TREND.map(d => d.applications));

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Please sign in to access the analytics dashboard.
          </p>
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl w-full">
              Sign In
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Not a recruiter - access denied
  if (userRole !== "recruiter") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This page is only available for recruiters. The analytics dashboard shows company-specific hiring metrics and insights.
          </p>
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl w-full">
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Header */}
      <section className="relative z-10 pt-28 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Building2 className="w-4 h-4" />
                <span>Company Report for <strong className="text-gray-900 dark:text-white">{MOCK_COMPANY.name}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Badge */}
      <section className="relative z-10 pb-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 bg-white dark:bg-gray-800/90 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {MOCK_COMPANY.logo}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Viewing analytics for</p>
              <p className="font-semibold">{MOCK_COMPANY.name}</p>
            </div>
            <Badge className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-0">
              <Brain className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="relative z-10 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {METRICS.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        metric.color === "indigo" ? "bg-indigo-100 dark:bg-indigo-500/20" :
                        metric.color === "purple" ? "bg-purple-100 dark:bg-purple-500/20" :
                        metric.color === "cyan" ? "bg-cyan-100 dark:bg-cyan-500/20" :
                        metric.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-500/20" :
                        "bg-amber-100 dark:bg-amber-500/20"
                      }`}>
                        <metric.icon className={`w-5 h-5 ${
                          metric.color === "indigo" ? "text-indigo-600 dark:text-indigo-400" :
                          metric.color === "purple" ? "text-purple-600 dark:text-purple-400" :
                          metric.color === "cyan" ? "text-cyan-600 dark:text-cyan-400" :
                          metric.color === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
                          "text-amber-600 dark:text-amber-400"
                        }`} />
                      </div>
                      <Badge className={`text-xs ${
                        metric.trend === "up" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      }`}>
                        {metric.trend === "up" ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{metric.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="relative z-10 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Application Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Your Application Trend
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500" />
                        Applications
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500" />
                        AI Matches
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Simple Bar Chart */}
                  <div className="h-64 flex items-end gap-2">
                    {APPLICATION_TREND.map((data) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-1 h-52 items-end justify-center">
                          <div 
                            className="w-5 bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400"
                            style={{ height: `${(data.applications / maxApplications) * 100}%` }}
                            title={`Applications: ${data.applications}`}
                          />
                          <div 
                            className="w-5 bg-purple-500 rounded-t-sm transition-all hover:bg-purple-400"
                            style={{ height: `${(data.matches / maxApplications) * 100}%` }}
                            title={`Matches: ${data.matches}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Match Score Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Match Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Horizontal Bar Distribution */}
                  <div className="space-y-4">
                    {MATCH_DISTRIBUTION.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="relative z-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Top Skills in Your Applicants
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {TOP_SKILLS.map((skill, index) => (
                      <div key={skill.skill} className="flex items-center gap-4">
                        <span className="w-6 text-center text-sm font-medium text-gray-400">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{skill.skill}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {skill.count.toLocaleString()} candidates
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    AI-Powered Insights for {MOCK_COMPANY.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {RECENT_INSIGHTS.map((insight, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl"
                      >
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                          insight.type === "trend" ? "bg-emerald-100 dark:bg-emerald-500/20" :
                          insight.type === "anomaly" ? "bg-amber-100 dark:bg-amber-500/20" :
                          "bg-indigo-100 dark:bg-indigo-500/20"
                        }`}>
                          {insight.type === "trend" ? (
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : insight.type === "anomaly" ? (
                            <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">{insight.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{insight.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* AI Summary Box */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">AI Analysis Summary</span>
                    </div>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400/80">
                      Your company&apos;s hiring pipeline at {MOCK_COMPANY.name} is performing 18% better than last month. 
                      AI matching accuracy continues to improve, with 60% of matched candidates progressing to interviews. 
                      Consider focusing on Full Stack Developer roles where match rates are exceptionally high.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
