# Building Readings App - Setup Instructions

## Prerequisites Installation

Since Node.js is not currently installed on your system, please follow these steps:

### 1. Install Node.js

**Option A: Download from Official Website**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version for Windows
3. Run the installer and follow the setup wizard
4. Restart VS Code after installation

**Option B: Using Windows Package Manager (if available)**
```powershell
winget install OpenJS.NodeJS
```

**Option C: Using Chocolatey (if available)**
```powershell
choco install nodejs
```

### 2. Verify Installation
After installing Node.js, verify it's working:
```powershell
node --version
npm --version
```

### 3. Install Project Dependencies
```powershell
npm install
```

### 4. Start Development Server
```powershell
npm run dev
```

## Project Features

Your Enhanced Building Readings App includes:

✅ **Reading Points Management** - Create reusable measurement points for standardized data collection
✅ **Reading Point Lists** - Organize points into groups for efficient bulk data entry
✅ **Bulk Reading Entry** - Enter multiple readings simultaneously using predefined points or custom selections
✅ **Local Database Storage** - Uses browser LocalStorage for data persistence
✅ **Interactive Charts** - Line, bar, and area charts with Chart.js
✅ **Data Filtering & Sorting** - Filter by reading type, building, and other criteria
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Modern React Architecture** - TypeScript, Vite, functional components with hooks

## Quick Start Guide

1. **Set Up Reading Points First** (Default Starting Tab)
   - Click "Reading Points" tab (opens by default)
   - Add new points with building, floor, room, and reading type
   - Add optional component/system classification
   - Create descriptive names like "Main Lobby Temperature Sensor"
   - Points are automatically marked as active

2. **Create Reading Point Lists** (Optional but Recommended)
   - Go to "Point Lists" sub-tab
   - Create lists for routine measurements like "Daily Temperature Rounds"
   - Select multiple related points to group together
   - Save lists for quick selection in bulk entry

3. **Use Bulk Entry for Data Collection**
   - Go to "Bulk Entry" tab
   - Set timestamp for all readings
   - Select a predefined list or choose individual points
   - Enter values for each selected point (grouped by component/type)
   - Submit all readings at once

4. **Analyze Your Data**
   - View all data in "Data Table" with sorting and filtering
   - Use "Charts & Trends" for visual analysis
   - Apply filters to focus on specific data types or buildings

## Next Steps

Once Node.js is installed, you can:
- Run `npm run dev` to start the development server
- Access the app at `http://localhost:3000`
- Begin collecting and analyzing building readings data

The app is ready to use immediately with no additional setup required!
