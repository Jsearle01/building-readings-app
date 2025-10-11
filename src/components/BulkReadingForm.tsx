import React, { useState, useEffect } from 'react';
import { ReadingPoint, ReadingPointList, BuildingReading, BulkReadingEntry, ReviewSubmission, PointCompletion } from '../types';
import { format } from 'date-fns';
import RoomSelector from './RoomSelector';

interface BulkReadingFormProps {
  onSubmit: (readings: BuildingReading[]) => void;
  onSubmitForReview?: (submission: Omit<ReviewSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  readings?: BuildingReading[]; // Add readings for trend analysis
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
  readings = [], // Add readings parameter
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
  
  // Trend analysis state
  const [trendAnalysis, setTrendAnalysis] = useState<{
    reading: ReadingPoint;
    similarReadings: BuildingReading[];
  } | null>(null);

  const activePoints = readingPoints.filter(p => p.isActive);

  // Helper function to check if completion is allowed (due today or overdue)
  const isCompletionDateValid = (list: ReadingPointList): { isValid: boolean; message?: string } => {
    if (!list.expectedCompletionDate) {
      return { isValid: true }; // No restriction if no date is set
    }
    
    const today = format(new Date(), 'yyyy-MM-dd'); // Today in YYYY-MM-DD format
    const expectedDate = list.expectedCompletionDate;
    
    // Allow completion if the list is due today or overdue
    if (expectedDate <= today) {
      return { isValid: true };
    } else {
      const expectedDateFormatted = new Date(expectedDate + 'T00:00:00').toLocaleDateString();
      return { 
        isValid: false, 
        message: `This list can only be completed on ${expectedDateFormatted}. Please wait until the scheduled date.`
      };
    }
  };

  // Debug: Log every time readingPointLists changes
  useEffect(() => {
    // Removed debug logging - functionality working correctly
  }, [readingPointLists]);

  // Get reading lists that are incomplete and due today or overdue (by expected completion date)
  const getIncompleteOverdueLists = (): ReadingPointList[] => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return readingPointLists.filter(list => {
      // Check if list has an expected completion date
      if (!list.expectedCompletionDate) {
        return false; // Skip lists without due dates
      }
      
      // Check if the due date is today or earlier (includes both today and overdue)
      const dueDate = list.expectedCompletionDate;
      const isDueOrOverdue = dueDate <= today;
      if (!isDueOrOverdue) {
        return false; // Skip future lists
      }
      
      // Check if the list has incomplete points
      const hasIncompletePoints = list.pointIds.some(pointId => !completedPoints.has(pointId));
      return hasIncompletePoints;
    });
  };

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
    const point = getPointById(pointId);
    
    if (!entry || !point) return false;
    
    // For SAT/UNSAT validation, check if value is SAT or UNSAT
    if (point.validationType === 'sat_unsat') {
      return entry.value === 'SAT' || entry.value === 'UNSAT';
    }
    
    // For range validation, check if value is a valid number
    return entry.value !== 0 && !isNaN(Number(entry.value)) && String(entry.value) !== '';
  };

  const isValueInRange = (pointId: string): boolean => {
    const entry = readingEntries.find(e => e.pointId === pointId);
    const point = getPointById(pointId);
    
    if (!entry || !point) {
      return false;
    }
    
    // For SAT/UNSAT validation, any valid SAT/UNSAT value is "in range"
    if (point.validationType === 'sat_unsat') {
      return entry.value === 'SAT' || entry.value === 'UNSAT';
    }
    
    // For range validation, check numeric range
    if (isNaN(Number(entry.value))) {
      return false;
    }
    
    const value = Number(entry.value);
    
    // Check minimum value
    if (point.minValue !== undefined && value < point.minValue) {
      return false;
    }
    
    // Check maximum value
    if (point.maxValue !== undefined && value > point.maxValue) {
      return false;
    }
    
    return true;
  };

  const isValueOutOfRange = (pointId: string): boolean => {
    const entry = readingEntries.find(e => e.pointId === pointId);
    const point = getPointById(pointId);
    
    if (!entry || !point || point.validationType !== 'range') {
      return false;
    }
    
    if (isNaN(Number(entry.value))) {
      return false;
    }
    
    const value = Number(entry.value);
    
    // Check if value is outside the acceptable range
    if (point.minValue !== undefined && value < point.minValue) {
      return true;
    }
    
    if (point.maxValue !== undefined && value > point.maxValue) {
      return true;
    }
    
    return false;
  };

  const canMarkComplete = (pointId: string) => {
    if (!hasValidValue(pointId)) {
      return false;
    }
    
    const entry = readingEntries.find(e => e.pointId === pointId);
    const point = getPointById(pointId);
    
    if (!entry || !point) {
      return false;
    }
    
    // For UNSAT values, require a comment
    if (point.validationType === 'sat_unsat' && entry.value === 'UNSAT') {
      return entry.notes && entry.notes.trim().length > 0;
    }
    
    // For out-of-range values, require a comment
    if (isValueOutOfRange(pointId)) {
      return entry.notes && entry.notes.trim().length > 0;
    }
    
    // For in-range values, no comment required
    return isValueInRange(pointId);
  };

  // Handle trend analysis for a specific reading point
  const handleTrendAnalysis = (selectedPoint: ReadingPoint) => {
    // Find similar readings based on building, room, and reading type
    const similarReadings = readings.filter(reading => 
      reading.buildingName === selectedPoint.buildingName &&
      reading.room === selectedPoint.room &&
      reading.readingType === selectedPoint.readingType &&
      reading.pointId !== selectedPoint.id
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    setTrendAnalysis({
      reading: selectedPoint,
      similarReadings: similarReadings
    });
  };

  // Close trend analysis
  const closeTrendAnalysis = () => {
    setTrendAnalysis(null);
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
    const invalidEntries = readingEntries.filter(entry => {
      const point = readingPoints.find(p => p.id === entry.pointId);
      if (!point) return true;
      
      if (point.validationType === 'sat_unsat') {
        return entry.value !== 'SAT' && entry.value !== 'UNSAT';
      } else {
        return entry.value === 0 || isNaN(Number(entry.value));
      }
    });

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
        value: point.validationType === 'sat_unsat' ? entry.value : Number(entry.value),
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

        {/* List Selection - Only Incomplete Overdue Lists */}
        {(() => {
          const incompleteOverdueLists = getIncompleteOverdueLists();
          if (incompleteOverdueLists.length > 0) {
            return (
              <div className="form-group">
                <label htmlFor="listSelect">
                  {allowIndividualSelection ? 'Quick Select from Due & Overdue Lists' : 'Select Reading List *'}
                </label>
                <select
                  id="listSelect"
                  value={selectedList}
                  onChange={(e) => handleListSelection(e.target.value)}
                  required={!allowIndividualSelection}
                  className="form-control"
                >
                  <option value="">-- Select a List --</option>
                  {incompleteOverdueLists.map(list => {
                    const validationResult = isCompletionDateValid(list);
                    const totalPoints = list.pointIds.length;
                    const completedCount = list.pointIds.filter(pointId => completedPoints.has(pointId)).length;
                    const progressPercentage = totalPoints > 0 ? Math.round((completedCount / totalPoints) * 100) : 0;
                    
                    const dueDate = list.expectedCompletionDate;
                    const today = format(new Date(), 'yyyy-MM-dd');
                    let dueDateDisplay = '';
                    let statusText = '';
                    
                    if (dueDate) {
                      // Format the due date nicely - avoid timezone issues
                      const [year, month, day] = dueDate.split('-').map(Number);
                      const localDate = new Date(year, month - 1, day); // month is 0-indexed
                      const dueDateFormatted = format(localDate, 'MMM d, yyyy');
                      dueDateDisplay = ` (Due: ${dueDateFormatted})`;
                      
                      // Add status indicator
                      if (dueDate < today) {
                        statusText = ' - OVERDUE';
                      } else if (dueDate === today) {
                        statusText = ' - DUE TODAY';
                      }
                    }
                    
                    return (
                      <option 
                        key={list.id} 
                        value={list.id}
                        disabled={!validationResult.isValid}
                      >
                        {list.name}{dueDateDisplay}{statusText} - {progressPercentage}% complete
                      </option>
                    );
                  })}
                </select>
                {incompleteOverdueLists.length > 0 && (
                  <small className="form-text text-muted">
                    {(() => {
                      const today = format(new Date(), 'yyyy-MM-dd');
                      const todayLists = incompleteOverdueLists.filter(list => list.expectedCompletionDate === today);
                      const overdueLists = incompleteOverdueLists.filter(list => list.expectedCompletionDate && list.expectedCompletionDate < today);
                      
                      let message = `Showing ${incompleteOverdueLists.length} list${incompleteOverdueLists.length !== 1 ? 's' : ''}`;
                      
                      if (todayLists.length > 0 && overdueLists.length > 0) {
                        message += ` (${todayLists.length} due today, ${overdueLists.length} overdue)`;
                      } else if (todayLists.length > 0) {
                        message += ` due today`;
                      } else if (overdueLists.length > 0) {
                        message += ` that are overdue`;
                      }
                      
                      return message + '. (Debugging: showing all due lists)';
                    })()}
                  </small>
                )}
              </div>
            );
          } else {
            return (
              <div className="form-group">
                <div className="no-overdue-lists">
                  <h4>📋 No Reading Lists Due</h4>
                  <p>All reading lists that are due today or overdue have been completed.</p>
                  <p>Check back later when new lists become due, or contact an administrator if you need to complete future lists.</p>
                </div>
              </div>
            );
          }
        })()}

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
                    {point.validationType === 'range' && (point.minValue !== undefined || point.maxValue !== undefined) && (
                      <><br /><small className="validation-info">
                        Range: {point.minValue !== undefined ? point.minValue : '−∞'} - {point.maxValue !== undefined ? point.maxValue : '+∞'} {point.unit}
                      </small></>
                    )}
                    {point.validationType === 'sat_unsat' && (
                      <><br /><small className="validation-info sat-unsat">SAT/UNSAT</small></>
                    )}
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
                            {point.validationType === 'range' && (point.minValue !== undefined || point.maxValue !== undefined) && (
                              <span className="entry-range">
                                Range: {point.minValue !== undefined ? point.minValue : '−∞'} - {point.maxValue !== undefined ? point.maxValue : '+∞'} {point.unit}
                              </span>
                            )}
                            {point.validationType === 'sat_unsat' && (
                              <span className="entry-validation">
                                Validation: SAT/UNSAT
                              </span>
                            )}
                          </div>
                          <div className="entry-actions">
                            <button
                              type="button"
                              onClick={() => handleTrendAnalysis(point)}
                              className="btn-trend"
                              title="View trend analysis for this point"
                            >
                              📈 Trend
                            </button>
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
                                 canMarkComplete(pointId) ? 'Mark Complete' : 
                                 !hasValidValue(pointId) ? 'Enter value first' :
                                 (() => {
                                   const entry = readingEntries.find(e => e.pointId === pointId);
                                   const point = getPointById(pointId);
                                   
                                   // Check for UNSAT requiring comment
                                   if (entry && point && point.validationType === 'sat_unsat' && entry.value === 'UNSAT' && (!entry.notes || entry.notes.trim().length === 0)) {
                                     return 'UNSAT requires comment';
                                   }
                                   
                                   // Check for out-of-range value requiring comment
                                   if (entry && isValueOutOfRange(pointId) && (!entry.notes || entry.notes.trim().length === 0)) {
                                     return 'Out of range - comment required';
                                   }
                                   
                                   // Check for general out of range
                                   if (!isValueInRange(pointId)) {
                                     return 'Value out of range';
                                   }
                                   
                                   return 'Enter value first';
                                 })()}
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
                            {point.validationType === 'sat_unsat' ? (
                              <>
                                <label htmlFor={`value-${pointId}`}>
                                  Validation *
                                </label>
                                <select
                                  id={`value-${pointId}`}
                                  value={entry.value}
                                  onChange={(e) => updateReadingEntry(pointId, 'value', e.target.value)}
                                  required
                                  disabled={isPointCompleted(pointId)}
                                  className={`${isPointCompleted(pointId) ? 'disabled' : ''}`}
                                >
                                  <option value="">Select...</option>
                                  <option value="SAT">SAT (Satisfactory)</option>
                                  <option value="UNSAT">UNSAT (Unsatisfactory)</option>
                                </select>
                              </>
                            ) : (
                              <>
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
                                  className={`${isPointCompleted(pointId) ? 'disabled' : ''} ${hasValidValue(pointId) && !isValueInRange(pointId) ? 'out-of-range' : ''}`}
                                />
                              </>
                            )}
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
                            <label htmlFor={`notes-${pointId}`}>
                              Notes
                              {(() => {
                                const entry = readingEntries.find(e => e.pointId === pointId);
                                const point = getPointById(pointId);
                                // Required for UNSAT
                                if (entry && point && point.validationType === 'sat_unsat' && entry.value === 'UNSAT') {
                                  return <span className="required-asterisk"> *</span>;
                                }
                                // Required for out-of-range values
                                if (isValueOutOfRange(pointId)) {
                                  return <span className="required-asterisk"> *</span>;
                                }
                                return null;
                              })()}
                            </label>
                            <textarea
                              id={`notes-${pointId}`}
                              value={entry.notes}
                              onChange={(e) => updateReadingEntry(pointId, 'notes', e.target.value)}
                              placeholder={(() => {
                                const entry = readingEntries.find(e => e.pointId === pointId);
                                const point = getPointById(pointId);
                                if (entry && point && point.validationType === 'sat_unsat' && entry.value === 'UNSAT') {
                                  return "Required for UNSAT - explain issue";
                                }
                                if (isValueOutOfRange(pointId)) {
                                  return "Required for out-of-range value - explain reading";
                                }
                                return "Optional notes";
                              })()}
                              disabled={isPointCompleted(pointId)}
                              rows={3}
                              className={(() => {
                                const entry = readingEntries.find(e => e.pointId === pointId);
                                const point = getPointById(pointId);
                                if (isPointCompleted(pointId)) return 'disabled';
                                if (entry && point && point.validationType === 'sat_unsat' && entry.value === 'UNSAT') {
                                  return 'required';
                                }
                                if (isValueOutOfRange(pointId)) {
                                  return 'required';
                                }
                                return '';
                              })()}
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

      {/* Trend Analysis Modal */}
      {trendAnalysis && (
        <div className="trend-modal-overlay" onClick={closeTrendAnalysis}>
          <div className="trend-modal" onClick={(e) => e.stopPropagation()}>
            <div className="trend-modal-header">
              <h3>📈 Trend Analysis - {trendAnalysis.reading.name}</h3>
              <button className="close-button" onClick={closeTrendAnalysis}>×</button>
            </div>
            
            <div className="trend-modal-content">
              <div className="trend-info">
                <h4>Reading Point Details:</h4>
                <div className="reading-details">
                  <p><strong>Location:</strong> {trendAnalysis.reading.buildingName} - {trendAnalysis.reading.floor} - {trendAnalysis.reading.room}</p>
                  <p><strong>Type:</strong> {trendAnalysis.reading.readingType.replace('_', ' ')}</p>
                  <p><strong>Unit:</strong> {trendAnalysis.reading.unit}</p>
                  {trendAnalysis.reading.component && <p><strong>Component:</strong> {trendAnalysis.reading.component}</p>}
                  {trendAnalysis.reading.description && <p><strong>Description:</strong> {trendAnalysis.reading.description}</p>}
                </div>
              </div>

              <div className="trend-chart-section">
                <h4>Historical Data ({trendAnalysis.similarReadings.length} readings):</h4>
                {trendAnalysis.similarReadings.length > 0 ? (
                  (() => {
                    // Check if this is a SAT/UNSAT reading point
                    const readingPoint = readingPoints.find(p => p.id === trendAnalysis.reading.id);
                    const isSatUnsat = readingPoint?.validationType === 'sat_unsat';
                    
                    if (isSatUnsat) {
                      // For SAT/UNSAT readings, show simple list instead of chart
                      const satCount = trendAnalysis.similarReadings.filter(r => r.value === 'SAT').length;
                      const unsatCount = trendAnalysis.similarReadings.filter(r => r.value === 'UNSAT').length;
                      
                      return (
                        <div className="sat-unsat-summary">
                          <div className="validation-stats">
                            <div className="stat-item sat">
                              <span className="stat-label">SAT (Satisfactory):</span>
                              <span className="stat-value">{satCount}</span>
                            </div>
                            <div className="stat-item unsat">
                              <span className="stat-label">UNSAT (Unsatisfactory):</span>
                              <span className="stat-value">{unsatCount}</span>
                            </div>
                          </div>
                          <div className="recent-readings">
                            <h5>Recent Readings:</h5>
                            {trendAnalysis.similarReadings.slice(0, 10).map((reading, index) => (
                              <div key={index} className={`reading-item ${reading.value}`}>
                                <span className="reading-value">{reading.value}</span>
                                <span className="reading-date">{format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    // For numeric readings, show the original chart
                    const numericReadings = trendAnalysis.similarReadings.filter(r => typeof r.value === 'number');
                    if (numericReadings.length === 0) {
                      return <p>No numeric data available for trending.</p>;
                    }
                    
                    return (
                      <div className="simple-trend-chart">
                        {numericReadings.map((reading) => {
                          const maxValue = Math.max(...numericReadings.map(r => r.value as number));
                          const minValue = Math.min(...numericReadings.map(r => r.value as number));
                          const range = maxValue - minValue || 1;
                          const height = (((reading.value as number) - minValue) / range) * 100;
                          
                          return (
                            <div key={reading.id} className="trend-bar-container">
                              <div 
                                className="trend-bar"
                                style={{ 
                                  height: `${Math.max(height, 5)}%`,
                                  backgroundColor: '#007bff'
                                }}
                                title={`${(reading.value as number).toFixed(2)} ${reading.unit} - ${format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm')}`}
                              />
                              <div className="trend-date">
                                {format(new Date(reading.timestamp), 'MMM dd')}
                              </div>
                              <div className="trend-value">
                                {(reading.value as number).toFixed(1)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <p className="no-trend-data">No historical data available for this reading point. Collect more readings to see trend analysis.</p>
                )}
              </div>

              {trendAnalysis.similarReadings.length > 1 && (
                <div className="trend-statistics">
                  <h4>Statistics:</h4>
                  {(() => {
                    const readingPoint = readingPoints.find(p => p.id === trendAnalysis.reading.id);
                    const isSatUnsat = readingPoint?.validationType === 'sat_unsat';
                    
                    if (isSatUnsat) {
                      const satCount = trendAnalysis.similarReadings.filter(r => r.value === 'SAT').length;
                      const unsatCount = trendAnalysis.similarReadings.filter(r => r.value === 'UNSAT').length;
                      const total = trendAnalysis.similarReadings.length;
                      
                      return (
                        <div className="stats-grid">
                          <div className="stat-item">
                            <strong>Total Readings:</strong> {total}
                          </div>
                          <div className="stat-item">
                            <strong>SAT Rate:</strong> {((satCount / total) * 100).toFixed(1)}% ({satCount}/{total})
                          </div>
                          <div className="stat-item">
                            <strong>UNSAT Rate:</strong> {((unsatCount / total) * 100).toFixed(1)}% ({unsatCount}/{total})
                          </div>
                        </div>
                      );
                    }
                    
                    // For numeric readings
                    const numericReadings = trendAnalysis.similarReadings.filter(r => typeof r.value === 'number');
                    if (numericReadings.length === 0) {
                      return <p>No numeric data available for statistics.</p>;
                    }
                    
                    return (
                      <div className="stats-grid">
                        <div className="stat-item">
                          <strong>Average:</strong> {(numericReadings.reduce((sum, r) => sum + (r.value as number), 0) / numericReadings.length).toFixed(2)} {trendAnalysis.reading.unit}
                        </div>
                        <div className="stat-item">
                          <strong>Min:</strong> {Math.min(...numericReadings.map(r => r.value as number)).toFixed(2)} {trendAnalysis.reading.unit}
                        </div>
                        <div className="stat-item">
                          <strong>Max:</strong> {Math.max(...numericReadings.map(r => r.value as number)).toFixed(2)} {trendAnalysis.reading.unit}
                        </div>
                        <div className="stat-item">
                          <strong>Range:</strong> {(Math.max(...numericReadings.map(r => r.value as number)) - Math.min(...numericReadings.map(r => r.value as number))).toFixed(2)} {trendAnalysis.reading.unit}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkReadingForm;