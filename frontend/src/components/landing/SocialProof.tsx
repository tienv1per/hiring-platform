"use client";

import { motion } from "framer-motion";

export function SocialProof() {
  const logos = [
    "Linear", "Raycast", "Vercel", "Ramp", "Scale AI", "OpenAI"
  ];

  return (
    <section className="py-12 bg-[#030711] border-b border-white/5 overflow-hidden">
      <div className="container px-4 text-center">
        <p className="text-gray-500 text-sm mb-8 font-medium tracking-wide">TRUSTED BY INNOVATIVE TEAMS</p>
        
        <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {logos.map((logo, i) => (
                 <div key={i} className="text-xl font-bold text-gray-400 hover:text-white transition-colors cursor-default">
                     {logo}
                 </div>
             ))}
        </div>
      </div>
    </section>
  );
}
