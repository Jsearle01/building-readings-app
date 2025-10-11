import React, { useState, useEffect } from 'react';
import { BuildingReading, ReadingPoint, ReadingPointList, ReadingType, ChartType, FieldDefinitions } from '../types';
import { format } from 'date-fns';
import ReadingPointsManager from './ReadingPointsManager';
import DataTable from './DataTable';
import ChartView from './ChartView';
import EnhancedControls from './EnhancedControls';
import './AdminInterface.css';

interface AdminInterfaceProps {
  readings: BuildingReading[];
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  selectedReadingType: ReadingType | 'all';
  selectedBuilding: string;
  chartType: ChartType;
  fieldDefinitions: FieldDefinitions;
  currentUserId?: string;
  onDeleteReading: (id: string) => void;
  onAddReadingPoint: (point: ReadingPoint) => void;
  onUpdateReadingPoint: (id: string, updates: Partial<ReadingPoint>) => void;
  onDeleteReadingPoint: (id: string) => void;
  onAddReadingPointList: (list: ReadingPointList) => void;
  onUpdateReadingPointList: (id: string, updates: Partial<ReadingPointList>) => void;
  onDeleteReadingPointList: (id: string) => void;
  onFilterChange: (readingType: ReadingType | 'all', building: string) => void;
  onChartTypeChange: (chartType: ChartType) => void;
}

const AdminInterface: React.FC<AdminInterfaceProps> = ({
  readings,
  readingPoints,
  readingPointLists,
  selectedReadingType,
  selectedBuilding,
  chartType,
  fieldDefinitions,
  currentUserId,
  onDeleteReading,
  onAddReadingPoint,
  onUpdateReadingPoint,
  onDeleteReadingPoint,
  onAddReadingPointList,
  onUpdateReadingPointList,
  onDeleteReadingPointList,
  onFilterChange,
  onChartTypeChange
}) => {
  const [currentView, setCurrentView] = useState<'points' | 'table' | 'chart'>('points');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // Reset room selection when building changes
  useEffect(() => {
    setSelectedRoom('all');
  }, [selectedBuilding]);

  // Get available rooms based on selected building
  const getAvailableRooms = () => {
    if (selectedBuilding === 'all') {
      return Array.from(new Set(readings.map(r => r.room))).filter(Boolean);
    }
    return Array.from(new Set(
      readings
        .filter(r => r.buildingName === selectedBuilding)
        .map(r => r.room)
    )).filter(Boolean);
  };

  // Get available components from reading points
  const getAvailableComponents = () => {
    return Array.from(new Set(
      readingPoints
        .map(p => p.component)
        .filter(Boolean)
    )) as string[];
  };

  // Get available dates from readings (formatted as readable dates)
  const getAvailableDates = () => {
    return Array.from(new Set(
      readings.map(r => format(new Date(r.timestamp), 'MMM dd, yyyy'))
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort newest first
  };

  // Enhanced filtering function
  const getEnhancedFilteredReadings = () => {
    return readings.filter(reading => {
      const typeMatch = selectedReadingType === 'all' || reading.readingType === selectedReadingType;
      const buildingMatch = selectedBuilding === 'all' || reading.buildingName === selectedBuilding;
      const roomMatch = selectedRoom === 'all' || reading.room === selectedRoom;
      
      // Date filtering
      const dateMatch = selectedDate === 'all' || format(new Date(reading.timestamp), 'MMM dd, yyyy') === selectedDate;
      
      // For component filtering, we need to check if the reading has a pointId and that point has the component
      let componentMatch = selectedComponent === 'all';
      if (!componentMatch && reading.pointId) {
        const point = readingPoints.find(p => p.id === reading.pointId);
        componentMatch = point?.component === selectedComponent;
      } else if (!componentMatch && !reading.pointId) {
        // If no pointId, we can't filter by component, so include it
        componentMatch = true;
      }
      
      return typeMatch && buildingMatch && roomMatch && componentMatch && dateMatch;
    });
  };

  // Handle room selection change
  const handleRoomChange = (room: string) => {
    setSelectedRoom(room);
  };

  // Handle component selection change
  const handleComponentChange = (component: string) => {
    setSelectedComponent(component);
  };

  // Handle date selection change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  // Clear all enhanced filters
  const clearAllFilters = () => {
    onFilterChange('all', 'all');
    setSelectedRoom('all');
    setSelectedComponent('all');
    setSelectedDate('all');
  };

  return (
    <div className="admin-interface">
      <header className="app-header">
        <div className="header-content">
          <h1>📊 Building Readings - Admin Dashboard</h1>
          <p>Manage reading points, lists, and data collection</p>
        </div>
        
        <nav className="navigation">
          <button 
            className={`nav-tab ${currentView === 'points' ? 'active' : ''}`}
            onClick={() => setCurrentView('points')}
          >
            📍 Manage Points & Lists
          </button>
          <button 
            className={`nav-tab ${currentView === 'table' ? 'active' : ''}`}
            onClick={() => setCurrentView('table')}
          >
            📋 Data Table
          </button>
          <button 
            className={`nav-tab ${currentView === 'chart' ? 'active' : ''}`}
            onClick={() => setCurrentView('chart')}
          >
            📈 Charts & Trends
          </button>
        </nav>
      </header>

      <main className="container">
        {currentView === 'points' && (
          <div className="view">
            <h2>Reading Points & Lists Management</h2>
            <p className="view-description">
              Create and manage reading points and organize them into lists for efficient data collection.
            </p>
            <ReadingPointsManager
              fieldDefinitions={fieldDefinitions}
              readingPoints={readingPoints}
              readingPointLists={readingPointLists}
              currentUserId={currentUserId}
              onAddPoint={onAddReadingPoint}
              onUpdatePoint={onUpdateReadingPoint}
              onDeletePoint={onDeleteReadingPoint}
              onAddList={onAddReadingPointList}
              onUpdateList={onUpdateReadingPointList}
              onDeleteList={onDeleteReadingPointList}
            />
          </div>
        )}

        {currentView === 'table' && (
          <>
            {readings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No readings available</h3>
                <p>Start collecting building readings to see data analysis and filtering options here.</p>
                <p className="empty-state-hint">
                  💡 You can add readings through the user interface or by creating reading points in the "Manage Points & Lists" tab.
                </p>
              </div>
            ) : (
              <div className="view">
                <h2>Data Table & Analysis</h2>
                <p className="view-description">
                  View, filter, and analyze all collected readings with advanced filtering by building, room, and component.
                </p>
                
                <EnhancedControls
                  selectedReadingType={selectedReadingType}
                  selectedBuilding={selectedBuilding}
                  selectedRoom={selectedRoom}
                  selectedComponent={selectedComponent}
                  selectedDate={selectedDate}
                  availableBuildings={Array.from(new Set(readings.map(r => r.buildingName)))}
                  availableRooms={getAvailableRooms()}
                  availableComponents={getAvailableComponents()}
                  availableDates={getAvailableDates()}
                  onReadingTypeChange={(type) => onFilterChange(type, selectedBuilding)}
                  onBuildingChange={(building) => onFilterChange(selectedReadingType, building)}
                  onRoomChange={handleRoomChange}
                  onComponentChange={handleComponentChange}
                  onDateChange={handleDateChange}
                  onClearFilters={clearAllFilters}
                />
                
                {getEnhancedFilteredReadings().length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3>No readings match your filters</h3>
                    <p>Try adjusting your filters to see more results, or clear all filters to view all readings.</p>
                    <p className="empty-state-hint">
                      💡 You have {readings.length} total readings available.
                    </p>
                  </div>
                ) : (
                  <DataTable 
                    readings={getEnhancedFilteredReadings()}
                    onDeleteReading={onDeleteReading}
                  />
                )}
              </div>
            )}
          </>
        )}

        {currentView === 'chart' && (
          <div className="view">
            <h2>Charts & Trends</h2>
            <p className="view-description">
              Visualize your data with advanced filtering by building, room, and component to identify patterns and trends.
            </p>
            <EnhancedControls
              selectedReadingType={selectedReadingType}
              selectedBuilding={selectedBuilding}
              selectedRoom={selectedRoom}
              selectedComponent={selectedComponent}
              selectedDate={selectedDate}
              availableBuildings={Array.from(new Set(readings.map(r => r.buildingName)))}
              availableRooms={getAvailableRooms()}
              availableComponents={getAvailableComponents()}
              availableDates={getAvailableDates()}
              onReadingTypeChange={(type) => onFilterChange(type, selectedBuilding)}
              onBuildingChange={(building) => onFilterChange(selectedReadingType, building)}
              onRoomChange={handleRoomChange}
              onComponentChange={handleComponentChange}
              onDateChange={handleDateChange}
              chartType={chartType}
              onChartTypeChange={onChartTypeChange}
              onClearFilters={clearAllFilters}
            />
            <ChartView 
              readings={getEnhancedFilteredReadings()}
              chartType={chartType}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminInterface;