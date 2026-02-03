/**
 * Quotation Builder Step 5: Review & Send
 *
 * Final step - review quotation summary and send to client.
 */

"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileText,
  IndianRupee,
  Link as LinkIcon,
  Loader2,
  Mail,
  Package,
  Save,
  Send,
  User,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuotationBuilder } from "../../quotation-builder-context";
import type { Project } from "../../types";
import { format } from "date-fns";

export function Step5ReviewSend() {
  const {
    formData,
    saveQuotation,
    setSubmitTrigger,
    isLoading,
    selectedStudio,
    projects,
    subtotal,
    taxAmount,
    grandTotal,
    templates,
    sections,
    quotationId,
  } = useQuotationBuilder();

  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);

  // Group line items by section
  const groupedItems = sections
    ?.map((section) => {
      const items = formData.step4.lineItems.filter(
        (item) => item.sectionId === section._id,
      );
      const sectionTotal = items.reduce(
        (sum, item) => sum + item.rate * item.quantity,
        0,
      );
      return {
        ...section,
        items,
        total: sectionTotal,
      };
    })
    .filter((group) => group.items.length > 0);

  // Handle save quotation
  const handleSaveQuotation = async () => {
    await saveQuotation();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleSaveQuotation);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger]);

  return (
    <div className="w-full flex flex-col h-full bg-[#0A0A0A] overflow-hidden">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/quotations")}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Back to Quotations
            </span>
          </button>
          <div className="h-4 w-px bg-white/5 mx-2" />
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>Dashboard</span>
            <span className="text-white/20">/</span>
            <span>Quotations</span>
            <span className="text-white/20">/</span>
            <span className="text-white">{quotationId || "New Quotation"}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-9 px-4 rounded-lg bg-white/2 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-2 text-white/60 hover:text-white hover:bg-white/5"
          >
            <FileText className="h-4 w-4" />
            Draft
          </Button>
          <Button
            variant="ghost"
            className="h-9 px-4 rounded-lg bg-white/2 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-2 text-white/60 hover:text-white hover:bg-white/5"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="ghost"
            className="h-9 px-4 rounded-lg bg-white/2 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-2 text-white/60 hover:text-white hover:bg-white/5"
          >
            <Save className="h-4 w-4" />
            Edit
          </Button>
          <Button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest gap-2">
            <Send className="h-4 w-4" />
            Send to Studio
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Identity Banner */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                    {quotationId || "QT-XXXXXX"}
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-black text-white/40">
                    V1
                  </span>
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  Generated on {format(new Date(), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            {/* Studio & Intent Section */}
            <div className="p-8 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
              <div className="flex items-center gap-2 mb-8">
                <div className="h-1.5 w-1.5 rounded-sm bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                  Studio & Intent
                </span>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Strategic Studio
                  </p>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    {selectedStudio?.name || "NOT SELECTED"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    End Client / Identity
                  </p>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    {formData.step4.lineItems[0]?.description ||
                      selectedStudio?.name ||
                      "ANALYSIS REQUIRED"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Proposal Validity
                  </p>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    {formData.step1.validUntil
                      ? format(formData.step1.validUntil, "MMM dd, yyyy")
                      : "NOT SET"}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items Table Sections */}
            {groupedItems?.map((group) => (
              <div
                key={group._id}
                className="rounded-2xl bg-white/1 border border-white/5 overflow-hidden"
              >
                {/* Section Header */}
                <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">
                      {group.name}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                      {group.items.length} Component
                      {group.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                      Section Aggregate
                    </span>
                    <span className="text-sm font-black text-white">
                      ₹{group.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 pb-4">
                        <th className="text-left py-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
                          Description & Architecture
                        </th>
                        <th className="text-center py-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
                          Unit
                        </th>
                        <th className="text-right py-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
                          Rate
                        </th>
                        <th className="text-center py-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
                          Qty
                        </th>
                        <th className="text-right py-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {group.items.map((item) => (
                        <tr key={item.id} className="group">
                          <td className="py-6">
                            <p className="text-xs font-black text-white uppercase tracking-wide group-hover:text-primary transition-colors">
                              {item.description}
                            </p>
                          </td>
                          <td className="py-6 text-center">
                            <span className="text-[10px] font-bold text-white/40 uppercase">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-6 text-right">
                            <span className="text-xs font-bold text-white/60">
                              ₹{item.rate.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="py-6 text-center">
                            <span className="text-xs font-bold text-white/60">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-6 text-right">
                            <span className="text-xs font-black text-white">
                              ₹
                              {(item.rate * item.quantity).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Terms & Conditions Section */}
            <div className="p-8 rounded-2xl bg-white/2 border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                  Terms & Conditions
                </span>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-white/1 border border-white/5">
                  <pre className="text-[10px] text-white/40 font-mono leading-relaxed whitespace-pre-wrap">
                    {formData.step4.terms || "No specific terms provided."}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Review Protocol Card */}
            <div className="p-6 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <div className="flex items-start gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
                    Review Protocol
                  </h3>
                  <p className="text-[9px] font-bold text-yellow-500/80 uppercase tracking-widest">
                    Action Required by Admin
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Assign Lead / Team
                  </p>
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:text-white transition-colors">
                    Select Team Member
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button className="h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest gap-2">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>

            {/* Financial Architecture Card */}
            <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">
                  Financial Architecture
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Aggregate Subtotal
                  </span>
                  <span className="text-xs font-black text-white">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Statutory GST (18%)
                  </span>
                  <span className="text-xs font-black text-white">
                    ₹{taxAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Final Valuation
                  </p>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase">
                      INR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 block">
                Quick Actions
              </span>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full h-11 justify-start px-4 rounded-xl bg-white/2 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-3 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <Send className="h-4 w-4" />
                  Send to Studio
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-11 justify-start px-4 rounded-xl bg-white/2 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-3 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <Download className="h-4 w-4" />
                  Download Quotation
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-11 justify-start px-4 rounded-xl bg-white/2 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-3 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate as New
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
