"use client";

import {
  Check,
  Crown,
  Diamond as DiamondIcon,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types ---

interface PricingTier {
  id: string;
  name: string;
  price: string; // Formatted string with currency
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
  colorTheme: "silver" | "gold" | "platinum" | "diamond" | "royal";
  icon: React.ReactNode;
}

// --- Data ---
// Extracted from pricing_strategy.md

const tiers: PricingTier[] = [
  {
    id: "silver",
    name: "Silver",
    price: "₹8,500",
    description: "Best for Small Traditional Weddings",
    colorTheme: "silver",
    icon: <ShieldCheck className="w-5 h-5" />,
    features: [
      "Traditional Color Correction (500 Images)",
      "Traditional Album (15 Sheets)",
      "Traditional Video Edit (60 min)",
      "Turnaround: 15-20 Days",
      "Digital Delivery",
    ],
    cta: "Choose Silver",
    ctaLink: "/contact?package=silver",
  },
  {
    id: "gold",
    name: "Gold",
    price: "₹18,000",
    description: "Best for Standard Weddings",
    colorTheme: "gold",
    icon: <Star className="w-5 h-5" />,
    features: [
      "Traditional Color Correction (1000 Images)",
      "Candid Grading (50 Images)",
      "Trad (20) + Candid (10) Album Sheets",
      "Traditional Video (90 min) + Teaser",
      "Turnaround: 12-15 Days",
    ],
    cta: "Choose Gold",
    ctaLink: "/contact?package=gold",
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "₹35,000",
    description: "Best for Premium Weddings",
    colorTheme: "platinum",
    icon: <Zap className="w-5 h-5" />,
    features: [
      "Traditional Color Correction (2000 Images)",
      "Candid Grading (100 Images)",
      "Trad (25) + Candid (20) Album Sheets",
      "2hr Video + Teaser + Highlight",
      "Drone Clips Integration",
      "Turnaround: 10-12 Days",
    ],
    cta: "Choose Platinum",
    ctaLink: "/contact?package=platinum",
    popular: true,
  },
  {
    id: "diamond",
    name: "Diamond",
    price: "₹55,000",
    description: "Best for Luxury Weddings",
    colorTheme: "diamond",
    icon: <DiamondIcon className="w-5 h-5" />,
    features: [
      "Traditional Color Correction (3000 Images)",
      "Candid Grading (200 Images)",
      "Trad (30) + Custom Candid (25) Sheets",
      "Parent Albums (2)",
      "Pre-Wedding Video + VFX",
      "Turnaround: 8-10 Days",
      "Priority Support",
    ],
    cta: "Choose Diamond",
    ctaLink: "/contact?package=diamond",
  },
  {
    id: "royal",
    name: "Royal Elite",
    price: "₹85,000",
    description: "For Destination/Celebrity Weddings",
    colorTheme: "royal",
    icon: <Crown className="w-5 h-5" />,
    features: [
      "Unlimited Color Correction",
      "Candid Grading (300) + Retouching (50)",
      "Trad (40) + Custom (30) Sheets",
      "Parent Albums (4)",
      "Cinematic Film (15-20 min)",
      "Heavy VFX Work",
      "Video Edit (5 Hours)",
      "Turnaround: 7-10 Days (Priority)",
    ],
    cta: "Contact for Elite",
    ctaLink: "/contact?package=royal",
  },
];

// --- Helpers ---

const getThemeStyles = (theme: PricingTier["colorTheme"]) => {
  switch (theme) {
    case "silver":
      return {
        border: "border-slate-500/30",
        hoverBorder: "group-hover:border-slate-400/50",
        glow: "shadow-slate-500/10",
        text: "text-slate-100",
        badge: "bg-slate-500/20 text-slate-300",
        button: "bg-slate-100 text-slate-900 hover:bg-white",
        icon: "text-slate-300",
      };
    case "gold":
      return {
        border: "border-amber-500/30",
        hoverBorder: "group-hover:border-amber-400/50",
        glow: "shadow-amber-500/10",
        text: "text-amber-100",
        badge: "bg-amber-500/20 text-amber-300",
        button: "bg-amber-400 text-amber-950 hover:bg-amber-300",
        icon: "text-amber-400",
      };
    case "platinum":
      return {
        border: "border-cyan-500/30",
        hoverBorder: "group-hover:border-cyan-400/50",
        glow: "shadow-cyan-500/10",
        text: "text-cyan-50",
        badge: "bg-cyan-500/20 text-cyan-300",
        button: "bg-cyan-400 text-cyan-950 hover:bg-cyan-300",
        icon: "text-cyan-400",
      };
    case "diamond":
      return {
        border: "border-blue-500/30",
        hoverBorder: "group-hover:border-blue-400/50",
        glow: "shadow-blue-500/10",
        text: "text-blue-50",
        badge: "bg-blue-500/20 text-blue-300",
        button: "bg-blue-500 text-white hover:bg-blue-400",
        icon: "text-blue-400",
      };
    case "royal":
      return {
        border: "border-fuchsia-500/40",
        hoverBorder: "group-hover:border-fuchsia-400/60",
        glow: "shadow-fuchsia-500/20",
        text: "text-fuchsia-50",
        badge: "bg-fuchsia-500/20 text-fuchsia-300",
        button:
          "bg-linear-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500",
        icon: "text-fuchsia-400",
      };
  }
};

// --- Sub-Components ---

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  const styles = getThemeStyles(tier.colorTheme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col h-full p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md",
        styles.border,
        styles.hoverBorder,
        tier.popular
          ? `bg-black/40 shadow-2xl ${styles.glow} z-10 scale-[1.02] md:scale-105`
          : "bg-black/20 hover:bg-black/30",
      )}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-max">
          <Badge className="bg-linear-to-r from-cyan-500 to-blue-500 text-white border-0 px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider shadow-lg shadow-cyan-500/25">
            Most Popular
          </Badge>
        </div>
      )}

      {/* Header Section - Fixed Height for alignment */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              "text-lg font-bold flex items-center gap-2",
              styles.text,
            )}
          >
            {tier.icon}
            {tier.name}
          </h3>
          {tier.id === "royal" && (
            <Badge
              variant="outline"
              className="text-[10px] border-fuchsia-500/50 text-fuchsia-300 h-5 px-1.5"
            >
              Elite
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold text-white tracking-tight">
            {tier.price}
          </div>
          <p className="text-xs text-muted-foreground min-h-10 leading-relaxed">
            {tier.description}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "h-px w-full mb-6 bg-linear-to-r from-transparent via-white/10 to-transparent",
        )}
      />

      {/* Features - Flex Grow to push button down */}
      <ul className="flex flex-col gap-3 mb-8 grow">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5 group/item">
            <Check
              className={cn(
                "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                styles.icon,
              )}
            />
            <span className="text-sm text-muted-foreground/90 group-hover/item:text-white/90 transition-colors duration-200">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA - Always at bottom */}
      <div className="mt-auto pt-2">
        <Button
          asChild
          className={cn(
            "w-full rounded-xl font-semibold transition-all duration-300 shadow-lg",
            styles.button,
            tier.popular ? "shadow-cyan-500/10" : "",
          )}
        >
          <a href={tier.ctaLink}>{tier.cta}</a>
        </Button>
      </div>
    </motion.div>
  );
}

// --- Main Component ---

export function PricingSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-black/50 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase font-black tracking-[0.3em] text-cyan-400"
          >
            Pricing Strategy
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-white"
          >
            Choose Your Perfect Package
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base max-w-xl mx-auto"
          >
            Professional post-production services tailored to your needs. From
            essential editing to cinematic masterpieces.
          </motion.p>
        </div>

        {/* Grid - 5 Columns for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 items-stretch pt-4">
          {tiers.map((tier, index) => (
            <PricingCard key={index} tier={tier} index={index} />
          ))}
        </div>

        {/* Footer info */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground/60">
            All prices are exclusive of GST (18%). Bulk discounts available for
            orders over ₹25,000.
          </p>
        </div>
      </div>
    </section>
  );
}
