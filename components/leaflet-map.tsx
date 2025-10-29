"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface Incident {
  id: string
  location: string
  lat: number
  lng: number
  issue: string
  status: "verified" | "pending"
  timestamp: string
}

interface LeafletMapProps {
  incidents: Incident[]
  loading: boolean
}

// Create a wrapper component that handles the dynamic import
function LeafletMapWrapper({ incidents, loading }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current || loading) return

    // Dynamically import Leaflet and CSS
    const initMap = async () => {
      const L = (await import("leaflet")).default
      // Import CSS dynamically
      const cssModule = await import("leaflet/dist/leaflet.css")

      // Initialize map if not already done
      if (!leafletMapRef.current && mapRef.current) {
        leafletMapRef.current = L.map(mapRef.current).setView([19.0760, 72.8777], 11)

        // Set z-index lower than header (header is z-50)
        leafletMapRef.current.getContainer().style.zIndex = '40'

        // Override Leaflet control and popup z-indexes to stay below header
        const style = document.createElement('style')
        style.textContent = `
          .leaflet-control-container { z-index: 35 !important; }
          .leaflet-popup { z-index: 38 !important; }
          .leaflet-popup-content-wrapper { z-index: 38 !important; }
          .leaflet-popup-tip { z-index: 38 !important; }
        `
        document.head.appendChild(style)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(leafletMapRef.current)
      }

      const map = leafletMapRef.current

      // Clear existing markers
      markersRef.current.forEach((marker: any) => map.removeLayer(marker))
      markersRef.current = []

      // Group incidents by location to handle multiple reports at same location
      const locationGroups = incidents.reduce((groups, incident) => {
        const key = `${incident.lat},${incident.lng}`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(incident)
        return groups
      }, {} as Record<string, Incident[]>)

      // Add markers for each location group
      Object.entries(locationGroups).forEach(([locationKey, locationIncidents]) => {
        const [lat, lng] = locationKey.split(',').map(Number)
        const count = locationIncidents.length
        const hasVerified = locationIncidents.some(inc => inc.status === "verified")
        const markerColor = hasVerified ? "#1e20afff" : "#f59e0b"

        // Create custom icon with count if multiple incidents
        const customIcon = L.divIcon({
          html: `
            <div style="
              background-color: ${markerColor};
              width: ${count > 1 ? '32px' : '24px'};
              height: ${count > 1 ? '32px' : '24px'};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: ${count > 1 ? '14px' : '12px'};
              font-weight: bold;
            ">
              ${count > 1 ? count : (hasVerified ? "✓" : "?")}
            </div>
          `,
          className: "custom-marker",
          iconSize: count > 1 ? [32, 32] : [24, 24],
          iconAnchor: count > 1 ? [16, 16] : [12, 12],
        })

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-black">${locationIncidents[0].location}</h3>
              <p class="text-sm text-gray-600 mb-2">${count} report${count > 1 ? 's' : ''} at this location</p>
              ${locationIncidents.map((incident, index) => `
                <div class="border-t border-gray-200 pt-2 ${index > 0 ? 'mt-2' : ''}">
                  <p class="text-sm font-medium">${incident.issue}</p>
                  <p class="text-xs text-gray-500">${incident.timestamp}</p>
                  <span class="inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    incident.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }">
                    ${incident.status}
                  </span>
                </div>
              `).join('')}
            </div>
          `)

        markersRef.current.push(marker)
      })

      // Fit map to show all markers if there are any
      if (incidents.length > 0) {
        const group = L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }

    initMap()

    // Cleanup function
    return () => {
      // Markers are cleared in the next effect
    }
  }, [incidents, loading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className="h-80 w-full rounded-lg" />
}

export default function LeafletMap(props: LeafletMapProps) {
  return <LeafletMapWrapper {...props} />
}
