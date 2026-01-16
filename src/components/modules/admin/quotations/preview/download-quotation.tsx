/**
 * Download Quotation PDF Component
 *
 * Uses html-to-image and jsPDF for direct PDF generation
 * without relying on browser print dialog.
 */

"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download as DownloadIcon, Loader2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
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

interface DownloadQuotationProps {
  quotation: QuotationData;
  sections: Section[];
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
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function DownloadQuotation({
  quotation,
  sections,
  companyInfo,
  clientName,
  projectName,
  variant = "default",
  size = "sm",
  className,
}: DownloadQuotationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!documentRef.current) {
      toast.error("Document reference not found");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating PDF... This may take a moment.");

    try {
      // Wait for all images in the document to be fully loaded
      const images = documentRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Small extra delay for rendering stability
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dataUrl = await htmlToImage.toPng(documentRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: 900,
        // Skip web font embedding to avoid parser crashes
        skipFonts: true,
      });

      // PDF Dimensions & Margins
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = 10; // 10mm standard margin
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pdfWidth - margin * 2;

      const imgProps = pdf.getImageProperties(dataUrl);
      const contentHeight = (imgProps.height * printableWidth) / imgProps.width;

      let heightLeft = contentHeight;
      let page = 0;

      while (heightLeft > 0) {
        if (page > 0) pdf.addPage();

        // For the first page, start at the very top (0 margin)
        // For other pages, start with the standard top margin
        const currentTopMargin = page === 0 ? 0 : margin;
        const currentPrintableHeight = pdfHeight - currentTopMargin - margin;

        // Calculate where the image should be placed relative to this page's viewport
        let topOffset;
        if (page === 0) {
          topOffset = 0;
        } else {
          // Skip the height already shown on page 0 and previous pages
          const heightShownOnPage0 = pdfHeight - margin;
          const heightShownOnOtherPages = (page - 1) * (pdfHeight - margin * 2);
          topOffset = margin - (heightShownOnPage0 + heightShownOnOtherPages);
        }

        pdf.addImage(
          dataUrl,
          "PNG",
          margin,
          topOffset,
          printableWidth,
          contentHeight,
          undefined,
          "FAST"
        );

        // Apply masking for clean edges
        pdf.setFillColor(255, 255, 255);
        if (page > 0) pdf.rect(0, 0, pdfWidth, margin, "F"); // Top mask only for p1+
        pdf.rect(0, pdfHeight - margin, pdfWidth, margin, "F"); // Bottom mask
        pdf.rect(0, 0, margin, pdfHeight, "F"); // Left mask
        pdf.rect(pdfWidth - margin, 0, margin, pdfHeight, "F"); // Right mask

        heightLeft -= currentPrintableHeight;
        page++;
      }

      const fileName = `Quotation_${quotation.code}_v${quotation.version}.pdf`;
      pdf.save(fileName);

      toast.success("PDF downloaded successfully", { id: toastId });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={isGenerating}
        className={className}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <DownloadIcon className="w-4 h-4 mr-2" />
        )}
        {isGenerating ? "Generating..." : "Download PDF"}
      </Button>

      {/* Hidden container for PDF capture - Uses explicit HEX overrides */}
      <div
        className="fixed left-[-9999px] top-[-9999px] pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            width: "900px",
            background: "white",
            // Force standard colors for the renderer to prevent modern color parsing crashes
            ["--background" as string]: "#ffffff",
            ["--foreground" as string]: "#0a0a0a",
            ["--primary" as string]: "#3b82f6",
            ["--card" as string]: "#ffffff",
            ["--border" as string]: "#e2e8f0",
            ["--muted" as string]: "#f8fafc",
            ["--muted-foreground" as string]: "#64748b",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <QuotationDocument
            ref={documentRef}
            quotation={quotation}
            sections={sections}
            companyInfo={companyInfo}
            clientName={clientName}
            projectName={projectName}
          />
        </div>
      </div>
    </>
  );
}
