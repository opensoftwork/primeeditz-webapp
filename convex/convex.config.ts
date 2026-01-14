import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();

// Third-party components
app.use(betterAuth);

export default app;