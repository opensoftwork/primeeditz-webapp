import { type NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	
	// Perform authentication check using Convex Better Auth helper
	// This uses internal Next.js headers() and is designed for middleware/proxy.
	const isAuthed = await isAuthenticated();

	// Protect auth pages: If authenticated, redirect to dashboard
	if (isAuthed && (pathname === '/sign-in' || pathname === '/sign-up')) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Protect dashboard and projects: If NOT authenticated, redirect to sign-in
	if (!isAuthed && pathname !== '/sign-in' && pathname !== '/sign-up') {
		const signInUrl = new URL("/sign-in", request.url);
		// Preserve the original URL as a redirect parameter for post-login redirection
		signInUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(signInUrl);
	}

	// Flow remains authenticated or accessing public route
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
		// Auth routes (for redirect when authenticated)
		"/sign-in",
		"/sign-up",
	],
};
