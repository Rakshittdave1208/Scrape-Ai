"use client";

import {
  CoinsIcon,
  HomeIcon,
  Layers2Icon,
  MenuIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import React, { useState } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { usePathname } from "next/navigation";

// Define sidebar routes
const routes = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/workflows", label: "Workflows", icon: Layers2Icon },
  { href: "/credentials", label: "Credentials", icon: ShieldCheckIcon },
  { href: "/billing", label: "Billing", icon: CoinsIcon },
];

function DesktopSidebar() {
  const pathname = usePathname();
  const activeRoute =
    routes.find(
      (route) => route.href.length > 0 && pathname.includes(route.href)
    ) || routes[0];

  return (
    <div
      className="hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-hidden
      w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground
      text-muted-foreground border-r-2 border-separate p-4"
    >
      {/* Logo Section */}
      <Logo />
      <div className="flex flex-col p-2">TODO Credits</div>

      {/* Navigation Links */}
      <div className="flex flex-col p-2 space-y-2 mt-4">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive =
            pathname === route.href ||
            (route.href !== "/" && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={buttonVariants({
                variant: isActive ? "sidebarActiveItems" : "sidebarItem",
              })}
            >
              <Icon size={20} />
              <span>{route.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export default DesktopSidebar;


export function MobileSidebar() {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  const activeRoute =
    routes.find(
      (route) => route.href.length > 0 && pathname.includes(route.href)
    ) || routes[0];
  return (
    <div className="block border-separate bg-background md:hidden">
      <nav className="w-64 flex items-center justify-between px-8">
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[400px] sm:w-[540px] space-y-4"
            side={"left"}
          >
            <Logo />
            <div className="flex flex-col gap-1">
              {routes.map((route) => {
                const Icon = route.icon;
                const isActive =
                  pathname === route.href ||
                  (route.href !== "/" && pathname.startsWith(route.href));
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={buttonVariants({
                      variant: isActive ? "sidebarActiveItems" : "sidebarItem",
                    })}
                    onClick={() => setOpen(prev => !prev)}
                  >
                    <Icon size={20} />
                    <span>{route.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
