"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Search, X, Check, Brain, FileText, Zap } from "lucide-react";

export function ComparisonSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <section className="py-24 bg-[#030711] overflow-hidden">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            The Old Way vs. <span className="text-indigo-400">The Agentic Way</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Drag the slider to see how we transformed the hiring process from a manual grind to an automated flow.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none group">
            
            {/* LEFT SIDE: THE OLD WAY (Grayscale, Boring) */}
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center p-8">
                <div className="text-left w-full max-w-md opacity-40 blur-sm group-hover:blur-0 transition-all duration-500">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 text-gray-500 font-mono text-sm mt-8">
                            <Search className="w-4 h-4" />
                            <span>Query: "Java" (14,000 results)</span>
                        </div>
                    </div>
                </div>
                <div className="absolute top-8 left-8 bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    2015: Keywords
                </div>
            </div>


            {/* RIGHT SIDE: THE NEW WAY (Neon, Dark, Futuristic) */}
            <div 
                className="absolute inset-0 bg-[#0B1121] flex items-center justify-center p-8 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[100px]" />

                <div className="relative z-10 w-full max-w-md">
                   <div className="space-y-6">
                       {/* AI Match Card */}
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         className="bg-indigo-950/40 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-2xl shadow-xl shadow-indigo-500/10"
                       >
                           <div className="flex justify-between items-start mb-4">
                               <div className="flex gap-3">
                                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                       <Brain className="w-5 h-5 text-white" />
                                   </div>
                                   <div>
                                       <h3 className="text-white font-semibold">Senior Engineer</h3>
                                       <p className="text-indigo-300 text-xs">98% Capability Match</p>
                                   </div>
                               </div>
                               <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">Active</span>
                           </div>
                           
                           {/* Skills Visualization */}
                           <div className="space-y-2">
                               <div className="flex justify-between text-xs text-gray-400">
                                   <span>System Design</span>
                                   <span className="text-white">Expert</span>
                               </div>
                               <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                   <div className="h-full bg-indigo-500 w-[95%]"></div>
                               </div>
                           </div>
                       </motion.div>

                       <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm">
                           <Zap className="w-4 h-4" />
                           <span>Semantic Understanding: "Architectural Leadership"</span>
                       </div>
                   </div>
                </div>

                <div className="absolute top-8 right-8 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/50">
                    2026: Agents
                </div>
            </div>

            {/* SLIDER HANDLE */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-30 flex items-center justify-center group-hover:bg-indigo-400 transition-colors"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => {
                    // Simple drag implementation could go here, 
                    // but for now we'll just use the range input overlay
                }}
            >
                <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center -ml-[19px] border-4 border-[#030711] cursor-col-resize">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="m9 18 6-6-6-6"/></svg>
                </div>
            </div>
            
            {/* Invisible Range Input for Interaction */}
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPosition} 
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-40"
            />

        </div>
      </div>
    </section>
  );
}
