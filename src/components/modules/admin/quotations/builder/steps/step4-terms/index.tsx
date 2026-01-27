/**
 * Quotation Builder Step 4: Terms & Conditions
 *
 * Final step - add terms, review, and save the quotation.
 */

"use client";

import {
  AlertCircle,
  Check,
  Copy,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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

export function Step4Terms() {
  const { formData, setFormData, saveQuotation, setSubmitTrigger, isLoading } =
    useQuotationBuilder();

  const [terms, setTerms] = useState(formData.step5.terms);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync with context when it changes
  useEffect(() => {
    if (formData.step5.terms !== terms) {
      setTerms(formData.step5.terms);
    }
  }, [formData.step5.terms]);

  // Update context when terms change
  const handleTermsChange = (value: string) => {
    setTerms(value);
    setFormData("step5", { terms: value });
    setHasError(false);
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

  // Handle submit
  const handleSubmit = async () => {
    if (!terms.trim()) {
      setHasError(true);
      return;
    }
    setFormData("step5", { terms });
    await saveQuotation();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleSubmit);
    return () => setSubmitTrigger(null);
  }, [terms, setSubmitTrigger, handleSubmit]);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Terms & Conditions
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Define payment terms, deliverables, and policies
            </p>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mb-6">
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-5 rounded-2xl border transition-colors",
            hasError
              ? "bg-red-500/5 border-red-500/20"
              : "bg-white/2 border-white/5",
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Terms of Service
                {hasError && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required
                  </span>
                )}
              </FieldLabel>
            </Field>
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

          <FieldContent>
            <Textarea
              value={terms}
              onChange={(e) => handleTermsChange(e.target.value)}
              placeholder="Enter your terms and conditions here...

Example:
• 50% advance payment required
• 2 revision rounds included
• Full rights transferred upon payment"
              className={cn(
                "min-h-[350px] bg-white/5 border-white/5 rounded-xl p-4 text-white text-sm leading-relaxed focus:ring-primary/20 resize-none font-mono",
                hasError && "border-red-500/30 focus:ring-red-500/20",
              )}
            />
          </FieldContent>

          <p className="mt-3 text-[10px] text-white/20 font-medium">
            {terms.length} characters • These terms will appear on the quotation
            document
          </p>
        </motion.div>

        {/* Final Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-white">
                Ready to Save?
              </h3>
              <p className="text-[10px] text-white/40 font-medium">
                Review your quotation and click "Finish" to save as draft
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Finish & Save
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
