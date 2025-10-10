import React, { useState } from 'react';
import { BuildingReading, ReadingPoint, ReadingPointList } from '../types';
import { format } from 'date-fns';

interface SimpleBulkEntryProps {
  onSubmit: (readings: BuildingReading[]) => void;
  readingPointLists: ReadingPointList[];
  readingPoints: ReadingPoint[];
}

interface GroupedPoint {
  location: string;
  component?: string;
  readingType: string;
  points: ReadingPoint[];
}

const SimpleBulkEntry: React.FC<SimpleBulkEntryProps> = ({
  onSubmit,
  readingPointLists,
  readingPoints
}) => {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>('');
  const [userInfo, setUserInfo] = useState<string>('');

  // Get all available reading point lists (no isActive filter since ReadingPointList doesn't have this property)
  const activeLists = readingPointLists;

  // Get points for the selected list
  const selectedList = activeLists.find(list => list.id === selectedListId);
  const selectedPoints = selectedList 
    ? readingPoints.filter(point => 
        selectedList.pointIds.includes(point.id) && point.isActive
      )
    : [];

  // Group points by location, then by component, then by reading type
  const groupPointsByLocationAndComponent = (points: ReadingPoint[]): GroupedPoint[] => {
    const groups: Record<string, Record<string, Record<string, ReadingPoint[]>>> = {};
    
    points.forEach(point => {
      const location = `${point.buildingName} - Floor ${point.floor} - ${point.room}`;
      const component = point.component || 'General';
      const readingType = point.readingType;
      
      if (!groups[location]) {
        groups[location] = {};
      }
      if (!groups[location][component]) {
        groups[location][component] = {};
      }
      if (!groups[location][component][readingType]) {
        groups[location][component][readingType] = [];
      }
      groups[location][component][readingType].push(point);
    });

    const result: GroupedPoint[] = [];
    Object.entries(groups).forEach(([location, componentGroups]) => {
      Object.entries(componentGroups).forEach(([component, typeGroups]) => {
        Object.entries(typeGroups).forEach(([readingType, points]) => {
          result.push({
            location,
            component: component === 'General' ? undefined : component,
            readingType,
            points
          });
        });
      });
    });

    return result.sort((a, b) => {
      // Sort by location first, then by component, then by reading type
      if (a.location !== b.location) return a.location.localeCompare(b.location);
      const compA = a.component || 'General';
      const compB = b.component || 'General';
      if (compA !== compB) return compA.localeCompare(compB);
      return a.readingType.localeCompare(b.readingType);
    });
  };

  const groupedPoints = groupPointsByLocationAndComponent(selectedPoints);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedListId) {
      alert('Please select a reading list');
      return;
    }

    if (selectedPoints.length === 0) {
      alert('Selected list contains no active reading points');
      return;
    }

    // Check if all required fields are filled
    const missingEntries = selectedPoints.filter(point => !entries[point.id] || entries[point.id].trim() === '');
    if (missingEntries.length > 0) {
      const missingNames = missingEntries.map(p => p.name).join(', ');
      alert(`Please enter values for: ${missingNames}`);
      return;
    }

    // Create readings
    const readings: BuildingReading[] = selectedPoints.map(point => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      buildingName: point.buildingName,
      floor: point.floor,
      room: point.room,
      readingType: point.readingType,
      value: parseFloat(entries[point.id]),
      unit: point.unit,
      timestamp: new Date(timestamp).toISOString(),
      notes: notes.trim() || undefined,
      userInfo: userInfo.trim() || undefined,
      readingPointId: point.id,
      readingPointName: point.name,
      component: point.component
    }));

    onSubmit(readings);
    
    // Reset form
    setEntries({});
    setNotes('');
    setUserInfo('');
    setSelectedListId('');
    setTimestamp(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    
    alert(`Successfully added ${readings.length} readings!`);
  };

  const handleEntryChange = (pointId: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [pointId]: value
    }));
  };

  if (activeLists.length === 0) {
    return (
      <div className="no-data">
        <h3>No Reading Lists Available</h3>
        <p>No active reading lists are configured. Please contact your administrator to set up reading lists.</p>
      </div>
    );
  }

  return (
    <div className="simple-bulk-entry">
      <form onSubmit={handleSubmit} className="bulk-entry-form">
        {/* List Selection */}
        <div className="form-section">
          <h3>📋 Select Reading List</h3>
          <div className="form-group">
            <label htmlFor="listSelect">Reading List:</label>
            <select
              id="listSelect"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Choose a reading list...</option>
              {activeLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.pointIds.length} points)
                  {list.description && ` - ${list.description}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timestamp */}
        <div className="form-section">
          <h3>🕐 Reading Time</h3>
          <div className="form-group">
            <label htmlFor="timestamp">Date & Time:</label>
            <input
              type="datetime-local"
              id="timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>

        {/* Reading Entries */}
        {selectedPoints.length > 0 && (
          <div className="form-section">
            <h3>📊 Enter Readings</h3>
            <p className="section-description">
              Enter values for all {selectedPoints.length} reading points in the selected list.
            </p>
            
            {groupedPoints.map((group, groupIndex) => (
              <div key={groupIndex} className="reading-group">
                <div className="location-header">
                  <span className="location-label">📍 {group.location}</span>
                </div>
                {group.component && (
                  <div className="component-header">
                    <span className="component-tag">{group.component}</span>
                  </div>
                )}
                <h4 className="simple-group-header">
                  <span className="reading-type">{group.readingType.replace('_', ' ').toUpperCase()}</span>
                </h4>
                
                <div className="reading-inputs">
                  {group.points.map(point => (
                    <div key={point.id} className="reading-input-row">
                      <div className="point-info">
                        <strong>{point.name}</strong>
                        {point.description && (
                          <div className="point-details">
                            {point.description}
                          </div>
                        )}
                      </div>
                      <div className="input-group">
                        <input
                          type="number"
                          step="any"
                          value={entries[point.id] || ''}
                          onChange={(e) => handleEntryChange(point.id, e.target.value)}
                          className="form-control reading-value"
                          placeholder="0.0"
                          required
                        />
                        <span className="input-unit">{point.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Information */}
        {selectedPoints.length > 0 && (
          <div className="form-section">
            <h3>👤 User Information</h3>
            <div className="form-group">
              <label htmlFor="userInfo">Enter your information (name, role, department, etc.):</label>
              <textarea
                id="userInfo"
                value={userInfo}
                onChange={(e) => setUserInfo(e.target.value)}
                className="form-control"
                rows={3}
                placeholder="Please enter your name, role, department, or any other relevant information about who is collecting this data..."
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-section">
          <h3>📝 Notes (Optional)</h3>
          <div className="form-group">
            <label htmlFor="notes">Additional Notes:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-control"
              rows={3}
              placeholder="Any additional notes about these readings..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!selectedListId || selectedPoints.length === 0}
          >
            💾 Submit All Readings ({selectedPoints.length})
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleBulkEntry;