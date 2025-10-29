import { getReportsFromDB } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const location = searchParams.get("location")

    const filters: Record<string, any> = {}
    if (status) filters.status = status
    if (location) filters.location_address = location

    const reports = await getReportsFromDB(filters)

    return Response.json({ success: true, reports })
  } catch (error) {
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
