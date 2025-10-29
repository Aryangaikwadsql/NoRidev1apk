import { supabase } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vehicleNumber: string }> }
) {
  try {
    const { vehicleNumber } = await params
    const vehicleNumberUpper = vehicleNumber.toUpperCase()

    // Validate vehicle number format
    const pattern = /^MH\d{2}[A-Z]{2}\d{4}$/
    if (!pattern.test(vehicleNumber)) {
      return Response.json(
        { error: "Invalid vehicle number format" },
        { status: 400 }
      )
    }

    // Get all reports for this vehicle
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("id, vehicle_number, report_reason, status, created_at, credibility_score, location_address, report_details, reporter_name, is_anonymous")
      .eq("vehicle_number", vehicleNumber)
      .order("created_at", { ascending: false })

    if (reportsError) {
      console.error("Error fetching vehicle reports:", reportsError)
      return Response.json(
        { error: "Failed to fetch vehicle data" },
        { status: 500 }
      )
    }

    if (!reports || reports.length === 0) {
      return Response.json({
        success: true,
        vehicle: null,
        message: "No reports found for this vehicle"
      })
    }

    // Calculate statistics
    const totalReports = reports.length
    const verifiedReports = reports.filter((r: any) => r.status === 'resolved').length
    const lastReported = (reports as any)[0]?.created_at || null

    // Get unique issues
    const recentIssues = [...new Set(reports.map((r: any) => r.report_reason).filter(Boolean))]

    // Get RTO jurisdiction (simplified - in real app, this would be a lookup table)
    const rtoCode = vehicleNumber.substring(2, 4)
    const rtoOffice = getRTOOffice(rtoCode)

    const vehicleData = {
      vehicleNumber: vehicleNumber,
      totalReports: totalReports,
      verifiedReports: verifiedReports,
      lastReported: lastReported ? new Date(lastReported).toLocaleDateString() : "Unknown",
      rtoOffice: rtoOffice,
      recentIssues: recentIssues.slice(0, 5), // Limit to 5 most recent issues
      reports: reports.map((r: any) => ({
        id: r.id,
        report_reason: r.report_reason,
        status: r.status,
        created_at: r.created_at,
        credibility_score: r.credibility_score,
        location: r.location_address,
        report_details: r.report_details,
        reporter_name: r.reporter_name,
        is_anonymous: r.is_anonymous
      }))
    }

    return Response.json({
      success: true,
      vehicle: vehicleData
    })

  } catch (error) {
    console.error("Error in vehicle search API:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function getRTOOffice(rtoCode: string): string {
  const rtoMap: Record<string, string> = {
    "01": "South Mumbai RTO",
    "02": "Andheri RTO",
    "03": "Bandra RTO",
    "04": "Borivali RTO",
    "05": "Thane RTO",
    "06": "Kalyan RTO",
    "12": "Pune RTO",
    "14": "Nagpur RTO",
  }

  return rtoMap[rtoCode] || `RTO Office ${rtoCode}`
}
