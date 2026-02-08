"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { clsx } from "clsx";

const faqs = [
  {
    question: "How does the AI matching work?",
    answer: "Our advanced AI analyzes your profile, skills, and experience against millions of data points to find jobs where you're most likely to succeed. It goes beyond simple keyword matching to understand the context of your career path."
  },
  {
    question: "Is this platform free for job seekers?",
    answer: "Yes! Creating a profile, browsing jobs, and applying to opportunities is completely free for candidates. We believe talent shouldn't have a price tag."
  },
  {
    question: "How do I know if my application was viewed?",
    answer: "We provide real-time tracking for all your applications. You'll get notified when a recruiter views your profile, shortlists you, or wants to schedule an interview."
  },
  {
    question: "Can I use this for remote jobs only?",
    answer: "Absolutely. You can filter for 'Remote', 'Hybrid', or 'On-site' roles. We have a vast network of companies hiring for remote-first positions globally."
  },
  {
    question: "For recruiters: How is this different from other job boards?",
    answer: "We don't just give you a pile of resumes. Our AI pre-screens candidates and ranks them by relevance, saving you hours of screening time. Plus, you only pay for successful matches."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to know about finding your next role.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border rounded-2xl overflow-hidden bg-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full p-6 text-left"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <span className={clsx(
                  "p-2 rounded-full transition-colors duration-200",
                  openIndex === index ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
