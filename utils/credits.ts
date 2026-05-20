import { createAdminClient } from "./supabase/admin"

/**
 * Atomically checks if a user has sufficient credit balance and deducts the amount.
 * Immune to race conditions because it operates within a database transaction (SELECT FOR UPDATE).
 * 
 * @param userId - The Supabase user UUID
 * @param amountInCents - The cost to deduct in cents (e.g., R$ 1.00 = 100)
 * @returns Promise<boolean> - True if deduction was successful, false if insufficient balance or user not found
 */
export async function deductCredits(userId: string, amountInCents: number): Promise<boolean> {
  if (!userId || amountInCents <= 0) {
    console.error("Invalid arguments passed to deductCredits:", { userId, amountInCents })
    return false
  }

  const supabaseAdmin = createAdminClient()

  try {
    // Call the database function decrement_credits(target_user_id, amount_cents)
    const { data: success, error } = await supabaseAdmin.rpc("decrement_credits", {
      target_user_id: userId,
      amount_cents: amountInCents,
    })

    if (error) {
      console.error("Failed to execute decrement_credits RPC:", error)
      return false
    }

    return !!success
  } catch (err) {
    console.error("Internal error during credit deduction:", err)
    return false
  }
}

/**
 * Helper to fetch a user's current credit balance.
 * 
 * @param userId - The Supabase user UUID
 * @returns Promise<number> - Current credit balance in cents (default is 0 if not found)
 */
export async function getCreditBalance(userId: string): Promise<number> {
  if (!userId) return 0

  const supabaseAdmin = createAdminClient()

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("credit_balance")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("Error retrieving credit balance:", error)
      return 0
    }

    return data?.credit_balance ?? 0
  } catch (err) {
    console.error("Internal error getting credit balance:", err)
    return 0
  }
}
