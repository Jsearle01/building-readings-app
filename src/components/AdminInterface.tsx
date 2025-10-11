import React, { useState } from 'react';
import { BuildingReading, ReadingPoint, ReadingPointList, ReadingType, ChartType, FieldDefinitions } from '../types';
import ReadingPointsManager from './ReadingPointsManager';
import BulkReadingForm from './BulkReadingForm';
import DataTable from './DataTable';
import ChartView from './ChartView';
import Controls from './Controls';

interface AdminInterfaceProps {
  readings: BuildingReading[];
  filteredReadings: BuildingReading[];
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  selectedReadingType: ReadingType | 'all';
  selectedBuilding: string;
  chartType: ChartType;
  fieldDefinitions: FieldDefinitions;
  onAddBulkReadings: (readings: BuildingReading[]) => void;
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
  filteredReadings,
  readingPoints,
  readingPointLists,
  selectedReadingType,
  selectedBuilding,
  chartType,
  fieldDefinitions,
  onAddBulkReadings,
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
  const [currentView, setCurrentView] = useState<'points' | 'bulk' | 'table' | 'chart'>('points');

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
            className={`nav-tab ${currentView === 'bulk' ? 'active' : ''}`}
            onClick={() => setCurrentView('bulk')}
          >
            📝 Bulk Entry
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
              onAddPoint={onAddReadingPoint}
              onUpdatePoint={onUpdateReadingPoint}
              onDeletePoint={onDeleteReadingPoint}
              onAddList={onAddReadingPointList}
              onUpdateList={onUpdateReadingPointList}
              onDeleteList={onDeleteReadingPointList}
            />
          </div>
        )}

        {currentView === 'bulk' && (
          <div className="view">
            <h2>Bulk Reading Entry</h2>
            <p className="view-description">
              Enter multiple readings simultaneously using predefined points or custom selections.
            </p>
            <BulkReadingForm 
              onSubmit={onAddBulkReadings}
              readingPoints={readingPoints}
              readingPointLists={readingPointLists}
              allowIndividualSelection={true}
              completedPoints={new Set()}
              onPointComplete={() => {}}
              onListSelection={() => {}}
              selectedRoom={null}
              onRoomSelect={() => {}}
              allReadingPoints={readingPoints}
              allReadingPointLists={readingPointLists}
              allCompletedReadings={new Set()}
            />
          </div>
        )}

        {currentView === 'table' && (
          <div className="view">
            <h2>Data Table & Analysis</h2>
            <p className="view-description">
              View, filter, and analyze all collected readings in a detailed table format.
            </p>
            <Controls
              selectedReadingType={selectedReadingType}
              selectedBuilding={selectedBuilding}
              availableBuildings={Array.from(new Set(readings.map(r => r.buildingName)))}
              onReadingTypeChange={(type) => onFilterChange(type, selectedBuilding)}
              onBuildingChange={(building) => onFilterChange(selectedReadingType, building)}
            />
            <DataTable 
              readings={filteredReadings}
              onDeleteReading={onDeleteReading}
            />
          </div>
        )}

        {currentView === 'chart' && (
          <div className="view">
            <h2>Charts & Trends</h2>
            <p className="view-description">
              Visualize your data with interactive charts to identify patterns and trends.
            </p>
            <Controls
              selectedReadingType={selectedReadingType}
              selectedBuilding={selectedBuilding}
              availableBuildings={Array.from(new Set(readings.map(r => r.buildingName)))}
              onReadingTypeChange={(type) => onFilterChange(type, selectedBuilding)}
              onBuildingChange={(building) => onFilterChange(selectedReadingType, building)}
              chartType={chartType}
              onChartTypeChange={onChartTypeChange}
              showChartControls={true}
            />
            <ChartView 
              readings={filteredReadings}
              chartType={chartType}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminInterface;