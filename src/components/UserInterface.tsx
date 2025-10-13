import React, { useState } from 'react';
import { BuildingReading, ReadingPoint, ReadingPointList, ReviewSubmission, PointCompletion } from '../types';
import BulkReadingForm from './BulkReadingForm';
import './UserInterface.css';

interface UserInterfaceProps {
  readingPoints: ReadingPoint[];
  initialReadingPointLists: ReadingPointList[];
  onCreateUserList?: (list: ReadingPointList) => void;
  readings: BuildingReading[]; // Add readings for trend analysis
  currentUserId: string;
  currentUserName?: string;
  onAddBulkReadings: (readings: BuildingReading[]) => void;
  onSubmitForReview: (submission: Omit<ReviewSubmission, 'id' | 'status' | 'submittedAt'>) => void;
}

const UserInterface: React.FC<UserInterfaceProps> = ({
  readingPoints,
  initialReadingPointLists,
  onCreateUserList,
  readings,
  currentUserId,
  currentUserName,
  onAddBulkReadings,
  onSubmitForReview
}) => {
  // Local state for readingPointLists to allow updates
  const [localReadingPointLists, setLocalReadingPointLists] = useState<ReadingPointList[]>(initialReadingPointLists);
  // State for template list creation
  const [showTemplateCreate, setShowTemplateCreate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');
  const [newListDescription, setNewListDescription] = useState<string>('');

  // Handler to create new list from template
  const handleCreateListFromTemplate = () => {
    if (!selectedTemplateId || !newListName) {
      alert('Please select a template and enter a name for the new list.');
      return;
    }
    const template = localReadingPointLists.find((l: ReadingPointList) => l.id === selectedTemplateId && l.isModel);
    if (!template) {
      alert('Template not found.');
      return;
    }
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newList: ReadingPointList = {
      id: Date.now().toString(),
      name: newListName,
      description: newListDescription || `Copy of ${template.name}`,
      pointIds: [...template.pointIds],
      expectedCompletionDate: today,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isModel: false
    };
    setLocalReadingPointLists(prev => [...prev, newList]);
    if (onCreateUserList) {
      onCreateUserList(newList);
    }
    alert(`New list "${newList.name}" created from template "${template.name}".`);
    setShowTemplateCreate(false);
    setSelectedTemplateId('');
    setNewListName('');
    setNewListDescription('');
  };
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [completedReadings, setCompletedReadings] = useState<Set<string>>(new Set());
  const [individualCompletions, setIndividualCompletions] = useState<Set<string>>(new Set());
  const [pointCompletions, setPointCompletions] = useState<Map<string, PointCompletion>>(new Map());
  const [selectedListId, setSelectedListId] = useState<string>('');

  // Combine both types of completions for display
  const allCompletedReadings = new Set([...completedReadings, ...individualCompletions]);

  // Filter reading points and lists based on selected room
  const getFilteredData = () => {
    // First filter lists by availability date and exclude model templates
    const availableLists = localReadingPointLists.filter(list => 
      isCompletionDateValid(list).isValid && !list.isModel
    );
    
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
      {/* Create New List from Template UI */}
      <div className="template-create-section" style={{ margin: '1rem 0' }}>
        <button className="btn btn-secondary" onClick={() => setShowTemplateCreate(v => !v)}>
          {showTemplateCreate ? 'Cancel' : 'Create New List from Template'}
        </button>
        {showTemplateCreate && (
          <div className="template-create-form" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
            <h4>Create New List from Template</h4>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Template List:</label>
              <select
                value={selectedTemplateId}
                onChange={e => {
                  const templateId = e.target.value;
                  setSelectedTemplateId(templateId);
                  const template = localReadingPointLists.find(l => l.id === templateId && l.isModel);
                  if (template) {
                    setNewListName(template.name);
                    setNewListDescription(template.description || '');
                  } else {
                    setNewListName('');
                    setNewListDescription('');
                  }
                }}
                style={{ marginLeft: '0.5rem' }}
              >
                <option value="">-- Select Template --</option>
                {localReadingPointLists.filter(l => l.isModel).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>New List Name:</label>
              <input type="text" value={newListName} onChange={e => setNewListName(e.target.value)} style={{ marginLeft: '0.5rem', width: '350px', height: '2.2em', fontSize: '1.1em' }} />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Description:</label>
              <textarea value={newListDescription} onChange={e => setNewListDescription(e.target.value)} style={{ marginLeft: '0.5rem', width: '350px', height: '4em', fontSize: '1.1em', resize: 'vertical' }} />
            </div>
            <button className="btn btn-primary" onClick={handleCreateListFromTemplate}>Create List</button>
          </div>
        )}
      </div>
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
            
            {localReadingPointLists.length === 0 && (
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
            allReadingPointLists={localReadingPointLists}
            allCompletedReadings={allCompletedReadings}
          />
        </div>

        {/* Quick Stats */}
  {localReadingPointLists.length > 0 && (
          <div className="user-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{selectedRoom ? filteredLists.length : localReadingPointLists.length}</div>
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
  {(selectedRoom ? filteredLists : localReadingPointLists).length > 0 && (
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