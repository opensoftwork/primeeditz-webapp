/**
 * Quotation Builder Step 4: Items & Terms
 *
 * Combined step for line items, subtotal, and terms & conditions.
 */

"use client";

import { Check, ChevronDown, Copy, FileText, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useQuotationBuilder } from "../../quotation-builder-context";

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

export function Step3ItemsTerms() {
  const { formData, setFormData, nextStep, setSubmitTrigger } =
    useQuotationBuilder();

  // Terms state
  const [terms, setTerms] = useState(formData.step4.terms);
  const [copied, setCopied] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(true);

  // Sync terms with context
  useEffect(() => {
    if (formData.step4.terms !== terms) {
      setTerms(formData.step4.terms);
    }
  }, [formData.step4.terms]);

  // Update context when terms change
  const handleTermsChange = (value: string) => {
    setTerms(value);
    setFormData("step4", { terms: value });
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
    // Terms are part of step 4 data (Items & Terms are combined in data structure)
    // even though this is Step 3 in UI flow now.
    setFormData("step4", { terms });
    nextStep();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleNext);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, terms]);

  return (
    <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="flex-1 space-y-8 pb-8">
        {/* Terms & Conditions Section */}
        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
          <button
            type="button"
            onClick={() => setTermsExpanded(!termsExpanded)}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Terms & Conditions
              </span>
              {terms && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {terms.length} chars
                </span>
              )}
            </div>
            <motion.div
              animate={{ rotate: termsExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-white/40" />
            </motion.div>
          </button>

          <AnimatePresence>
            {termsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Quick Templates */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Quick Templates
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TERMS_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template.id)}
                        className="h-8 px-3 rounded-lg bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Terms Editor */}
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Terms of Service
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!terms}
                    className="h-7 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white/30 hover:text-white disabled:opacity-30"
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

                <Textarea
                  value={terms}
                  onChange={(e) => handleTermsChange(e.target.value)}
                  placeholder="Enter your terms and conditions here..."
                  className="min-h-[500px] bg-white/5 border-white/5 rounded-xl p-4 text-white text-sm leading-relaxed focus:ring-primary/20 resize-none font-mono"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
