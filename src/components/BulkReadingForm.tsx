import React, { useState } from 'react';
import { ReadingPoint, ReadingPointList, BuildingReading, BulkReadingEntry, ReviewSubmission, PointCompletion } from '../types';
import RoomSelector from './RoomSelector';

interface BulkReadingFormProps {
  onSubmit: (readings: BuildingReading[]) => void;
  onSubmitForReview?: (submission: Omit<ReviewSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  currentUserId?: string;
  currentUserName?: string;
  requiresReview?: boolean; // If true, submissions go to review instead of direct entry
  allowIndividualSelection?: boolean; // If false, only allow complete list selection
  completedPoints?: Set<string>; // Set of point IDs that are marked as complete
  pointCompletions?: Map<string, PointCompletion>; // Map of point ID to completion details
  onPointComplete?: (pointId: string, completed: boolean, completion?: PointCompletion) => void; // Callback when user marks a point complete
  onListSelection?: (listId: string) => void; // Callback when user selects a list
  // Room selection props
  selectedRoom?: string | null;
  onRoomSelect?: (room: string | null) => void;
  allReadingPoints?: ReadingPoint[]; // All reading points (not filtered by room)
  allReadingPointLists?: ReadingPointList[]; // All reading point lists (not filtered by room)
  allCompletedReadings?: Set<string>; // All completed readings for room color calculation
}

const BulkReadingForm: React.FC<BulkReadingFormProps> = ({
  onSubmit,
  onSubmitForReview,
  readingPoints,
  readingPointLists,
  currentUserId,
  currentUserName,
  requiresReview = false,
  allowIndividualSelection = true,
  completedPoints = new Set(),
  pointCompletions = new Map(),
  onPointComplete,
  onListSelection,
  selectedRoom,
  onRoomSelect,
  allReadingPoints,
  allReadingPointLists,
  allCompletedReadings = new Set()
}) => {
  const [selectedList, setSelectedList] = useState<string>('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [readingEntries, setReadingEntries] = useState<BulkReadingEntry[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16) // Format for datetime-local input
  );

  const activePoints = readingPoints.filter(p => p.isActive);

  const handleListSelection = (listId: string) => {
    setSelectedList(listId);
    if (onListSelection) {
      onListSelection(listId);
    }
    
    if (listId) {
      const list = readingPointLists.find(l => l.id === listId);
      if (list) {
        setSelectedPoints(list.pointIds);
        // Initialize reading entries for the selected points
        const entries = list.pointIds.map(pointId => ({
          pointId,
          value: 0,
          notes: ''
        }));
        setReadingEntries(entries);
      }
    } else {
      setSelectedPoints([]);
      setReadingEntries([]);
    }
  };

  const handlePointToggle = (pointId: string) => {
    if (selectedPoints.includes(pointId)) {
      setSelectedPoints(prev => prev.filter(id => id !== pointId));
      setReadingEntries(prev => prev.filter(entry => entry.pointId !== pointId));
    } else {
      setSelectedPoints(prev => [...prev, pointId]);
      setReadingEntries(prev => [...prev, { pointId, value: 0, notes: '' }]);
    }
  };

  const updateReadingEntry = (pointId: string, field: 'value' | 'notes', value: string | number) => {
    // Don't allow updates if the point is completed
    if (isPointCompleted(pointId)) {
      return;
    }
    
    setReadingEntries(prev => prev.map(entry => 
      entry.pointId === pointId 
        ? { ...entry, [field]: value }
        : entry
    ));
  };

  const handlePointCompletion = (pointId: string, completed: boolean) => {
    // Only allow completion if there's a valid value entered
    if (completed && !hasValidValue(pointId)) {
      return; // Don't allow completion without a value
    }
    
    if (onPointComplete) {
      const entry = readingEntries.find(e => e.pointId === pointId);
      const completion: PointCompletion | undefined = completed ? {
        pointId,
        completedAt: new Date().toISOString(),
        completedBy: currentUserName || currentUserId,
        value: entry?.value,
        notes: entry?.notes
      } : undefined;
      
      onPointComplete(pointId, completed, completion);
    }
  };

  const isPointCompleted = (pointId: string) => {
    return completedPoints.has(pointId);
  };

  const getCompletionDetails = (pointId: string) => {
    return pointCompletions.get(pointId);
  };

  const formatCompletionTime = (completedAt: string) => {
    const date = new Date(completedAt);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const hasValidValue = (pointId: string) => {
    const entry = readingEntries.find(e => e.pointId === pointId);
    return entry && entry.value !== 0 && !isNaN(Number(entry.value)) && String(entry.value) !== '';
  };

  const canMarkComplete = (pointId: string) => {
    return hasValidValue(pointId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If individual selection is not allowed, require a list selection
    if (!allowIndividualSelection && !selectedList) {
      alert('Please select a reading list to continue');
      return;
    }

    if (readingEntries.length === 0) {
      const message = allowIndividualSelection 
        ? 'Please select reading points and enter values'
        : 'Please select a reading list first';
      alert(message);
      return;
    }

    // Validate that all entries have values
    const invalidEntries = readingEntries.filter(entry => 
      entry.value === 0 || isNaN(Number(entry.value))
    );

    if (invalidEntries.length > 0) {
      alert('Please enter valid values for all selected reading points');
      return;
    }

    // Convert entries to BuildingReading objects
    const readings: BuildingReading[] = readingEntries.map(entry => {
      const point = readingPoints.find(p => p.id === entry.pointId);
      if (!point) throw new Error(`Reading point not found: ${entry.pointId}`);

      return {
        id: `${Date.now()}-${entry.pointId}`,
        buildingName: point.buildingName,
        floor: point.floor,
        room: point.room,
        readingType: point.readingType,
        value: Number(entry.value),
        unit: point.unit,
        timestamp: new Date(timestamp).toISOString(),
        notes: entry.notes || undefined,
        pointId: point.id
      };
    });

    if (requiresReview && onSubmitForReview && currentUserId) {
      // Submit for review
      const selectedListObj = readingPointLists.find(l => l.id === selectedList);
      const submission = {
        submittedBy: currentUserId,
        listId: selectedList || undefined,
        listName: selectedListObj?.name,
        readings,
        submissionNotes: submissionNotes || undefined
      };
      
      onSubmitForReview(submission);
      alert(`Successfully submitted ${readings.length} readings for review!`);
    } else {
      // Direct submission
      onSubmit(readings);
      alert(`Successfully added ${readings.length} readings!`);
    }

    // Reset form
    setSelectedList('');
    setSelectedPoints([]);
    setReadingEntries([]);
    setSubmissionNotes('');
    setTimestamp(new Date().toISOString().slice(0, 16));
  };

  const getPointById = (pointId: string) => {
    return readingPoints.find(p => p.id === pointId);
  };

  const getEntryByPointId = (pointId: string) => {
    return readingEntries.find(entry => entry.pointId === pointId);
  };

  const groupPointsByReadingType = () => {
    const groups: Record<string, string[]> = {};
    
    selectedPoints.forEach(pointId => {
      const point = getPointById(pointId);
      if (point) {
        // Group by component if available, otherwise by reading type
        const groupKey = point.component || point.readingType;
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(pointId);
      }
    });
    
    return groups;
  };

  const getReadingTypeDisplayName = (groupKey: string) => {
    // Check if this is a reading type or a custom component
    const readingTypes = ['temperature', 'humidity', 'energy', 'water', 'gas', 'occupancy', 'air_quality', 'lighting'];
    
    if (readingTypes.includes(groupKey)) {
      return groupKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else {
      // It's a custom component name, return as-is
      return groupKey;
    }
  };

  if (activePoints.length === 0) {
    return (
      <div className="no-data">
        <h3>No Active Reading Points</h3>
        <p>You need to create and activate reading points before using bulk entry.</p>
        <p>Go to the "Reading Points" tab to create your first reading points.</p>
      </div>
    );
  }

  return (
    <div className="bulk-reading-form">
      <form onSubmit={handleSubmit}>
        {/* Timestamp Selection */}
        <div className="form-group">
          <label htmlFor="timestamp">Reading Timestamp</label>
          <input
            type="datetime-local"
            id="timestamp"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
          />
        </div>

        {/* List Selection */}
        {readingPointLists.length > 0 && (
          <div className="form-group">
            <label htmlFor="listSelect">
              {allowIndividualSelection ? 'Quick Select from List (Optional)' : 'Select Reading List *'}
            </label>
            <select
              id="listSelect"
              value={selectedList}
              onChange={(e) => handleListSelection(e.target.value)}
              required={!allowIndividualSelection}
            >
              <option value="">
                {allowIndividualSelection ? '-- Select a predefined list --' : '-- Choose a reading list --'}
              </option>
              {readingPointLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.pointIds.length} points)
                </option>
              ))}
            </select>
            {!allowIndividualSelection && (
              <small className="field-help">
                You must select a complete reading list. Individual point selection is not available.
              </small>
            )}
          </div>
        )}

        {/* Room Selector - Only show when a list is selected and all required props are available */}
        {selectedList && allReadingPoints && allReadingPointLists && onRoomSelect && (
          <div className="room-selector-container">
            <RoomSelector
              readingPoints={allReadingPoints}
              readingPointLists={allReadingPointLists}
              selectedRoom={selectedRoom || null}
              onRoomSelect={onRoomSelect}
              completedReadings={allCompletedReadings}
            />
          </div>
        )}

        {/* Individual Point Selection - Only show if allowed */}
        {allowIndividualSelection && (
          <div className="form-group">
            <label>Select Reading Points</label>
            <div className="points-selection">
              {activePoints.map(point => (
                <div key={point.id} className="point-checkbox">
                  <input
                    type="checkbox"
                    id={`bulk-point-${point.id}`}
                    checked={selectedPoints.includes(point.id)}
                    onChange={() => handlePointToggle(point.id)}
                  />
                  <label htmlFor={`bulk-point-${point.id}`}>
                    <strong>{point.name}</strong><br />
                    <small>{point.buildingName} - {point.floor} - {point.room}</small><br />
                    <small>{point.readingType.replace('_', ' ')} ({point.unit})</small>
                    {point.component && <><br /><small className="component-tag">📊 {point.component}</small></>}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reading Value Inputs */}
        {selectedPoints.length > 0 && (
          <div className="reading-entries">
            <h3>Enter Reading Values</h3>
            {Object.entries(groupPointsByReadingType()).map(([readingType, pointIds]) => {
              const completedInGroup = pointIds.filter(pointId => isPointCompleted(pointId)).length;
              const totalInGroup = pointIds.length;
              const groupProgress = totalInGroup > 0 ? (completedInGroup / totalInGroup) * 100 : 0;
              
              return (
                <div key={readingType} className="reading-type-group">
                  <div className="group-header">
                    <div className="group-title">
                      <h4>{getReadingTypeDisplayName(readingType)}</h4>
                      <span className="group-count">({pointIds.length} point{pointIds.length !== 1 ? 's' : ''})</span>
                    </div>
                    <div className="group-progress">
                      <div className="progress-text">
                        {completedInGroup}/{totalInGroup} completed
                      </div>
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small"
                          style={{ 
                            width: `${groupProgress}%`,
                            backgroundColor: groupProgress === 100 ? '#4caf50' : groupProgress > 0 ? '#ff9800' : '#f44336'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                
                <div className="entries-grid">
                  {pointIds.map(pointId => {
                    const point = getPointById(pointId);
                    const entry = getEntryByPointId(pointId);
                    
                    if (!point || !entry) return null;

                    return (
                      <div key={pointId} className={`entry-card ${isPointCompleted(pointId) ? 'completed' : ''}`}>
                        <div className="entry-header">
                          <div className="entry-title-section">
                            <h5>{point.name}</h5>
                            <span className="entry-location">
                              {point.buildingName} - {point.floor} - {point.room}
                            </span>
                          </div>
                          <div className="completion-section">
                            <label className={`completion-checkbox ${!canMarkComplete(pointId) && !isPointCompleted(pointId) ? 'disabled' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isPointCompleted(pointId)}
                                disabled={!canMarkComplete(pointId) && !isPointCompleted(pointId)}
                                onChange={(e) => handlePointCompletion(pointId, e.target.checked)}
                              />
                              <span className="checkbox-label">
                                {isPointCompleted(pointId) ? '✓ Complete' : 
                                 canMarkComplete(pointId) ? 'Mark Complete' : 'Enter value first'}
                              </span>
                            </label>
                            {isPointCompleted(pointId) && (() => {
                              const completion = getCompletionDetails(pointId);
                              return completion ? (
                                <div className="completion-timestamp">
                                  <small>Completed: {formatCompletionTime(completion.completedAt)}</small>
                                  {completion.completedBy && (
                                    <small>By: {completion.completedBy}</small>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                        
                        <div className="entry-inputs">
                          <div className="form-group">
                            <label htmlFor={`value-${pointId}`}>
                              Value ({point.unit}) *
                            </label>
                            <input
                              type="number"
                              id={`value-${pointId}`}
                              value={entry.value}
                              onChange={(e) => updateReadingEntry(pointId, 'value', e.target.value)}
                              step="0.1"
                              required
                              disabled={isPointCompleted(pointId)}
                              className={isPointCompleted(pointId) ? 'disabled' : ''}
                            />
                            {isPointCompleted(pointId) && (
                              <small className="completion-info">
                                🔒 Value locked - completed {(() => {
                                  const completion = getCompletionDetails(pointId);
                                  return completion ? formatCompletionTime(completion.completedAt) : 'recently';
                                })()}
                              </small>
                            )}
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`notes-${pointId}`}>Notes</label>
                            <input
                              type="text"
                              id={`notes-${pointId}`}
                              value={entry.notes}
                              onChange={(e) => updateReadingEntry(pointId, 'notes', e.target.value)}
                              placeholder="Optional notes"
                              disabled={isPointCompleted(pointId)}
                              className={isPointCompleted(pointId) ? 'disabled' : ''}
                            />
                            {isPointCompleted(pointId) && (
                              <small className="completion-info">
                                🔒 Notes locked
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Submission Notes for Review */}
        {selectedPoints.length > 0 && requiresReview && (
          <div className="form-group">
            <label htmlFor="submissionNotes">Submission Notes</label>
            <textarea
              id="submissionNotes"
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Optional notes about this submission for the reviewer..."
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        {selectedPoints.length > 0 && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {requiresReview 
                ? `Submit ${selectedPoints.length} Reading${selectedPoints.length !== 1 ? 's' : ''} for Review`
                : `Add ${selectedPoints.length} Reading${selectedPoints.length !== 1 ? 's' : ''}`
              }
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedList('');
                setSelectedPoints([]);
                setReadingEntries([]);
              }}
            >
              Clear Selection
            </button>
          </div>
        )}

        {selectedPoints.length === 0 && (
          <div className="no-selection">
            <p>
              {allowIndividualSelection 
                ? 'Select reading points above to begin entering values.'
                : 'Please select a reading list above to begin entering values.'
              }
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default BulkReadingForm;