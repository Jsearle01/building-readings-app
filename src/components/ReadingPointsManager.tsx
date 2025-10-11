import React, { useState } from 'react';
import { ReadingPoint, ReadingPointList, FieldDefinitions } from '../types';
import { getAllUsers } from '../auth';
import './ReadingPointsManager.css';

interface ReadingPointsManagerProps {
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  fieldDefinitions: FieldDefinitions;
  currentUserId?: string;
  onAddPoint: (point: ReadingPoint) => void;
  onUpdatePoint: (id: string, updates: Partial<ReadingPoint>) => void;
  onDeletePoint: (id: string) => void;
  onAddList: (list: ReadingPointList) => void;
  onUpdateList: (id: string, updates: Partial<ReadingPointList>) => void;
  onDeleteList: (id: string) => void;
}

const ReadingPointsManager: React.FC<ReadingPointsManagerProps> = ({
  readingPoints,
  readingPointLists,
  fieldDefinitions,
  currentUserId,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  onAddList,
  onUpdateList,
  onDeleteList
}) => {
  // Helper function to get user display name
  const getUserDisplayName = (userId?: string): string => {
    if (!userId) return 'Unknown';
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    return user?.fullName || user?.username || userId;
  };

  // Helper function to format dates
  const formatDate = (dateString: string): string => {
    // Handle date strings to avoid timezone issues
    if (dateString.includes('T')) {
      // Full ISO string with time
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } else {
      // Date-only string (YYYY-MM-DD) - treat as local date to avoid timezone shift
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toLocaleDateString();
    }
  };

  const [activeTab, setActiveTab] = useState<'points' | 'lists'>('points');
  const [showAddPointForm, setShowAddPointForm] = useState(false);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [showEditListForm, setShowEditListForm] = useState(false);
  const [showCopyListForm, setShowCopyListForm] = useState(false);
  const [copyingList, setCopyingList] = useState<string | null>(null);

  // Filter states
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  // Get unique values for filters
  const getUniqueBuildings = () => {
    const buildings = [...new Set(readingPoints.map(point => point.buildingName))];
    return buildings.sort();
  };

  const getUniqueFloors = () => {
    const filteredPoints = selectedBuilding === 'all' 
      ? readingPoints 
      : readingPoints.filter(point => point.buildingName === selectedBuilding);
    const floors = [...new Set(filteredPoints.map(point => point.floor))];
    return floors.sort();
  };

  const getUniqueRooms = () => {
    let filteredPoints = readingPoints;
    if (selectedBuilding !== 'all') {
      filteredPoints = filteredPoints.filter(point => point.buildingName === selectedBuilding);
    }
    if (selectedFloor !== 'all') {
      filteredPoints = filteredPoints.filter(point => point.floor === selectedFloor);
    }
    const rooms = [...new Set(filteredPoints.map(point => point.room))];
    return rooms.sort();
  };

  // Filter reading points based on selected filters
  const getFilteredPoints = () => {
    let filtered = readingPoints;
    
    if (selectedBuilding !== 'all') {
      filtered = filtered.filter(point => point.buildingName === selectedBuilding);
    }
    if (selectedFloor !== 'all') {
      filtered = filtered.filter(point => point.floor === selectedFloor);
    }
    if (selectedRoom !== 'all') {
      filtered = filtered.filter(point => point.room === selectedRoom);
    }
    
    return filtered;
  };

  // Handle filter changes with cascading resets
  const handleBuildingChange = (building: string) => {
    setSelectedBuilding(building);
    setSelectedFloor('all');
    setSelectedRoom('all');
  };

  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
    setSelectedRoom('all');
  };

  // New Reading Point Form
  const [newPoint, setNewPoint] = useState({
    name: '',
    buildingName: '',
    floor: '',
    room: '',
    readingType: fieldDefinitions.readingTypes[0] || 'temperature',
    component: '' as string | undefined,
    unit: '',
    description: '',
    validationType: 'range' as 'range' | 'sat_unsat',
    minValue: '' as string,
    maxValue: '' as string
  });

  // New Reading Point List Form
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    expectedCompletionDate: '',
    selectedPoints: [] as string[]
  });

  // Copy Reading Point List Form
  const [copyList, setCopyList] = useState({
    name: '',
    description: '',
    expectedCompletionDate: '',
    originalName: ''
  });

  // Edit Reading Point Form
  const [editPoint, setEditPoint] = useState({
    name: '',
    buildingName: '',
    floor: '',
    room: '',
    readingType: 'temperature',
    component: '',
    unit: '',
    description: '',
    validationType: 'range' as 'range' | 'sat_unsat',
    minValue: '' as string,
    maxValue: '' as string
  });

  // Edit Reading Point List Form
  const [editList, setEditList] = useState({
    name: '',
    description: '',
    selectedPoints: [] as string[]
  });

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPoint.name || !newPoint.buildingName || !newPoint.floor || !newPoint.room) {
      alert('Please fill in all required fields');
      return;
    }

    const point: ReadingPoint = {
      id: Date.now().toString(),
      name: newPoint.name,
      buildingName: newPoint.buildingName,
      floor: newPoint.floor,
      room: newPoint.room,
      readingType: newPoint.readingType,
      component: newPoint.component || undefined,
      unit: newPoint.unit,
      description: newPoint.description,
      validationType: newPoint.validationType,
      minValue: newPoint.validationType === 'range' && newPoint.minValue !== '' ? Number(newPoint.minValue) : undefined,
      maxValue: newPoint.validationType === 'range' && newPoint.maxValue !== '' ? Number(newPoint.maxValue) : undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    onAddPoint(point);
    setNewPoint({
      name: '',
      buildingName: '',
      floor: '',
      room: '',
      readingType: fieldDefinitions.readingTypes[0] || 'temperature',
      component: '',
      unit: '',
      description: '',
      validationType: 'range',
      minValue: '',
      maxValue: ''
    });
    setShowAddPointForm(false);
  };

  const startEditingPoint = (point: ReadingPoint) => {
    setEditPoint({
      name: point.name,
      buildingName: point.buildingName,
      floor: point.floor,
      room: point.room,
      readingType: point.readingType,
      component: point.component || '',
      unit: point.unit,
      description: point.description || '',
      validationType: point.validationType || 'range',
      minValue: point.minValue !== undefined ? point.minValue.toString() : '',
      maxValue: point.maxValue !== undefined ? point.maxValue.toString() : ''
    });
    setEditingPoint(point.id);
  };

  const handleEditPoint = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editPoint.name || !editPoint.buildingName || !editPoint.floor || !editPoint.room) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingPoint) {
      onUpdatePoint(editingPoint, {
        name: editPoint.name,
        buildingName: editPoint.buildingName,
        floor: editPoint.floor,
        room: editPoint.room,
        readingType: editPoint.readingType,
        component: editPoint.component || undefined,
        unit: editPoint.unit,
        description: editPoint.description,
        validationType: editPoint.validationType,
        minValue: editPoint.validationType === 'range' && editPoint.minValue !== '' ? Number(editPoint.minValue) : undefined,
        maxValue: editPoint.validationType === 'range' && editPoint.maxValue !== '' ? Number(editPoint.maxValue) : undefined,
      });
      
      setEditingPoint(null);
      setEditPoint({
        name: '',
        buildingName: '',
        floor: '',
        room: '',
        readingType: 'temperature',
        component: '',
        unit: '',
        description: '',
        validationType: 'range',
        minValue: '',
        maxValue: ''
      });
    }
  };

  const cancelEditPoint = () => {
    setEditingPoint(null);
    setEditPoint({
      name: '',
      buildingName: '',
      floor: '',
      room: '',
      readingType: 'temperature',
      component: '',
      unit: '',
      description: '',
      validationType: 'range',
      minValue: '',
      maxValue: ''
    });
  };

  // Confirmation helper functions
  const handleDeletePointWithConfirmation = (point: ReadingPoint) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the reading point "${point.name}"?\n\n` +
      `Location: ${point.buildingName} - ${point.floor} - ${point.room}\n` +
      `Type: ${point.readingType.replace('_', ' ')} (${point.unit})\n\n` +
      `This action cannot be undone.`
    );
    
    if (isConfirmed) {
      onDeletePoint(point.id);
    }
  };

  const handleDeleteListWithConfirmation = (list: ReadingPointList) => {
    const pointCount = list.pointIds.length;
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the reading list "${list.name}"?\n\n` +
      `This list contains ${pointCount} reading point${pointCount !== 1 ? 's' : ''}.\n` +
      `This action cannot be undone.`
    );
    
    if (isConfirmed) {
      onDeleteList(list.id);
    }
  };

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newList.name || newList.selectedPoints.length === 0) {
      alert('Please provide a list name and select at least one reading point');
      return;
    }

    const list: ReadingPointList = {
      id: Date.now().toString(),
      name: newList.name,
      description: newList.description,
      pointIds: newList.selectedPoints,
      expectedCompletionDate: newList.expectedCompletionDate || undefined,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddList(list);
    setNewList({
      name: '',
      description: '',
      expectedCompletionDate: '',
      selectedPoints: []
    });
    setShowAddListForm(false);
  };

  const handleCopyList = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!copyList.name) {
      alert('Please provide a name for the new list');
      return;
    }

    const originalList = readingPointLists.find(list => list.id === copyingList);
    if (!originalList) {
      alert('Original list not found');
      return;
    }

    const newListFromCopy: ReadingPointList = {
      id: Date.now().toString(),
      name: copyList.name,
      description: copyList.description || `Copy of ${originalList.name}`,
      pointIds: [...originalList.pointIds], // Copy all points from original list
      expectedCompletionDate: copyList.expectedCompletionDate || undefined,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddList(newListFromCopy);
    setCopyList({
      name: '',
      description: '',
      expectedCompletionDate: '',
      originalName: ''
    });
    setCopyingList(null);
    setShowCopyListForm(false);
    alert(`Successfully created "${copyList.name}" with ${originalList.pointIds.length} points from "${originalList.name}"`);
  };

  const startCopyList = (listId: string) => {
    const originalList = readingPointLists.find(list => list.id === listId);
    if (!originalList) return;

    setCopyingList(listId);
    setCopyList({
      name: `Copy of ${originalList.name}`,
      description: originalList.description || '',
      expectedCompletionDate: '',
      originalName: originalList.name
    });
    setShowCopyListForm(true);
  };

  const togglePointSelection = (pointId: string) => {
    setNewList(prev => ({
      ...prev,
      selectedPoints: prev.selectedPoints.includes(pointId)
        ? prev.selectedPoints.filter(id => id !== pointId)
        : [...prev.selectedPoints, pointId]
    }));
  };

  const toggleEditPointSelection = (pointId: string) => {
    setEditList(prev => ({
      ...prev,
      selectedPoints: prev.selectedPoints.includes(pointId)
        ? prev.selectedPoints.filter(id => id !== pointId)
        : [...prev.selectedPoints, pointId]
    }));
  };

  const startEditingList = (list: ReadingPointList) => {
    setEditList({
      name: list.name,
      description: list.description || '',
      selectedPoints: [...list.pointIds]
    });
    setEditingList(list.id);
    setShowEditListForm(true);
  };

  const handleEditList = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editList.name || editList.selectedPoints.length === 0) {
      alert('Please provide a list name and select at least one reading point');
      return;
    }

    if (editingList) {
      onUpdateList(editingList, {
        name: editList.name,
        description: editList.description,
        pointIds: editList.selectedPoints
      });

      setEditList({
        name: '',
        description: '',
        selectedPoints: []
      });
      setEditingList(null);
      setShowEditListForm(false);
    }
  };

  const cancelEditList = () => {
    setEditList({
      name: '',
      description: '',
      selectedPoints: []
    });
    setEditingList(null);
    setShowEditListForm(false);
  };

  const getPointsByIds = (pointIds: string[]) => {
    return readingPoints.filter(point => pointIds.includes(point.id));
  };

  return (
    <div className="reading-points-manager">
      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          Reading Points ({readingPoints.length})
        </button>
        <button 
          className={`tab ${activeTab === 'lists' ? 'active' : ''}`}
          onClick={() => setActiveTab('lists')}
        >
          Point Lists ({readingPointLists.length})
        </button>
      </div>

      {/* Reading Points Tab */}
      {activeTab === 'points' && (
        <div className="points-section">
          <div className="section-header">
            <h3>Reading Points</h3>
            <button 
              className="btn"
              onClick={() => setShowAddPointForm(true)}
            >
              Add New Point
            </button>
          </div>

          {/* Add Point Form */}
          {showAddPointForm && (
            <div className="form-overlay">
              <form className="add-point-form" onSubmit={handleAddPoint}>
                <h4>Add New Reading Point</h4>
                
                <div className="form-group">
                  <label>Point Name *</label>
                  <input
                    type="text"
                    value={newPoint.name}
                    onChange={(e) => setNewPoint(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g., Main Lobby Temperature Sensor"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Building *</label>
                    <select
                      value={newPoint.buildingName}
                      onChange={(e) => setNewPoint(prev => ({...prev, buildingName: e.target.value}))}
                      required
                    >
                      <option value="">Select Building</option>
                      {fieldDefinitions.buildings.map(building => (
                        <option key={building} value={building}>{building}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Floor *</label>
                    <select
                      value={newPoint.floor}
                      onChange={(e) => setNewPoint(prev => ({...prev, floor: e.target.value}))}
                      required
                    >
                      <option value="">Select Floor</option>
                      {fieldDefinitions.floors.map(floor => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Room *</label>
                    <select
                      value={newPoint.room}
                      onChange={(e) => setNewPoint(prev => ({...prev, room: e.target.value}))}
                      required
                    >
                      <option value="">Select Room</option>
                      {fieldDefinitions.rooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Reading Type</label>
                  <select
                    value={newPoint.readingType}
                    onChange={(e) => setNewPoint(prev => ({...prev, readingType: e.target.value, unit: ''}))}
                  >
                    <option value="">Select Reading Type</option>
                    {fieldDefinitions.readingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    value={newPoint.unit}
                    onChange={(e) => setNewPoint(prev => ({...prev, unit: e.target.value}))}
                    required
                    disabled={!newPoint.readingType}
                  >
                    <option value="">Select Unit</option>
                    {newPoint.readingType && fieldDefinitions.units[newPoint.readingType]?.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <small className="field-help">
                    {!newPoint.readingType ? 'Select a reading type first' : 'Choose the measurement unit for this reading type'}
                  </small>
                </div>

                <div className="form-group">
                  <label>Component/System</label>
                  <select
                    value={newPoint.component || ''}
                    onChange={(e) => setNewPoint(prev => ({...prev, component: e.target.value || undefined}))}
                  >
                    <option value="">No Component</option>
                    {fieldDefinitions.components.map(component => (
                      <option key={component} value={component}>{component}</option>
                    ))}
                  </select>
                  <small className="field-help">Optional: Specify the building component or system this point monitors</small>
                </div>

                <div className="form-group">
                  <label>Validation Type</label>
                  <select
                    value={newPoint.validationType}
                    onChange={(e) => setNewPoint(prev => ({...prev, validationType: e.target.value as 'range' | 'sat_unsat'}))}
                  >
                    <option value="range">Range (Min/Max Values)</option>
                    <option value="sat_unsat">SAT/UNSAT (Satisfactory/Unsatisfactory)</option>
                  </select>
                  <small className="field-help">Choose how users will validate this reading point</small>
                </div>

                {newPoint.validationType === 'range' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Minimum Value</label>
                      <input
                        type="number"
                        value={newPoint.minValue}
                        onChange={(e) => setNewPoint(prev => ({...prev, minValue: e.target.value}))}
                        placeholder={`Optional minimum value (${newPoint.unit || 'unit'})`}
                        step="any"
                      />
                      <small className="field-help">Leave empty for no minimum limit</small>
                    </div>
                    <div className="form-group">
                      <label>Maximum Value</label>
                      <input
                        type="number"
                        value={newPoint.maxValue}
                        onChange={(e) => setNewPoint(prev => ({...prev, maxValue: e.target.value}))}
                        placeholder={`Optional maximum value (${newPoint.unit || 'unit'})`}
                        step="any"
                      />
                      <small className="field-help">Leave empty for no maximum limit</small>
                    </div>
                  </div>
                )}

                {newPoint.validationType === 'sat_unsat' && (
                  <div className="form-group">
                    <div className="validation-info">
                      <p><strong>SAT/UNSAT Validation:</strong> Users will select either "Satisfactory" or "Unsatisfactory" instead of entering numeric values.</p>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newPoint.description}
                    onChange={(e) => setNewPoint(prev => ({...prev, description: e.target.value}))}
                    placeholder="Optional description of this reading point"
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn">Add Point</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddPointForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Controls */}
          <div className="filter-controls">
            <h4>Filter Reading Points</h4>
            <div className="filter-row">
              <div className="filter-group">
                <label>Building:</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                >
                  <option value="all">All Buildings</option>
                  {getUniqueBuildings().map(building => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Floor:</label>
                <select
                  value={selectedFloor}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  disabled={selectedBuilding === 'all'}
                >
                  <option value="all">All Floors</option>
                  {getUniqueFloors().map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Room:</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  disabled={selectedBuilding === 'all' || selectedFloor === 'all'}
                >
                  <option value="all">All Rooms</option>
                  {getUniqueRooms().map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedBuilding('all');
                    setSelectedFloor('all');
                    setSelectedRoom('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Points List */}
          <div className="points-list">
            <div className="points-summary">
              <h4>Reading Points ({getFilteredPoints().length} of {readingPoints.length})</h4>
            </div>
            {getFilteredPoints().length === 0 ? (
              <div className="no-data">
                {readingPoints.length === 0 ? (
                  <p>No reading points created yet. Add your first reading point to get started!</p>
                ) : (
                  <p>No reading points match the selected filters. Try adjusting your filter criteria.</p>
                )}
              </div>
            ) : (
              <div className="points-grid">
                {getFilteredPoints().map(point => (
                  <div key={point.id} className="point-card">
                    {editingPoint === point.id ? (
                      // Edit form
                      <form onSubmit={handleEditPoint} className="edit-point-form">
                        <div className="form-header">
                          <h4>Edit Reading Point</h4>
                          <div className="form-actions">
                            <button type="submit" className="btn-icon save" title="Save">
                              ✓
                            </button>
                            <button type="button" className="btn-icon cancel" onClick={cancelEditPoint} title="Cancel">
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-name-${point.id}`}>Name *</label>
                          <input
                            id={`edit-name-${point.id}`}
                            type="text"
                            value={editPoint.name}
                            onChange={(e) => setEditPoint(prev => ({...prev, name: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-building-${point.id}`}>Building *</label>
                          <input
                            id={`edit-building-${point.id}`}
                            type="text"
                            value={editPoint.buildingName}
                            onChange={(e) => setEditPoint(prev => ({...prev, buildingName: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-floor-${point.id}`}>Floor *</label>
                          <input
                            id={`edit-floor-${point.id}`}
                            type="text"
                            value={editPoint.floor}
                            onChange={(e) => setEditPoint(prev => ({...prev, floor: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-room-${point.id}`}>Room *</label>
                          <input
                            id={`edit-room-${point.id}`}
                            type="text"
                            value={editPoint.room}
                            onChange={(e) => setEditPoint(prev => ({...prev, room: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-reading-type-${point.id}`}>Reading Type *</label>
                          <select
                            id={`edit-reading-type-${point.id}`}
                            value={editPoint.readingType}
                            onChange={(e) => setEditPoint(prev => ({...prev, readingType: e.target.value}))}
                            required
                          >
                            {fieldDefinitions.readingTypes.map(type => (
                              <option key={type} value={type}>
                                {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-unit-${point.id}`}>Unit *</label>
                          <input
                            id={`edit-unit-${point.id}`}
                            type="text"
                            value={editPoint.unit}
                            onChange={(e) => setEditPoint(prev => ({...prev, unit: e.target.value}))}
                            placeholder="e.g., °C, %, kWh"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-component-${point.id}`}>Component</label>
                          <input
                            id={`edit-component-${point.id}`}
                            type="text"
                            value={editPoint.component}
                            onChange={(e) => setEditPoint(prev => ({...prev, component: e.target.value}))}
                            placeholder="e.g., HVAC-01, Sensor-A"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`edit-validation-type-${point.id}`}>Validation Type</label>
                          <select
                            id={`edit-validation-type-${point.id}`}
                            value={editPoint.validationType}
                            onChange={(e) => setEditPoint(prev => ({...prev, validationType: e.target.value as 'range' | 'sat_unsat'}))}
                          >
                            <option value="range">Range (Min/Max Values)</option>
                            <option value="sat_unsat">SAT/UNSAT (Satisfactory/Unsatisfactory)</option>
                          </select>
                        </div>
                        {editPoint.validationType === 'range' && (
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor={`edit-min-value-${point.id}`}>Min Value</label>
                              <input
                                id={`edit-min-value-${point.id}`}
                                type="number"
                                step="any"
                                value={editPoint.minValue}
                                onChange={(e) => setEditPoint(prev => ({...prev, minValue: e.target.value}))}
                                placeholder="Min"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`edit-max-value-${point.id}`}>Max Value</label>
                              <input
                                id={`edit-max-value-${point.id}`}
                                type="number"
                                step="any"
                                value={editPoint.maxValue}
                                onChange={(e) => setEditPoint(prev => ({...prev, maxValue: e.target.value}))}
                                placeholder="Max"
                              />
                            </div>
                          </div>
                        )}
                        {editPoint.validationType === 'sat_unsat' && (
                          <div className="form-group">
                            <div className="validation-info">
                              <p><strong>SAT/UNSAT Validation:</strong> Users will select either "Satisfactory" or "Unsatisfactory" instead of entering numeric values.</p>
                            </div>
                          </div>
                        )}
                        <div className="form-group">
                          <label htmlFor={`edit-description-${point.id}`}>Description</label>
                          <textarea
                            id={`edit-description-${point.id}`}
                            value={editPoint.description}
                            onChange={(e) => setEditPoint(prev => ({...prev, description: e.target.value}))}
                            rows={3}
                            placeholder="Optional description of this reading point"
                          />
                        </div>
                      </form>
                    ) : (
                      // Display view
                      <>
                        <div className="point-header">
                          <h4>{point.name}</h4>
                          <div className="point-actions">
                            <button 
                              className="btn-icon"
                              onClick={() => startEditingPoint(point)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-icon"
                              onClick={() => onUpdatePoint(point.id, { isActive: !point.isActive })}
                              title={point.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {point.isActive ? '●' : '○'}
                            </button>
                            <button 
                              className="btn-icon delete"
                              onClick={() => handleDeletePointWithConfirmation(point)}
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="point-details">
                          <p><strong>Location:</strong> {point.buildingName} - {point.floor} - {point.room}</p>
                          <p><strong>Type:</strong> {point.readingType.replace('_', ' ')} ({point.unit})</p>
                          {point.validationType === 'range' && (point.minValue !== undefined || point.maxValue !== undefined) && (
                            <p><strong>Range:</strong> {point.minValue !== undefined ? point.minValue : '−∞'} - {point.maxValue !== undefined ? point.maxValue : '+∞'} {point.unit}</p>
                          )}
                          {point.validationType === 'sat_unsat' && (
                            <p><strong>Validation:</strong> SAT/UNSAT (Satisfactory/Unsatisfactory)</p>
                          )}
                          {point.component && <p><strong>Component:</strong> {point.component}</p>}
                          {point.description && <p><strong>Description:</strong> {point.description}</p>}
                          <p className={`status ${point.isActive ? 'active' : 'inactive'}`}>
                            {point.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reading Point Lists Tab */}
      {activeTab === 'lists' && (
        <div className="lists-section">
          <div className="section-header">
            <h3>Reading Point Lists</h3>
            <button 
              className="btn"
              onClick={() => setShowAddListForm(true)}
              disabled={readingPoints.length === 0}
            >
              Create New List
            </button>
          </div>

          {readingPoints.length === 0 && (
            <div className="no-data">
              <p>Create some reading points first before creating lists.</p>
            </div>
          )}

          {/* Add List Form */}
          {showAddListForm && (
            <div className="form-overlay">
              <form className="add-list-form" onSubmit={handleAddList}>
                <h4>Create New Reading Point List</h4>
                
                <div className="form-group">
                  <label>List Name *</label>
                  <input
                    type="text"
                    value={newList.name}
                    onChange={(e) => setNewList(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g., Daily Temperature Rounds"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newList.description}
                    onChange={(e) => setNewList(prev => ({...prev, description: e.target.value}))}
                    placeholder="Optional description of this list"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Expected Completion Date</label>
                  <input
                    type="date"
                    value={newList.expectedCompletionDate}
                    onChange={(e) => setNewList(prev => ({...prev, expectedCompletionDate: e.target.value}))}
                    title="Users will only be able to complete this list on the specified date"
                  />
                  <small className="field-help">Users can only complete this list on the specified date</small>
                </div>

                <div className="form-group">
                  <label>Select Reading Points *</label>
                  <div className="points-selection">
                    {readingPoints.filter(p => p.isActive).map(point => (
                      <div key={point.id} className="point-checkbox">
                        <input
                          type="checkbox"
                          id={`point-${point.id}`}
                          checked={newList.selectedPoints.includes(point.id)}
                          onChange={() => togglePointSelection(point.id)}
                        />
                        <label htmlFor={`point-${point.id}`}>
                          <strong>{point.name}</strong><br />
                          <small>{point.buildingName} - {point.floor} - {point.room}</small>
                          {point.component && <><br /><small className="component-tag">📊 {point.component}</small></>}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn">Create List</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddListForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Copy List Form */}
          {showCopyListForm && (
            <div className="form-overlay">
              <form className="add-list-form" onSubmit={handleCopyList}>
                <h4>Copy Reading Point List</h4>
                <p className="form-help">
                  Creating a copy of "<strong>{copyList.originalName}</strong>" with all its reading points.
                </p>
                
                <div className="form-group">
                  <label>New List Name *</label>
                  <input
                    type="text"
                    value={copyList.name}
                    onChange={(e) => setCopyList(prev => ({...prev, name: e.target.value}))}
                    required
                    placeholder="Enter name for the new list"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={copyList.description}
                    onChange={(e) => setCopyList(prev => ({...prev, description: e.target.value}))}
                    placeholder="Optional description for the new list"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Expected Completion Date</label>
                  <input
                    type="date"
                    value={copyList.expectedCompletionDate}
                    onChange={(e) => setCopyList(prev => ({...prev, expectedCompletionDate: e.target.value}))}
                  />
                  <small className="field-help">
                    Set the due date for when this list should be completed
                  </small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Copy
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCopyListForm(false);
                      setCopyingList(null);
                      setCopyList({
                        name: '',
                        description: '',
                        expectedCompletionDate: '',
                        originalName: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit List Form */}
          {showEditListForm && (
            <div className="form-overlay">
              <form className="add-list-form" onSubmit={handleEditList}>
                <h4>Edit Reading Point List</h4>
                
                <div className="form-group">
                  <label>List Name *</label>
                  <input
                    type="text"
                    value={editList.name}
                    onChange={(e) => setEditList(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g., Daily Temperature Rounds"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editList.description}
                    onChange={(e) => setEditList(prev => ({...prev, description: e.target.value}))}
                    placeholder="Optional description of this list"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Select Reading Points *</label>
                  <div className="points-selection">
                    {readingPoints.filter(p => p.isActive).map(point => (
                      <div key={point.id} className="point-checkbox">
                        <input
                          type="checkbox"
                          id={`edit-point-${point.id}`}
                          checked={editList.selectedPoints.includes(point.id)}
                          onChange={() => toggleEditPointSelection(point.id)}
                        />
                        <label htmlFor={`edit-point-${point.id}`}>
                          <strong>{point.name}</strong><br />
                          <small>{point.buildingName} - {point.floor} - {point.room}</small>
                          {point.component && <><br /><small className="component-tag">📊 {point.component}</small></>}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn">Update List</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={cancelEditList}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lists Display */}
          <div className="lists-display">
            {readingPointLists.length === 0 ? (
              <div className="no-data">
                <p>No reading point lists created yet.</p>
              </div>
            ) : (
              <div className="lists-grid">
                {readingPointLists.map(list => (
                  <div key={list.id} className="list-card">
                    <div className="list-header">
                      <h4>{list.name}</h4>
                      <div className="list-actions">
                        <button 
                          className="btn-icon copy"
                          onClick={() => startCopyList(list.id)}
                          title="Copy List"
                        >
                          📋
                        </button>
                        <button 
                          className="btn-icon edit"
                          onClick={() => startEditingList(list)}
                          title="Edit List"
                        >
                          ✎
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDeleteListWithConfirmation(list)}
                          title="Delete List"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="list-details">
                      {list.description && <p>{list.description}</p>}
                      <div className="list-info-grid">
                        {list.expectedCompletionDate && (
                          <p><strong>Expected Date:</strong> {formatDate(list.expectedCompletionDate)}</p>
                        )}
                        <p><strong>Created by:</strong> {getUserDisplayName(list.createdBy)}</p>
                        <p><strong>Created:</strong> {formatDate(list.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingPointsManager;