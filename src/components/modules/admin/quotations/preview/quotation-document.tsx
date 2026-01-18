/**
 * Quotation Document Component
 *
 * Print-ready quotation document optimized for A4 paper.
 * Professional layout for post-production studio.
 */

"use client";

import React from "react";
import { format } from "date-fns";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Layers,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { amountInWords } from "./utils/number-to-words";
import type {
  QuotationData,
  QuotationSection,
  QuotationLineItem,
  CompanyInfo,
} from "../types";

// ============================================================================
// Component Props
// ============================================================================

interface QuotationDocumentProps {
  quotation: QuotationData;
  sections: QuotationSection[];
  activeSection?: string; // Filter to show only this section
  companyInfo?: CompanyInfo;
  clientName?: string;
  projectName?: string;
}

// ============================================================================
// Currency Formatter
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============================================================================
// Sub-Components
// ============================================================================

// Recursive line item renderer with numbering
function DocumentLineItem({
  item,
  index,
  level = 0,
  parentNumber = "",
}: {
  item: QuotationLineItem;
  index: number;
  level?: number;
  parentNumber?: string;
}) {
  const itemNumber = parentNumber ? `${parentNumber}.${index}` : `${index}`;
  const itemTotal = item.rate * item.quantity;

  return (
    <>
      <tr
        className={cn(
          "border-b border-slate-100 transition-colors",
          level === 0 ? "bg-white font-semibold" : "bg-slate-50/30 text-[11px]"
        )}
      >
        <td className="py-3.5 px-3 text-center text-slate-400 font-bold align-top w-12">
          {itemNumber}
        </td>
        <td className="py-3.5 px-4 align-top">
          <div
            className={cn(
              "text-slate-900",
              level === 0 ? "font-bold text-sm" : "font-medium pl-4"
            )}
          >
            {level > 0 && <span className="text-slate-300 mr-2">└</span>}
            {item.description}
          </div>
        </td>
        <td className="py-3.5 px-2 text-center text-slate-500 align-top uppercase text-[10px] font-bold tracking-wider w-16">
          {item.unit}
        </td>
        <td className="py-3.5 px-2 text-center font-bold text-slate-700 align-top w-14">
          {item.quantity}
        </td>
        <td className="py-3.5 px-3 text-right text-slate-600 align-top tabular-nums font-mono text-sm w-24">
          {formatCurrency(item.rate)}
        </td>
        <td className="py-3.5 px-4 text-right font-black text-slate-900 align-top tabular-nums w-28">
          {formatCurrency(itemTotal)}
        </td>
      </tr>
      {item.subItems?.map((sub, idx) => (
        <DocumentLineItem
          key={`${item.id}-sub-${idx}`}
          item={{ ...sub, id: `${item.id}-sub-${idx}` }}
          index={idx + 1}
          level={level + 1}
          parentNumber={itemNumber}
        />
      ))}
    </>
  );
}

// ============================================================================
// Main Document Component
// ============================================================================

export const QuotationDocument = React.forwardRef<
  HTMLDivElement,
  QuotationDocumentProps
>(({ quotation, sections, activeSection, companyInfo, clientName, projectName }, ref) => {
  // Filter sections if activeSection is provided
  const filteredSections = activeSection
    ? sections.filter((s) => s.name === activeSection)
    : sections;

  // Filter line items if activeSection is provided
  const filteredLineItems = activeSection
    ? quotation.lineItems.filter((item) => {
        const section = sections.find((s) => s._id === item.sectionId);
        return section?.name === activeSection;
      })
    : quotation.lineItems;

  // Calculate totals based on filtered items
  const subtotal = filteredLineItems.reduce((acc, item) => {
    const itemTotal = item.rate * item.quantity;
    const subItemsTotal =
      item.subItems?.reduce((s, sub) => s + sub.rate * sub.quantity, 0) ?? 0;
    return acc + itemTotal + subItemsTotal;
  }, 0);

  const discountAmount = activeSection ? 0 : (quotation.discountAmount || 0); // No discount for single section
  const taxRate = quotation.taxRate || 0.18;
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const grandTotal = subtotal - discountAmount + taxAmount;

  // Group items by section (using filtered sections)
  const groupedItems = filteredSections.map((section) => ({
    section,
    items: filteredLineItems.filter((item) => item.sectionId === section._id),
  }));

  // Default company info for PrimeEditz
  const company = companyInfo || {
    name: "PRIMEEDITZ",
    tagline: "Post-Production Excellence",
    address: "Creative Hub, Film City, Mumbai 400065",
    phone: "+91 22 4455 6677",
    email: "studio@primeeditz.com",
  };

  return (
    <div
      ref={ref}
      className="bg-white text-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.12)] rounded-sm min-h-[1123px] w-full max-w-[900px] mx-auto overflow-hidden print:shadow-none print:m-0 print:max-w-none print:rounded-none ring-1 ring-slate-100 print:ring-0"
    >
      <div className="p-10 md:p-14 pt-8 md:pt-10 pb-20 md:pb-24 space-y-10 text-slate-900 print:p-8 print:pt-0 print:pb-16">
        {/* ================================================================ */}
        {/* Header: Branding & Quotation Info */}
        {/* ================================================================ */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-black tracking-[0.2em] text-xl text-slate-900 uppercase">
                  {company.name}
                </div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {company.tagline}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px] font-medium">
                  {company.address}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px] font-medium">{company.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px] font-medium">{company.email}</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-5 md:min-w-[220px]">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter text-slate-950 mb-2 opacity-10 leading-none">
                PROPOSAL
              </h1>
              <div className="bg-slate-50 inline-block px-4 py-2.5 rounded-lg border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Reference No.
                </div>
                <div className="text-sm font-black text-slate-900">
                  #{quotation.code}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Date: {format(quotation._creationTime, "dd MMMM yyyy")}
                </span>
              </div>
              {quotation.validUntil && (
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                  Valid Until: {format(quotation.validUntil, "dd MMM yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-slate-100" />

        {/* ================================================================ */}
        {/* Client & Project Context */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50 p-7 rounded-xl border border-slate-100">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-slate-950 rounded-full" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Client
              </div>
            </div>
            <div className="pl-4">
              <div className="font-black text-lg text-slate-900">
                {clientName || quotation.clientId || "—"}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Post-Production Engagement
              </div>
            </div>
          </div>

          <div className="space-y-3 border-l border-slate-200 pl-10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-slate-950 rounded-full" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Project
              </div>
            </div>
            <div className="pl-4">
              <div className="font-bold text-sm text-slate-800 italic leading-relaxed">
                {projectName || "Creative Production Services"}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Sectioned Line Items */}
        {/* ================================================================ */}
        <div className="pt-2 space-y-10">
          {groupedItems.map(
            ({ section, items }) =>
              items.length > 0 && (
                <div
                  key={section._id}
                  className="space-y-3 section-container print:mb-8"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-1.5 h-5 rounded-full",
                        section.color === "blue"
                          ? "bg-blue-500"
                          : section.color === "purple"
                          ? "bg-purple-500"
                          : section.color === "green"
                          ? "bg-emerald-500"
                          : section.color === "amber"
                          ? "bg-amber-500"
                          : "bg-slate-950"
                      )}
                    />
                    <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 flex items-center gap-3">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {section.name}
                    </div>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-950 bg-slate-50/50">
                        <th className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 w-12">
                          #
                        </th>
                        <th className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Description
                        </th>
                        <th className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 w-16">
                          Unit
                        </th>
                        <th className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 w-14">
                          Qty
                        </th>
                        <th className="py-3 px-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 w-24">
                          Rate
                        </th>
                        <th className="py-3 px-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 w-28">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <DocumentLineItem
                          key={item.id}
                          item={item}
                          index={idx + 1}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )}
        </div>

        {/* ================================================================ */}
        {/* Financial Summary */}
        {/* ================================================================ */}
        <div className="flex flex-col md:flex-row justify-end pt-6 gap-10">
          <div className="w-full max-w-[320px] space-y-3">
            <div className="flex justify-between items-center px-4">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
                Subtotal
              </span>
              <span className="font-bold text-slate-700">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center px-4">
                <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
                  Discount
                </span>
                <span className="font-bold text-emerald-600">
                  - {formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
                  Tax
                </span>
                <span className="text-[8px] py-0.5 px-1.5 border border-slate-200 text-slate-500 bg-slate-50 font-bold rounded">
                  GST {(taxRate * 100).toFixed(0)}%
                </span>
              </div>
              <span className="font-bold text-slate-700">
                {formatCurrency(taxAmount)}
              </span>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl shadow-xl">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <div className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px]">
                    Grand Total
                  </div>
                  <div className="text-white/30 text-[8px] font-bold italic">
                    Inclusive of all taxes
                  </div>
                </div>
                <div className="text-2xl font-black text-white tracking-tighter tabular-nums">
                  {formatCurrency(grandTotal)}
                </div>
              </div>
            </div>

            <div className="px-4 py-2">
              <div className="text-[9px] text-right text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                <span className="text-slate-300 block mb-0.5 tracking-normal lowercase italic font-normal">
                  Amount in words:
                </span>
                {amountInWords(grandTotal)}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Terms & Conditions */}
        {/* ================================================================ */}
        {quotation.terms && (
          <div className="pt-10">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                Terms & Conditions
              </div>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-wrap columns-1 md:columns-2 gap-10 text-justify">
              {quotation.terms}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Signature Section */}
        {/* ================================================================ */}
        <div className="pt-14 grid grid-cols-2 gap-24">
          <div className="space-y-5">
            <div className="h-0.5 bg-slate-100 w-full" />
            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                Client Acceptance
              </div>
              <div className="text-[9px] text-slate-400 font-medium tracking-tight">
                Acknowledgement of scope & pricing
              </div>
            </div>
          </div>
          <div className="text-right space-y-5">
            <div className="h-0.5 bg-slate-950 w-full" />
            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                Authorized Signature
              </div>
              <div className="text-[9px] text-slate-400 font-bold uppercase italic">
                For {company.name}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="pt-10 flex justify-center opacity-30">
          <div className="text-[8px] font-black tracking-[0.3em] text-slate-300 uppercase">
            Generated via PrimeEditz Studio
          </div>
        </div>
      </div>
    </div>
  );
});

QuotationDocument.displayName = "QuotationDocument";
