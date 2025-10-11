# Building Readings Management System

A comprehensive enterprise-grade web application for collecting, managing, and analyzing building readings data with advanced validation, role-based access control, and sophisticated data management capabilities.

## ✨ Key Features Overview

### 🏢 **Multi-Role System**
- **User Interface**: Data collection and reading entry
- **Administrator Interface**: Full system management and configuration
- **Reviewer Interface**: Quality control and approval workflows
- **Super Admin**: User management and system oversight

### 📊 **Advanced Data Collection**
- **Dual Validation System**: Numeric range validation AND categorical SAT/UNSAT validation
- **Overdue Reading Lists**: Automatic detection and display of past-due readings
- **Smart List Management**: Date-based filtering with proper timezone handling
- **Bulk Entry System**: Efficient multi-point data collection
- **Progress Tracking**: Real-time completion status for all reading lists

### 🛡️ **Validation & Quality Control**
- **Comment Requirements**: Mandatory comments for UNSAT selections and out-of-range values
- **Visual Feedback**: Color-coded validation indicators
- **Trend Analysis**: Historical data comparison for context
- **Review Workflows**: Submit readings for approval when required

### 🗓️ **Advanced Scheduling**
- **Due Date Management**: Lists with expected completion dates
- **Overdue Detection**: Automatic identification of past-due readings
- **Date Display**: Clear due date indicators with status (TODAY, OVERDUE)
- **Timezone-Safe**: Proper date handling across different timezones

## 📋 **Detailed Feature Breakdown**

### **Reading Point Management**
- ✅ **Dual Validation Types**: 
  - Numeric ranges with min/max values
  - Categorical SAT (Satisfactory) / UNSAT (Unsatisfactory) selection
- ✅ **Inline Editing**: Edit point details directly in the interface
- ✅ **Smart Organization**: Group by building component or reading type
- ✅ **Active/Inactive Status**: Enable/disable points as needed
- ✅ **Comprehensive Point Details**: Location, type, validation settings, descriptions

### **Reading List Management**
- ✅ **List Creation**: Organize points into logical groupings
- ✅ **Copy Functionality**: Duplicate existing lists with new due dates
- ✅ **Due Date Assignment**: Set expected completion dates for all lists
- ✅ **Overdue Tracking**: Automatic detection of lists past their due date
- ✅ **Progress Monitoring**: Real-time completion percentage display
- ✅ **Confirmation Dialogs**: Safe deletion with user confirmation

### **Data Collection Interface**
- ✅ **Smart Dropdown**: Shows lists with due dates and status indicators
- ✅ **Dual Input Types**: 
  - Numeric input for range validation
  - Dropdown selection for SAT/UNSAT validation
- ✅ **Comment Requirements**: Enforced comments for:
  - UNSAT selections
  - Out-of-range numeric values
- ✅ **Visual Validation**: Color-coded indicators (green/red/yellow)
- ✅ **Completion Tracking**: Track which points are complete per session

### **Administrator Features**
- ✅ **Full CRUD Operations**: Create, read, update, delete for all entities
- ✅ **List Copying**: Duplicate lists with customizable due dates
- ✅ **Inline Editing**: Direct editing of point properties
- ✅ **Validation Configuration**: Set min/max values or SAT/UNSAT per point
- ✅ **Date Management**: Proper timezone handling for due dates
- ✅ **Bulk Operations**: Efficient management of multiple items

### **User Experience Enhancements**
- ✅ **Role-Based Navigation**: Different interfaces per user type
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Visual Feedback**: Clear status indicators and progress displays
- ✅ **Intuitive Workflows**: Streamlined processes for common tasks
- ✅ **Data Persistence**: Local storage with proper state management

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Jsearle01/building-readings-app.git
   cd building-readings-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173`

### **Available Scripts**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally

## 🔐 **User Roles & Access**

### **Default Login Credentials**
- **User**: `user123` / `password123`
- **Admin**: `admin123` / `admin123`
- **Reviewer**: `reviewer123` / `reviewer123`
- **Super Admin**: `superadmin` / `superadmin123`

### **Role Capabilities**

| Feature | User | Admin | Reviewer | Super Admin |
|---------|------|-------|----------|-------------|
| Data Collection | ✅ | ✅ | ✅ | ✅ |
| View Readings | ✅ | ✅ | ✅ | ✅ |
| Manage Reading Points | ❌ | ✅ | ❌ | ✅ |
| Manage Reading Lists | ❌ | ✅ | ❌ | ✅ |
| Review Submissions | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| System Configuration | ❌ | ✅ | ❌ | ✅ |

## 📖 **Usage Guide**

### **For Users: Daily Reading Collection**

1. **Login** with user credentials
2. **Select Reading Lists**: Choose from available due or overdue lists
3. **Complete Readings**: 
   - Enter numeric values for range-validated points
   - Select SAT/UNSAT for categorical points
   - Add required comments for UNSAT or out-of-range values
4. **Submit Data**: Submit completed readings for review or direct entry

### **For Administrators: System Management**

1. **Login** with admin credentials
2. **Manage Reading Points**:
   - Create new points with validation settings
   - Edit existing points with inline editing
   - Set numeric ranges OR SAT/UNSAT validation per point
3. **Manage Reading Lists**:
   - Create lists with due dates
   - Copy existing lists for new schedules
   - Monitor completion progress
4. **Monitor System**: Track overdue lists and completion rates

### **For Reviewers: Quality Control**

1. **Login** with reviewer credentials
2. **Review Submissions**: Approve or reject submitted readings
3. **Quality Control**: Ensure data meets standards before final entry
4. **Provide Feedback**: Comment on submissions requiring clarification

## 🛠️ **Technical Architecture**

### **Frontend Stack**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **date-fns** for robust date handling
- **Chart.js** with React integration for data visualization
- **Custom CSS** with responsive design patterns

### **Data Management**
- **LocalStorage** for client-side persistence
- **State Management** with React hooks
- **Type-Safe APIs** with TypeScript interfaces
- **Real-Time Updates** with reactive state patterns

### **Validation System**
- **Dual Validation Types**: Numeric ranges and categorical selection
- **Client-Side Validation** with immediate feedback
- **Comment Requirements** for quality control
- **Visual Indicators** for user guidance

## 📁 **Project Structure**

```
src/
├── components/
│   ├── AdminInterface.tsx       # Administrator dashboard
│   ├── UserInterface.tsx        # User data collection interface
│   ├── ReviewerInterface.tsx    # Review and approval interface
│   ├── BulkReadingForm.tsx     # Main data entry form
│   ├── ReadingPointsManager.tsx # Point and list management
│   ├── DataTable.tsx           # Data display and analysis
│   ├── Login.tsx               # Authentication component
│   └── *.css                   # Component-specific styles
├── types.ts                    # TypeScript type definitions
├── auth.ts                     # Authentication and user management
├── App.tsx                     # Main application component
├── App.css                     # Global application styles
└── main.tsx                    # Application entry point
```

## 🔧 **Configuration Options**

### **Validation Types**
- **Numeric Range**: Set min/max values for automatic validation
- **SAT/UNSAT**: Categorical selection for qualitative assessments

### **Comment Requirements**
- **UNSAT Selections**: Always require explanatory comments
- **Out-of-Range Values**: Require comments for values outside defined ranges

### **Date Management**
- **Due Dates**: Set expected completion dates for reading lists
- **Timezone Handling**: Proper local date interpretation
- **Overdue Detection**: Automatic identification of past-due items

## 🎯 **Best Practices**

### **System Setup**
1. **Configure Reading Points**: Set appropriate validation types per point
2. **Organize Lists**: Group related points by frequency or system
3. **Set Due Dates**: Establish regular schedules for routine readings
4. **Train Users**: Ensure understanding of validation requirements

### **Daily Operations**
1. **Check Overdue Lists**: Prioritize past-due readings
2. **Complete Comments**: Provide context for UNSAT or out-of-range values
3. **Review Progress**: Monitor completion rates throughout the day
4. **Submit Promptly**: Submit readings for timely processing

### **Quality Control**
1. **Review Submissions**: Check for completeness and accuracy
2. **Verify Comments**: Ensure adequate explanations for unusual readings
3. **Monitor Trends**: Watch for patterns in UNSAT or out-of-range values
4. **Provide Feedback**: Guide users on data quality improvements

## 🚀 **Advanced Features**

### **Overdue Management**
- Automatic detection of lists past their due date
- Visual indicators for overdue status
- Prioritized display of past-due items
- Historical tracking of completion patterns

### **Progress Tracking**
- Real-time completion percentages
- Visual progress indicators
- Completion status per reading session
- Historical completion data

### **Data Quality**
- Mandatory comments for quality control
- Visual validation feedback
- Trend analysis for anomaly detection
- Review workflows for approval processes

## 📈 **Future Enhancements**

- **Backend Integration**: Database persistence and API endpoints
- **Real-Time Sync**: Multi-user collaboration with live updates
- **Advanced Analytics**: Predictive modeling and trend analysis
- **Mobile Apps**: Native iOS and Android applications
- **IoT Integration**: Automatic sensor data collection
- **Reporting Engine**: Automated report generation and scheduling
- **Notification System**: Alerts for overdue readings and anomalies
- **Audit Trails**: Comprehensive logging of all system activities

## 📞 **Support & Contributing**

### **Getting Help**
- Check the [Issues](https://github.com/Jsearle01/building-readings-app/issues) page for known problems
- Create a new issue for bugs or feature requests
- Review the code documentation for implementation details

### **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Submit a pull request with detailed description

## 📄 **License**

This project is open source and available under the MIT License.

---

**Building Readings Management System** - Comprehensive enterprise solution for building data collection and management.
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
