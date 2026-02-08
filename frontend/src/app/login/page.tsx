"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, Brain, Sparkles, Shield, Zap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error("Login failed", {
          description: "Invalid email or password",
        });
      } else {
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });
        router.refresh();
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Visual & Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-cyan-400/20 rounded-full blur-[60px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-white max-w-lg space-y-8"
        >
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Recruitment</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl leading-tight">
            Find the perfect match <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">faster than ever.</span>
          </h1>
          
          {/* Description */}
          <p className="text-lg text-white/80">
            Join thousands of companies and job seekers using our AI platform to connect with the right opportunities.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Instant Matching</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Shield className="w-4 h-4 text-green-300" />
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Smart Insights</span>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  U{i}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                +2k
              </div>
            </div>
            <p className="text-sm text-white/70 mt-3 font-medium">Trusted by leading teams worldwide</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto w-full max-w-md space-y-8"
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-12 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 h-12 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Don&apos;t have an account? </span>
            <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign up for free
            </Link>
          </div>
          
          {/* AI Footer */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span>Powered by advanced AI matching</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
