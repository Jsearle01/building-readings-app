import React from 'react';
import { ReadingType, ChartType } from '../types';
import './EnhancedControls.css';

interface EnhancedControlsProps {
  selectedReadingType: ReadingType | 'all';
  selectedBuilding: string;
  selectedRoom: string;
  selectedComponent: string;
  selectedDate: string;
  availableBuildings: string[];
  availableRooms: string[];
  availableComponents: string[];
  availableDates: string[];
  onReadingTypeChange: (type: ReadingType | 'all') => void;
  onBuildingChange: (building: string) => void;
  onRoomChange: (room: string) => void;
  onComponentChange: (component: string) => void;
  onDateChange: (date: string) => void;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  onClearFilters: () => void;
}

const EnhancedControls: React.FC<EnhancedControlsProps> = ({
  selectedReadingType,
  selectedBuilding,
  selectedRoom,
  selectedComponent,
  selectedDate,
  availableBuildings,
  availableRooms,
  availableComponents,
  availableDates,
  onReadingTypeChange,
  onBuildingChange,
  onRoomChange,
  onComponentChange,
  onDateChange,
  chartType,
  onChartTypeChange,
  onClearFilters
}) => {
  return (
    <div className="enhanced-controls">
      <div className="controls-grid">
        <div className="form-group">
          <label htmlFor="dateFilter">Date:</label>
          <select
            id="dateFilter"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          >
            <option value="all">All Dates</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="buildingFilter">Building:</label>
          <select
            id="buildingFilter"
            value={selectedBuilding}
            onChange={(e) => onBuildingChange(e.target.value)}
          >
            <option value="all">All Buildings</option>
            {availableBuildings.map(building => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="roomFilter">Room:</label>
          <select
            id="roomFilter"
            value={selectedRoom}
            onChange={(e) => onRoomChange(e.target.value)}
            disabled={selectedBuilding === 'all' && availableRooms.length === 0}
          >
            <option value="all">All Rooms</option>
            {availableRooms.map(room => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="componentFilter">Component:</label>
          <select
            id="componentFilter"
            value={selectedComponent}
            onChange={(e) => onComponentChange(e.target.value)}
          >
            <option value="all">All Components</option>
            {availableComponents.map(component => (
              <option key={component} value={component}>
                {component}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="readingTypeFilter">Reading Type:</label>
          <select
            id="readingTypeFilter"
            value={selectedReadingType}
            onChange={(e) => onReadingTypeChange(e.target.value as ReadingType | 'all')}
          >
            <option value="all">All Types</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="energy">Energy Consumption</option>
            <option value="water">Water Usage</option>
            <option value="gas">Gas Usage</option>
            <option value="occupancy">Occupancy</option>
            <option value="air_quality">Air Quality</option>
            <option value="lighting">Lighting Level</option>
          </select>
        </div>

        {chartType && onChartTypeChange && (
          <div className="form-group">
            <label htmlFor="chartTypeSelect">Chart Type:</label>
            <select
              id="chartTypeSelect"
              value={chartType}
              onChange={(e) => onChartTypeChange(e.target.value as ChartType)}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <button 
            className="btn btn-secondary clear-filters-btn"
            onClick={onClearFilters}
          >
            🔄 Clear All Filters
          </button>
        </div>
      </div>

      <div className="filter-summary">
        <span className="filter-count">
          Active Filters: {[
            selectedReadingType !== 'all' ? 'Type' : null,
            selectedBuilding !== 'all' ? 'Building' : null,
            selectedRoom !== 'all' ? 'Room' : null,
            selectedComponent !== 'all' ? 'Component' : null,
            selectedDate !== 'all' ? 'Date' : null
          ].filter(Boolean).length}
        </span>
      </div>
    </div>
  );
};

export default EnhancedControls;