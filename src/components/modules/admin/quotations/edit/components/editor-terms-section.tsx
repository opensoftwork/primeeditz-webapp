"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../builder/quotation-builder-context";

const TERMS_TEMPLATES = [
  {
    id: "standard",
    name: "Standard",
    content: `1. PAYMENT TERMS\n• 50% advance payment\n• 50% on delivery\n\n2. REVISIONS\n• 2 rounds included\n\n3. RIGHTS\n• Transferred upon full payment`,
  },
  {
    id: "detailed",
    name: "Detailed",
    content: `TERMS AND CONDITIONS\n\n1. SCOPE OF WORK\nAs specified in line items.\n\n2. PAYMENT SCHEDULE\n• 50% Booking Amount\n• 50% Balance before final delivery\n\n3. REVISION POLICY\n• Two rounds of revisions included.\n\n4. INTELLECTUAL PROPERTY\n• Rights transfer upon full payment.`,
  },
];

export function EditorTermsSection() {
  const { formData, setFormData } = useQuotationBuilder();
  const [localTerms, setLocalTerms] = useState(formData.step5.terms);

  useEffect(() => {
    if (formData.step5.terms !== localTerms) {
      setLocalTerms(formData.step5.terms);
    }
  }, [formData.step5.terms]);

  const handleTermsChange = (value: string) => {
    setLocalTerms(value);
    setFormData("step5", { terms: value });
  };

  const applyTemplate = (content: string) => {
    handleTermsChange(content);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Terms & Conditions
        </h2>
      </div>

      <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5 space-y-6">
        <div className="flex flex-wrap gap-2">
          {TERMS_TEMPLATES.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(t.content)}
              className="h-8 px-3 rounded-lg bg-white/5 border-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider"
            >
              <Sparkles className="h-3 w-3 mr-2" />
              {t.name}
            </Button>
          ))}
        </div>

        <Textarea
          value={localTerms}
          onChange={(e) => handleTermsChange(e.target.value)}
          placeholder="Enter terms and conditions..."
          className="min-h-[250px] bg-white/5 border-white/5 rounded-2xl p-6 text-white text-sm leading-relaxed focus:ring-primary/20 resize-none font-mono"
        />

        <p className="text-[10px] text-white/20 font-medium">
          These terms will be displayed at the bottom of the PDF and client
          view.
        </p>
      </div>
    </div>
  );
}
