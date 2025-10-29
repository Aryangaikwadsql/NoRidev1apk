import { createClient } from "@supabase/supabase-js"
import type { Database, Report } from "./types"

export interface SupabaseConfig {
  url: string
  anonKey: string
}

export const supabaseConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
}

export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey)

export async function uploadImage(file: File, bucket: string = "reports"): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      console.error("Error uploading image:", error)
      console.error("Make sure the 'reports' bucket exists in your Supabase dashboard and is set to public")
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log("Image uploaded successfully:", publicUrl)
    return publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}

export async function getReportsFromDB(filters?: Record<string, any>) {
  try {
    let query = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (filters) {
      query = query.match(filters)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching reports:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching reports:", error)
    return []
  }
}

export async function createReportInDB(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from("reports")
      .insert(reportData)
      .select()

    if (error) {
      console.error("Error creating report:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error creating report:", error)
    return null
  }
}

export async function getVehicleStatistics(vehicleNumber: string) {
  try {
    const { data, error } = await supabase
      .from("vehicle_statistics")
      .select("*")
      .eq("vehicle_number", vehicleNumber)
      .single()

    if (error) {
      console.error("Error fetching vehicle statistics:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching vehicle statistics:", error)
    return null
  }
}

export async function getReportStatistics() {
  try {
    const { data, error } = await supabase
      .from("report_statistics")
      .select("*")
      .single()

    if (error) {
      console.error("Error fetching report statistics:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching report statistics:", error)
    return null
  }
}
