import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except static files, api routes and Netlify internals
    "/((?!api|_next|_vercel|_netlify|.*\\..*).*)",
  ],
};
