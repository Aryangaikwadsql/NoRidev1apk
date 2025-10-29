 "use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { AlertCircle, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"

interface MapIncident {
  id: string
  location: string
  lat: number
  lng: number
  issue: string
  status: "verified" | "pending"
  timestamp: string
  vehicleNumber: string
  count?: number
}

interface ClusterMarker {
  lat: number
  lng: number
  count: number
  incidents: MapIncident[]
}

export function EnhancedMapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [incidents, setIncidents] = useState<MapIncident[]>([])
  const [clusters, setClusters] = useState<ClusterMarker[]>([])
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null)
  const [timeFilter, setTimeFilter] = useState<"24h" | "7d" | "30d" | "all">("7d")
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all")
  const [showHeatmap, setShowHeatmap] = useState(false)

  useEffect(() => {
    fetchIncidents()

    // Refresh map data every 30 seconds for real-time updates
    const interval = setInterval(fetchIncidents, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchIncidents = async () => {
    try {
      const response = await fetch("/api/map")
      const data = await response.json()
      if (data.success) {
        const formattedIncidents = data.incidents
          .filter((inc: any) => inc.lat && inc.lng) // Only include incidents with valid GPS coordinates
          .map((inc: any) => ({
            id: inc.id,
            location: inc.location,
            lat: inc.lat,
            lng: inc.lng,
            issue: inc.issue,
            status: inc.status === "verified" ? "verified" : "verified",
            timestamp: new Date(inc.timestamp).toLocaleString(),
            vehicleNumber: inc.vehicleNumber,
          }))
        setIncidents(formattedIncidents)
        clusterIncidents(formattedIncidents)
      } else {
        // Fallback to empty array if no success
        setIncidents([])
        setClusters([])
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
      // Fallback to empty array if API fails
      setIncidents([])
      setClusters([])
    }
  }

  const clusterIncidents = (data: MapIncident[]) => {
    const clusterRadius = 0.02 // Approximate radius in degrees
    const clustered: ClusterMarker[] = []
    const processed = new Set<string>()

    data.forEach((incident) => {
      if (processed.has(incident.id)) return

      const nearby = data.filter((other) => {
        const distance = Math.sqrt(Math.pow(other.lat - incident.lat, 2) + Math.pow(other.lng - incident.lng, 2))
        return distance < clusterRadius
      })

      if (nearby.length > 1) {
        nearby.forEach((inc) => processed.add(inc.id))
        clustered.push({
          lat: nearby.reduce((sum, inc) => sum + inc.lat, 0) / nearby.length,
          lng: nearby.reduce((sum, inc) => sum + inc.lng, 0) / nearby.length,
          count: nearby.length,
          incidents: nearby,
        })
      } else {
        processed.add(incident.id)
        clustered.push({
          lat: incident.lat,
          lng: incident.lng,
          count: 1,
          incidents: [incident],
        })
      }
    })

    setClusters(clustered)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    // Draw background
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Calculate bounds
    const lats = clusters.map((c) => c.lat)
    const lngs = clusters.map((c) => c.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const padding = 40
    const mapWidth = canvas.width - padding * 2
    const mapHeight = canvas.height - padding * 2

    // Draw heatmap if enabled
    if (showHeatmap) {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      clusters.forEach((cluster) => {
        const x = padding + ((cluster.lng - minLng) / (maxLng - minLng)) * mapWidth
        const y = padding + ((maxLat - cluster.lat) / (maxLat - minLat)) * mapHeight

        const intensity = Math.min(cluster.count / 5, 1)
        const radius = 30

        for (let i = -radius; i < radius; i++) {
          for (let j = -radius; j < radius; j++) {
            const px = Math.floor(x + i)
            const py = Math.floor(y + j)

            if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
              const distance = Math.sqrt(i * i + j * j)
              const alpha = Math.max(0, 1 - distance / radius) * intensity

              const idx = (py * canvas.width + px) * 4
              data[idx] = Math.min(255, data[idx] + 255 * alpha * 0.5) // Red
              data[idx + 1] = Math.min(255, data[idx + 1] + 100 * alpha * 0.3) // Green
              data[idx + 2] = Math.min(255, data[idx + 2] + 50 * alpha * 0.2) // Blue
              data[idx + 3] = 200
            }
          }
        }
      })

      ctx.putImageData(imageData, 0, 0)
    }

    // Draw clusters
    clusters.forEach((cluster) => {
      const x = padding + ((cluster.lng - minLng) / (maxLng - minLng)) * mapWidth
      const y = padding + ((maxLat - cluster.lat) / (maxLat - minLat)) * mapHeight

      const radius = cluster.count > 1 ? 16 : 12

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.beginPath()
      ctx.arc(x, y + 2, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw marker
      const hasVerified = cluster.incidents.some((inc) => inc.status === "verified")
      ctx.fillStyle = hasVerified ? "#1e40af" : "#f59e0b"

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw border
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Draw count if clustered
      if (cluster.count > 1) {
        ctx.fillStyle = "#fff"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(cluster.count.toString(), x, y)
      }
    })

    // Draw title
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Mumbai Incident Map", 20, 25)

    // Draw legend
    const legendY = canvas.height - 80
    ctx.fillStyle = "#fff"
    ctx.fillRect(10, legendY, 160, 70)
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(10, legendY, 160, 70)

    ctx.fillStyle = "#1e40af"
    ctx.beginPath()
    ctx.arc(25, legendY + 15, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#374151"
    ctx.font = "12px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Verified", 40, legendY + 18)

    ctx.fillStyle = "#f59e0b"
    ctx.beginPath()
    ctx.arc(25, legendY + 35, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#374151"
    ctx.fillText("Pending", 40, legendY + 38)

    ctx.fillStyle = "#374151"
    ctx.font = "10px Arial"
    ctx.fillText("Clustered markers", 40, legendY + 58)
  }, [clusters, showHeatmap])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const lats = clusters.map((c) => c.lat)
    const lngs = clusters.map((c) => c.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const padding = 40
    const mapWidth = canvas.width - padding * 2
    const mapHeight = canvas.height - padding * 2

    clusters.forEach((cluster) => {
      const clusterX = padding + ((cluster.lng - minLng) / (maxLng - minLng)) * mapWidth
      const clusterY = padding + ((maxLat - cluster.lat) / (maxLat - minLat)) * mapHeight

      const distance = Math.sqrt((x - clusterX) ** 2 + (y - clusterY) ** 2)
      if (distance < 20) {
        if (cluster.count === 1) {
          setSelectedIncident(cluster.incidents[0])
        } else {
          setSelectedIncident(null)
        }
      }
    })
  }

  return (
    <div className="space-y-4 p-4">
      {/* Filters */}
      <Card className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium mb-1 block">Time Range</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-xs">Show heatmap</span>
        </label>
      </Card>

      {/* Map */}
      <div ref={containerRef} className="bg-gray-100 rounded-lg overflow-hidden h-96 relative">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full cursor-pointer" />
      </div>

      {/* Selected Incident Details */}
      {selectedIncident && (
        <Card className="p-4 space-y-3 border-accent">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{selectedIncident.vehicleNumber}</h3>
              <p className="text-xs text-black">{selectedIncident.location}</p>
            </div>
            <button onClick={() => setSelectedIncident(null)} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Issue</p>
              <p className="text-sm">{selectedIncident.issue}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{selectedIncident.timestamp}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  selectedIncident.status === "verified"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {selectedIncident.status}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Blue markers are verified reports. Yellow are pending. Clustered markers show multiple reports in the same
          area.
        </p>
      </div>
    </div>
  )
}
