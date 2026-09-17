import { NextRequest, NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// The most simple usage is when you want to require authentication for your entire site. You can add a middleware.js file with the following:
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// The main work of the middleware is to check if the user is authenticated and redirect them to the appropriate page based on their authentication status. If the user is not authenticated, they will be redirected to the sign in page. If the user is authenticated, they will be redirected to the home page.
export async function proxy(request: NextRequest) {

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET_KEY });
  const url = request.nextUrl.clone(); // Clone the request URL to modify it if needed

  if (token && (
    url.pathname.startsWith('/signin') ||
    url.pathname.startsWith('/sign-up') ||
    url.pathname === '/' ||
    url.pathname.startsWith('/verify'))) {
    // If the user is authenticated and trying to access the sign in page, redirect them to the home page.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.redirect(new URL('/home', request.url));
}

// All the paths i want middlewares to run on
export const config = {
  matcher: [
    '/signin',
    '/sign-up',
    '/',
    '/dashboard/:path*',  // match all paths under /dashboard
    '/verify/:path*',
  ]
}