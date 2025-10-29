import { supabase } from "./supabase"

// Mock database layer - can be replaced with real database calls
interface Report {
  id: string
  vehicleNumber: string
  driverName: string
  location: string
  issue: string
  description: string
  status: "submitted" | "under-review" | "verified" | "rejected"
  submittedDate: string
  reportedBy: string
  confidence: number
  photo?: string
}

// In-memory storage (replace with real database)
const reports: Report[] = []

export async function createReport(reportData: Omit<Report, "id" | "submittedDate">) {
  const id = `R${String(reports.length + 1).padStart(3, "0")}`
  const newReport: Report = {
    ...reportData,
    id,
    submittedDate: new Date().toISOString(),
  }
  reports.push(newReport)
  return newReport
}

export async function getReports(filters?: { status?: string; location?: string }) {
  let filtered = [...reports]

  if (filters?.status) {
    filtered = filtered.filter((r) => r.status === filters.status)
  }

  if (filters?.location) {
    filtered = filtered.filter((r) => r.location.toLowerCase().includes(filters.location!.toLowerCase()))
  }

  return filtered
}

export async function getReportById(id: string) {
  return reports.find((r) => r.id === id)
}

export async function updateReportStatus(id: string, status: Report["status"]) {
  const report = reports.find((r) => r.id === id)
  if (report) {
    report.status = status
  }
  return report
}

export async function getStatistics() {
  try {
    // Use the view directly for real-time statistics
    const { data, error } = await supabase
      .from("report_statistics")
      .select("*")
      .single()

    if (error) {
      console.error("Error fetching statistics from view:", error)
      // Fallback: calculate statistics directly from reports table
      console.log("Falling back to direct calculation from reports table...")
      const { data: reports, error: reportsError } = await supabase
        .from("reports")
        .select("status, credibility_score, vehicle_number")

      if (reportsError) {
        console.error("Error fetching reports for statistics:", reportsError)
        return {
          total: 0,
          verified: 0,
          pending: 0,
          rejected: 0,
          averageConfidence: 0,
        }
      }

      const total = (reports as any[]).length
      const verified = (reports as any[]).filter((r: any) => r.status === 'resolved').length
      const pending = (reports as any[]).filter((r: any) => r.status === 'pending').length
      const rejected = (reports as any[]).filter((r: any) => r.status === 'invalid').length
      const averageConfidence = total > 0
        ? Math.round((reports as any[]).reduce((sum: number, r: any) => sum + (r.credibility_score || 0), 0) / total)
        : 0

      return {
        total,
        verified,
        pending,
        rejected,
        averageConfidence,
      }
    }

    return {
      total: (data as any).total_reports || 0,
      verified: (data as any).verified_count || 0,
      pending: (data as any).pending_count || 0,
      rejected: (data as any).rejected_count || 0,
      averageConfidence: Math.round((data as any).average_confidence || 0),
    }
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return {
      total: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      averageConfidence: 0,
    }
  }
}

export async function getMapData() {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("id, location_address, location_lat, location_lng, report_reason, status, created_at, vehicle_number")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching map data:", error)
      return []
    }

    return (data || [])
      .filter((r: any) => r.location_lat && r.location_lng) // Only include reports with valid GPS coordinates
      .map((r: any) => ({
        id: r.id,
        location: r.location_address || "Unknown location",
        lat: parseFloat(r.location_lat),
        lng: parseFloat(r.location_lng),
        issue: r.report_reason || "General",
        status: r.status === "resolved" ? "verified" : "verified",
        timestamp: r.created_at,
        vehicleNumber: r.vehicle_number,
      }))
  } catch (error) {
    console.error("Error fetching map data:", error)
    return []
  }
}
