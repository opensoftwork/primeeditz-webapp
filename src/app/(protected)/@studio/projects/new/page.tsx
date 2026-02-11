"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewProjectRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/quotations/new");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-white/40 animate-pulse font-black uppercase tracking-widest text-xs">
        Redirecting to Quotation Request...
      </p>
    </div>
  );
}
