import { type NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	
	// Perform authentication check using Convex Better Auth helper
	// This uses internal Next.js headers() and is designed for middleware/proxy.
	const isAuthed = await isAuthenticated();

	// Check if this is the first user (bootstrap mode)
	// We perform this check for unauthenticated users to route them to Sign Up instead of Sign In
	let isFirst = false;
	try {
		const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
		if (convexUrl) {
			const response = await fetch(`${convexUrl}/api/query`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ path: "profiles:isFirstUser", args: {} }),
			});
			const data = await response.json();
			isFirst = data.value === true;
		}
	} catch (e) {
		console.error("Proxy: Failed to check isFirstUser:", e);
	}

	// 1. Protect auth pages: If authenticated, redirect to dashboard or onboarding
	if (isAuthed && (pathname === '/sign-in' || pathname === '/sign-up')) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// 2. Unauthenticated flows
	if (!isAuthed) {
		let response: NextResponse;

		// If it's the first user, everything should go to sign-up
		if (isFirst && pathname !== '/sign-up') {
			response = NextResponse.redirect(new URL("/sign-up", request.url));
		}
		// If not first user, and trying to access protected content, go to sign-in
		else if (!isFirst && !['/sign-in', '/sign-up'].includes(pathname)) {
			const signInUrl = new URL("/sign-in", request.url);
			signInUrl.searchParams.set("redirect", pathname);
			response = NextResponse.redirect(signInUrl);
		} else {
			response = NextResponse.next();
		}

		// Security: If not authenticated, ensure any stale session cookies are cleared
		// to prevent ghosting or UI state confusion (especially on /onboarding)
		if (pathname !== '/sign-in' && pathname !== '/sign-up') {
			response.cookies.delete("better-auth.session_token");
			// Handle potential secure/production cookie names as well
			response.cookies.delete("__Secure-better-auth.session_token");
			response.cookies.delete("__Host-better-auth.session_token");
		}

		return response;
	}

	// Flow remains authenticated or accessing allowed route
	return NextResponse.next();
}

export const config = {
	matcher: [
		// Protected routes
		"/dashboard/:path*",
		"/dashboard",
		"/projects/:path*",
		"/settings/:path*",
		"/onboarding/:path*",
		"/onboarding",
		"/assigned-work/:path*",
		"/assigned-work",
		// Auth routes (for redirect when authenticated)
		"/sign-in",
		"/sign-up",
	],
};
