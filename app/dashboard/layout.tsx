import { Navbar } from "@/components/navbar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileProvider } from "./profile-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credit_balance, subscription_tier")
    .eq("id", user.id)
    .maybeSingle()

  const profileData = {
    id: user.id,
    email: user.email ?? "",
    credit_balance: profile?.credit_balance ?? 0,
    subscription_tier: profile?.subscription_tier ?? null
  }

  return (
    <ProfileProvider profile={profileData}>
      <div className="min-h-screen bg-[#000000] text-white selection:bg-blue-500/30">
        <Navbar />
        {/* Background glow effects for dashboard */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>
        <div className="relative z-10 pt-24">
          {children}
        </div>
      </div>
    </ProfileProvider>
  )
}
