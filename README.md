# NoRide Mumbai

![NoRide Logo](./public/logonew1.png)

A civic complaint platform empowering Mumbai citizens to report auto-rickshaw driver misconduct with anonymous reporting, map-based visualization, fake report detection, and RTO integration.

## Features

### For Citizens
- **Anonymous Reporting**: Report misconduct without revealing identity
- **Interactive Map**: View reported incidents across Mumbai with clustering
- **Vehicle Search**: Look up vehicle history and report statistics
- **Report Tracking**: Monitor status of submitted reports
- **Statistics Dashboard**: View trends and hotspots

### For RTO Authorities
- **Admin Dashboard**: Manage reports by jurisdiction
- **Verification System**: Verify or reject reports with notes
- **Analytics**: Track report trends and patterns
- **Credibility Scoring**: ML-based fake report detection

## Tech Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS v4, shadcn/ui
- **Backend**: Node.js, Express (via Next.js API routes)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Maps**: Leaflet.js, OpenStreetMap
- **ML**: TensorFlow.js (client-side image analysis)
- **Hosting**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/Aryangaikwadsql/NoRidev1apk.git
cd NoRidev1apk
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure Supabase
- Create a new Supabase project
- Run the SQL schema from `scripts/schema.sql`
- Add your Supabase credentials to `.env.local`

5. Run development server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Environment Variables

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Nominatim (free geocoding)
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org

# Optional: IP Geolocation
IPAPI_KEY=your_ipapi_key
\`\`\`

## API Routes

### Reports
- `GET /api/reports` - Fetch reports with filters
- `POST /api/reports` - Submit new report
- `GET /api/reports/[id]` - Get report details
- `PATCH /api/reports/[id]` - Update report status

### Statistics
- `GET /api/statistics` - Get dashboard statistics

### Map
- `GET /api/map` - Get map data with incidents

## Fake Report Detection Algorithm

The system uses ML-based pattern analysis with credibility scoring:

**Base Score**: 50 points

**Add Points**:
- +30: Clear vehicle number in image
- +25: GPS coordinates provided
- +20: Non-anonymous report
- +15: Multiple images
- +10: Detailed description (>50 chars)

**Subtract Points**:
- -20: Duplicate image detected
- -15: Same IP reported same vehicle <6hrs ago
- -15: Stock/internet image detected
- -10: Geolocation anomaly
- -5: Report during odd hours (2-5 AM)

**Auto Actions**:
- Score < 30: Auto-flagged for review
- Score > 80 + images: Auto-verified

## Database Schema

### Reports Table
- `id`: UUID primary key
- `vehicle_number`: MH format validation
- `location_lat/lng`: GPS coordinates
- `report_reason`: Enum of issue types
- `report_details`: Full description
- `images`: Array of image URLs
- `is_anonymous`: Boolean
- `credibility_score`: 0-100
- `status`: pending/reviewing/resolved/invalid
- `created_at`: Timestamp

### Vehicle Statistics Table
- `vehicle_number`: Primary key
- `total_reports`: Count
- `verified_reports`: Count
- `last_reported`: Timestamp
- `rto_office`: Assigned jurisdiction

### RTO Users Table
- `id`: UUID
- `email`: Unique
- `rto_office`: Jurisdiction
- `jurisdiction_codes`: Array of MH codes

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

\`\`\`bash
vercel deploy
\`\`\`

### Deploy Backend (Optional)

For production, consider deploying backend separately:
- Railway.app
- Render.com
- AWS Lambda

## Legal & Privacy

- All reports are user-generated content
- Anonymous reports are protected
- Data retention: 1 year automatic deletion
- GDPR compliant
- Terms of Service & Privacy Policy required

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Submit pull request

## License

MIT License - see LICENSE file

## Support

For issues or questions:
- GitHub Issues: [Create issue](https://github.com/Aryangaikwadsql/NoRidev1apk/issues)
- Email: support@noride.in

## Roadmap

- Phase 1 (MVP): Basic reporting & map
- Phase 2: Image upload & RTO dashboard
- Phase 3: Advanced ML filtering & Marathi support
- Phase 4: PWA & offline support

---

**Made with ❤️ for Mumbai's safety**
