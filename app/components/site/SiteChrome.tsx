import { IconArrowRight, IconMenu2 } from "@tabler/icons-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_HREF, CONTACT_EMAIL, SIGN_IN_HREF, SIGN_UP_HREF } from "@/lib/marketing";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/privacy", label: "Privacy" },
];

export function DossierMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-6", className)}>
      <path d="M5 3.5h9.5L19 8v12.5H5z" className="fill-primary" />
      <path d="M14.5 3.5V8H19" className="fill-primary-foreground/30" />
      <path d="M8 12h8M8 15h8M8 18h5" stroke="currentColor" strokeWidth="1.4" className="text-primary-foreground" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
      <DossierMark />
      <span className="dossier-serif text-xl font-medium tracking-tight">Dossier</span>
    </Link>
  );
}

/** Primary call to action: one style, used everywhere on the site. */
export function StartButton({ size = "lg", className, children = "Create your dossier" }: { size?: "sm" | "lg"; className?: string; children?: ReactNode }) {
  return (
    <Button asChild size={size} className={cn("gap-2", className)}>
      <a href={SIGN_UP_HREF()}>
        {children}
        <IconArrowRight className="size-4" aria-hidden="true" />
      </a>
    </Button>
  );
}

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background transition-colors",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={SIGN_IN_HREF()} className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline-block">
            Sign in
          </a>
          <StartButton size="sm" className="hidden sm:inline-flex">
            Get started
          </StartButton>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <IconMenu2 className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[82vw] max-w-sm">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <nav aria-label="Mobile" className="mt-10 flex flex-col gap-1 px-2">
                <Link to="/" className="rounded-md px-3 py-3 text-lg">
                  Home
                </Link>
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} className="rounded-md px-3 py-3 text-lg">
                    {n.label}
                  </Link>
                ))}
                <a href={SIGN_IN_HREF()} className="rounded-md px-3 py-3 text-lg">
                  Sign in
                </a>
                <StartButton className="mt-4 w-full justify-center" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-3 text-sm text-muted-foreground">
            An application coach for scholarships, fellowships, grants and accelerators. Your words, your stories, checked
            before anyone else reads them.
          </p>
        </div>
        <nav aria-label="Product" className="text-sm">
          <p className="font-medium">Product</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link to="/how-it-works" className="hover:text-foreground">
                How it works
              </Link>
            </li>
            <li>
              <a href={SIGN_UP_HREF()} className="hover:text-foreground">
                Create an account
              </a>
            </li>
            <li>
              <a href={APP_HREF()} className="hover:text-foreground">
                Open the app
              </a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Trust" className="text-sm">
          <p className="font-medium">Trust</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy &amp; safety
              </Link>
            </li>
            <li>
              <Link to="/how-it-works#never" className="hover:text-foreground">
                What Dossier never does
              </Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-2 border-t py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 Dossier. Built with Agent-Native for the Builder.io Agent-Native Hackathon.</p>
          <p>Committee reviewers are simulated. Dossier never submits applications for you.</p>
        </div>
      </div>
    </footer>
  );
}

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Section heading pair used across the site: serif title + one line of plain explanation. */
export function SectionHeading({ id, title, children, className }: { id?: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 id={id} className="dossier-serif text-balance text-3xl font-medium leading-tight tracking-tight sm:text-[2.6rem]">
        {title}
      </h2>
      {children ? <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{children}</p> : null}
    </div>
  );
}
