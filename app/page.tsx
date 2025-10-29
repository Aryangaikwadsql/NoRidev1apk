
"use client"
import { useState, useEffect } from "react"
import { MapPin, Search, AlertCircle, Home, Map, BarChart3, History, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapView } from "@/components/map-view"
import { ReportHistory } from "@/components/report-history"
import { ReportForm } from "@/components/report-form"
import { VehicleSearch } from "@/components/vehicle-search"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { Logo } from "@/components/logo"
import { PremiumOnboarding } from "@/components/onboarding"

interface Stats {
  total: number
  verified: number
  pending: number
  rejected: number
  averageConfidence: number
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"home" | "report" | "map" | "search" | "stats" | "history">("home")
  const [showOnboarding, setShowOnboarding] = useState(true)

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (hasSeenOnboarding) {
      setShowOnboarding(false)
    }
  }, [])

  // For testing: Clear localStorage to show onboarding again
  useEffect(() => {
    localStorage.removeItem('hasSeenOnboarding')
    setShowOnboarding(true)
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('hasSeenOnboarding', 'true')
  }

  if (showOnboarding) {
    return <PremiumOnboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-md mx-auto px-4 py-6 flex items-center justify-center">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-20">
        {activeTab === "home" && (
          <div className="space-y-4 p-4 pt-32">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-6 text-center mt-8">
              <h1 className="text-2xl font-bold mb-3">Report Misconduct</h1>
              <p className="text-base opacity-90 leading-relaxed">Help keep Mumbai's auto-rickshaw services safe and accountable</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 text-center">
                <div className="text-3xl font-bold text-accent">1,247</div>
                <p className="text-sm text-muted-foreground mt-2">Reports Filed</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="text-3xl font-bold text-green-600">89%</div>
                <p className="text-sm text-muted-foreground mt-2">Verified</p>
              </Card>
            </div>

            {/* Recent Reports */}
            <div>
              <h2 className="font-semibold mb-4 text-lg">Recent Reports</h2>
              <ReportHistory />
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setActiveTab("report")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-7 text-lg font-semibold rounded-lg"
              >
                File a Report
              </Button>
              <Button
                onClick={() => setActiveTab("search")}
                variant="outline"
                className="w-full py-7 text-lg font-semibold rounded-lg"
              >
                <Search className="w-5 h-5 mr-3" />
                Search Vehicle
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 leading-relaxed">
                All reports are anonymous and your identity is hidden. Your safety is our priority.
              </p>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="pt-36 pb-4">
            <MapView />
          </div>
        )}
        {activeTab === "search" && (
          <div className="p-4 pt-32">
            <VehicleSearch />
          </div>
        )}
        {activeTab === "stats" && (
          <div className="pt-32">
            <StatisticsDashboard />
          </div>
        )}
        {activeTab === "history" && (
          <div className="pt-32">
            <ReportHistory />
          </div>
        )}

        {activeTab === "report" && (
          <div className="p-4 pt-32">
            <ReportForm
              onSuccess={() => {
                setTimeout(() => setActiveTab("home"), 2000)
              }}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="max-w-md mx-auto">
          <div className="flex">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "map", label: "Map", icon: Map },
              { id: "search", label: "Search", icon: Search },
              { id: "stats", label: "Stats", icon: BarChart3 },
              { id: "history", label: "History", icon: History },
              { id: "report", label: "Report", icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-2 text-center font-medium transition-colors text-xs ${
                  activeTab === tab.id
                    ? "text-accent border-t-2 border-accent bg-accent/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="mb-1">
                  <tab.icon className="w-5 h-5 mx-auto" />
                </div>
                <div>{tab.label}</div>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
