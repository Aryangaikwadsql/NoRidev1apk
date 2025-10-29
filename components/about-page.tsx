"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, Shield, Users, TrendingUp } from "lucide-react"

export function AboutPage() {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">About NoRide Mumbai</h1>
        <p className="text-sm text-muted-foreground">
          Empowering citizens to report auto-rickshaw driver misconduct and improve public safety
        </p>
      </div>

      {/* Mission */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Our Mission
        </h2>
        <p className="text-sm text-muted-foreground">
          To create a transparent, accountable system for reporting auto-rickshaw driver misconduct in Mumbai, ensuring
          safer and more reliable transportation for all citizens.
        </p>
      </Card>

      {/* How It Works */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          How It Works
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Report misconduct anonymously with vehicle details</li>
          <li>2. Our system analyzes reports for credibility</li>
          <li>3. RTO authorities review and verify reports</li>
          <li>4. Action is taken against verified violations</li>
          <li>5. Public can track report status and outcomes</li>
        </ol>
      </Card>

      {/* Impact */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Impact
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">1,247</p>
            <p className="text-xs text-muted-foreground">Reports Filed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">89%</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-xs text-muted-foreground">Actions Taken</p>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-4 space-y-3 border-blue-200 bg-blue-50">
        <h2 className="font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Privacy & Safety
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ All reports are anonymous by default</li>
          <li>✓ Your identity is never disclosed</li>
          <li>✓ Data is encrypted and secure</li>
          <li>✓ GDPR compliant</li>
          <li>✓ Reports auto-deleted after 1 year</li>
        </ul>
      </Card>

      {/* FAQ */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Frequently Asked Questions</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Is my report really anonymous?</p>
            <p className="text-muted-foreground">
              Yes, all reports are anonymous by default. You can optionally provide contact info.
            </p>
          </div>
          <div>
            <p className="font-medium">How long does verification take?</p>
            <p className="text-muted-foreground">Most reports are reviewed within 24-48 hours by RTO authorities.</p>
          </div>
          <div>
            <p className="font-medium">What happens after I report?</p>
            <p className="text-muted-foreground">
              Your report is analyzed, verified, and if valid, action is taken against the driver.
            </p>
          </div>
          <div>
            <p className="font-medium">Can I track my report?</p>
            <p className="text-muted-foreground">Yes, use the History tab to track your report status in real-time.</p>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-4 text-center space-y-2">
        <p className="text-sm font-medium">Have questions or feedback?</p>
        <p className="text-xs text-muted-foreground">Email: support@noride.in</p>
        <p className="text-xs text-muted-foreground">Phone: 1800-RICKSHA-1</p>
      </Card>
    </div>
  )
}
