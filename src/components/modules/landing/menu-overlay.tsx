"use client";

import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenuStore } from "@/stores/use-menu-store";
import { TransitionLink } from "./transition-link";
import "@/styles/header.css";
import "@/styles/transition.css";

export const MenuOverlay = () => {
  const { isOpen, closeMenu } = useMenuStore();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Docs", path: "/docs" },
    { name: "Contact", path: "/contact" },
    { name: "Core Site", path: "/core-site" },
  ];

  const socialLinks = [
    {
      href: "https://www.instagram.com/prime.editzofficials/",
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61581754295419",
      icon: Facebook,
      label: "Facebook",
    },
    {
      href: "https://www.linkedin.com/company/prime-editz/about/",
      icon: Linkedin,
      label: "LinkedIn",
    },
    {
      href: "https://www.youtube.com/@PrimeEditz-2025",
      icon: Youtube,
      label: "YouTube",
    },
    { href: "https://x.com/PrimeEditz2025", icon: Twitter, label: "Twitter" },
  ];

  return (
    <div className={`nav-overlay ${isOpen ? "open" : ""}`} onClick={closeMenu}>
      {/* Navigation Items - Top Center */}
      <div className="nav-items" onClick={(e) => e.stopPropagation()}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <div
              key={item.name}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <TransitionLink
                href={item.path}
                className="a"
                onClick={closeMenu}
              >
                {item.name.toUpperCase()}
              </TransitionLink>
            </div>
          );
        })}
      </div>

      {/* Footer Section */}
      <div className="nav-footer">
        <div className="container">
          <div className="nav-footer-content">
            {/* Social Links Section */}
            <div className="nav-footer-section">
              <h4 className="nav-footer-heading">Follow Us</h4>
              <div className="nav-footer-social">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="nav-footer-social-link"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="nav-footer-social-icon" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="nav-footer-section">
              <h4 className="nav-footer-heading">Contact Details</h4>
              <div className="nav-footer-info">
                <p className="nav-footer-text">+91 636432 5166</p>
                <p className="nav-footer-text">info@primeeditz.com</p>
              </div>
            </div>

            {/* Working Hours Section */}
            <div className="nav-footer-section">
              <h4 className="nav-footer-heading">Working Hours</h4>
              <div className="nav-footer-info">
                <p className="nav-footer-text">Mon-Sat</p>
                <p className="nav-footer-text">9:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
