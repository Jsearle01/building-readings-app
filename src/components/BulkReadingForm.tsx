import React, { useState } from 'react';
import { ReadingPoint, ReadingPointList, BuildingReading, BulkReadingEntry } from '../types';

interface BulkReadingFormProps {
  onSubmit: (readings: BuildingReading[]) => void;
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
}

const BulkReadingForm: React.FC<BulkReadingFormProps> = ({
  onSubmit,
  readingPoints,
  readingPointLists
}) => {
  const [selectedList, setSelectedList] = useState<string>('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [readingEntries, setReadingEntries] = useState<BulkReadingEntry[]>([]);
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16) // Format for datetime-local input
  );

  const activePoints = readingPoints.filter(p => p.isActive);

  const handleListSelection = (listId: string) => {
    setSelectedList(listId);
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
    setReadingEntries(prev => prev.map(entry => 
      entry.pointId === pointId 
        ? { ...entry, [field]: value }
        : entry
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (readingEntries.length === 0) {
      alert('Please select reading points and enter values');
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

    onSubmit(readings);

    // Reset form
    setSelectedList('');
    setSelectedPoints([]);
    setReadingEntries([]);
    setTimestamp(new Date().toISOString().slice(0, 16));
    
    alert(`Successfully added ${readings.length} readings!`);
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
            <label htmlFor="listSelect">Quick Select from List (Optional)</label>
            <select
              id="listSelect"
              value={selectedList}
              onChange={(e) => handleListSelection(e.target.value)}
            >
              <option value="">-- Select a predefined list --</option>
              {readingPointLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.pointIds.length} points)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Individual Point Selection */}
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

        {/* Reading Value Inputs */}
        {selectedPoints.length > 0 && (
          <div className="reading-entries">
            <h3>Enter Reading Values</h3>
            {Object.entries(groupPointsByReadingType()).map(([readingType, pointIds]) => (
              <div key={readingType} className="reading-type-group">
                <div className="group-header">
                  <h4>{getReadingTypeDisplayName(readingType)}</h4>
                  <span className="group-count">({pointIds.length} point{pointIds.length !== 1 ? 's' : ''})</span>
                </div>
                
                <div className="entries-grid">
                  {pointIds.map(pointId => {
                    const point = getPointById(pointId);
                    const entry = getEntryByPointId(pointId);
                    
                    if (!point || !entry) return null;

                    return (
                      <div key={pointId} className="entry-card">
                        <div className="entry-header">
                          <h5>{point.name}</h5>
                          <span className="entry-location">
                            {point.buildingName} - {point.floor} - {point.room}
                          </span>
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
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`notes-${pointId}`}>Notes</label>
                            <input
                              type="text"
                              id={`notes-${pointId}`}
                              value={entry.notes}
                              onChange={(e) => updateReadingEntry(pointId, 'notes', e.target.value)}
                              placeholder="Optional notes"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        {selectedPoints.length > 0 && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Add {selectedPoints.length} Reading{selectedPoints.length !== 1 ? 's' : ''}
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
            <p>Select reading points above to begin entering values.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default BulkReadingForm;