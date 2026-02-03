/**
 * Quotation Builder Step 5: Review & Send
 *
 * Final step - review quotation summary and send to client.
 */

"use client";

import {
  Check,
  CheckCircle2,
  Copy,
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
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../quotation-builder-context";
import type { Project } from "../../types";

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
  } = useQuotationBuilder();

  const [linkCopied, setLinkCopied] = useState(false);

  // Get selected projects
  const selectedProjectIds = formData.step3.projectIds;
  const filteredProjects =
    (projects as Project[])?.filter((p) =>
      selectedProjectIds.includes(p._id),
    ) || [];

  // Get selected packages from step3
  const selectedPackageIds = Object.values(formData.step3.projectTemplates)
    .filter((id) => id && id !== "" && !id.startsWith("__pkg_"))
    .concat(
      Object.values(formData.step3.projectTemplates)
        .filter((id) => id?.startsWith("__pkg_"))
        .map((id) => id.replace("__pkg_", "")),
    );

  const uniquePackageIds = [...new Set(selectedPackageIds)];
  const selectedPackages = templates?.filter((t) =>
    uniquePackageIds.includes(t._id),
  );

  // Handle save quotation
  const handleSaveQuotation = async () => {
    await saveQuotation();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleSaveQuotation);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger]);

  // Copy share link placeholder
  const handleCopyLink = () => {
    // This would copy the actual share link after saving
    navigator.clipboard.writeText("Share link will be available after saving");
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="flex-1 space-y-8 pb-8">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Review & Send
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Review your quotation and send it to the client
          </p>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Client Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="p-5 rounded-2xl bg-white/2 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Client
                </p>
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  {selectedStudio?.name || "Not Selected"}
                </p>
              </div>
            </div>
            {selectedStudio?.email && (
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <Mail className="h-3 w-3" />
                <span>{selectedStudio.email}</span>
              </div>
            )}
          </motion.div>

          {/* Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl bg-white/2 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Projects
                </p>
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  {filteredProjects.length} Project
                  {filteredProjects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {filteredProjects.slice(0, 3).map((project) => (
                <p
                  key={project._id}
                  className="text-[10px] text-white/40 truncate"
                >
                  • {project.eventName || project.code}
                </p>
              ))}
              {filteredProjects.length > 3 && (
                <p className="text-[10px] text-primary">
                  + {filteredProjects.length - 3} more
                </p>
              )}
            </div>
          </motion.div>

          {/* Packages Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-white/2 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Packages
                </p>
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  {selectedPackages?.length || 0} Package
                  {(selectedPackages?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {selectedPackages?.slice(0, 3).map((pkg) => (
                <p key={pkg._id} className="text-[10px] text-white/40 truncate">
                  • {pkg.name}
                </p>
              ))}
              {(selectedPackages?.length || 0) > 3 && (
                <p className="text-[10px] text-primary">
                  + {(selectedPackages?.length || 0) - 3} more
                </p>
              )}
              {(!selectedPackages || selectedPackages.length === 0) && (
                <p className="text-[10px] text-white/20 italic">
                  Custom quotation
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Pricing Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-6">
            <IndianRupee className="h-5 w-5 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest text-white">
              Pricing Summary
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Line Items */}
            <div className="text-center p-4 rounded-xl bg-black/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Line Items
              </p>
              <p className="text-2xl font-black text-white">
                {formData.step4.lineItems.length}
              </p>
            </div>

            {/* Subtotal */}
            <div className="text-center p-4 rounded-xl bg-black/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Subtotal
              </p>
              <p className="text-2xl font-black text-white">
                ₹{subtotal.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Tax */}
            <div className="text-center p-4 rounded-xl bg-black/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Tax ({formData.step5.taxRate}%)
              </p>
              <p className="text-2xl font-black text-white">
                ₹{taxAmount.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Grand Total */}
            <div className="text-center p-4 rounded-xl bg-primary/20 border border-primary/30">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                Grand Total
              </p>
              <p className="text-3xl font-black text-primary">
                ₹{grandTotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Terms Preview */}
        {formData.step4.terms && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl bg-white/2 border border-white/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Terms & Conditions
              </span>
              <span className="text-[9px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded">
                {formData.step4.terms.length} characters
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
              <pre className="text-[10px] text-white/40 whitespace-pre-wrap font-mono leading-relaxed">
                {formData.step4.terms.substring(0, 500)}
                {formData.step4.terms.length > 500 && "..."}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Save as Draft */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Save className="h-6 w-6 text-white/40" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Save as Draft
                </h3>
                <p className="text-[10px] text-white/40">
                  Save and continue editing later
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveQuotation}
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-white/5 border-white/10 hover:bg-white/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </motion.div>

          {/* Send to Client */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Send to Client
                </h3>
                <p className="text-[10px] text-white/40">
                  Save and generate share link
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleSaveQuotation}
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Finalize & Send
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Share Link Section (shown after save) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-5 rounded-2xl bg-white/2 border border-white/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-white/40" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest">
                  Share Link
                </p>
                <p className="text-[10px] text-white/40">
                  Link will be generated after saving
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                disabled={true}
                className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
                className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
