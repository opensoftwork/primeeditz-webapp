import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
	// Check for session cookie from Better Auth
	// This is a fast, cookie-only check (not database verification)
	const sessionCookie = getSessionCookie(request);

	// If no session cookie, redirect to sign-in
	if (!sessionCookie) {
		const signInUrl = new URL("/sign-in", request.url);
		// Preserve the original URL as a redirect parameter
		signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
		return NextResponse.redirect(signInUrl);
	}

	// Session cookie exists, allow request to proceed
	// Full auth verification happens in protected layout
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/client/:path*",
		"/admin/:path*",
		"/employee/:path*",
		"/onboarding",
	],
};
