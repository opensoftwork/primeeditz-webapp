"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- Types ---

interface FAQItem {
  question: string;
  answer: string;
}

// --- Data ---

const faqs: FAQItem[] = [
  {
    question: "How does file storage work?",
    answer:
      "Each project is allocated storage based on your quotation. Clients upload raw files directly to secure folders. Storage usage is tracked in real-time with clear visual indicators.",
  },
  {
    question: "Can I invite my team?",
    answer:
      "Yes! Depending on your plan, you can invite team members as Employees who can access assigned projects and upload deliverables.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support JPG, PNG, GIF for photos, and MP4, MOV, AVI for videos. Maximum file sizes are 100MB for photos and 2GB for videos.",
  },
  {
    question: "How do quotations work?",
    answer:
      "Admins create quotations from templates, specifying services and storage needs. Clients receive a detailed breakdown and can approve or request changes.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Not yet, but our web app is fully responsive and works great on mobile devices. Native apps are on our roadmap for 2025.",
  },
  {
    question: "How secure is my data?",
    answer:
      "All files are encrypted in transit and at rest. We use signed URLs for secure access, and you control who can view your projects.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! All paid plans are month-to-month with no long-term contracts. You can cancel anytime from your account settings.",
  },
  {
    question: "Do you offer custom solutions?",
    answer:
      "Absolutely! Our Enterprise plan includes custom storage limits, dedicated support, and tailored features for larger studios. Contact us to discuss.",
  },
];

// --- Main Component ---

export function FAQSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background border-y border-white/5 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-3xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase font-black tracking-[0.3em] text-primary"
          >
            Got Questions?
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-xl"
          >
            Everything you need to know about PrimeEditz. Can't find your
            answer? Contact our support team.
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.3 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={cn(
                  "rounded-xl border border-white/5 bg-white/2 px-6",
                  "data-[state=open]:bg-white/5 data-[state=open]:border-white/10",
                  "transition-all duration-300"
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "text-left font-semibold text-white py-5",
                    "hover:no-underline hover:text-primary transition-colors",
                    "[&[data-state=open]>svg]:rotate-180"
                  )}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
