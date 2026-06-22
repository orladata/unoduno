"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CommandPalette } from "@/components/command-palette"

interface DashboardShellProps {
  profile: {
    id: string
    email: string
    credit_balance: number
    subscription_tier: string | null
  }
  children: React.ReactNode
}

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#00ff41]/30 selection:text-black">
      {/* Sidebar */}
      <DashboardSidebar
        creditBalance={profile.credit_balance}
        email={profile.email}
        subscriptionTier={profile.subscription_tier}
        onLogout={handleLogout}
      />

      {/* Command Palette (global) */}
      <CommandPalette />

      {/* Background glow effects - Neon Green */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[10%] w-[35%] h-[35%] rounded-full bg-[#00ff41]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[25%] h-[25%] rounded-full bg-[#00ff41]/[0.02] blur-[100px]" />
      </div>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="relative z-10 lg:pl-[var(--sidebar-width)] min-h-screen transition-[padding] duration-300">
        <div className="px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8 pb-20 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
