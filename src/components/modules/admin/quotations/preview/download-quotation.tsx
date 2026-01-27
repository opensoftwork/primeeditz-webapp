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
import { cn } from "@/lib/utils";
import type {
  QuotationData,
  QuotationSection,
  CompanyInfo,
  Project,
} from "../types";

// ============================================================================
// Component Props
// ============================================================================

interface DownloadQuotationProps {
  quotation: QuotationData;
  sections: QuotationSection[];
  projects?: Project[];
  activeSection?: string; // Section name for filtered download
  companyInfo?: CompanyInfo;
  studioName?: string;
  projectName?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
  label?: string;
  icon?: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

export function DownloadQuotation({
  quotation,
  sections,
  projects = [],
  activeSection,
  companyInfo,
  studioName,
  projectName,
  variant = "default",
  size = "sm",
  className,
  label,
  icon,
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
        quality: 1, // Maximum quality
        pixelRatio: 4, // Higher resolution for crisp text
        backgroundColor: "#ffffff",
        width: 900,
        // Skip web font embedding to avoid parser crashes
        skipFonts: true,
        // Use CORS to avoid tainted canvas
        cacheBust: true,
      });

      // ======================================================================
      // Smart Slicing Logic
      // Detects where components are cut and adjusts page breaks.
      // ======================================================================
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = 10;
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      const imgProps = pdf.getImageProperties(dataUrl);
      const contentHeight = (imgProps.height * printableWidth) / imgProps.width;

      // Map browser pixels to PDF mm
      const pxToMm = printableWidth / 900; 

      // Find all elements that shouldn't be split
      const avoidElements = Array.from(
        documentRef.current.querySelectorAll(".break-inside-avoid")
      ) as HTMLElement[];

      const componentOffsets = avoidElements.map((el) => {
        const rect = el.getBoundingClientRect();
        const rootRect = documentRef.current!.getBoundingClientRect();
        return {
          top: (rect.top - rootRect.top) * pxToMm,
          bottom: (rect.bottom - rootRect.top) * pxToMm,
          height: rect.height * pxToMm,
        };
      });

      let currentTopMm = 0;
      let page = 0;

      while (currentTopMm < contentHeight) {
        if (page > 0) pdf.addPage();

        // Calculate the "natural" bottom of this page in content coordinates
        let pageBottomLimit = currentTopMm + printableHeight;

        // Check if any "avoid" element is being cut by this page boundary
        const cutoffElement = componentOffsets.find(
          (off) => off.top < pageBottomLimit && off.bottom > pageBottomLimit
        );

        // If an element is cut, and it's not larger than a whole page,
        // we move the boundary to the top of that element.
        if (cutoffElement && cutoffElement.height < printableHeight) {
          pageBottomLimit = cutoffElement.top;
        }

        // Draw the slice of the image
        // topOffset is negative because we're moving the content UP relative to the page
        const topOffset = margin - currentTopMm;

        pdf.addImage(
          dataUrl,
          "PNG",
          margin,
          topOffset,
          printableWidth,
          contentHeight,
          undefined,
          "NONE"
        );

        // Masking to clean up the edges (especially the overflow from currentTopMm)
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, margin, "F"); // Top
        pdf.rect(0, pdfHeight - margin, pdfWidth, margin, "F"); // Bottom
        pdf.rect(0, 0, margin, pdfHeight, "F"); // Left
        pdf.rect(pdfWidth - margin, 0, margin, pdfHeight, "F"); // Right

        // If we adjust pageBottomLimit, we might leave whitespace at the bottom.
        // We need to mask it so the content from the next page doesn't bleed in.
        const actualPageContentHeight = Math.min(
          pageBottomLimit - currentTopMm,
          printableHeight
        );
        if (actualPageContentHeight < printableHeight) {
          pdf.rect(
            margin,
            margin + actualPageContentHeight,
            printableWidth,
            printableHeight - actualPageContentHeight,
            "F"
          );
        }

        currentTopMm = pageBottomLimit;
        page++;
      }

      // Generate filename with section name if applicable
      const sanitizedSection = activeSection?.replace(/\s+/g, "_");
      const fileName = activeSection
        ? `Quotation_${quotation.code}_${sanitizedSection}.pdf`
        : `Quotation_${quotation.code}_v${quotation.version}.pdf`;
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
          <Loader2 className={cn("w-4 h-4 animate-spin", label !== "" && "mr-2")} />
        ) : (
          icon || <DownloadIcon className={cn("w-4 h-4", label !== "" && "mr-2")} />
        )}
        {isGenerating ? (label === "" ? "" : "Generating...") : (label !== undefined ? label : "Download PDF")}
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
            projects={projects}
            activeSection={activeSection}
            companyInfo={companyInfo}
            studioName={studioName}
            projectName={projectName}
          />
        </div>
      </div>
    </>
  );
}
