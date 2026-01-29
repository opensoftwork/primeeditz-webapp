import { Metadata } from "next";
import { QuotationRequestForm } from "@/components/modules/studio/quotation-request";

export const metadata: Metadata = {
  title: "Request Quotation | PrimeEditz Studio",
  description:
    "Select service packages and request a quotation for your project.",
};

export default function QuotationRequestPage() {
  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Quotation</h1>
        <p className="text-muted-foreground mt-2">
          Select the service packages you need and we will generate a quotation
          for you.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <QuotationRequestForm />
      </div>
    </div>
  );
}
