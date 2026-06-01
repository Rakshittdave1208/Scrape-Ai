"use client";

import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  GitBranchIcon,
  CoinsIcon,
  HomeIcon,
  Layers2Icon,
  MenuIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Define sidebar routes
const routes = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/workflows", label: "Workflows", icon: Layers2Icon },
  { href: "/nodes", label: "Nodes", icon: SparklesIcon },
  { href: "/architecture", label: "Architecture", icon: GitBranchIcon },
  { href: "/credentials", label: "Credentials", icon: ShieldCheckIcon },
  { href: "/billing", label: "Billing", icon: CoinsIcon },
];

function DesktopSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const savedState = window.localStorage.getItem("desktop-sidebar-collapsed");
    setIsCollapsed(savedState === "true");
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("desktop-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div
      className={cn(
        "relative hidden h-screen overflow-hidden border-r-2 border-separate bg-primary/5 p-4 text-muted-foreground transition-[width,min-width,max-width,padding] duration-300 dark:bg-secondary/30 dark:text-foreground md:block",
        isCollapsed ? "min-w-[92px] max-w-[92px] w-[92px] px-3" : "min-w-[280px] max-w-[280px] w-full"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className={cn("overflow-hidden", isCollapsed && "pt-1")}>
          {isCollapsed ? <Logo fontSize="text-base" iconSize={18} /> : <Logo />}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-none"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronsRightIcon size={18} /> : <ChevronsLeftIcon size={18} />}
        </Button>
      </div>

      {!isCollapsed ? <div className="flex flex-col p-2 text-sm">TODO Credits</div> : null}

      <div className={cn("mt-4 flex flex-col p-2 space-y-2", isCollapsed && "px-0")}>
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
              title={route.label}
            >
              <Icon size={20} />
              {!isCollapsed ? <span>{route.label}</span> : null}
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
