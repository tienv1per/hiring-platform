"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Cpu, MessageSquare, Shield, Zap, Globe, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030711] text-white overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. HERO SECTION: "The Neural Network" */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20">
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-200">The Intelligence Behind Your Career</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50"
          >
            Hiring at the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient-xy">
              Speed of Thought
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            We've rebuilt the hiring stack from the ground up using 
            <span className="text-indigo-400 font-semibold"> Agentic AI</span>. 
            No more keyword matching. Bringing semantic understanding to the job market.
          </motion.p>
          
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.6 }}
           >
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-indigo-500/20">
                 Explore the Technology <Cpu className="ml-2 w-5 h-5" />
              </Button>
           </motion.div>
        </div>
      </section>

      {/* 2. THE CORE: Tech Stack Visualization */}
      <section className="py-24 relative overflow-hidden">
          <div className="container px-4">
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Inside the <span className="text-indigo-400">Core</span></h2>
                  <p className="text-xl text-gray-500">How our Gemini-powered engine processes millions of data points.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2 z-0" />

                  {[
                      { icon: Globe, title: "Global Ingestion", desc: "Real-time vectorization of millions of job posts and resume profiles.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                      { icon: Brain, title: "Semantic Neural Match", desc: "Our Gemini wrapper understands context, soft skills, and career trajectories.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
                      { icon: Zap, title: "Instant Connection", desc: "Predictive matching connects candidates before they even search.", color: "text-purple-400", bg: "bg-purple-500/10" }
                  ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="relative z-10 bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group"
                      >
                          <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                              <item.icon className={`w-7 h-7 ${item.color}`} />
                          </div>
                          <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                          <p className="text-gray-400 leading-relaxed">
                              {item.desc}
                          </p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* 3. EVOLUTION TIMELINE */}
      <section className="py-24 bg-gradient-to-b from-[#030711] to-[#050A15]">
          <div className="container px-4">
            <h2 className="text-4xl font-bold mb-16 text-center">The Evolution of Hiring</h2>
            
            <div className="space-y-8 max-w-4xl mx-auto">
                {[
                    { year: "2010", title: "The Classifieds Era", desc: "Static text lists. Zero intelligence.", active: false },
                    { year: "2018", title: "Keyword Matching", desc: "Basic string matching. High noise, low signal.", active: false },
                    { year: "2026", title: "Agentic AI (Now)", desc: "Autonomous agents that negotiate, schedule, and match based on deep semantic compatibility.", active: true }
                ].map((era, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className={`flex gap-6 items-start p-6 rounded-2xl border transition-all ${era.active ? 'bg-indigo-900/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                    >
                        <div className={`text-2xl font-bold font-mono ${era.active ? 'text-indigo-400' : 'text-gray-600'}`}>{era.year}</div>
                        <div>
                            <h3 className={`text-xl font-bold mb-2 ${era.active ? 'text-white' : 'text-gray-400'}`}>{era.title}</h3>
                            <p className="text-gray-500">{era.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
          </div>
      </section>

      {/* 4. MISSION: Human + AI */}
      <section className="py-24 relative">
          <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-3xl -z-10" />
          <div className="container px-4 text-center">
              <Shield className="w-16 h-16 text-indigo-400 mx-auto mb-8 animate-pulse" />
              <h2 className="text-5xl font-bold mb-6">Built for Humans. Powered by Code.</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                  We believe AI shouldn't replace the human connection in hiring—it should eliminate the noise so true connection can happen faster.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                  <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      🛡️ Bias-Audited Algorithms
                  </div>
                  <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      🔒 Privacy First Architecture
                  </div>
                  <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      🤝 Human-in-the-loop
                  </div>
              </div>
          </div>
      </section>

    </div>
  );
}
