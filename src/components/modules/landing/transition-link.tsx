"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, MouseEvent } from "react";
import gsap from "gsap";

function animateTransition() {
  return new Promise((resolve) => {
    gsap.set(".transition-overlay", { scaleY: 0, transformOrigin: "bottom" });
    gsap.to(".transition-overlay", {
      scaleY: 1,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: resolve,
    });
  });
}

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

export function TransitionLink({ href, children, onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't intercept if it's an external link, hash link, or has modifier keys
    if (
      href.startsWith('http') || 
      href.startsWith('mailto:') || 
      href.startsWith('#') ||
      e.ctrlKey || 
      e.metaKey || 
      e.shiftKey
    ) {
      if (onClick) onClick(e);
      return;
    }

    e.preventDefault();
    
    // Check if we're already on this route
    const currentPath = window.location.pathname;
    if (currentPath === href) {
      if (onClick) onClick(e);
      return;
    }
    
    // Show transition overlay first (cover screen from bottom)
    await animateTransition();
    
    // Small delay to ensure overlay is fully visible
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    // Navigate (content changes while overlay is covering screen)
    router.push(href);
    
    // Call original onClick if provided
    if (onClick) onClick(e);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

