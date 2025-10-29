// Complete fake report detection algorithm per specification
export interface CredibilityAnalysis {
  baseScore: number
  addedPoints: number
  subtractedPoints: number
  finalScore: number
  flags: string[]
  riskLevel: "low" | "medium" | "high"
  shouldAutoVerify: boolean
  shouldAutoHide: boolean
}

export function calculateCredibilityScore(data: {
  vehicleNumber: string
  description: string
  hasImages: boolean
  hasGPS: boolean
  isAnonymous: boolean
  imageCount: number
  descriptionLength: number
  isDuplicateImage: boolean
  isStockImage: boolean
  sameIPReportedRecently: boolean
  geolocationAnomaly: boolean
  reportVelocity: number
  submittedHour: number
}): CredibilityAnalysis {
  const baseScore = 50
  let addedPoints = 0
  let subtractedPoints = 0
  const flags: string[] = []

  // Add Points
  if (data.hasImages && data.vehicleNumber.length > 0) {
    addedPoints += 30
  }
  if (data.hasGPS) {
    addedPoints += 25
  }
  if (!data.isAnonymous) {
    addedPoints += 20
  }
  if (data.imageCount > 1) {
    addedPoints += 15
  }
  if (data.descriptionLength > 50) {
    addedPoints += 10
  }

  // Subtract Points
  if (data.isDuplicateImage) {
    subtractedPoints += 20
    flags.push("Duplicate image detected")
  }
  if (data.isStockImage) {
    subtractedPoints += 15
    flags.push("Stock/internet image detected")
  }
  if (data.sameIPReportedRecently) {
    subtractedPoints += 15
    flags.push("Multiple reports from same device recently")
  }
  if (data.geolocationAnomaly) {
    subtractedPoints += 10
    flags.push("Geolocation anomaly detected")
  }
  if (data.reportVelocity > 10) {
    subtractedPoints += 20
    flags.push("Unusual spike in reports for this vehicle")
  }
  if (data.submittedHour >= 2 && data.submittedHour <= 5) {
    subtractedPoints += 5
    flags.push("Report submitted during odd hours")
  }

  const finalScore = Math.max(0, Math.min(100, baseScore + addedPoints - subtractedPoints))

  let riskLevel: "low" | "medium" | "high" = "low"
  if (finalScore < 30) {
    riskLevel = "high"
  } else if (finalScore < 70) {
    riskLevel = "medium"
  }

  const shouldAutoVerify = finalScore > 80 && data.hasImages
  const shouldAutoHide = finalScore < 30

  return {
    baseScore,
    addedPoints,
    subtractedPoints,
    finalScore,
    flags,
    riskLevel,
    shouldAutoVerify,
    shouldAutoHide,
  }
}
