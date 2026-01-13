import { defineComponent } from "convex/server";

/**
 * Quotation Component
 * 
 * A portable, self-contained quotation management system.
 * Can be used standalone or linked to external entities (projects, clients).
 * 
 * To use in another project:
 * 1. Copy this entire `quotation` folder to your project's `convex/components/`
 * 2. Add `app.use(quotation)` to your `convex/convex.config.ts`
 * 3. Run `npx convex dev` to generate the component API
 * 
 * @see https://docs.convex.dev/components
 */
const quotation = defineComponent("quotation");

export default quotation;
