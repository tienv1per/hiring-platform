"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Building2, Brain, Rocket, Shield, Users, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "For individuals exploring AI-powered job matching.",
    price: { monthly: 0, annual: 0 },
    highlight: false,
    badge: null,
    icon: Sparkles,
    color: "gray",
    features: [
      "50 AI Matches / month",
      "Basic Resume Analysis",
      "5 AI Career Guide queries",
      "Email Support",
      "Community Access",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    description: "For serious job seekers who want the competitive edge.",
    price: { monthly: 29, annual: 24 },
    highlight: true,
    badge: "Most Popular",
    icon: Zap,
    color: "indigo",
    features: [
      "Unlimited AI Matches",
      "Advanced Resume DNA Analysis",
      "Unlimited AI Career Guide",
      "Priority Job Alerts",
      "Interview Prep AI",
      "LinkedIn Profile Optimizer",
      "Priority Support",
    ],
    cta: "Start 14-Day Trial",
  },
  {
    name: "Enterprise",
    description: "For teams and organizations hiring at scale.",
    price: { monthly: 199, annual: 166 },
    highlight: false,
    badge: "For Teams",
    icon: Building2,
    color: "purple",
    features: [
      "Everything in Pro",
      "Unlimited Team Seats",
      "Custom AI Model Training",
      "ATS Integration (Greenhouse, Lever)",
      "Dedicated Success Manager",
      "API Access",
      "SLA & Compliance (SOC2, GDPR)",
      "White-label Options",
    ],
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    q: "How does the AI matching work?",
    a: "Our Gemini-powered engine vectorizes your resume and job descriptions, finding semantic matches based on skills, experience, and career trajectory—not just keywords.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes! All plans are month-to-month with no long-term contracts. Cancel directly from your dashboard.",
  },
  {
    q: "What's included in 'AI Career Guide'?",
    a: "An interactive AI assistant that analyzes your skills, suggests career paths, identifies skill gaps, and recommends learning resources.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use end-to-end encryption, are SOC2 compliant, and never sell your data. Your resume is yours.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden selection:bg-indigo-500/30">
      
      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm mb-6"
          >
            <Rocket className="w-4 h-4" />
            <span>Simple, Transparent Pricing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Career AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Every plan includes our core AI matching engine. Choose the level of intelligence that fits your ambition.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 p-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Annual <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="pb-24">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 border transition-all ${
                  plan.highlight
                    ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-105 z-10"
                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                    plan.highlight 
                      ? "bg-indigo-600 text-white" 
                      : "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  plan.color === "indigo" ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                  plan.color === "purple" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400" :
                  "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                }`}>
                  <plan.icon className="w-6 h-6" />
                </div>

                {/* Plan Info */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 h-12">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold">
                    ${billingCycle === "annual" ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/ month</span>
                  {billingCycle === "annual" && plan.price.annual > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Billed annually</div>
                  )}
                </div>

                {/* CTA */}
                <Button 
                  className={`w-full mb-8 h-12 text-base rounded-xl ${
                    plan.highlight 
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                      : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${
                        plan.highlight ? "text-indigo-600 dark:text-indigo-400" : "text-green-600 dark:text-green-400"
                      }`} />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI STATS */}
      <section className="py-16 bg-gray-50 dark:bg-white/5 border-y border-gray-200 dark:border-white/10">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2M+", label: "AI Matches Made" },
              { value: "98%", label: "Match Accuracy" },
              { value: "10x", label: "Faster Hiring" },
              { value: "500K+", label: "Active Users" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-indigo-50 dark:from-indigo-950/20 to-white dark:to-[#030711]">
        <div className="container px-4 text-center">
          <Brain className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to let AI work for you?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands who've already upgraded their job search with intelligent matching.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-500 text-white">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
