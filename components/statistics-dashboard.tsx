"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { getReportStatistics } from "@/lib/supabase"

interface StatsData {
  total_reports: number
  verified_count: number
  pending_count: number
  rejected_count: number
  flagged_count: number
  average_confidence: number
  unique_vehicles: number
}

interface ChartData {
  date: string
  reports: number
  verified: number
}

export function StatisticsDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/statistics")
        const data = await response.json()
        if (data.success) {
          setStats(data.statistics)

          // Generate mock chart data for the last 7 days
          const mockChartData: ChartData[] = []
          const today = new Date()
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const reports = Math.floor(Math.random() * 20) + 5
            const verified = Math.floor(reports * 0.7)
            mockChartData.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              reports,
              verified
            })
          }
          setChartData(mockChartData)
        }
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh statistics every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div>
                    <div className="h-6 bg-muted rounded w-16 mb-1" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Unable to load statistics</p>
          <p className="text-xs text-muted-foreground">Please check your connection</p>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Unique Vehicles</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">{stats.total_reports.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.verified_count.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.pending_count.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.unique_vehicles.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Unique Vehicles</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reports Trend (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="reports"
                stroke="#2563eb"
                strokeWidth={2}
                name="Total Reports"
              />
              <Line
                type="monotone"
                dataKey="verified"
                stroke="#16a34a"
                strokeWidth={2}
                name="Verified Reports"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Status Distribution Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Report Status Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { status: 'Verified', count: stats?.verified_count || 0, color: '#16a34a' },
              { status: 'Rejected', count: stats?.rejected_count || 0, color: '#dc2626' },
              { status: 'Flagged', count: stats?.flagged_count || 0, color: '#7c3aed' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Average Confidence</p>
              <p className="text-sm text-muted-foreground">Report credibility score</p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {Math.round(stats.average_confidence)}%
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Resolution Rate</p>
              <p className="text-sm text-muted-foreground">Reports processed vs total</p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {stats.total_reports > 0 ? Math.round((stats.verified_count / stats.total_reports) * 100) : 0}%
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
