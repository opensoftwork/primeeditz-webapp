import { defineComponent } from "convex/server";

/**
 * Library Component
 * 
 * A portable, self-contained items library for reusable catalog entries.
 * Can be used by quotations, invoices, inventory, or any other module.
 * 
 * To use in another project:
 * 1. Copy this entire `library` folder to your project's `convex/components/`
 * 2. Add `app.use(library)` to your `convex/convex.config.ts`
 * 3. Run `npx convex dev` to generate the component API
 * 
 * @see https://docs.convex.dev/components
 */
const library = defineComponent("library");

export default library;
