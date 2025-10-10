import React, { useState } from 'react';
import { ReadingPoint, ReadingPointList, FieldDefinitions } from '../types';

interface ReadingPointsManagerProps {
  readingPoints: ReadingPoint[];
  readingPointLists: ReadingPointList[];
  fieldDefinitions: FieldDefinitions;
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
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  onAddList,
  onUpdateList,
  onDeleteList
}) => {
  const [activeTab, setActiveTab] = useState<'points' | 'lists'>('points');
  const [showAddPointForm, setShowAddPointForm] = useState(false);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [showEditListForm, setShowEditListForm] = useState(false);

  // New Reading Point Form
  const [newPoint, setNewPoint] = useState({
    name: '',
    buildingName: '',
    floor: '',
    room: '',
    readingType: fieldDefinitions.readingTypes[0] || 'temperature',
    component: '' as string | undefined,
    unit: '',
    description: ''
  });

  // New Reading Point List Form
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    selectedPoints: [] as string[]
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
      description: ''
    });
    setShowAddPointForm(false);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddList(list);
    setNewList({
      name: '',
      description: '',
      selectedPoints: []
    });
    setShowAddListForm(false);
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

          {/* Points List */}
          <div className="points-list">
            {readingPoints.length === 0 ? (
              <div className="no-data">
                <p>No reading points created yet. Add your first reading point to get started!</p>
              </div>
            ) : (
              <div className="points-grid">
                {readingPoints.map(point => (
                  <div key={point.id} className="point-card">
                    <div className="point-header">
                      <h4>{point.name}</h4>
                      <div className="point-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => onUpdatePoint(point.id, { isActive: !point.isActive })}
                          title={point.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {point.isActive ? '●' : '○'}
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => onDeletePoint(point.id)}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="point-details">
                      <p><strong>Location:</strong> {point.buildingName} - {point.floor} - {point.room}</p>
                      <p><strong>Type:</strong> {point.readingType.replace('_', ' ')} ({point.unit})</p>
                      {point.component && <p><strong>Component:</strong> {point.component}</p>}
                      {point.description && <p><strong>Description:</strong> {point.description}</p>}
                      <p className={`status ${point.isActive ? 'active' : 'inactive'}`}>
                        {point.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
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
                          className="btn-icon edit"
                          onClick={() => startEditingList(list)}
                          title="Edit List"
                        >
                          ✎
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => onDeleteList(list.id)}
                          title="Delete List"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="list-details">
                      {list.description && <p>{list.description}</p>}
                      <p><strong>Points:</strong> {list.pointIds.length}</p>
                      <div className="list-points">
                        {getPointsByIds(list.pointIds).map(point => (
                          <span key={point.id} className="point-tag">
                            {point.name}
                          </span>
                        ))}
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