"use client"

import type React from "react"

import { useState } from "react"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface VehicleReport {
  vehicleNumber: string
  totalReports: number
  verifiedReports: number
  lastReported: string
  rtoOffice: string
  recentIssues: string[]
  reports: Array<{
    id: string
    report_reason: string
    status: string
    created_at: string
    credibility_score: number
    location?: string
    report_details: string
    reporter_name?: string
    is_anonymous: boolean
  }>
}

export function VehicleSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState<VehicleReport | null>(null)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateVehicleNumber = (number: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleaned = number.replace(/\s/g, "").toUpperCase()
    // Check exact MH00XX0000 format - must be exactly 10 characters
    const pattern = /^MH\d{2}[A-Z]{2}\d{4}$/
    return pattern.test(cleaned) && cleaned.length === 10
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSearchResult(null)
    setSearched(false)

    const cleanedQuery = searchQuery.replace(/\s/g, "").toUpperCase()

    if (!validateVehicleNumber(cleanedQuery)) {
      setError("Invalid format. Use: MH00XX0000 (e.g., MH01AB1234)")
      setSearched(true)
      return
    }

    setLoading(true)

    try {
      // Fetch vehicle statistics from database
      const response = await fetch(`/api/vehicle/${cleanedQuery}`)
      const data = await response.json()

      if (data.success && data.vehicle) {
        setSearchResult(data.vehicle)
      } else {
        setSearchResult(null)
      }
    } catch (error) {
      console.error("Error searching vehicle:", error)
      setError("Failed to search vehicle. Please try again.")
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3 mt-8">
        <Input
          type="text"
          placeholder="Search vehicle number (MH00XX0000)"
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value.toUpperCase()
            // Strict validation for MH00XX0000 format step by step
            if (value === "") {
              setSearchQuery("")
            } else if (value.length === 1 && value === "M") {
              setSearchQuery("M")
            } else if (value.length === 2 && value === "MH") {
              setSearchQuery("MH")
            } else if (value.length >= 3 && value.length <= 4 && /^MH\d{1,2}$/.test(value)) {
              setSearchQuery(value)
            } else if (value.length >= 5 && value.length <= 6 && /^MH\d{2}[A-Z]{1,2}$/.test(value)) {
              setSearchQuery(value)
            } else if (value.length >= 7 && value.length <= 10 && /^MH\d{2}[A-Z]{2}\d{1,4}$/.test(value)) {
              setSearchQuery(value)
            }
          }}
          className="flex-1 h-12 text-base"
          maxLength={10}
        />
        <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 h-12 px-6">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </Button>
      </form>

      {error && (
        <Card className="p-6 text-center border-red-200 bg-red-50">
          <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
          <p className="text-base font-medium text-red-700">{error}</p>
        </Card>
      )}

      {searched && !searchResult && !error && (
        <Card className="p-6 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-base font-medium">No reports found for this vehicle</p>
          <p className="text-sm text-muted-foreground mt-2">This vehicle has a clean record</p>
        </Card>
      )}

      {searchResult && (
        <Card className="p-6 space-y-5">
          <div>
            <h3 className="font-bold text-xl">{searchResult.vehicleNumber}</h3>
            <p className="text-base text-muted-foreground">{searchResult.rtoOffice}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{searchResult.totalReports}</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{searchResult.verifiedReports}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {searchResult.totalReports - searchResult.verifiedReports}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase">Recent Issues</p>
            <div className="flex flex-wrap gap-3">
              {searchResult.recentIssues.map((issue) => (
                <span key={issue} className="bg-red-100 text-red-700 text-sm px-3 py-1.5 rounded-full">
                  {issue}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-lg mb-4">Report History</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResult.reports.map((report) => (
                <Card key={report.id} className="p-4 border-l-4 border-l-accent">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm">{report.report_reason}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            report.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : report.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString()}
                      </p>
                      {report.location && (
                        <p className="text-xs text-muted-foreground mb-2">📍 {report.location}</p>
                      )}
                      <p className="text-sm text-gray-700 mb-2">{report.report_details}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Reported by: {report.is_anonymous ? "Anonymous" : (report.reporter_name || "Unknown")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Credibility: {report.credibility_score}/100
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">Last reported: {searchResult.lastReported}</p>
        </Card>
      )}
    </div>
  )
}
