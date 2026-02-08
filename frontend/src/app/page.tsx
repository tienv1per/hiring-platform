"use client";

import { HeroAI } from "@/components/landing/HeroAI";
import { SocialProof } from "@/components/landing/SocialProof";
import { ComparisonSlider } from "@/components/landing/ComparisonSlider";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white selection:bg-indigo-500/30">
      <main className="flex-1">
        <HeroAI />
        <SocialProof />
        <ComparisonSlider />
        <BentoFeatures />
        <ContactSection />
        
        {/* Simple CTA Section */}
        <section className="py-32 bg-gradient-to-t from-indigo-100 dark:from-indigo-950/20 to-gray-50 dark:to-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="container px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900 dark:text-white">Ready to hire at the speed of thought?</h2>
                <button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-2xl shadow-indigo-500/20">
                    Get Started Free
                </button>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

