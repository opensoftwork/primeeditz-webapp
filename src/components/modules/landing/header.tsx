"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { TransitionLink } from "./transition-link";

export const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Docs", path: "/docs" },
    { name: "Contact", path: "/contact" },
    { name: "Core Site", path: "/core-site" },
  ];

  return (
    <div className="fixed z-100 top-0 left-0 w-full py-3 sm:py-4 md:py-5 lg:py-6 xl:py-8 pointer-events-none">
      <div className="w-full max-w-[1320px] mx-auto px-3 sm:px-4 md:px-6">
        <header className="relative flex items-center justify-between w-full px-4 sm:px-5 md:px-6 lg:px-8 xl:px-12 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-black/40 border border-white/30 shadow-xl shadow-black/20 pointer-events-auto">
          <TransitionLink href="/" className="shrink-0">
            <Logo className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px]" />
          </TransitionLink>
          {/* Desktop Navigation - Hidden when menu button is used */}
          <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-8 xl:gap-x-10 pointer-events-none">
            <div className="flex items-center gap-x-8 xl:gap-x-10 pointer-events-auto">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.path ||
                  (pathname === "/" && item.path === "/");
                return (
                  <TransitionLink
                    className={`uppercase inline-block font-mono text-sm duration-150 transition-colors ease-out ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                    href={item.path}
                    key={item.name}
                  >
                    {item.name}
                  </TransitionLink>
                );
              })}
            </div>
          </nav>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 shrink-0">
            <Link
              className="uppercase hidden xl:block transition-colors ease-out duration-150 font-mono text-sm text-primary hover:text-primary/80 font-medium"
              href="/sign-in/"
            >
              Sign In
            </Link>
            <Link
              className="uppercase hidden xl:block transition-colors ease-out duration-150 font-mono text-sm text-primary hover:text-primary/80 font-medium"
              href="/sign-up/"
            >
              Sign Up
            </Link>
            <MobileMenu />
          </div>
        </header>
      </div>
    </div>
  );
};
