# MeasureMe - Body Measurement Tracker

## Project Overview

**MeasureMe** is a modern, mobile-first web application for tracking body measurements over time. Built with React, Vite, and Supabase, it provides an intuitive interface for logging measurements and visualizing progress through interactive charts.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend/Database | Supabase (PostgreSQL) |
| API | Supabase REST API |
| Hosting | Vercel |
| State Management | React Context + useState |

---

## Design System

### Color Palette

**Primary: Sharky Blue** - A sophisticated blue-gray color scheme

```
Light Mode:
- Primary: #3B5B7A (Sharky Blue)
- Primary Light: #5A7A99
- Primary Dark: #2A4A69
- Background: #F8FAFC
- Surface: #FFFFFF
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border: #E2E8F0
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

Dark Mode:
- Primary: #5A7A99
- Primary Light: #7A9AB9
- Primary Dark: #3B5B7A
- Background: #0F172A
- Surface: #1E293B
- Text Primary: #F1F5F9
- Text Secondary: #94A3B8
- Border: #334155
- Success: #34D399
- Warning: #FBBF24
- Error: #F87171
```

### Typography
- Font Family: Inter (Google Fonts)
- Headings: Semi-bold (600)
- Body: Regular (400)
- Mobile-first responsive sizing

### Design Principles
- Mobile-first approach
- Clean, minimal UI with generous whitespace
- Smooth transitions and micro-interactions
- Accessible (WCAG 2.1 AA compliant)
- Responsive across all device sizes

---

## Features

### Core Features

#### 1. Measurements Page
- List view of all tracked measurements
- Each item displays:
  - Measurement name
  - Current/latest value with unit
  - Date of last measurement
- Actions:
  - Add new measurement type
  - Edit measurement details
  - Delete measurement type
- Tap/click on measurement opens detail modal

#### 2. Measurement Detail Modal
- Complete history of all data points for that measurement
- Each entry shows:
  - Value with unit
  - Date and time
- Actions:
  - Add new entry
  - Edit existing entry
  - Delete entry
- Scrollable list for extensive history

#### 3. Analytics Page
- Interactive line chart (Recharts)
- Date range picker (custom range)
- Measurement filter:
  - Portrait: Graph takes 50% height, filters below
  - Landscape: Full-screen graph with popup menu for filters
- Multi-series support (multiple measurements on one chart)
- Responsive and touch-friendly

#### 4. Settings
- Unit preference toggle (Metric/Imperial)
- Theme toggle (Light/Dark mode)
- Stored in localStorage for persistence

### Default Measurements

The following measurements are created by default:

| Measurement | Unit (Metric) | Unit (Imperial) | Category |
|-------------|---------------|-----------------|----------|
| Weight | kg | lbs | Body |
| Height | cm | in | Body |
| Body Fat | % | % | Body |
| Chest | cm | in | Upper Body |
| Waist | cm | in | Core |
| Hips | cm | in | Lower Body |
| Bicep (Left) | cm | in | Arms |
| Bicep (Right) | cm | in | Arms |
| Thigh (Left) | cm | in | Legs |
| Thigh (Right) | cm | in | Legs |
| Calf (Left) | cm | in | Legs |
| Calf (Right) | cm | in | Legs |
| Neck | cm | in | Upper Body |
| Shoulders | cm | in | Upper Body |
| Chest Skinfold | mm | mm | JP3 Skinfold |
| Abdomen Skinfold | mm | mm | JP3 Skinfold |
| Thigh Skinfold | mm | mm | JP3 Skinfold |
| JP3 Body Fat % | % | % | JP3 Calculated |

### Jackson-Pollock 3-Site Body Fat Calculation

The app includes an auto-calculation feature for body fat percentage using the **Jackson-Pollock 3-Site formula (Male)**.

#### Measurement Sites
- **Chest Skinfold** - Diagonal fold halfway between the nipple and the anterior axillary line
- **Abdomen Skinfold** - Vertical fold 2cm to the right of the navel
- **Thigh Skinfold** - Vertical fold on the front of the thigh, midway between the hip and knee

#### Formula

```
Sum = Chest + Abdomen + Thigh (in mm)

Body Density = 1.10938 - (0.0008267 × Sum) + (0.0000016 × Sum²) - (0.0002574 × Age)

Body Fat % = (495 / Body Density) - 450  (Siri Equation)
```

#### How It Works
1. User enters their **age** in Settings (required for the formula)
2. When adding a new JP3 entry, user is prompted to enter all 3 skinfold measurements
3. The app automatically:
   - Saves all 3 skinfold measurements with the same timestamp
   - Calculates the JP3 Body Fat % using the formula
   - Saves the calculated result as a measurement entry
4. All 4 values (3 skinfolds + calculated %) appear in the analytics chart

#### Settings Addition
- **Age** (number) - Required for JP3 calculation, stored in settings table

---

## Database Schema

### Tables

#### `measurements`
Stores the types of measurements being tracked.

```sql
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  unit_metric VARCHAR(20) NOT NULL,
  unit_imperial VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `measurement_entries`
Stores individual measurement data points.

```sql
CREATE TABLE measurement_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measurement_id UUID REFERENCES measurements(id) ON DELETE CASCADE,
  value DECIMAL(10, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_entries_measurement_id ON measurement_entries(measurement_id);
CREATE INDEX idx_entries_recorded_at ON measurement_entries(recorded_at);
```

#### `settings`
Stores app settings (single row table).

```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  unit_system VARCHAR(10) DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  user_age INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Project Structure

```
MaccBodyTracker/
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Loading.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Layout.tsx
│   │   ├── measurements/
│   │   │   ├── MeasurementList.tsx
│   │   │   ├── MeasurementCard.tsx
│   │   │   ├── MeasurementModal.tsx
│   │   │   ├── MeasurementForm.tsx
│   │   │   ├── EntryList.tsx
│   │   │   └── EntryForm.tsx
│   │   ├── analytics/
│   │   │   ├── Chart.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── MeasurementFilter.tsx
│   │   │   └── LandscapeMenu.tsx
│   │   └── settings/
│   │       ├── UnitToggle.tsx
│   │       └── ThemeToggle.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   └── SettingsContext.tsx
│   ├── hooks/
│   │   ├── useMeasurements.ts
│   │   ├── useEntries.ts
│   │   ├── useSettings.ts
│   │   └── useOrientation.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── MeasurementsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── PROJECT_CONTEXT.md
```

---

## API Endpoints (Supabase REST)

All API calls use the Supabase JavaScript client library.

### Measurements
- `GET /measurements` - List all measurement types
- `POST /measurements` - Create new measurement type
- `PATCH /measurements/:id` - Update measurement type
- `DELETE /measurements/:id` - Delete measurement type (cascades to entries)

### Entries
- `GET /measurement_entries?measurement_id=eq.{id}` - Get entries for a measurement
- `GET /measurement_entries?recorded_at=gte.{start}&recorded_at=lte.{end}` - Get entries in date range
- `POST /measurement_entries` - Create new entry
- `PATCH /measurement_entries/:id` - Update entry
- `DELETE /measurement_entries/:id` - Delete entry

### Settings
- `GET /settings` - Get current settings
- `PATCH /settings` - Update settings

---

## Development Phases

### Phase 1: Project Setup & Foundation
- [x] Project documentation
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up Supabase client
- [ ] Create database schema
- [ ] Implement basic layout and navigation
- [ ] Add theme toggle (light/dark mode)

### Phase 2: Measurements Core
- [ ] Create measurement types CRUD
- [ ] Display measurements list
- [ ] Add measurement form/modal
- [ ] Edit/delete measurement types
- [ ] Seed default measurements

### Phase 3: Measurement Entries
- [ ] Create entries CRUD
- [ ] Measurement detail modal with entry history
- [ ] Add entry form with date/time picker
- [ ] Edit/delete entries
- [ ] Display latest value on measurement cards

### Phase 4: Analytics & Charts
- [ ] Integrate Recharts
- [ ] Create multi-series line chart
- [ ] Implement date range picker
- [ ] Add measurement filter controls
- [ ] Handle portrait/landscape layouts
- [ ] Optimize for performance

### Phase 5: Polish & Deploy
- [ ] Responsive design refinements
- [ ] Loading states and error handling
- [ ] Empty states
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] Documentation updates

---

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Supabase Setup Instructions

### 1. Create a New Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project details:
   - Name: `measureme` (or your preference)
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for setup (~2 minutes)

### 2. Get API Credentials
1. Go to Project Settings → API
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (the long JWT token)
3. Add these to your `.env` file

### 3. Create Database Tables
1. Go to SQL Editor in your Supabase dashboard
2. Run the SQL scripts provided in the `supabase/migrations/` folder
3. Or use the SQL provided in the Database Schema section above

### 4. Configure Row Level Security (RLS)
Since this is a single-user app without auth, we'll disable RLS:

```sql
-- Disable RLS for all tables (single user app)
ALTER TABLE measurements DISABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

**Note**: If you later add authentication, you'll need to enable RLS and create appropriate policies.

---

## Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/measureme.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### 3. Custom Domain (Optional)
- Add your custom domain in Vercel project settings

---

## Unit Conversion Reference

| Measurement | Metric → Imperial | Imperial → Metric |
|-------------|-------------------|-------------------|
| Weight | kg × 2.20462 = lbs | lbs × 0.453592 = kg |
| Length | cm × 0.393701 = in | in × 2.54 = cm |
| Body Fat % | No conversion | No conversion |

---

## Future Enhancements (Out of Scope for V1)

- User authentication (multi-user support)
- Goal setting and progress tracking
- Photo progress tracking
- Export data to CSV/PDF
- BMI auto-calculation
- Measurement reminders/notifications
- Social sharing
- Progressive Web App (PWA) support
- Data backup/restore

---

## Contributing

This is a personal project. For any questions or suggestions, please open an issue.

---

## License

MIT License - Feel free to use and modify as needed.
