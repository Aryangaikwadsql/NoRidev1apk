import { searchLocations } from "@/lib/location-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 3) {
      return Response.json({ success: false, error: "Query must be at least 3 characters" }, { status: 400 })
    }

    const suggestions = await searchLocations(query)
    return Response.json({ success: true, suggestions })
  } catch (error) {
    console.error("Error searching locations:", error)
    return Response.json({ error: "Failed to search locations" }, { status: 500 })
  }
}
