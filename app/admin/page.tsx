"use client"

import { useState, useEffect } from "react"
import { BarChart3, CheckCircle2, XCircle, Clock, Search, Filter, AlertTriangle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface AdminReport {
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
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [reports, setReports] = useState<AdminReport[]>([])
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
    fetchStatistics()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      const data = await response.json()
      if (data.success) {
        setReports(
          data.reports.map((r: any) => ({
            ...r,
            vehicleNumber: r.vehicleNumber,
            driverName: r.driverName,
            submittedDate: new Date(r.submittedDate).toLocaleDateString(),
          })),
        )
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/statistics")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.issue.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || report.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const handleVerify = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified" }),
      })
      if (response.ok) {
        fetchReports()
        fetchStatistics()
        setSelectedReport(null)
      }
    } catch (error) {
      console.error("Failed to verify report:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })
      if (response.ok) {
        fetchReports()
        fetchStatistics()
        setSelectedReport(null)
      }
    } catch (error) {
      console.error("Failed to reject report:", error)
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
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20White%20Bold%20Modern%20Clothing%20Brand%20Logo-bbkqmCfhe64DjhLtnjriOUjQbVSir1.png"
              alt="NoRide Mumbai"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <div className="border-l border-primary-foreground/30 pl-3">
              <p className="text-sm font-semibold">Admin Dashboard</p>
              <p className="text-xs opacity-75">RTO Management Portal</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-accent opacity-50" />
            </div>
          </Card>

          <Card className="p-6 border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Verified</p>
                <p className="text-3xl font-bold mt-2 text-green-700">{stats.verified}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-3xl font-bold mt-2 text-yellow-700">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejected</p>
                <p className="text-3xl font-bold mt-2 text-red-700">{stats.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by vehicle number, location, or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-muted-foreground mt-2.5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-md text-sm bg-background"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Reports Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Issue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Confidence</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      Loading reports...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-sm">{report.vehicleNumber}</p>
                          <p className="text-xs text-muted-foreground">{report.driverName || "Unknown"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{report.location}</td>
                      <td className="px-6 py-4 text-sm">{report.issue}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                            {report.status.replace("-", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${report.confidence}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{report.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{report.submittedDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReport(report.id)}
                            className="text-xs"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {report.status !== "verified" && report.status !== "rejected" && (
                            <>
                              <Button
                                size="sm"
                                className="text-xs bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleVerify(report.id)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleReject(report.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
              {(() => {
                const report = reports.find((r) => r.id === selectedReport)
                if (!report) return null

                return (
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold">{report.vehicleNumber}</h2>
                        <p className="text-sm text-muted-foreground">{report.location}</p>
                      </div>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Issue</p>
                        <p className="text-sm mt-1">{report.issue}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
                        <p className="text-sm mt-1">{report.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Driver</p>
                          <p className="text-sm mt-1">{report.driverName || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Confidence</p>
                          <p className="text-sm mt-1 font-semibold">{report.confidence}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Submitted</p>
                          <p className="text-sm mt-1">{report.submittedDate}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(report.status)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                              {report.status.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {report.status !== "verified" && report.status !== "rejected" && (
                      <div className="flex gap-2 border-t border-border pt-4">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleVerify(report.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Verify Report
                        </Button>
                        <Button
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleReject(report.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Report
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full mt-2 bg-transparent"
                      onClick={() => setSelectedReport(null)}
                    >
                      Close
                    </Button>
                  </div>
                )
              })()}
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
