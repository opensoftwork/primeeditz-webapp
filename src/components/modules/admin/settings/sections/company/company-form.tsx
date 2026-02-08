"use client";

import { IdentitySection } from "./components/identity-section";
import { ContactSection } from "./components/contact-section";
import { BillingSection } from "./components/billing-section";
import { BankSection } from "./components/bank-section";

interface CompanyFormProps {
  initialData: any;
}

export function CompanyForm({ initialData }: CompanyFormProps) {
  return (
    <div className="space-y-6 pb-20">
      <IdentitySection initialData={initialData} />
      <ContactSection initialData={initialData} />
      <BillingSection initialData={initialData} />
      <BankSection initialData={initialData} />
    </div>
  );
}
