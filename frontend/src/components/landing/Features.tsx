"use client";

import { motion } from "framer-motion";
import { BrainCircuit, MessageSquare, LineChart, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

const features = [
  {
    title: "AI-Powered Matching",
    description: "Our algorithm analyzes job descriptions and your profile to find the perfect fit, not just keywords.",
    icon: BrainCircuit,
    className: "md:col-span-2",
    gradient: "from-blue-500/20 to-purple-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Instant Recruiter Chat",
    description: "Direct messaging with hiring managers. No more black holes.",
    icon: MessageSquare,
    className: "md:col-span-1",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
  },
  {
    title: "Application Analytics",
    description: "Track your application status and see where you stand in real-time.",
    icon: LineChart,
    className: "md:col-span-1",
    gradient: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-500",
  },
  {
    title: "Verified Companies",
    description: "We vet every employer to ensure legitimate, high-quality opportunities.",
    icon: ShieldCheck,
    className: "md:col-span-2",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-500",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Capabilities that give you the edge
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We've built a suite of tools designed to bypass the noise and connect you directly with your next career move.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={clsx(
                "group relative overflow-hidden rounded-3xl border bg-background p-8 hover:shadow-lg transition-all duration-300",
                feature.className
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Hover Gradient Background */}
              <div
                className={clsx(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  feature.gradient
                )}
              />

              <div className="relative z-10 flex flex-col h-full">
                <div className={clsx("mb-4 p-3 rounded-2xl w-fit bg-muted group-hover:bg-background/80 transition-colors", feature.iconColor)}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
