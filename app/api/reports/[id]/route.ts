import { getReportById, updateReportStatus } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const report = await getReportById(params.id)

    if (!report) {
      return Response.json({ error: "Report not found" }, { status: 404 })
    }

    return Response.json({ success: true, report })
  } catch (error) {
    return Response.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    if (!body.status) {
      return Response.json({ error: "Status is required" }, { status: 400 })
    }

    const report = await updateReportStatus(params.id, body.status)

    if (!report) {
      return Response.json({ error: "Report not found" }, { status: 404 })
    }

    return Response.json({ success: true, report })
  } catch (error) {
    return Response.json({ error: "Failed to update report" }, { status: 500 })
  }
}
