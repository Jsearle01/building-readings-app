import React from 'react';
import { ReadingPoint, ReadingPointList } from '../types';

interface RoomInfo {
  room: string;
  building: string;
  floor: string;
  totalPoints: number;
  completedPoints: number;
  points: ReadingPoint[];
}

interface RoomSelectorProps {
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  selectedRoom: string | null;
  onRoomSelect: (room: string | null) => void;
  completedReadings?: Set<string>; // Set of point IDs that have been completed
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  readingPoints,
  readingPointLists,
  selectedRoom,
  onRoomSelect,
  completedReadings = new Set()
}) => {
  // Get all rooms from reading points that are part of active lists
  const getRoomsInfo = (): RoomInfo[] => {
    const roomMap = new Map<string, RoomInfo>();
    
    // Get all point IDs that are in active lists
    const activePointIds = new Set(
      readingPointLists.flatMap(list => list.pointIds)
    );
    
    // Filter points to only include those in active lists and that are active
    const relevantPoints = readingPoints.filter(point => 
      point.isActive && activePointIds.has(point.id)
    );
    
    relevantPoints.forEach(point => {
      const roomKey = `${point.buildingName}-${point.floor}-${point.room}`;
      
      if (!roomMap.has(roomKey)) {
        roomMap.set(roomKey, {
          room: point.room,
          building: point.buildingName,
          floor: point.floor,
          totalPoints: 0,
          completedPoints: 0,
          points: []
        });
      }
      
      const roomInfo = roomMap.get(roomKey)!;
      roomInfo.totalPoints++;
      roomInfo.points.push(point);
      
      if (completedReadings.has(point.id)) {
        roomInfo.completedPoints++;
      }
    });
    
    // Sort rooms by building, then floor, then room name
    return Array.from(roomMap.values()).sort((a, b) => {
      if (a.building !== b.building) return a.building.localeCompare(b.building);
      if (a.floor !== b.floor) return a.floor.localeCompare(b.floor);
      return a.room.localeCompare(b.room);
    });
  };
  
  const roomsInfo = getRoomsInfo();
  
  const getCompletionStatus = (roomInfo: RoomInfo) => {
    const percentage = roomInfo.totalPoints > 0 ? (roomInfo.completedPoints / roomInfo.totalPoints) * 100 : 0;
    if (percentage === 100) return 'complete';
    if (percentage > 0) return 'partial';
    return 'pending';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return '#4caf50'; // Green
      case 'partial': return '#ff9800'; // Orange
      case 'pending': return '#f44336'; // Red
      default: return '#9e9e9e'; // Gray
    }
  };
  
  const getStatusText = (roomInfo: RoomInfo) => {
    const status = getCompletionStatus(roomInfo);
    if (status === 'complete') return 'Complete ✓';
    if (status === 'partial') return `${roomInfo.completedPoints}/${roomInfo.totalPoints} done`;
    return `${roomInfo.totalPoints} needed`;
  };

  if (roomsInfo.length === 0) {
    return (
      <div className="room-selector">
        <div className="no-rooms">
          <h3>No Rooms Available</h3>
          <p>No reading points are configured in active lists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="room-selector">
      <div className="room-selector-header">
        <h3>🏠 Select Room for Readings</h3>
        <p>Choose a room to view and collect readings. Status shows completion progress.</p>
        <button 
          className="clear-selection-btn"
          onClick={() => onRoomSelect(null)}
          disabled={!selectedRoom}
        >
          View All Rooms
        </button>
      </div>
      
      <div className="rooms-grid">
        {roomsInfo.map((roomInfo) => {
          const roomKey = `${roomInfo.building}-${roomInfo.floor}-${roomInfo.room}`;
          const status = getCompletionStatus(roomInfo);
          const isSelected = selectedRoom === roomKey;
          
          return (
            <div
              key={roomKey}
              className={`room-card ${status} ${isSelected ? 'selected' : ''}`}
              onClick={() => onRoomSelect(isSelected ? null : roomKey)}
              style={{
                borderColor: getStatusColor(status),
                backgroundColor: isSelected ? `${getStatusColor(status)}15` : undefined
              }}
            >
              <div className="room-header">
                <h4 className="room-name">{roomInfo.room}</h4>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(status) }}
                >
                  {getStatusText(roomInfo)}
                </div>
              </div>
              
              <div className="room-details">
                <div className="location-info">
                  <span className="building">{roomInfo.building}</span>
                  <span className="floor">Floor {roomInfo.floor}</span>
                </div>
                
                <div className="progress-info">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${roomInfo.totalPoints > 0 ? (roomInfo.completedPoints / roomInfo.totalPoints) * 100 : 0}%`,
                        backgroundColor: getStatusColor(status)
                      }}
                    />
                  </div>
                  <span className="points-count">
                    {roomInfo.totalPoints} reading point{roomInfo.totalPoints !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {isSelected && (
                <div className="selected-indicator">
                  <span>📍 Selected</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="legend">
        <h4>Status Legend:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color complete"></div>
            <span>Complete - All readings collected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color partial"></div>
            <span>Partial - Some readings collected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pending"></div>
            <span>Pending - No readings collected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelector;