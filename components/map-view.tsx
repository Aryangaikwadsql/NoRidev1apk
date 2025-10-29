"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import LeafletMap from "@/components/leaflet-map"

interface Incident {
  id: string
  location: string
  lat: number
  lng: number
  issue: string
  status: "verified" | "pending"
  timestamp: string
}

export function MapView() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch("/api/map")
        const data = await response.json()
        if (data.success) {
          const mappedIncidents: Incident[] = data.incidents
            .filter((inc: any) => inc.lat && inc.lng) // Only include incidents with valid coordinates
            .map((inc: any) => ({
              id: inc.id,
              location: inc.location,
              lat: inc.lat,
              lng: inc.lng,
              issue: inc.issue,
              status: inc.status === "verified" ? "verified" : "pending",
              timestamp: new Date(inc.timestamp).toLocaleDateString(),
            }))
          setIncidents(mappedIncidents)
        }
      } catch (error) {
        console.error("Error fetching incidents:", error)
        setIncidents([])
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()

    // Refresh map data every 30 seconds for real-time updates
    const interval = setInterval(fetchIncidents, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 p-4">
      <LeafletMap incidents={incidents} loading={loading} />

      {/* Incidents List */}
      <div>
        <h3 className="font-semibold mb-4 text-lg">Reported Incidents</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-base">Loading incidents...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-base">No incidents reported yet</p>
              <p className="text-sm text-muted-foreground mt-2">Incidents will appear here once reported</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-4 rounded-lg border bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-4 h-4 rounded-full flex-shrink-0 mt-2 ${
                      incident.status === "verified" ? "bg-blue-600" : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base text-black">{incident.location}</p>
                    <p className="text-sm text-gray-600">{incident.issue}</p>
                    <p className="text-sm text-gray-500 mt-1">{incident.timestamp}</p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1.5 rounded-full flex-shrink-0 ${
                      incident.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 leading-relaxed">
          Tap on markers to view incident details.
        </p>
      </div>
    </div>
  )
}
