/**
 * Service Package Builder Step 4: Terms & Conditions
 *
 * Dedicated step for configuring terms and conditions with template support.
 */

"use client";

import { Check, Copy, FileText, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useBuilder } from "../../builder-context";

// Default terms templates
const TERMS_TEMPLATES = [
  {
    id: "standard",
    name: "Standard",
    content: `1. PAYMENT TERMS
• 50% advance payment before project commencement
• 50% upon delivery of final files
• Payment via bank transfer or UPI

2. REVISIONS
• Up to 2 rounds of revisions included
• Additional revisions charged at ₹2,000 per round

3. DELIVERY
• Delivery timeline as per project scope
• Delays due to client feedback not included

4. CANCELLATION
• Advance amount non-refundable after work begins
• 50% cancellation fee if cancelled midway

5. RIGHTS & OWNERSHIP
• Full rights transferred upon complete payment
• Raw files available at additional cost`,
  },
  {
    id: "simple",
    name: "Simple",
    content: `• 50% advance, 50% on delivery
• 2 revision rounds included
• Full rights transferred upon payment
• Advance non-refundable after work starts`,
  },
  {
    id: "detailed",
    name: "Detailed",
    content: `TERMS AND CONDITIONS

1. SCOPE OF WORK
The services covered in this quotation are as specified in the line items above. Any additional work requested will be quoted separately.

2. PAYMENT SCHEDULE
• Booking Amount: 50% of total amount upon confirmation
• Balance Payment: Remaining 50% before final delivery
• Mode: Bank Transfer / UPI / Cheque

3. REVISION POLICY
• Two (2) rounds of revisions are included in this quote
• Additional revisions will be charged at standard hourly rates
• Major scope changes will require a revised quotation

4. PROJECT TIMELINE
• Work will commence upon receipt of advance payment
• Timeline is estimated and may vary based on complexity
• Client delays in feedback will extend delivery timeline

5. CANCELLATION & REFUND
• Booking amount is non-refundable once work has commenced
• 50% of remaining balance due if cancelled after 50% completion
• Full amount due if cancelled after 80% completion

6. INTELLECTUAL PROPERTY
• All rights transfer to client upon full payment
• We retain the right to use work for portfolio/marketing
• Raw/source files available at 20% additional cost

7. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all project materials and business information.

8. VALIDITY
This quotation is valid for 30 days from the date of issue.`,
  },
];

export function Step4Terms() {
  const {
    step3Data,
    setStep3Data,
    setSubmitTrigger,
    setSyncCurrentStep,
    goToStep,
    isEditor,
  } = useBuilder();

  // Terms state
  const [terms, setTerms] = useState(step3Data?.terms ?? "");
  const [copied, setCopied] = useState(false);

  // Sync terms from context on mount
  useEffect(() => {
    if (step3Data?.terms !== undefined && step3Data.terms !== terms) {
      setTerms(step3Data.terms);
    }
  }, [step3Data?.terms]);

  // Update context when terms change
  const handleTermsChange = (value: string) => {
    setTerms(value);
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = TERMS_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      handleTermsChange(template.content);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(terms);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle next step
  const handleNext = () => {
    // Update step3Data with terms
    if (step3Data) {
      setStep3Data({
        ...step3Data,
        terms: terms || undefined,
      });
    }
    if (!isEditor) {
      goToStep(5);
    }
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => handleNext);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, terms, step3Data]);

  // Register sync callback
  useEffect(() => {
    setSyncCurrentStep(() => () => {
      if (step3Data) {
        setStep3Data({
          ...step3Data,
          terms: terms || undefined,
        });
      }
    });
    return () => setSyncCurrentStep(null);
  }, [terms, step3Data, setStep3Data, setSyncCurrentStep]);

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
            Step 04 — Legal Framework
          </span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
          Terms & Conditions
        </h2>
        <p className="text-sm font-semibold text-white/40 leading-relaxed">
          Define the legal guardrails and terms that will be included with
          quotations using this package.
        </p>
      </div>

      <div className="space-y-8 w-full">
        {/* Quick Templates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Quick Templates
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {TERMS_TEMPLATES.map((template) => (
              <Button
                key={template.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template.id)}
                className="h-10 px-5 rounded-xl bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Terms Editor Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Terms of Service
            </FieldLabel>
            {terms && (
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  terms.length > 1800 ? "text-red-500" : "text-white/20",
                )}
              >
                {terms.length} / 2000
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            disabled={!terms}
            className="h-8 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white/30 hover:text-white disabled:opacity-30"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1 text-green-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Terms Textarea */}
        <div className="relative group">
          <Textarea
            value={terms}
            onChange={(e) => handleTermsChange(e.target.value)}
            placeholder="Define payment milestones, cancellation policies, delivery timelines..."
            className="bg-zinc-900/30 border-white/5 focus:border-primary/50 focus:ring-primary/20 resize-none min-h-[500px] rounded-[12px] text-sm transition-all p-8 shadow-inner placeholder:text-white/10 backdrop-blur-sm font-mono leading-relaxed"
          />
          {/* Decorative Corner */}
          <div className="absolute bottom-6 right-6 pointer-events-none opacity-20">
            <FileText className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-center gap-2 px-4">
          <AlertCircle className="h-3 w-3 text-white/20" />
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
            These terms will be appended to the final quotation PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
