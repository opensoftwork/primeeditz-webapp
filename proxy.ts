import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	
	// Check for session cookie from Better Auth
	// This is a fast, cookie-only check (not database verification)
	const sessionCookie = getSessionCookie(request);

	// If authenticated user tries to access auth pages, redirect to dashboard
	if (sessionCookie && (pathname === '/sign-in' || pathname === '/sign-up')) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// If accessing protected route without session, redirect to sign-in
	if (!sessionCookie) {
		const signInUrl = new URL("/sign-in", request.url);
		// Preserve the original URL as a redirect parameter
		signInUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(signInUrl);
	}

	// Session cookie exists, allow request to proceed
	// Full auth verification happens in protected layout
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
