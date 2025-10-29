import { getMapData } from "@/lib/db"

export async function GET() {
  try {
    const incidents = await getMapData()
    return Response.json({ success: true, incidents })
  } catch (error) {
    return Response.json({ error: "Failed to fetch map data" }, { status: 500 })
  }
}
