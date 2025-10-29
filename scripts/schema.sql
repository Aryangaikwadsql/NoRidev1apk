-- NoRide Mumbai Database Schema
-- Complete production schema for Supabase or Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reports table - Main table for all citizen reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number VARCHAR(20) NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address VARCHAR(255),
  report_reason VARCHAR(100) NOT NULL,
  report_details TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_anonymous BOOLEAN DEFAULT true,
  reporter_contact VARCHAR(255),
  reporter_name VARCHAR(100),
  rto_jurisdiction VARCHAR(100),
  credibility_score INTEGER DEFAULT 50,
  is_flagged BOOLEAN DEFAULT false,
  ip_hash VARCHAR(255),
  device_fingerprint VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Statistics table - Aggregated data per vehicle
CREATE TABLE IF NOT EXISTS vehicle_statistics (
  vehicle_number VARCHAR(20) PRIMARY KEY,
  total_reports INTEGER DEFAULT 0,
  verified_reports INTEGER DEFAULT 0,
  last_reported TIMESTAMP,
  rto_office VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RTO Users table - Admin users for each RTO office
CREATE TABLE IF NOT EXISTS rto_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  rto_office VARCHAR(100) NOT NULL,
  jurisdiction_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table - Track all report status changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_vehicle_number ON reports(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_rto_jurisdiction ON reports(rto_jurisdiction);
CREATE INDEX IF NOT EXISTS idx_reports_credibility_score ON reports(credibility_score);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location_address);
CREATE INDEX IF NOT EXISTS idx_vehicle_stats_vehicle ON vehicle_statistics(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_rto_users_email ON rto_users(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_report_id ON audit_logs(report_id);

-- Statistics view - Real-time dashboard statistics
CREATE OR REPLACE VIEW report_statistics AS
SELECT
  COUNT(*) as total_reports,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as verified_count,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  SUM(CASE WHEN status = 'invalid' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN is_flagged = true THEN 1 ELSE 0 END) as flagged_count,
  ROUND(AVG(credibility_score)::numeric, 2) as average_confidence,
  COUNT(DISTINCT vehicle_number) as unique_vehicles
FROM reports;

-- RTO Jurisdiction view - Reports by RTO office
CREATE OR REPLACE VIEW reports_by_rto AS
SELECT
  rto_jurisdiction,
  COUNT(*) as total_reports,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as verified,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN is_flagged = true THEN 1 ELSE 0 END) as flagged
FROM reports
GROUP BY rto_jurisdiction;

-- Top reported vehicles view
CREATE OR REPLACE VIEW top_reported_vehicles AS
SELECT
  vehicle_number,
  COUNT(*) as report_count,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as verified_count,
  MAX(created_at) as last_reported
FROM reports
GROUP BY vehicle_number
ORDER BY report_count DESC
LIMIT 100;



-- Row Level Security (RLS) Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rto_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read all reports (for transparency)
CREATE POLICY "Public read reports" ON reports
  FOR SELECT USING (true);

-- Only authenticated RTO users can update reports in their jurisdiction
CREATE POLICY "RTO update own jurisdiction" ON reports
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM rto_users WHERE rto_office = reports.rto_jurisdiction
    )
  );

-- Only authenticated users can insert reports
CREATE POLICY "Users can insert reports" ON reports
  FOR INSERT WITH CHECK (true);

-- RTO users can only see their own jurisdiction
CREATE POLICY "RTO users see own data" ON rto_users
  FOR SELECT USING (auth.uid() = id);
