"use client";

import { Menu, X } from "lucide-react";
import { useMenuStore } from "@/stores/use-menu-store";

export const MobileMenu = () => {
  const { isOpen, toggleMenu } = useMenuStore();

  return (
    <button
      onClick={toggleMenu}
      className="menu-toggle-btn uppercase font-mono text-foreground/90 hover:text-foreground duration-150 transition-colors ease-out z-50 relative"
      aria-label="Toggle menu"
    >
      {isOpen ? <X size={24} className="sm:w-6 sm:h-6 md:w-6 md:h-6" /> : <Menu size={24} className="sm:w-6 sm:h-6 md:w-6 md:h-6" />}
    </button>
  );
};
