"use client"

import type React from "react"
import { useState } from "react"
import { MapPin, AlertCircle, CheckCircle2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { validateVehicleNumber, getCurrentLocation, LocationCoordinates } from "@/lib/location-service"
import { validateImage, compressImage } from "@/lib/image-service"
import { calculateCredibilityScore } from "@/lib/credibility-scoring"
import { REPORT_REASONS, getRTOJurisdiction } from "@/lib/types"
import { createReportInDB, uploadImage } from "@/lib/supabase"

interface ReportFormProps {
  onSubmit?: (data: any) => void
  onSuccess?: () => void
}

export function ReportForm({ onSubmit, onSuccess }: ReportFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    location: "",
    locationLat: 0,
    locationLng: 0,
    reportReason: "",
    reportDetails: "",
    images: [] as File[],
    isAnonymous: true,
    reporterName: "",
    reporterContact: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [credibilityScore, setCredibilityScore] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationCoordinates[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    let processedValue = value

    // Special handling for vehicle number to enforce MH00XX0000 format
    if (name === "vehicleNumber") {
      processedValue = formatVehicleNumber(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Real-time validation for vehicle number
    if (name === "vehicleNumber" && processedValue.trim()) {
      const cleaned = processedValue.replace(/\s/g, "").toUpperCase()
      const pattern = /^MH\d{2}[A-Z]{2}\d{4}$/
      if (!pattern.test(cleaned)) {
        setErrors((prev) => ({
          ...prev,
          vehicleNumber: "Invalid format. Use: MH00XX0000 (e.g., MH01AB1234)"
        }))
      }
    }

    // Handle location search suggestions
    if (name === "location" && value.length >= 3) {
      handleLocationSearch(value)
    } else if (name === "location" && value.length < 3) {
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const formatVehicleNumber = (value: string): string => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase()

    // Build the formatted string step by step
    let formatted = ""

    // First 2 characters must be MH
    if (cleaned.length >= 1) {
      formatted += cleaned[0] === "M" ? "M" : ""
    }
    if (cleaned.length >= 2) {
      formatted += cleaned[1] === "H" ? "H" : ""
    }

    // Next 2 characters must be digits
    if (cleaned.length >= 3) {
      const digit1 = cleaned[2].match(/\d/) ? cleaned[2] : ""
      formatted += digit1
    }
    if (cleaned.length >= 4) {
      const digit2 = cleaned[3].match(/\d/) ? cleaned[3] : ""
      formatted += digit2
    }

    // Next 2 characters must be letters
    if (cleaned.length >= 5) {
      const letter1 = cleaned[4].match(/[A-Z]/) ? cleaned[4] : ""
      formatted += letter1
    }
    if (cleaned.length >= 6) {
      const letter2 = cleaned[5].match(/[A-Z]/) ? cleaned[5] : ""
      formatted += letter2
    }

    // Next 4 characters must be digits
    if (cleaned.length >= 7) {
      const digit3 = cleaned[6].match(/\d/) ? cleaned[6] : ""
      formatted += digit3
    }
    if (cleaned.length >= 8) {
      const digit4 = cleaned[7].match(/\d/) ? cleaned[7] : ""
      formatted += digit4
    }
    if (cleaned.length >= 9) {
      const digit5 = cleaned[8].match(/\d/) ? cleaned[8] : ""
      formatted += digit5
    }
    if (cleaned.length >= 10) {
      const digit6 = cleaned[9].match(/\d/) ? cleaned[9] : ""
      formatted += digit6
    }

    // Limit to exactly 10 characters
    return formatted.substring(0, 10)
  }

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true)
    try {
      const location = await getCurrentLocation()
      if (location) {
        setFormData((prev) => ({
          ...prev,
          location: location.address,
          locationLat: location.lat,
          locationLng: location.lng,
        }))
        // Clear location error if it exists
        if (errors.location) {
          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.location
            return newErrors
          })
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          location: "Unable to get your location. Please enter manually.",
        }))
      }
    } catch (error) {
      console.error("Error getting location:", error)
      setErrors((prev) => ({
        ...prev,
        location: "Error getting location. Please enter manually.",
      }))
    } finally {
      setGettingLocation(false)
    }
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      location: address,
      locationLat: lat,
      locationLng: lng,
    }))
    setLocationSuggestions([])
    setShowSuggestions(false)
    // Clear location error if it exists
    if (errors.location) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.location
        return newErrors
      })
    }
  }

  const handleLocationSearch = async (query: string) => {
    if (query.length < 3) return

    try {
      const response = await fetch(`/api/locations?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setLocationSuggestions(data.suggestions)
        setShowSuggestions(data.suggestions.length > 0)
      } else {
        setLocationSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Error searching locations:", error)
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const newImages: File[] = []

    for (let i = 0; i < Math.min(files.length, 5 - formData.images.length); i++) {
      const file = files[i]
      const validation = await validateImage(file)

      if (!validation.isValid) {
        setErrors((prev) => ({
          ...prev,
          images: "Invalid image format or size exceeds 5MB",
        }))
        continue
      }

      const compressed = await compressImage(file)
      newImages.push(new File([compressed], file.name, { type: "image/jpeg" }))
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNum === 1) {
      if (!formData.vehicleNumber.trim()) {
        newErrors.vehicleNumber = "Vehicle number is required"
      } else if (!validateVehicleNumber(formData.vehicleNumber)) {
        newErrors.vehicleNumber = "Invalid format. Use: MH00XX0000 (e.g., MH01AB1234)"
      }

      if (!formData.location.trim()) {
        newErrors.location = "Location is required"
      }
    }

    if (stepNum === 2) {
      if (!formData.reportReason) {
        newErrors.reportReason = "Please select a reason"
      }

      if (!formData.reportDetails.trim()) {
        newErrors.reportDetails = "Please provide details"
      } else if (formData.reportDetails.length < 20) {
        newErrors.reportDetails = "Description must be at least 20 characters"
      }
    }

    if (stepNum === 3) {
      if (!formData.isAnonymous) {
        if (!formData.reporterName.trim()) {
          newErrors.reporterName = "Name is required"
        }
        if (!formData.reporterContact.trim()) {
          newErrors.reporterContact = "Contact is required"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(step)) return

    if (step < 3) {
      setStep(step + 1)
      return
    }

    // Calculate credibility score
    const score = calculateCredibilityScore({
      vehicleNumber: formData.vehicleNumber,
      description: formData.reportDetails,
      hasImages: formData.images.length > 0,
      hasGPS: formData.locationLat !== 0,
      isAnonymous: formData.isAnonymous,
      imageCount: formData.images.length,
      descriptionLength: formData.reportDetails.length,
      isDuplicateImage: false,
      isStockImage: false,
      sameIPReportedRecently: false,
      geolocationAnomaly: false,
      reportVelocity: 0,
      submittedHour: new Date().getHours(),
    })

    setCredibilityScore(score.finalScore)
    setSubmitted(true)

    // Upload images first
    const uploadedImageUrls: string[] = []
    for (const image of formData.images) {
      try {
        const url = await uploadImage(image)
        if (url) {
          uploadedImageUrls.push(url)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    // Create report in database
    const reportData = {
      vehicle_number: formData.vehicleNumber,
      location_address: formData.location,
      location_lat: formData.locationLat,
      location_lng: formData.locationLng,
      report_reason: formData.reportReason,
      report_details: formData.reportDetails,
      images: uploadedImageUrls,
      is_anonymous: formData.isAnonymous,
      reporter_contact: formData.isAnonymous ? null : formData.reporterContact,
      reporter_name: formData.isAnonymous ? null : formData.reporterName,
      rto_jurisdiction: getRTOJurisdiction(formData.vehicleNumber),
      credibility_score: score.finalScore,
      status: "resolved",
    }

    try {
      const result = await createReportInDB(reportData)
      if (result) {
        console.log("Report created successfully:", result)
      }
    } catch (error) {
      console.error("Error creating report:", error)
    }

    if (onSubmit) {
      onSubmit({
        ...formData,
        credibilityScore: score.finalScore,
        rtoJurisdiction: getRTOJurisdiction(formData.vehicleNumber),
      })
    }

    setTimeout(() => {
      if (onSuccess) onSuccess()
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <div>
          <h2 className="text-xl font-bold">Report Submitted Successfully</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Thank you for helping keep Mumbai safe. Your report has been submitted to the RTO.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
          <p className="text-xs text-green-800">
            <strong>Credibility Score:</strong> {credibilityScore}% - Your report is now visible to the community and will be reviewed by our team.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex gap-3">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? "bg-accent" : "bg-muted"}`}
          />
        ))}
      </div>

      {/* Step 1: Vehicle & Location */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-6">Vehicle & Location Details</h3>
          </div>

          <div>
            <label className="block text-base font-medium mb-3">Vehicle Number *</label>
            <Input
              type="text"
              name="vehicleNumber"
              placeholder="MH 01 AB 1234"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              className={`h-12 text-base ${errors.vehicleNumber ? "border-red-500" : ""}`}
            />
            {errors.vehicleNumber && <p className="text-sm text-red-500 mt-2">{errors.vehicleNumber}</p>}
          </div>

          <div>
            <label className="block text-base font-medium mb-3">Location *</label>
            <div className="space-y-3">
              <div className="relative">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    name="location"
                    placeholder="Where did this happen?"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`h-12 text-base flex-1 ${errors.location ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    variant="outline"
                    className="h-12 px-4"
                  >
                    <MapPin className="w-5 h-5" />
                    {gettingLocation ? "Getting..." : "Current"}
                  </Button>
                </div>
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(suggestion.lat, suggestion.lng, suggestion.address)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-gray-900">{suggestion.address.split(',')[0]}</p>
                        <p className="text-xs text-gray-500 truncate">{suggestion.address}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formData.location && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">{formData.location}</p>
                </div>
              )}
            </div>
            {errors.location && <p className="text-sm text-red-500 mt-2">{errors.location}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">Location will be auto-assigned to the nearest RTO office</p>
          </div>
        </div>
      )}

      {/* Step 2: Report Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-6">Report Details</h3>
          </div>

          <div>
            <label className="block text-base font-medium mb-3">Reason for Report *</label>
            <select
              name="reportReason"
              value={formData.reportReason}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg bg-background text-base h-12 ${
                errors.reportReason ? "border-red-500" : "border-border"
              }`}
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reportReason && <p className="text-sm text-red-500 mt-2">{errors.reportReason}</p>}
          </div>

          <div>
            <label className="block text-base font-medium mb-3">Description *</label>
            <Textarea
              name="reportDetails"
              placeholder="Describe what happened in detail..."
              value={formData.reportDetails}
              onChange={handleInputChange}
              className={`min-h-40 text-base ${errors.reportDetails ? "border-red-500" : ""}`}
            />
            <p className="text-sm text-muted-foreground mt-2">{formData.reportDetails.length}/500 characters</p>
            {errors.reportDetails && <p className="text-sm text-red-500 mt-2">{errors.reportDetails}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-base font-medium mb-3">Photos (Optional - Max 5)</label>
            <div className="space-y-4">
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.images.map((image, idx) => (
                    <div key={idx} className="relative bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length < 5 && (
                <label className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-base font-medium">{uploading ? "Uploading..." : "Click to upload photos"}</p>
                  <p className="text-sm text-muted-foreground mt-2">{formData.images.length}/5 images uploaded</p>
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Privacy & Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-6">Privacy & Confirmation</h3>
          </div>

          <Card className="p-5 space-y-4">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="mt-2 w-5 h-5"
              />
              <div>
                <p className="font-medium text-base">Report Anonymously</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Your identity will not be disclosed</p>
              </div>
            </label>
          </Card>

          {!formData.isAnonymous && (
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium mb-3">Your Name</label>
                <Input
                  type="text"
                  name="reporterName"
                  placeholder="Full name"
                  value={formData.reporterName}
                  onChange={handleInputChange}
                  className={`h-12 text-base ${errors.reporterName ? "border-red-500" : ""}`}
                />
                {errors.reporterName && <p className="text-sm text-red-500 mt-2">{errors.reporterName}</p>}
              </div>

              <div>
                <label className="block text-base font-medium mb-3">Contact (Email or Phone)</label>
                <Input
                  type="text"
                  name="reporterContact"
                  placeholder="email@example.com or 9876543210"
                  value={formData.reporterContact}
                  onChange={handleInputChange}
                  className={`h-12 text-base ${errors.reporterContact ? "border-red-500" : ""}`}
                />
                {errors.reporterContact && <p className="text-sm text-red-500 mt-2">{errors.reporterContact}</p>}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">
              By submitting this report, you confirm that the information is accurate and will help improve public
              safety.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button type="button" onClick={() => setStep(step - 1)} variant="outline" className="flex-1 h-12 text-base font-semibold">
            Back
          </Button>
        )}
        <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base font-semibold">
          {step === 3 ? "Submit Report" : "Next"}
        </Button>
      </div>
    </form>
  )
}
