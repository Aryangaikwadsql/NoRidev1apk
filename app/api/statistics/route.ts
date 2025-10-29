import { getStatistics } from "@/lib/db"

export async function GET() {
  try {
    const stats = await getStatistics()

    // Calculate unique vehicles from the database
    const { supabase } = await import("@/lib/supabase")
    const { data: uniqueData, error: uniqueError } = await supabase
      .from("reports")
      .select("vehicle_number")

    let uniqueVehicles = 0
    if (!uniqueError && uniqueData) {
      const uniqueVehicleNumbers = new Set(uniqueData.map((r: any) => r.vehicle_number))
      uniqueVehicles = uniqueVehicleNumbers.size
    } else {
      uniqueVehicles = stats.total // fallback
    }

    return Response.json({
      success: true,
      statistics: {
        total_reports: stats.total,
        verified_count: stats.verified,
        pending_count: stats.pending,
        rejected_count: stats.rejected,
        flagged_count: 0, // Not implemented yet
        average_confidence: stats.averageConfidence,
        unique_vehicles: uniqueVehicles,
      }
    })
  } catch (error) {
    return Response.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
