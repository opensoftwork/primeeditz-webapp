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
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export function EditQuotation({ quotationId }: { quotationId: string }) {
  return (
    <QuotationBuilderProvider initialQuotationId={quotationId}>
      <QuotationEditorContent quotationId={quotationId} />
    </QuotationBuilderProvider>
  );
}

function QuotationEditorContent({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const quotation = useQuery(
    //@ts-ignore
    api.functions.quotations.queries.getQuotation,
    { quotationId: quotationId as Id<"quotations"> },
  );

  useEffect(() => {
    if (quotation?.code) {
      setOverride(quotationId, quotation.code);
    }
    return () => removeOverride(quotationId);
  }, [quotationId, quotation?.code, setOverride, removeOverride]);

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
    <div className="flex-1 space-y-10 p-8 md:p-12 w-full transition-all duration-700 animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                QUOTATION EDITOR
              </span>
              {quotation?.code && (
                <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-white/40">
                  {quotation.code}
                </span>
              )}
            </div>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Edit Quotation
            </h1>
            <p className="text-sm text-white/40 mt-2 uppercase tracking-widest font-bold">
              Adjusting value for {selectedStudio?.name || "selected client"}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={saveQuotation}
            disabled={isLoading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-8 py-6 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 gap-3 text-xs uppercase tracking-widest"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
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
            <div className="p-6 rounded-4xl bg-amber-500/5 border border-amber-500/10 space-y-3">
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
