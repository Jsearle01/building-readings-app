# Building Readings App

A comprehensive web application for collecting, storing, and analyzing building readings data with interactive charts, reading points management, and bulk data entry capabilities.

## Features

### 📊 Data Collection
- **Reading Points**: Create reusable measurement points for consistent data collection
- **Bulk Entry**: Enter multiple readings simultaneously using predefined reading points
- **Smart Component Grouping**: Bulk entry automatically groups by building component/system when specified, otherwise by reading type
- **Point Lists**: Organize reading points into lists for efficient bulk data entry

### 📈 Data Visualization
- **Interactive Charts**: Line charts, bar charts, and area charts
- **Real-time Trending**: Visualize data trends over time
- **Multiple Series**: Compare different reading types simultaneously
- **Summary Statistics**: Average, minimum, maximum values for each reading type

### 🔍 Data Management
- **Advanced Filtering**: Filter by reading type and building
- **Sortable Data**: Automatic sorting by timestamp (newest first)
- **Data Export**: View data in organized table format
- **Local Storage**: Client-side data persistence

### 🏢 Reading Points System
- **Point Definition**: Create standardized measurement points with location and type
- **Component Classification**: Assign points to building components or systems (e.g., "HVAC-01", "Chiller System")
- **Point Management**: Activate/deactivate, edit, and delete reading points
- **List Creation**: Group related points into lists for bulk data collection
- **List Editing**: Add or remove points from existing lists, update names and descriptions
- **Smart Grouping**: Bulk entry groups by component when specified, otherwise by reading type
- **Reusable Templates**: Use predefined lists for routine measurements

### 📱 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Tab-based interface for easy switching between views
- **Modern UI**: Clean, professional interface with smooth transitions

## Usage Guide

### 1. Setting Up Reading Points

Start by setting up your reading points for efficient data collection:

1. **Navigate to "Reading Points" tab** (default view)
2. **Click "Add New Point"** to create a reading point
3. **Fill in the details**:
   - Point Name (e.g., "Main Lobby Temperature")
   - Building, Floor, Room location
   - Reading Type (automatically sets unit)
   - Component/System (optional, e.g., "HVAC-01", "Chiller System")
   - Optional description
4. **Save the point** - it will be marked as "Active"

**Component Examples:**
- HVAC systems: "HVAC-01", "HVAC-02"
- Electrical systems: "Main Panel", "Emergency Generator"
- Water systems: "Domestic Hot Water", "Chilled Water Loop"
- Equipment: "Boiler #1", "Cooling Tower A"

### 2. Creating Point Lists

Organize your reading points into convenient lists:

1. **Go to "Point Lists" sub-tab**
2. **Click "Create New List"**
3. **Provide list details**:
   - List name (e.g., "Daily Temperature Rounds")
   - Optional description
   - Select the reading points to include
4. **Save the list** for use in bulk entry

### 2.5. Editing Point Lists

Modify existing lists to add or remove points:

1. **In the "Point Lists" section**, click the **edit button (✎)** on any list card
2. **Update list details**:
   - Change the list name or description
   - Add new points by checking additional checkboxes
   - Remove points by unchecking existing selections
3. **Click "Update List"** to save changes
4. **Use "Cancel"** to discard changes

**Tip**: You can easily reorganize your measurement routines by editing lists as your needs change.

### 3. Bulk Data Entry

The primary method for efficient data collection:

1. **Navigate to "Bulk Entry" tab**
2. **Set the timestamp** for all readings
3. **Select reading points** either:
   - Choose a predefined list from dropdown, OR
   - Select individual points manually
4. **Enter values** for each selected point:
   - **Smart Grouping**: Points are automatically organized by component (if specified) or reading type
   - **Component Systems**: Points with the same component are grouped together (e.g., all "HVAC-01" sensors)
   - **Visual Organization**: Each group shows the count of points and clear section headers
   - **Efficient Entry**: Enter readings for the same system or component together
5. **Add optional notes** for specific readings
6. **Submit all readings** at once

### 4. Viewing and Analyzing Data

1. **Data Table**: View all readings in sortable table format
2. **Charts & Trends**: Visualize data with various chart types
3. **Apply filters** to focus on specific:
   - Reading types
   - Buildings
   - Time periods

## Data Types Supported

| Reading Type | Default Unit | Description |
|-------------|-------------|-------------|
| Temperature | °C | Room/area temperature |
| Humidity | % | Relative humidity percentage |
| Energy | kWh | Energy consumption |
| Water | L | Water usage |
| Gas | m³ | Gas consumption |
| Occupancy | people | Number of occupants |
| Air Quality | ppm | Air quality measurement |
| Lighting | lux | Light level measurement |

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Charts**: Chart.js with React-ChartJS-2 integration
- **Styling**: Custom CSS with responsive design
- **Data Storage**: Browser LocalStorage for client-side persistence
- **Date Handling**: date-fns for date formatting and manipulation

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Install Node.js Dependencies**
   ```powershell
   npm install
   ```

2. **Start Development Server**
   ```powershell
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Best Practices

### Reading Points Setup
1. **Create standardized naming**: Use consistent naming conventions like "Building-Floor-Room-Type"
2. **Use descriptive names**: Make point names clear and identifiable
3. **Group by frequency**: Create lists based on how often you collect certain readings
4. **Regular maintenance**: Deactivate unused points to keep lists clean
5. **Update lists as needed**: Use the edit functionality to add/remove points from lists as requirements change

### Data Collection
1. **Use bulk entry for routine readings**: More efficient than individual entries
2. **Include relevant notes**: Add context for unusual readings
3. **Regular timestamps**: Use consistent timing for trend analysis
4. **Verify units**: Ensure reading types match expected units

### Data Analysis
1. **Filter strategically**: Use filters to focus on specific data patterns
2. **Compare related metrics**: Use multi-series charts for correlation analysis
3. **Monitor trends**: Regular review of historical data for patterns
4. **Export data**: Use table view for detailed analysis or reporting

## Project Structure

```
src/
├── components/          # React components
│   ├── ReadingForm.tsx  # Individual reading input
│   ├── BulkReadingForm.tsx # Bulk data entry
│   ├── ReadingPointsManager.tsx # Points & lists management
│   ├── DataTable.tsx    # Data display table
│   ├── ChartView.tsx    # Chart visualization
│   └── Controls.tsx     # Filter controls
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── App.css             # Application-specific styles
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

## Future Enhancements

- **Backend Integration**: Add server-side database support
- **Real-time Data**: WebSocket integration for live readings
- **Export Features**: CSV/Excel export capabilities
- **Advanced Analytics**: Predictive analytics and anomaly detection
- **User Management**: Multi-user support with authentication
- **Notifications**: Alerts for readings outside normal ranges
- **Mobile App**: Native mobile application
- **API Integration**: Connect with building management systems

## License

This project is open source and available under the MIT License.
