/**
 * Quotation Preview Component
 *
 * Wraps the QuotationDocument with app-level controls
 * for print, download, and navigation.
 */

"use client";

import React, { useRef } from "react";
import { FileText, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuotationDocument } from "./quotation-document";
import { DownloadQuotation } from "./download-quotation";

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
            <DownloadQuotation
              quotation={quotation}
              sections={sections}
              companyInfo={companyInfo}
              clientName={clientName}
              projectName={projectName}
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
            />
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
          html,
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 20 !important;
          }

          @page {
            size: A4;
            margin: 8mm 10mm 15mm 10mm;
            padding: 20mm;
          }

          @page:first {
            margin-top: 20;
          }

          /* Prevent orphans and widows */
          p,
          li,
          tr {
            orphans: 3;
            widows: 3;
          }

          /* Keep section headers with content */
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            page-break-after: avoid;
            break-after: avoid;
          }

          /* Avoid breaking inside table rows */
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Keep tables together when possible */
          table {
            page-break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          /* Section containers - avoid breaking */
          .section-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Add padding at bottom of each page for clean breaks */
          .print-page-padding {
            padding-bottom: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
