import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

// Validate required environment variables
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

if (!convexUrl) {
	throw new Error(
		"NEXT_PUBLIC_CONVEX_URL environment variable is required. Please check your .env.local file.",
	);
}

if (!convexSiteUrl) {
	throw new Error(
		"NEXT_PUBLIC_CONVEX_SITE_URL environment variable is required. Please check your .env.local file.",
	);
}

export const {
	handler,
	preloadAuthQuery,
	isAuthenticated,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = convexBetterAuthNextJs({
	convexUrl,
	convexSiteUrl,
});