import { createClient } from "@supabase/supabase-js"

// Use the environment variables that are already configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface TPHUser {
  id: string
  name: string
  age: number
  score: number
  persona: string
  referral_code?: string
  completed_at: string
  created_at: string
  updated_at: string
}

export interface ReferralCode {
  id: string
  code: string
  owner_id: string
  owner_name: string
  owner_score: number
  is_valid: boolean
  created_at: string
  updated_at: string
}

// Store user TPH result in Supabase
export async function storeTPHResult(userData: {
  name: string
  age: number
  score: number
  persona: string
  referralCode?: string
}) {
  try {
    // Insert user data
    const { data: user, error: userError } = await supabase
      .from("tph_users")
      .insert({
        name: userData.name,
        age: userData.age,
        score: userData.score,
        persona: userData.persona,
        referral_code: userData.referralCode,
      })
      .select()
      .single()

    if (userError) throw userError

    // If user scored 80+ and has a referral code, store it in referral_codes table
    if (userData.score >= 80 && userData.referralCode && user) {
      const { error: referralError } = await supabase.from("referral_codes").insert({
        code: userData.referralCode,
        owner_id: user.id,
        owner_name: userData.name,
        owner_score: userData.score,
        is_valid: true,
      })

      if (referralError) {
        console.error("Error storing referral code:", referralError)
      }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error storing TPH result:", error)
    return { success: false, error }
  }
}

// Verify referral code from Supabase
export async function verifyReferralCode(code: string) {
  try {
    const { data, error } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_valid", true)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return { success: false, error: "Invalid referral code" }
      }
      throw error
    }

    // Check if the owner scored 80+
    if (data.owner_score >= 80) {
      return { success: true, referralCode: data }
    } else {
      return { success: false, error: "Referral code owner did not meet score requirement" }
    }
  } catch (error) {
    console.error("Error verifying referral code:", error)
    return { success: false, error: "Failed to verify referral code" }
  }
}

// Get top scorers for leaderboard (optional feature)
export async function getTopScorers(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("tph_users")
      .select("name, score, persona, completed_at")
      .order("score", { ascending: false })
      .order("completed_at", { ascending: true })
      .limit(limit)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching top scorers:", error)
    return { success: false, error }
  }
}
