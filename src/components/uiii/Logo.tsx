import { cn } from "@/lib/utils";
import { SquareDashedMousePointer } from "lucide-react";
import Link from "next/link";
import React from "react";

function Logo({
  fontSize = "text-2xl",
  iconSize = 20,
}: {
  fontSize?: string;
  iconSize?: number;
}) {
  return (
    <Link
      href="/"
      className={cn("font-bold flex items-center gap-2 font-display", fontSize)}
    >
      <div className="rounded-none bg-primary p-2">
        <SquareDashedMousePointer size={iconSize} className="stroke-primary-foreground" />
      </div>
      <div>
        <span className="text-foreground">Scraper</span>
        <span className="text-primary">Flow</span>
      </div>

    </Link>
  );
}

export default Logo;
