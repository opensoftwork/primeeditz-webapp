// Step Components for Quotation Builder
// =======================================
// New step structure:
// 1. Studio & Context (step1-client-context)
// 2. Package Selection (step2-package-selection)
// 3. Items & Terms (step4-items-terms)
// 4. Review & Send (step5-review-send)

// Step 1: Studio & Context
export { Step1StudioContext } from "./step1-client-context";

// Step 2: Package Selection
export { Step2PackageSelection } from "./step2-package-selection";

// Step 3: Items & Terms (formerly Step 4)
export { Step3ItemsTerms } from "./step3-items-terms";

// Step 4: Review & Send (formerly Step 5)
export { Step5ReviewSend } from "./step4-review-send";
