// Database types matching Supabase schema
export interface Report {
  id: string
  vehicle_number: string
  location_lat: number
  location_lng: number
  location_address: string
  report_reason: string
  report_details: string
  images: string[]
  is_anonymous: boolean
  reporter_contact: string | null
  reporter_name?: string
  rto_jurisdiction: string
  credibility_score: number
  is_flagged: boolean
  ip_hash: string
  device_fingerprint: string
  status: "pending" | "reviewing" | "resolved" | "invalid"
  created_at: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Report, 'id' | 'created_at'>>
      }
      vehicle_statistics: {
        Row: {
          vehicle_number: string
          total_reports: number
          verified_reports: number
          last_reported: string
          rto_office: string
          updated_at: string
        }
        Insert: Omit<VehicleStatistics, 'updated_at'>
        Update: Partial<Omit<VehicleStatistics, 'vehicle_number'>>
      }
      rto_users: {
        Row: {
          id: string
          email: string
          rto_office: string
          jurisdiction_codes: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<RTOUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RTOUser, 'id' | 'created_at'>>
      }
      audit_logs: {
        Row: {
          id: string
          report_id: string
          action: string
          old_status: string | null
          new_status: string | null
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>
      }
    }
    Views: {
      report_statistics: {
        Row: {
          total_reports: number
          verified_count: number
          pending_count: number
          rejected_count: number
          flagged_count: number
          average_confidence: number
          unique_vehicles: number
        }
      }
      reports_by_rto: {
        Row: {
          rto_jurisdiction: string
          total_reports: number
          verified: number
          pending: number
          flagged: number
        }
      }
      top_reported_vehicles: {
        Row: {
          vehicle_number: string
          report_count: number
          verified_count: number
          last_reported: string
        }
      }
    }
  }
}

export interface VehicleStatistics {
  vehicle_number: string
  total_reports: number
  verified_reports: number
  last_reported: string
  rto_office: string
  updated_at?: string
}

export interface RTOUser {
  id: string
  email: string
  rto_office: string
  jurisdiction_codes: string[]
  created_at?: string
  updated_at?: string
}

export interface AuditLog {
  id: string
  report_id: string
  action: string
  old_status: string | null
  new_status: string | null
  changed_by: string | null
  notes: string | null
  created_at: string
}

export interface ReportFormData {
  vehicleNumber: string
  location: string
  locationLat?: number
  locationLng?: number
  reportReason: string
  reportDetails: string
  images: File[]
  isAnonymous: boolean
  reporterContact?: string
  reporterName?: string
}

export const REPORT_REASONS = [
  "Refused fare",
  "Demanded extra money",
  "No meter usage",
  "Misbehavior",
  "Route refusal",
  "Rash driving",
  "Vehicle condition",
  "Harassment",
  "Other",
]

export const RTO_JURISDICTIONS: Record<string, string> = {
  "MH-01": "South Mumbai RTO",
  "MH-02": "Andheri RTO",
  "MH-03": "Wadala RTO",
  "MH-04": "Tardeo RTO",
  "MH-05": "Thane RTO",
  "MH-06": "Borivali RTO",
  "MH-07": "Malad RTO",
}

export function getRTOJurisdiction(vehicleNumber: string): string {
  const prefix = vehicleNumber.substring(0, 5).toUpperCase()
  return RTO_JURISDICTIONS[prefix] || "General RTO"
}
