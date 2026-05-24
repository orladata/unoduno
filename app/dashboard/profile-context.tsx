"use client"

import { createContext, useContext } from "react"

export interface ProfileContextData {
  id: string
  email: string
  credit_balance: number
  subscription_tier: string | null
}

const ProfileContext = createContext<ProfileContextData | undefined>(undefined)

export function ProfileProvider({ 
  children, 
  profile 
}: { 
  children: React.ReactNode
  profile: ProfileContextData 
}) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    return null
  }
  return context
}
