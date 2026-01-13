import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

// Modular Components (can be copy-pasted to other projects)
import quotation from "./components/quotation/convex.config";
import library from "./components/library/convex.config";

const app = defineApp();

// Third-party components
app.use(betterAuth);

// Local modular components
app.use(quotation);
app.use(library);

export default app;