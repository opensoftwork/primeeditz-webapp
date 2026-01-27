import betterAuth from "@convex-dev/better-auth/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

// Third-party components
app.use(betterAuth);

export default app;
