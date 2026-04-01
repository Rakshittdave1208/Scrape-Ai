
"use client";

import BreadcrumbHeader from '@/components/uiii/BreadcrumbHeader'
import DesktopSidebar from '@/components/uiii/sidebar'
import { MobileSidebar } from '@/components/uiii/sidebar'
import { ModeToggle } from '@/components/uiii/ThemeModeToggle'
import { SignedIn, UserButton } from '@clerk/nextjs'

import { Separator } from '@radix-ui/react-separator'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <DesktopSidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-[56px] items-center justify-between border-b-2 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <MobileSidebar />
            </div>
            <BreadcrumbHeader />
          </div>
          <div className="flex items-center gap-1"><ModeToggle />
            <SignedIn >
              <UserButton />
            </SignedIn>
          </div>
        </header>
        <Separator />
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <div className="flex w-full max-w-none flex-1 min-h-0 flex-col overflow-y-auto px-4 py-4 text-accent-foreground md:px-6">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}

export default layout
