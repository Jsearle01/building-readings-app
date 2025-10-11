import React, { useState } from 'react';
import { BuildingReading, ReadingPoint, ReadingPointList, ReviewSubmission, PointCompletion } from '../types';
import BulkReadingForm from './BulkReadingForm';
import './UserInterface.css';

interface UserInterfaceProps {
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  readings: BuildingReading[]; // Add readings for trend analysis
  currentUserId: string;
  currentUserName?: string;
  onAddBulkReadings: (readings: BuildingReading[]) => void;
  onSubmitForReview: (submission: Omit<ReviewSubmission, 'id' | 'status' | 'submittedAt'>) => void;
}

const UserInterface: React.FC<UserInterfaceProps> = ({
  readingPoints,
  readingPointLists,
  readings, // Add readings parameter
  currentUserId,
  currentUserName,
  onAddBulkReadings,
  onSubmitForReview
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [completedReadings, setCompletedReadings] = useState<Set<string>>(new Set());
  const [individualCompletions, setIndividualCompletions] = useState<Set<string>>(new Set());
  const [pointCompletions, setPointCompletions] = useState<Map<string, PointCompletion>>(new Map());
  const [selectedListId, setSelectedListId] = useState<string>('');

  // Combine both types of completions for display
  const allCompletedReadings = new Set([...completedReadings, ...individualCompletions]);

  // Filter reading points and lists based on selected room
  const getFilteredData = () => {
    // First filter lists by availability date
    const availableLists = readingPointLists.filter(list => isCompletionDateValid(list).isValid);
    
    if (!selectedRoom) {
      return { filteredPoints: readingPoints, filteredLists: availableLists };
    }

    const [building, floor, room] = selectedRoom.split('-');
    
    // Filter points by selected room
    const filteredPoints = readingPoints.filter(point => 
      point.buildingName === building && 
      point.floor === floor && 
      point.room === room &&
      point.isActive
    );

    // Filter available lists to only include those that have points in the selected room
    const relevantPointIds = new Set(filteredPoints.map(p => p.id));
    const filteredLists = availableLists.filter(list => 
      list.pointIds.some(pointId => relevantPointIds.has(pointId))
    ).map(list => ({
      ...list,
      pointIds: list.pointIds.filter(pointId => relevantPointIds.has(pointId))
    })).filter(list => list.pointIds.length > 0);

    return { filteredPoints, filteredLists };
  };

  // Helper function to check if today matches the expected completion date
  const isCompletionDateValid = (list: ReadingPointList): { isValid: boolean; message?: string } => {
    if (!list.expectedCompletionDate) {
      return { isValid: true }; // No restriction if no date is set
    }
    
    const today = new Date().toISOString().split('T')[0]; // Today in YYYY-MM-DD format
    const expectedDate = list.expectedCompletionDate;
    
    // Allow completion if the list is due today OR OVERDUE (before today)
    if (expectedDate <= today) {
      return { isValid: true };
    } else {
      const expectedDateFormatted = new Date(expectedDate + 'T00:00:00').toLocaleDateString();
      return { 
        isValid: false, 
        message: `Available on ${expectedDateFormatted}`
      };
    }
  };

  const { filteredPoints, filteredLists } = getFilteredData();

  const handleListSelection = (listId: string) => {
    setSelectedListId(listId);
    // Reset room selection when changing lists
    if (listId !== selectedListId) {
      setSelectedRoom(null);
    }
  };

  const handleIndividualPointCompletion = (pointId: string, completed: boolean, completion?: PointCompletion) => {
    setIndividualCompletions(prev => {
      const newSet = new Set(prev);
      if (completed) {
        newSet.add(pointId);
      } else {
        newSet.delete(pointId);
      }
      return newSet;
    });

    // Update completion details with user name instead of ID
    setPointCompletions(prev => {
      const newMap = new Map(prev);
      if (completed && completion) {
        const completionWithUserName = {
          ...completion,
          completedBy: currentUserName || completion.completedBy
        };
        newMap.set(pointId, completionWithUserName);
      } else {
        newMap.delete(pointId);
      }
      return newMap;
    });
  };

  const handleBulkReadings = (readings: BuildingReading[]) => {
    // Mark points as completed
    const newCompletedReadings = new Set(completedReadings);
    readings.forEach(reading => {
      if (reading.pointId) {
        newCompletedReadings.add(reading.pointId);
      }
    });
    setCompletedReadings(newCompletedReadings);
    
    onAddBulkReadings(readings);
  };

  const handleSubmitForReview = (submission: Omit<ReviewSubmission, 'id' | 'status' | 'submittedAt'>) => {
    // Mark points as completed
    const newCompletedReadings = new Set(completedReadings);
    submission.readings.forEach(reading => {
      if (reading.pointId) {
        newCompletedReadings.add(reading.pointId);
      }
    });
    setCompletedReadings(newCompletedReadings);
    
    onSubmitForReview(submission);
  };
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

          {/* Show different messages based on list selection and room selection */}
          {!selectedListId && (
            <div className="workflow-info">
              <div className="alert alert-info">
                <h4>📋 Getting Started</h4>
                <p>
                  <strong>Step 1:</strong> Select a reading list below to begin data collection.
                  <br />
                  <strong>Step 2:</strong> Choose a specific room to focus your readings.
                  <br />
                  <strong>Step 3:</strong> Enter values and mark points complete as you work.
                </p>
              </div>
            </div>
          )}

          {selectedListId && !selectedRoom && (
            <div className="workflow-info">
              <div className="alert alert-info">
                <h4>🏠 Choose a Room</h4>
                <p>
                  Great! You've selected a reading list. Now choose a room from the options below to focus your data collection.
                  Room colors indicate completion status: Red = Not started, Orange = In progress, Green = Complete.
                </p>
              </div>
            </div>
          )}

          {/* Show room-specific message if room is selected */}
          {selectedListId && selectedRoom && (
            <div className="room-selection-info">
              <div className="alert alert-info">
                <h4>🏠 Room Selected: {selectedRoom.split('-')[2]}</h4>
                <p>
                  Showing reading points for {selectedRoom.split('-')[2]} in {selectedRoom.split('-')[0]}, Floor {selectedRoom.split('-')[1]}.
                  Enter values and check "Mark Complete" for each point as you finish.
                  {filteredLists.length === 0 && ' No reading points available for this room in the selected list.'}
                </p>
              </div>
            </div>
          )}

          <BulkReadingForm
            onSubmit={handleBulkReadings}
            onSubmitForReview={handleSubmitForReview}
            readingPoints={filteredPoints}
            readingPointLists={filteredLists}
            readings={readings} // Add readings for trend analysis
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            requiresReview={true}
            allowIndividualSelection={false}
            completedPoints={individualCompletions}
            pointCompletions={pointCompletions}
            onPointComplete={handleIndividualPointCompletion}
            onListSelection={handleListSelection}
            selectedRoom={selectedRoom}
            onRoomSelect={setSelectedRoom}
            allReadingPoints={readingPoints}
            allReadingPointLists={readingPointLists}
            allCompletedReadings={allCompletedReadings}
          />
        </div>

        {/* Quick Stats */}
        {readingPointLists.length > 0 && (
          <div className="user-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{selectedRoom ? filteredLists.length : readingPointLists.length}</div>
                <div className="stat-label">{selectedRoom ? 'Room Lists' : 'Available Lists'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {(selectedRoom ? filteredPoints : readingPoints).filter(p => p.isActive).length}
                </div>
                <div className="stat-label">{selectedRoom ? 'Room Points' : 'Active Points'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {selectedRoom ? 1 : new Set(readingPoints.map(p => p.buildingName)).size}
                </div>
                <div className="stat-label">{selectedRoom ? 'Room' : 'Buildings'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{allCompletedReadings.size}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>
        )}

        {/* Available Lists Overview */}
        {(selectedRoom ? filteredLists : readingPointLists).length > 0 && (
          <div className="available-lists">
            <h3>📋 {selectedRoom ? 'Room Reading Lists' : 'Available Reading Lists'}</h3>
            <div className="lists-grid">
              {(selectedRoom ? filteredLists : filteredLists).map(list => {
                const relevantPoints = selectedRoom ? filteredPoints : readingPoints;
                const activePoints = relevantPoints.filter(p => 
                  list.pointIds.includes(p.id) && p.isActive
                ).length;
                
                return (
                  <div key={list.id} className="list-card">
                    <div className="list-header">
                      <h4>{list.name}</h4>
                      {list.expectedCompletionDate && (
                        <div className="completion-date available">
                          ✅ Due Today
                        </div>
                      )}
                    </div>
                    {list.description && (
                      <p className="list-description">{list.description}</p>
                    )}
                    <div className="list-stats">
                      <span className="point-count">{activePoints} active points</span>
                      <span className="buildings">
                        {selectedRoom ? (
                          <span>Room: {selectedRoom.split('-')[2]}</span>
                        ) : (
                          <span>
                            {new Set(
                              readingPoints
                                .filter(p => list.pointIds.includes(p.id) && p.isActive)
                                .map(p => p.buildingName)
                            ).size} buildings
                          </span>
                        )}
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