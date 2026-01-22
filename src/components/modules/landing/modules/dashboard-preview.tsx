"use client";

// import { useState, useEffect } from "react";
import Image from "next/image";
// import { ImageViewer } from "../ui/image-viewer";

export function DashboardPreview() {
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for custom event from View button - Commented out for now
  // useEffect(() => {
  //   const handleOpenModal = () => setIsModalOpen(true);
  //   window.addEventListener('openDashboardModal', handleOpenModal);
  //   return () => window.removeEventListener('openDashboardModal', handleOpenModal);
  // }, []);

  const dashboardImage = "/landing/hero-dashboard.svg";

  return (
    <>
      <div className="w-full group">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background/20 rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-4 shadow-2xl sm:shadow-3xl border border-foreground/10 w-full transition-all duration-500 hover:border-foreground/20 hover:shadow-[0_25px_50px_-12px_rgba(0,147,221,0.3)]">
          <div 
            className="relative overflow-hidden"
            // onClick={() => {
            //   // Only allow click on mobile - Commented out for now
            //   if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            //     setIsModalOpen(true);
            //   }
            // }}
          >
            <Image
              src={dashboardImage}
              alt="Dashboard preview - Prime Editz platform interface"
              width={1320}
              height={800}
              className="w-full h-auto object-contain"
              sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, (max-width: 1280px) 85vw, 1320px"
              priority
              quality={90}
            />
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reusable Image Viewer Modal - Commented out for now */}
      {/* <ImageViewer
        images={dashboardImage}
        alt="Dashboard preview"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}
    </>
  )
}
