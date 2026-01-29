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
      <PackageSelector
        selectedIds={selectedPackageIds}
        onSelectionChange={setSelectedPackageIds}
      />
    </motion.div>
  );
}
