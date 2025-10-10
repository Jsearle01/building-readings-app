import React from 'react';
import { ReadingType, ChartType } from '../types';

interface ControlsProps {
  selectedReadingType: ReadingType | 'all';
  selectedBuilding: string;
  availableBuildings: string[];
  onReadingTypeChange: (type: ReadingType | 'all') => void;
  onBuildingChange: (building: string) => void;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  showChartControls?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  selectedReadingType,
  selectedBuilding,
  availableBuildings,
  onReadingTypeChange,
  onBuildingChange,
  chartType,
  onChartTypeChange,
  showChartControls = false
}) => {
  return (
    <div className="controls">
      <div className="form-group">
        <label htmlFor="readingTypeFilter">Filter by Reading Type:</label>
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

      <div className="form-group">
        <label htmlFor="buildingFilter">Filter by Building:</label>
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

      {showChartControls && chartType && onChartTypeChange && (
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
          className="btn btn-secondary"
          onClick={() => {
            onReadingTypeChange('all');
            onBuildingChange('all');
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default Controls;
