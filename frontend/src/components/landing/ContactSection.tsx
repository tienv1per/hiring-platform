"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", phone: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#030711]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-400/20 dark:bg-cyan-600/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl blur-xl opacity-30 -z-10" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Have specific questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10">
              Our AI experts are ready to help you find the perfect hiring solution.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="relative">
              {/* Glassmorphic container */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* Name */}
                  <div className="text-left">
                    <Label htmlFor="contact-name" className="text-gray-700 dark:text-gray-300 font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-2 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl h-12 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Phone */}
                  <div className="text-left">
                    <Label htmlFor="contact-phone" className="text-gray-700 dark:text-gray-300 font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="mt-2 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl h-12 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="text-left">
                    <Label htmlFor="contact-email" className="text-gray-700 dark:text-gray-300 font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-2 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl h-12 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Message */}
                  <div className="text-left">
                    <Label htmlFor="contact-message" className="text-gray-700 dark:text-gray-300 font-medium">
                      Your Question <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Let us know about your specific questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="mt-2 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
