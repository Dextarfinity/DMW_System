
"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingOverlay({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className={cn("animate-spin text-primary h-12 w-12")} />
      <p className="mt-4 text-lg text-muted-foreground">{message}</p>
    </div>
  );
}
