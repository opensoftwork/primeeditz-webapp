/**
 * Quotation Preview Component
 *
 * Wraps the QuotationDocument with app-level controls
 * for print, download, and navigation.
 */

"use client";

import React, { useRef } from "react";
import { FileText, Printer, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuotationDocument } from "./quotation-document";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface LineItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  sectionId?: string;
  projectId?: string;
  subItems?: {
    description: string;
    unit: string;
    quantity: number;
    rate: number;
  }[];
}

interface Section {
  _id: string;
  name: string;
  color?: string;
  sequence?: number;
}

interface QuotationData {
  code: string;
  version: number;
  status: string;
  clientId?: string;
  projectIds?: string[];
  lineItems: LineItem[];
  terms?: string;
  validUntil?: number;
  taxRate?: number;
  discountAmount?: number;
  _creationTime: number;
}

interface QuotationPreviewProps {
  quotation: QuotationData;
  sections: Section[];
  onBack?: () => void;
  companyInfo?: {
    name: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
  };
  clientName?: string;
  projectName?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function QuotationPreview({
  quotation,
  sections,
  onBack,
  companyInfo,
  clientName,
  projectName,
}: QuotationPreviewProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, trigger print with "Save as PDF" option
    toast.info("Use 'Save as PDF' in the print dialog to download.");
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-100 print:bg-white">
      {/* Control Panel - Hidden on Print */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 print:hidden">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-9 px-3 text-white/40 hover:text-white font-bold text-xs rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white tracking-tight">
                  Professional Preview
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded">
                    Print Ready
                  </span>
                  <span className="text-[10px] text-white/30 font-medium italic">
                    #{quotation.code}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-9 px-4 rounded-lg bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-9 px-4 rounded-lg font-bold text-xs"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div className="py-8 px-4 print:p-0 print:py-0">
        <QuotationDocument
          ref={documentRef}
          quotation={quotation}
          sections={sections}
          companyInfo={companyInfo}
          clientName={clientName}
          projectName={projectName}
        />
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
