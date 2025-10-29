interface ReportAnalysis {
  confidence: number
  flags: string[]
  riskLevel: "low" | "medium" | "high"
  details: {
    descriptionQuality: number
    locationValidity: number
    issueRelevance: number
    timingPattern: number
    reporterBehavior: number
  }
}

interface ReportData {
  vehicleNumber: string
  location: string
  issue: string
  description: string
  driverName?: string
  submittedDate?: string
}

// Mumbai locations for validation
const VALID_MUMBAI_LOCATIONS = [
  "Bandra",
  "Andheri",
  "Dadar",
  "Colaba",
  "Powai",
  "Thane",
  "Navi Mumbai",
  "Borivali",
  "Malad",
  "Kandivali",
  "Vile Parle",
  "Santacruz",
  "Worli",
  "Parel",
  "Fort",
  "Marine Drive",
  "Juhu",
  "Versova",
  "Kala Ghoda",
  "Mahim",
]

// Valid issue types
const VALID_ISSUES = [
  "Overcharging",
  "Rash Driving",
  "Refusal to Use Meter",
  "Refusal to Meter",
  "Harassment",
  "Vehicle Condition",
  "Cleanliness",
  "Unsafe Behavior",
  "Refusal of Service",
  "Aggressive Behavior",
]

export function analyzeReport(report: ReportData): ReportAnalysis {
  const flags: string[] = []
  const details = {
    descriptionQuality: 0,
    locationValidity: 0,
    issueRelevance: 0,
    timingPattern: 0,
    reporterBehavior: 0,
  }

  // 1. Description Quality Analysis
  const descriptionLength = report.description.trim().length
  const wordCount = report.description.trim().split(/\s+/).length

  if (descriptionLength < 20) {
    flags.push("Description too short")
    details.descriptionQuality = 20
  } else if (descriptionLength < 50) {
    flags.push("Minimal description provided")
    details.descriptionQuality = 50
  } else if (descriptionLength > 500) {
    details.descriptionQuality = 85
  } else {
    details.descriptionQuality = Math.min(100, 60 + (descriptionLength / 500) * 40)
  }

  // Check for specific details (numbers, times, etc.)
  const hasNumbers = /\d+/.test(report.description)
  const hasTimeReference = /\d{1,2}:\d{2}|morning|afternoon|evening|night|am|pm/i.test(report.description)

  if (hasNumbers) details.descriptionQuality += 10
  if (hasTimeReference) details.descriptionQuality += 10
  details.descriptionQuality = Math.min(100, details.descriptionQuality)

  // 2. Location Validity
  const locationMatch = VALID_MUMBAI_LOCATIONS.some((loc) => report.location.toLowerCase().includes(loc.toLowerCase()))

  if (!locationMatch) {
    flags.push("Location not recognized as Mumbai area")
    details.locationValidity = 30
  } else {
    details.locationValidity = 90
  }

  // 3. Issue Relevance
  const issueMatch = VALID_ISSUES.some((issue) => report.issue.toLowerCase().includes(issue.toLowerCase()))

  if (!issueMatch) {
    flags.push("Issue type not standard")
    details.issueRelevance = 40
  } else {
    details.issueRelevance = 95
  }

  // 4. Vehicle Number Validation
  const vehicleNumberPattern = /^[A-Z]{2}\s?\d{2}\s?[A-Z]{2}\s?\d{4}$/i
  if (!vehicleNumberPattern.test(report.vehicleNumber)) {
    flags.push("Invalid vehicle number format")
    details.issueRelevance -= 15
  }

  // 5. Timing Pattern Analysis
  details.timingPattern = 70 // Default reasonable score

  // Check for suspicious patterns
  if (report.submittedDate) {
    const submittedDate = new Date(report.submittedDate)
    const now = new Date()
    const daysDifference = (now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)

    // Reports submitted too long ago might be less reliable
    if (daysDifference > 30) {
      flags.push("Report submitted more than 30 days ago")
      details.timingPattern = 50
    }
    // Very recent reports are more reliable
    else if (daysDifference < 1) {
      details.timingPattern = 85
    }
  }

  // 6. Reporter Behavior Analysis
  details.reporterBehavior = 75 // Default score

  // Anonymous reports are generally acceptable
  if (!report.driverName) {
    details.reporterBehavior = 80
  }

  // Check for excessive capitalization (potential spam indicator)
  const capsRatio = (report.description.match(/[A-Z]/g) || []).length / report.description.length
  if (capsRatio > 0.3) {
    flags.push("Excessive capitalization detected")
    details.reporterBehavior -= 20
  }

  // Check for repeated characters (spam indicator)
  if (/(.)\1{4,}/.test(report.description)) {
    flags.push("Repeated characters detected")
    details.reporterBehavior -= 25
  }

  // Calculate overall confidence score
  const weights = {
    descriptionQuality: 0.25,
    locationValidity: 0.2,
    issueRelevance: 0.2,
    timingPattern: 0.15,
    reporterBehavior: 0.2,
  }

  const confidence = Math.round(
    details.descriptionQuality * weights.descriptionQuality +
      details.locationValidity * weights.locationValidity +
      details.issueRelevance * weights.issueRelevance +
      details.timingPattern * weights.timingPattern +
      details.reporterBehavior * weights.reporterBehavior,
  )

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low"
  if (confidence < 50) {
    riskLevel = "high"
  } else if (confidence < 70) {
    riskLevel = "medium"
  }

  return {
    confidence: Math.max(0, Math.min(100, confidence)),
    flags,
    riskLevel,
    details,
  }
}

export function getDetectionSummary(analysis: ReportAnalysis): string {
  if (analysis.riskLevel === "high") {
    return "High risk: Multiple concerns detected. Requires careful review."
  } else if (analysis.riskLevel === "medium") {
    return "Medium risk: Some concerns detected. Recommend additional verification."
  }
  return "Low risk: Report appears legitimate. Standard verification recommended."
}
