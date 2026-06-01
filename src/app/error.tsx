"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="rounded-none bg-destructive/10 p-4 ring-1 ring-destructive/20">
          <AlertCircleIcon className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight font-display">Something went wrong</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The application encountered an unexpected error. This is likely due to a database schema mismatch after the recent architectural overhaul.
          </p>
          <div className="mt-4 rounded-none bg-muted p-3 text-left">
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Error Digest</p>
            <p className="text-xs font-mono break-all">{error.digest || error.message || "Unknown error"}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => reset()}
            className="gap-2 rounded-none"
          >
            <RotateCcwIcon className="h-4 w-4" />
            Try again
          </Button>
          <Button
            asChild
            className="rounded-none bg-primary text-primary-foreground"
          >
            <a href="/">Back to home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
