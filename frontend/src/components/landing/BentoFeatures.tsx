"use client";

import { motion } from "framer-motion";
import { Brain, Shield, Mail, Search, MessageSquare, Code, Users, Rocket } from "lucide-react";

export function BentoFeatures() {
  return (
    <section className="py-24 bg-[#030711]">
      <div className="container px-4">
        <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Gemini Ultra</span>
            </h2>
            <p className="text-xl text-gray-400">The hiring stack that thinks like a human, but scales like a machine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
            
            {/* 1. SEMANTIC SEARCH (Large) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-1 md:col-span-2 row-span-2 bg-[#0A0F1C] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all"
            >
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                        <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Semantic Search Engine</h3>
                    <p className="text-gray-400 mb-8">
                        We don't match keywords. We vector-embed every resume and job description to find deep conceptual alignment.
                    </p>
                    
                    {/* Visual: Node Graph */}
                    <div className="relative h-48 w-full bg-[#05080F] rounded-xl border border-white/5 p-4 overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-3 gap-2 opacity-50">
                             {[...Array(9)].map((_, i) => (
                                 <motion.div 
                                     key={i}
                                     initial={{ scale: 0 }}
                                     whileInView={{ scale: 1 }}
                                     transition={{ delay: i * 0.1 }}
                                     className="bg-white/5 rounded-full m-2 aspect-square flex items-center justify-center"
                                 >
                                     <div className={`w-2 h-2 rounded-full ${i === 4 ? 'bg-indigo-500 animate-ping' : 'bg-gray-700'}`} />
                                 </motion.div>
                             ))}
                        </div>
                        {/* Connecting lines SVG could go here */}
                    </div>
                </div>
            </motion.div>

            {/* 2. AUTOMATED OUTREACH */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="col-span-1 md:col-span-1 row-span-1 bg-[#0A0F1C] border border-white/5 rounded-3xl p-6 relative group hover:border-cyan-500/30 transition-all"
            >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
                    <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Outreach</h3>
                <p className="text-sm text-gray-400">AI drafts hyper-personalized emails that get replies.</p>
            </motion.div>

            {/* 3. BIAS SHIELD */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="col-span-1 md:col-span-1 row-span-1 bg-[#0A0F1C] border border-white/5 rounded-3xl p-6 relative group hover:border-green-500/30 transition-all"
            >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                    <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Bias Shield</h3>
                <p className="text-sm text-gray-400">Algorithms audited to remove gender and racial bias.</p>
            </motion.div>

            {/* 4. CODE ANALYSIS */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="col-span-1 md:col-span-2 bg-[#0A0F1C] border border-white/5 rounded-3xl p-6 flex items-center gap-6 group hover:border-purple-500/30 transition-all"
            >
                <div className="w-full">
                     <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Code className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">GitHub Deep Scan</h3>
                     </div>
                     <p className="text-sm text-gray-400">
                         We analyze actual code quality, commit history, and PR velocity to verify technical skills beyond the resume.
                     </p>
                </div>
                <div className="hidden md:block w-32 h-20 bg-black/50 rounded-lg border border-white/10 p-2 font-mono text-[8px] text-green-400 overflow-hidden opacity-50">
                    function sort() &#123;<br/>
                    &nbsp;&nbsp;return array.filter(...)<br/>
                    &#125;
                </div>
            </motion.div>

        </div>
      </div>
    </section>
  );
}
