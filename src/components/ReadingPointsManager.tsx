import React, { useState } from 'react';
import { ReadingPoint, ReadingPointList, FieldDefinitions } from '../types';

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
  // Tab state
  React.useEffect(() => {
    const handleTabClose = () => {
      sessionStorage.clear();
    };
    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);
  const [activeTab, setActiveTab] = useState<'points' | 'lists' | 'models'>('points');

  // Overlay states
  const [showAddPointForm, setShowAddPointForm] = useState(false);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [showCopyListForm, setShowCopyListForm] = useState(false);
  const [showBulkCreateForm, setShowBulkCreateForm] = useState(false);
  const [showEditListForm, setShowEditListForm] = useState(false);

  // Editing states
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [copyingList, setCopyingList] = useState<string | null>(null);

  // Utility functions
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (userId?: string) => {
    // Replace with actual user lookup if available
    return userId ?? 'Unknown';
  };

  const getUniqueBuildings = () => {
    const buildings = [...new Set(readingPoints.map(point => point.buildingName))];
    return buildings.sort();
  };
// function body starts here
  // Filter states
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

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
    selectedPoints: [] as string[],
    isModel: false
  });

  // Copy Reading Point List Form
  const [copyList, setCopyList] = useState({
    name: '',
    description: '',
    expectedCompletionDate: '',
    originalName: '',
    isModel: false,
    selectedPoints: [] as string[]
  });

  // Bulk Create Lists Form
  const [bulkCreateForm, setBulkCreateForm] = useState({
    selectedListId: '',
    startDate: '',
    endDate: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    namePattern: 'sequential' as 'sequential' | 'date',
    namePrefix: '',
    includeOriginalName: true,
    isModel: false
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
    selectedPoints: [] as string[],
    isModel: false
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
      updatedAt: new Date().toISOString(),
      isModel: newList.isModel
    };

    onAddList(list);
    setNewList({
      name: '',
      description: '',
      expectedCompletionDate: '',
      selectedPoints: [],
      isModel: false
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
      pointIds: [...copyList.selectedPoints], // Use selected points from overlay
      expectedCompletionDate: copyList.expectedCompletionDate || undefined,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isModel: copyList.isModel || false
    };

    onAddList(newListFromCopy);
    setCopyList({
      name: '',
      description: '',
      expectedCompletionDate: '',
      originalName: '',
      isModel: false,
      selectedPoints: []
    });
    setCopyingList(null);
    setShowCopyListForm(false);
    alert(`Successfully created "${copyList.name}" with ${originalList.pointIds.length} points from "${originalList.name}"`);
  };

  // Bulk Create Lists Handler
  const handleBulkCreateLists = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkCreateForm.selectedListId || !bulkCreateForm.startDate || !bulkCreateForm.endDate) {
      alert('Please select a template list and specify the date range.');
      return;
    }

    const templateList = readingPointLists.find(list => list.id === bulkCreateForm.selectedListId);
    if (!templateList) {
      alert('Selected template list not found.');
      return;
    }

    const startDate = new Date(bulkCreateForm.startDate);
    const endDate = new Date(bulkCreateForm.endDate);
    
    if (startDate > endDate) {
      alert('Start date must be before or equal to end date.');
      return;
    }

    const createdLists: ReadingPointList[] = [];
    const currentDate = new Date(startDate);
    let listIndex = 1;

    while (currentDate <= endDate) {
      let listName = '';
      const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Generate list name based on pattern
      if (bulkCreateForm.namePattern === 'date') {
        const dateFormatted = currentDate.toLocaleDateString();
        if (bulkCreateForm.includeOriginalName) {
          listName = `${templateList.name} - ${dateFormatted}`;
        } else {
          listName = `${bulkCreateForm.namePrefix || 'Reading List'} - ${dateFormatted}`;
        }
      } else {
        if (bulkCreateForm.includeOriginalName) {
          listName = `${templateList.name} ${listIndex}`;
        } else {
          listName = `${bulkCreateForm.namePrefix || 'Reading List'} ${listIndex}`;
        }
      }

      // Create the list based on template
      const newList: ReadingPointList = {
        id: `bulk-${Date.now()}-${listIndex}`,
        name: listName,
        description: templateList.description || `Auto-generated from template: ${templateList.name}`,
        pointIds: [...templateList.pointIds], // Copy all points from template
        expectedCompletionDate: dateString,
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isModel: bulkCreateForm.isModel
      };

      createdLists.push(newList);
      onAddList(newList);

      // Move to next date based on frequency
      if (bulkCreateForm.frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (bulkCreateForm.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (bulkCreateForm.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      listIndex++;
    }

    // Reset form and close
    setBulkCreateForm({
      selectedListId: '',
      startDate: '',
      endDate: '',
      frequency: 'daily',
      namePattern: 'sequential',
      namePrefix: '',
      includeOriginalName: true,
      isModel: false
    });
    setShowBulkCreateForm(false);
    
    alert(`Successfully created ${createdLists.length} reading lists from template "${templateList.name}" for ${bulkCreateForm.startDate} to ${bulkCreateForm.endDate}`);
  };

  const startCopyList = (listId: string) => {
    const originalList = readingPointLists.find(list => list.id === listId);
    if (!originalList) return;

    setCopyingList(listId);
    setCopyList({
      name: `Copy of ${originalList.name}`,
      description: originalList.description || '',
      expectedCompletionDate: '',
      originalName: originalList.name,
      isModel: originalList.isModel ? true : false,
      selectedPoints: [...originalList.pointIds]
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
      selectedPoints: [...list.pointIds],
      isModel: list.isModel || false
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
            pointIds: editList.selectedPoints,
            isModel: editList.isModel
          });

      setEditList({
        name: '',
        description: '',
        selectedPoints: [],
        isModel: false
      });
      setEditingList(null);
      setShowEditListForm(false);
    }
  };

  const cancelEditList = () => {
    setEditList({
      name: '',
      description: '',
      selectedPoints: [],
      isModel: false
    });
    setEditingList(null);
    setShowEditListForm(false);
  };

  const handleConvertToModel = (list: ReadingPointList) => {
    const isConfirmed = window.confirm(
      `Convert "${list.name}" to a Model Template?\n\n` +
      `Model templates:\n` +
      `• Are never worked or completed by users\n` +
      `• Only serve as templates for creating other lists\n` +
      `• Will be moved to the Model Templates tab\n\n` +
      `This action can be reversed later if needed.`
    );

    if (isConfirmed) {
      onUpdateList(list.id, { isModel: true });
    }
  };

  const handleConvertToRegular = (list: ReadingPointList) => {
    const isConfirmed = window.confirm(
      `Convert "${list.name}" back to a Regular List?\n\n` +
      `This template will:\n` +
      `• Become available for users to work with\n` +
      `• Be moved to the Point Lists tab\n` +
      `• No longer serve as a template only\n\n` +
      `Are you sure you want to proceed?`
    );

    if (isConfirmed) {
      onUpdateList(list.id, { isModel: false });
    }
  };

  const getPointsByIds = (pointIds: string[]) => {
    return readingPoints.filter(point => pointIds.includes(point.id));
  };

  return (
  <>
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
          Point Lists ({readingPointLists.filter(list => !list.isModel).length})
        </button>
        <button 
          className={`tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          📋 Model Templates ({readingPointLists.filter(list => list.isModel).length})
        </button>
      </div>

      {/* Copy List Form - always rendered when active */}
      {showCopyListForm && (
        <div className="form-overlay">
          <form className="add-list-form" onSubmit={handleCopyList}>
            <h4>Copy Reading Point List</h4>
            {copyList.isModel && (
              <div className="model-template-context">
                <span className="badge model-badge">🔒 Copying Model Template</span>
              </div>
            )}
            <div className="form-group">
              <label>New List Name *</label>
              <input type="text" value={copyList.name} onChange={e => setCopyList(prev => ({...prev, name: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={copyList.description} onChange={e => setCopyList(prev => ({...prev, description: e.target.value}))} rows={2} />
            </div>
            <div className="form-group">
              <label>Expected Completion Date</label>
              <input type="date" value={copyList.expectedCompletionDate} onChange={e => setCopyList(prev => ({...prev, expectedCompletionDate: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Select Reading Points *</label>
              <div className="points-selection">
                {readingPoints.filter(p => p.isActive).map(point => (
                  <div key={point.id} className="point-checkbox">
                    <input
                      type="checkbox"
                      id={`copy-point-${point.id}`}
                      checked={copyList.selectedPoints?.includes(point.id) || false}
                      onChange={() => setCopyList(prev => ({
                        ...prev,
                        selectedPoints: prev.selectedPoints?.includes(point.id)
                          ? prev.selectedPoints.filter(id => id !== point.id)
                          : [...(prev.selectedPoints || []), point.id]
                      }))}
                    />
                    <label htmlFor={`copy-point-${point.id}`}>
                      <strong>{point.name}</strong><br />
                      <small>{point.buildingName} - {point.floor} - {point.room}</small>
                      {point.component && <><br /><small className="component-tag">📊 {point.component}</small></>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={copyList.isModel} onChange={e => setCopyList(prev => ({...prev, isModel: e.target.checked}))} />
                📋 Mark as Model Template
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Copy</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowCopyListForm(false); setCopyingList(null); setCopyList({ name: '', description: '', expectedCompletionDate: '', originalName: '', isModel: false, selectedPoints: [] }); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Edit List Form - always rendered when active */}
      {showEditListForm && (
        <div className="form-overlay">
          <form className="add-list-form" onSubmit={handleEditList}>
            <h4>Edit Reading Point List</h4>
            {editList.isModel && (
              <div className="model-template-context">
                <span className="badge model-badge">🔒 Editing Model Template</span>
              </div>
            )}
            <div className="form-group">
              <label>List Name *</label>
              <input type="text" value={editList.name} onChange={e => setEditList(prev => ({...prev, name: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={editList.description} onChange={e => setEditList(prev => ({...prev, description: e.target.value}))} rows={2} />
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
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={editList.isModel} onChange={e => setEditList(prev => ({...prev, isModel: e.target.checked}))} />
                📋 Mark as Model Template
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Update List</button>
              <button type="button" className="btn btn-secondary" onClick={cancelEditList}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="points-section">
          {/* Add Point Form */}
          {showAddPointForm && (
            <div className="form-overlay">
              <form className="add-point-form" onSubmit={handleAddPoint}>
                <h4>Add New Reading Point</h4>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={newPoint.name} onChange={e => setNewPoint(prev => ({...prev, name: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Building *</label>
                  <input type="text" value={newPoint.buildingName} onChange={e => setNewPoint(prev => ({...prev, buildingName: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Floor *</label>
                  <input type="text" value={newPoint.floor} onChange={e => setNewPoint(prev => ({...prev, floor: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Room *</label>
                  <input type="text" value={newPoint.room} onChange={e => setNewPoint(prev => ({...prev, room: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Reading Type</label>
                  <select value={newPoint.readingType} onChange={e => setNewPoint(prev => ({...prev, readingType: e.target.value}))}>
                    {fieldDefinitions.readingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Component</label>
                  <input type="text" value={newPoint.component} onChange={e => setNewPoint(prev => ({...prev, component: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input type="text" value={newPoint.unit} onChange={e => setNewPoint(prev => ({...prev, unit: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={newPoint.description} onChange={e => setNewPoint(prev => ({...prev, description: e.target.value}))} rows={2} />
                </div>
                <div className="form-group">
                  <label>Validation Type</label>
                  <select value={newPoint.validationType} onChange={e => setNewPoint(prev => ({...prev, validationType: e.target.value as 'range' | 'sat_unsat'}))}>
                    <option value="range">Range</option>
                    <option value="sat_unsat">Satisfactory/Unsatisfactory</option>
                  </select>
                </div>
                {newPoint.validationType === 'range' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Min Value</label>
                      <input type="number" value={newPoint.minValue} onChange={e => setNewPoint(prev => ({...prev, minValue: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label>Max Value</label>
                      <input type="number" value={newPoint.maxValue} onChange={e => setNewPoint(prev => ({...prev, maxValue: e.target.value}))} />
                    </div>
                  </div>
                )}
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Add Point</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddPointForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-row">
            <label>Building:</label>
            <select value={selectedBuilding} onChange={e => handleBuildingChange(e.target.value)}>
              <option value="all">All</option>
              {getUniqueBuildings().map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <label>Floor:</label>
            <select value={selectedFloor} onChange={e => handleFloorChange(e.target.value)}>
              <option value="all">All</option>
              {getUniqueFloors().map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <label>Room:</label>
            <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
              <option value="all">All</option>
              {getUniqueRooms().map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Points List */}
        <div className="points-list">
          {getFilteredPoints().length === 0 ? (
            <div className="no-data">
              <p>No reading points found for the selected filters.</p>
            </div>
          ) : (
            <div className="points-grid">
              {getFilteredPoints().map(point => (
                <div key={point.id} className="point-card">
                  <div className="point-header">
                    <h4>{point.name}</h4>
                    <div className="point-actions">
                      <button className="btn-icon edit" onClick={() => startEditingPoint(point)} title="Edit Point">✎</button>
                      <button className="btn-icon delete" onClick={() => handleDeletePointWithConfirmation(point)} title="Delete Point">×</button>
                    </div>
                  </div>
                  <div className="point-details">
                    <p><strong>Location:</strong> {point.buildingName} - {point.floor} - {point.room}</p>
                    <p><strong>Type:</strong> {point.readingType} {point.unit && `(${point.unit})`}</p>
                    {point.component && <p><strong>Component:</strong> {point.component}</p>}
                    {point.description && <p><strong>Description:</strong> {point.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Lists Tab */}
    {activeTab === 'lists' && (
      <div className="lists-section">
        {/* Add List Form */}
        {showAddListForm && (
          <div className="form-overlay">
            <form className="add-list-form" onSubmit={handleAddList}>
              <h4>Create New Reading Point List</h4>
              <div className="form-group">
                <label>List Name *</label>
                <input type="text" value={newList.name} onChange={e => setNewList(prev => ({...prev, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={newList.description} onChange={e => setNewList(prev => ({...prev, description: e.target.value}))} rows={2} />
              </div>
              <div className="form-group">
                <label>Expected Completion Date</label>
                <input type="date" value={newList.expectedCompletionDate} onChange={e => setNewList(prev => ({...prev, expectedCompletionDate: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Select Reading Points *</label>
                <div className="points-selection">
                  {readingPoints.filter(p => p.isActive).map(point => (
                    <div key={point.id} className="point-checkbox">
                      <input type="checkbox" id={`point-${point.id}`} checked={newList.selectedPoints.includes(point.id)} onChange={() => togglePointSelection(point.id)} />
                      <label htmlFor={`point-${point.id}`}>{point.name} <small>{point.buildingName} - {point.floor} - {point.room}</small></label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={newList.isModel} onChange={e => setNewList(prev => ({...prev, isModel: e.target.checked}))} />
                  📋 Mark as Model Template
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create List</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddListForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      {/* Copy List Form - always rendered when active */}
      {showCopyListForm && (
        <div className="form-overlay">
          <form className="add-list-form" onSubmit={handleCopyList}>
            <h4>Copy Reading Point List</h4>
            {copyList.isModel && (
              <div className="model-template-context">
                <span className="badge model-badge">🔒 Copying Model Template</span>
              </div>
            )}
            <div className="form-group">
              <label>New List Name *</label>
              <input type="text" value={copyList.name} onChange={e => setCopyList(prev => ({...prev, name: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={copyList.description} onChange={e => setCopyList(prev => ({...prev, description: e.target.value}))} rows={2} />
            </div>
            <div className="form-group">
              <label>Expected Completion Date</label>
              <input type="date" value={copyList.expectedCompletionDate} onChange={e => setCopyList(prev => ({...prev, expectedCompletionDate: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Select Reading Points *</label>
              <div className="points-selection">
                {readingPoints.filter(p => p.isActive).map(point => (
                  <div key={point.id} className="point-checkbox">
                    <input
                      type="checkbox"
                      id={`copy-point-${point.id}`}
                      checked={copyList.selectedPoints?.includes(point.id) || false}
                      onChange={() => setCopyList(prev => ({
                        ...prev,
                        selectedPoints: prev.selectedPoints?.includes(point.id)
                          ? prev.selectedPoints.filter(id => id !== point.id)
                          : [...(prev.selectedPoints || []), point.id]
                      }))}
                    />
                    <label htmlFor={`copy-point-${point.id}`}>
                      <strong>{point.name}</strong><br />
                      <small>{point.buildingName} - {point.floor} - {point.room}</small>
                      {point.component && <><br /><small className="component-tag">📊 {point.component}</small></>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={copyList.isModel} onChange={e => setCopyList(prev => ({...prev, isModel: e.target.checked}))} />
                📋 Mark as Model Template
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Copy</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowCopyListForm(false); setCopyingList(null); setCopyList({ name: '', description: '', expectedCompletionDate: '', originalName: '', isModel: false, selectedPoints: [] }); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
        {/* Bulk Create Lists Form */}
        {showBulkCreateForm && (
          <div className="form-overlay">
            <form className="add-list-form" onSubmit={handleBulkCreateLists}>
              <h4>Bulk Create Lists from Template</h4>
              {/* ...bulk create form fields (already present above)... */}
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
              {readingPointLists.filter(list => !list.isModel).map(list => (
                <div key={list.id} className="list-card">
                  <div className="list-header">
                    <h4>{list.name}</h4>
                    <div className="list-actions">
                      <button className="btn-icon copy" onClick={() => startCopyList(list.id)} title="Copy List">📋</button>
                      <button className="btn-icon edit" onClick={() => startEditingList(list)} title="Edit List">✎</button>
                      <button className="btn-icon model-convert" onClick={() => handleConvertToModel(list)} title="Convert to Model Template">📋</button>
                      <button className="btn-icon delete" onClick={() => handleDeleteListWithConfirmation(list)} title="Delete List">×</button>
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

    {/* Model Templates Tab */}
    {activeTab === 'models' && (
      <div className="lists-section">
        {/* Model Templates Display */}
        {readingPointLists.filter(list => list.isModel).length > 0 ? (
          <div className="lists-grid">
            {readingPointLists.filter(list => list.isModel).map(list => (
              <div key={list.id} className="list-card">
                <div className="list-header">
                  <h4>{list.name}</h4>
                  <div className="list-actions">
                    <button 
                      className="btn-icon copy"
                      onClick={() => startCopyList(list.id)}
                      title="Copy Model Template"
                    >
                      📋
                    </button>
                    <button 
                      className="btn-icon edit"
                      onClick={() => startEditingList(list)}
                      title="Edit Model Template"
                    >
                      ✎
                    </button>
                    <button 
                      className="btn-icon model-convert"
                      onClick={() => handleConvertToRegular(list)}
                      title="Convert to Regular List"
                    >
                      📄
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDeleteListWithConfirmation(list)}
                      title="Delete Model Template"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="list-card-content">
                  <div className="list-details">
                    <p><strong>Points:</strong> {list.pointIds.length}</p>
                    {list.description && <p><strong>Description:</strong> {list.description}</p>}
                    <div className="template-badge">
                      <span className="badge model-badge">🔒 MODEL TEMPLATE</span>
                    </div>
                    <p><strong>Created by:</strong> {getUserDisplayName(list.createdBy)}</p>
                    <p><strong>Created:</strong> {formatDate(list.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No model templates found.</div>
        )}
        {/* Edit List Form for Model Templates */}
        {showEditListForm && (
          <div className="form-overlay">
            <form className="add-list-form" onSubmit={handleEditList}>
              <h4>Edit Reading Point List</h4>
              {editList.isModel && (
                <div className="model-template-context">
                  <span className="badge model-badge">🔒 Editing Model Template</span>
                </div>
              )}
              <div className="form-group">
                <label>List Name *</label>
                <input type="text" value={editList.name} onChange={e => setEditList(prev => ({...prev, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={editList.description} onChange={e => setEditList(prev => ({...prev, description: e.target.value}))} rows={2} />
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
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={editList.isModel} onChange={e => setEditList(prev => ({...prev, isModel: e.target.checked}))} />
                  📋 Mark as Model Template
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Update List</button>
                <button type="button" className="btn btn-secondary" onClick={cancelEditList}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    )}
  </>);
}

export { ReadingPointsManager };
export default ReadingPointsManager;