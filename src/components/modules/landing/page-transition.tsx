'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

// Animation function for revealing the page
function revealTransition() {
  return new Promise((resolve) => {
    gsap.set('.transition-overlay', { scaleY: 1, transformOrigin: 'top' });
    gsap.to('.transition-overlay', {
      scaleY: 0,
      duration: 0.6,
      delay: 0.5,
      ease: 'power2.inOut',
      onComplete: resolve,
    });
  });
}

export function PageTransition() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Initial reveal on mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      gsap.set('.transition-overlay', { scaleY: 1, transformOrigin: 'top' });
      revealTransition();
    }
  }, []);

  useEffect(() => {
    // Only reveal on route change (not initial mount)
    // The TransitionLink component handles the "cover" animation before navigation
    // This effect only handles the "reveal" after navigation completes
    if (isInitialMount.current) return;
    
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      
      // Small delay to ensure route change has completed
      const handleRouteChange = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await revealTransition();
      };

      handleRouteChange();
    }
  }, [pathname]);

  return (
    <div className="transition">
      <div className="transition-overlay"></div>
    </div>
  );
}

