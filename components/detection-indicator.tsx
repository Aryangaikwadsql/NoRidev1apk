"use client"

import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ReportAnalysis } from "@/lib/report-detection"

interface DetectionIndicatorProps {
  analysis: ReportAnalysis
}

export function DetectionIndicator({ analysis }: DetectionIndicatorProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-50 border-red-200"
      case "medium":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-green-50 border-green-200"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
    }
  }

  const getRiskText = (level: string) => {
    switch (level) {
      case "high":
        return "High Risk"
      case "medium":
        return "Medium Risk"
      default:
        return "Low Risk"
    }
  }

  return (
    <Card className={`p-4 border ${getRiskColor(analysis.riskLevel)}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRiskIcon(analysis.riskLevel)}
            <div>
              <p className="font-semibold text-sm">{getRiskText(analysis.riskLevel)}</p>
              <p className="text-xs opacity-75">Confidence Score: {analysis.confidence}%</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{analysis.confidence}%</div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              analysis.riskLevel === "high"
                ? "bg-red-500"
                : analysis.riskLevel === "medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${analysis.confidence}%` }}
          />
        </div>

        {/* Flags */}
        {analysis.flags.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold opacity-75">Detected Issues:</p>
            <ul className="space-y-1">
              {analysis.flags.map((flag, idx) => (
                <li key={idx} className="text-xs flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-current border-opacity-10">
          <div>
            <p className="text-xs opacity-75">Description Quality</p>
            <p className="text-sm font-semibold">{analysis.details.descriptionQuality}%</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Location Validity</p>
            <p className="text-sm font-semibold">{analysis.details.locationValidity}%</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Issue Relevance</p>
            <p className="text-sm font-semibold">{analysis.details.issueRelevance}%</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Reporter Behavior</p>
            <p className="text-sm font-semibold">{analysis.details.reporterBehavior}%</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
