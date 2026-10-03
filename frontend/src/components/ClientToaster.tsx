"use client";

import { Toaster } from "sonner";

export function ClientToaster() {
  return <Toaster position="top-right" richColors theme="light" style={{ zIndex: 999999 }} />;
}
