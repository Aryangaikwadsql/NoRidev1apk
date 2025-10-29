"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReportRecord {
  id: string
  vehicleNumber: string
  driverName: string
  location: string
  issue: string
  description: string
  images: string[]
  status: "submitted" | "under-review" | "verified" | "rejected"
  submittedDate: string
  lastUpdated: string
  timeline: {
    date: string
    event: string
    status: string
  }[]
}

export function ReportHistory() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      const data = await response.json()
      if (data.success) {
        const formattedReports = data.reports.map((r: any) => ({
          id: r.id,
          vehicleNumber: r.vehicle_number,
          driverName: r.reporter_name || "Anonymous",
          location: r.location_address,
          issue: r.report_reason,
          description: r.report_details,
          images: r.images || [],
          status: r.status === "resolved" ? "verified" : "submitted",
          submittedDate: new Date(r.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          lastUpdated: new Date(r.updated_at || r.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          timeline: [
            {
              date: new Date(r.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              event: "Report submitted",
              status: "submitted",
            },
          ],
        }))
        setReports(formattedReports)
        localStorage.setItem("cachedReports", JSON.stringify(formattedReports))
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      const cached = localStorage.getItem("cachedReports")
      if (cached) setReports(JSON.parse(cached))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700"
      case "under-review":
        return "bg-blue-100 text-blue-700"
      case "submitted":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "under-review":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "submitted":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const openImageModal = (imageUrl: string) => {
    const scrollY = window.scrollY
    document.body.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = "100%"

    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    modal.innerHTML = `
      <div class="relative max-w-4xl max-h-[90vh] p-4 flex flex-col items-center">
        <img src="${imageUrl}" class="max-w-full max-h-[85vh] rounded-lg object-contain" />
        <div class="absolute top-4 right-4 flex gap-3">
          <button class="close-btn text-white text-3xl bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center">&times;</button>
        </div>
        <div class="absolute bottom-6 right-6 flex gap-3">
          <button class="download-btn text-white bg-black/60 hover:bg-black/80 px-4 py-2 rounded">Download</button>
          <button class="save-btn text-white bg-black/60 hover:bg-black/80 px-4 py-2 rounded">Save</button>
        </div>
      </div>
    `

    const closeModal = () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
      modal.remove()
    }

    modal.querySelector(".close-btn")?.addEventListener("click", closeModal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal()
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal()
    })

    modal.querySelector(".download-btn")?.addEventListener("click", async (e) => {
      e.stopPropagation()
      try {
        const res = await fetch(imageUrl)
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `report-image-${Date.now()}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } catch {
        alert("Download failed. Try again.")
      }
    })

    modal.querySelector(".save-btn")?.addEventListener("click", (e) => {
      e.stopPropagation()
      const saved = JSON.parse(localStorage.getItem("savedImages") || "[]")
      if (!saved.includes(imageUrl)) {
        saved.push(imageUrl)
        localStorage.setItem("savedImages", JSON.stringify(saved))
        alert("Image saved locally ✅")
      } else alert("Already saved.")
    })

    document.body.appendChild(modal)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-3">Recent Reports</h2>
        <p className="text-base text-muted-foreground mb-6">
          View all recent reports submitted by the community
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-base">Loading reports...</p>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-base">No reports submitted yet</p>
          <p className="text-sm text-muted-foreground mt-3">
            Start by filing a report to help keep Mumbai safe
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.slice(0, 3).map((report) => (
            <Card
              key={report.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
            >
              <div className="p-5 flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(report.status)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-base">{report.vehicleNumber}</p>
                      <p className="text-sm text-white mt-2">
                        {report.location} • {report.issue}
                      </p>
                    </div>
                    <span
                      className={`text-sm px-3 py-1.5 rounded-full ${getStatusColor(report.status)}`}
                    >
                      {report.status.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Submitted: {report.submittedDate}
                  </p>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-muted-foreground transition-transform ${
                    expandedReport === report.id ? "rotate-180" : ""
                  }`}
                />
              </div>

              {expandedReport === report.id && (
                <div className="border-t border-border bg-muted/30 p-5 space-y-5">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase">
                        Report ID
                      </p>
                      <p className="text-base font-mono">{report.id}</p>
                    </div>

                    {report.driverName && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase">
                          Driver Name
                        </p>
                        <p className="text-base">{report.driverName}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase">
                        Description
                      </p>
                      <p className="text-base text-foreground mt-2">{report.description}</p>
                    </div>

                    {report.images?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase">
                          Attached Images
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {report.images.map((img, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={img}
                                alt={`Report ${i + 1}`}
                                className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openImageModal(img)
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none"
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-lg pointer-events-none">
                                <Eye className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <p className="text-sm text-green-800">
          All reports are visible immediately after submission. Reports are reviewed and verified by our team.
        </p>
      </div>
    </div>
  )
}
