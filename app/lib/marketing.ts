import { appPath } from "@agent-native/core/client/api-path";

/** Public website pages: no sign-in, no app sidebar. Everything else is the app. */
export const MARKETING_PATHS = ["/", "/how-it-works", "/privacy"] as const;

export function isMarketingPath(pathname: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return (MARKETING_PATHS as readonly string[]).includes(path);
}

/** Full-document links: the server owns sign-up and sign-in. */
export const SIGN_UP_HREF = () => appPath("/signup");
export const SIGN_IN_HREF = () => appPath(`/sign-in?return=${encodeURIComponent("/programs")}`);
export const APP_HREF = () => appPath("/programs");

/** Where people ask questions or request account deletion. */
export const CONTACT_EMAIL = "softonchain@gmail.com";
