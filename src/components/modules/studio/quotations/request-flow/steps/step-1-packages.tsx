"use client";

import { motion } from "motion/react";
import { useRequestWizard } from "../request-wizard-context";
import { PackageSelector } from "../../../quotation-request/package-selector";

export function Step1Packages() {
  const { selectedPackageIds, setSelectedPackageIds } = useRequestWizard();

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20"
    >
      <div className="mb-8 space-y-1">
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Service Packages
        </h2>
        <p className="text-sm text-white/40 font-medium">
          Select one or more packages for this quote
        </p>
      </div>

      <PackageSelector
        selectedIds={selectedPackageIds}
        onSelectionChange={setSelectedPackageIds}
      />
    </motion.div>
  );
}
