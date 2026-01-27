/**
 * Quotation Editor (Single Page)
 *
 * A non-stepper implementation for editing existing quotations.
 * Shows all sections on a single page for faster adjustments.
 */

"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  QuotationBuilderProvider,
  useQuotationBuilder,
} from "../builder/quotation-builder-context";
import { PricingSummary } from "../detail/components/pricing-summary";
import {
  EditorClientCard,
  EditorLineItemsSection,
  EditorTermsSection,
  EditorValiditySection,
} from "./components";

export function EditQuotation({ quotationId }: { quotationId: string }) {
  return (
    <QuotationBuilderProvider initialQuotationId={quotationId}>
      <QuotationEditorContent quotationId={quotationId} />
    </QuotationBuilderProvider>
  );
}

function QuotationEditorContent({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const {
    saveQuotation,
    isLoading,
    subtotal,
    grandTotal,
    formData,
    taxAmount,
    selectedStudio,
  } = useQuotationBuilder();

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/quotations/${quotationId}`)}
              className="h-8 px-2 -ml-2 text-white/40 hover:text-white font-bold"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Edit Quotation
            </h1>
          </div>
          <p className="text-white/50 text-xs font-medium ml-12">
            Modifying quotation details for{" "}
            {selectedStudio?.name || "selected client"}.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={saveQuotation}
            disabled={isLoading}
            className="bg-primary text-primary-foreground font-black px-8 h-12 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8 pb-20">
          {/* Client Info (Read-only) */}
          <section>
            <EditorClientCard />
          </section>

          {/* Line Items Section */}
          <section>
            <EditorLineItemsSection />
          </section>

          {/* Terms Section */}
          <section>
            <EditorTermsSection />
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Financial Summary */}
            <PricingSummary
              subtotal={subtotal}
              discountAmount={formData.step5.discountAmount}
              taxRate={formData.step5.taxRate / 100}
              taxAmount={taxAmount}
              grandTotal={grandTotal}
              formatCurrency={(val) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(val)
              }
            />

            {/* Validity Settings (Moved from main content) */}
            <EditorValiditySection />

            {/* Editor Mode Warning */}
            <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">
                Editor Mode
              </h4>
              <p className="text-[11px] text-white/40 font-medium leading-relaxed">
                You are currently in direct edit mode. All changes made here
                will update the existing version of this quotation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
