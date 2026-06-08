import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileProvider } from "./profile-context"
import { DashboardShell } from "./dashboard-shell"
import { auth, currentUser } from "@clerk/nextjs/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("credit_balance, subscription_tier")
    .eq("id", userId)
    .maybeSingle()

  const profileData = {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress ?? "",
    credit_balance: profile?.credit_balance ?? 0,
    subscription_tier: profile?.subscription_tier ?? null
  }

  return (
    <ProfileProvider profile={profileData}>
      <DashboardShell profile={profileData}>
        {children}
      </DashboardShell>
    </ProfileProvider>
  )
}
