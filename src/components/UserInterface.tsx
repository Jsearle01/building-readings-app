import React from 'react';
import { BuildingReading, ReadingPoint, ReadingPointList } from '../types';
import SimpleBulkEntry from './SimpleBulkEntry';

interface UserInterfaceProps {
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  onAddBulkReadings: (readings: BuildingReading[]) => void;
}

const UserInterface: React.FC<UserInterfaceProps> = ({
  readingPoints,
  readingPointLists,
  onAddBulkReadings
}) => {
  return (
    <div className="user-interface">
      <header className="app-header">
        <div className="header-content">
          <h1>📊 Building Readings - Data Collection</h1>
          <p>Enter readings using pre-configured lists</p>
        </div>
      </header>

      <main className="container">
        <div className="view">
          <div className="user-intro">
            <h2>📝 Data Entry</h2>
            <p className="view-description">
              Select a reading list and enter all required measurements. All reading points 
              and lists are managed by your administrator.
            </p>
            
            {readingPointLists.length === 0 && (
              <div className="alert alert-info">
                <h3>🚧 Setup Required</h3>
                <p>
                  No reading lists are currently configured. Please contact your administrator 
                  to set up reading points and lists before you can collect data.
                </p>
              </div>
            )}
          </div>

          <SimpleBulkEntry
            onSubmit={onAddBulkReadings}
            readingPoints={readingPoints}
            readingPointLists={readingPointLists}
          />
        </div>

        {/* Quick Stats */}
        {readingPointLists.length > 0 && (
          <div className="user-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{readingPointLists.length}</div>
                <div className="stat-label">Available Lists</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {readingPoints.filter(p => p.isActive).length}
                </div>
                <div className="stat-label">Active Points</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {new Set(readingPoints.map(p => p.buildingName)).size}
                </div>
                <div className="stat-label">Buildings</div>
              </div>
            </div>
          </div>
        )}

        {/* Available Lists Overview */}
        {readingPointLists.length > 0 && (
          <div className="available-lists">
            <h3>📋 Available Reading Lists</h3>
            <div className="lists-grid">
              {readingPointLists.map(list => {
                const activePoints = readingPoints.filter(p => 
                  list.pointIds.includes(p.id) && p.isActive
                ).length;
                
                return (
                  <div key={list.id} className="list-card">
                    <h4>{list.name}</h4>
                    {list.description && (
                      <p className="list-description">{list.description}</p>
                    )}
                    <div className="list-stats">
                      <span className="point-count">{activePoints} active points</span>
                      <span className="buildings">
                        {new Set(
                          readingPoints
                            .filter(p => list.pointIds.includes(p.id) && p.isActive)
                            .map(p => p.buildingName)
                        ).size} buildings
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserInterface;