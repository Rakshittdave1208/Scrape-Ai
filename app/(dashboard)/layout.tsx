
"use client";

import BreadcrumbHeader from '@/components/uiii/BreadcrumbHeader'
import DesktopSidebar from '@/components/uiii/sidebar'
import { ModeToggle } from '@/components/uiii/ThemeModeToggle'
import { SignedIn, SignIn, SignUp, UserButton } from '@clerk/nextjs'

import { Separator } from '@radix-ui/react-separator'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <DesktopSidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-center justify-between px-6 py-4 h-[50px] cointainer border-b-solid border-2">
          <BreadcrumbHeader />
          <div className="gap-1 flex items-center"><ModeToggle />
            <SignedIn >
              <UserButton />
            </SignedIn>
          </div>
        </header>
        <Separator />
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <div className="container flex flex-1 min-h-0 flex-col overflow-y-auto py-4 text-accent-foreground">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}

export default layout
