import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)", "/profile(.*)"]);
const isAuthPage = createRouteMatcher(["/auth"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authenticated = await convexAuth.isAuthenticated();

  // Redirect unauthenticated users away from protected routes
  if (isProtected(request) && !authenticated) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }

  // Redirect authenticated users away from the auth page
  if (isAuthPage(request) && authenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
