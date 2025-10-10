import React, { useState } from 'react';
import { FieldDefinitions, DEFAULT_FIELD_DEFINITIONS } from '../types';
import UserManagement from './UserManagement';

interface SuperAdminInterfaceProps {
  fieldDefinitions: FieldDefinitions;
  onUpdateFieldDefinitions: (definitions: FieldDefinitions) => void;
}

const SuperAdminInterface: React.FC<SuperAdminInterfaceProps> = ({
  fieldDefinitions,
  onUpdateFieldDefinitions
}) => {
  const [activeTab, setActiveTab] = useState<'buildings' | 'floors' | 'rooms' | 'components' | 'reading-types' | 'units' | 'users'>('buildings');
  const [editingField, setEditingField] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newReadingType, setNewReadingType] = useState<string>('');
  const [newReadingTypeUnits, setNewReadingTypeUnits] = useState<string>('');

  const handleAddValue = (field: keyof FieldDefinitions) => {
    if (!newValue.trim()) return;

    const updated = { ...fieldDefinitions };
    if (field === 'units') return; // Units handled separately
    
    const fieldArray = updated[field] as string[];
    if (!fieldArray.includes(newValue.trim())) {
      (updated[field] as string[]).push(newValue.trim());
      onUpdateFieldDefinitions(updated);
    }
    setNewValue('');
  };

  const handleRemoveValue = (field: keyof FieldDefinitions, value: string) => {
    const updated = { ...fieldDefinitions };
    if (field === 'units') return; // Units handled separately
    
    (updated[field] as string[]) = (updated[field] as string[]).filter(item => item !== value);
    onUpdateFieldDefinitions(updated);
  };

  const handleAddUnit = (readingType: string, unit: string) => {
    if (!unit.trim()) return;

    const updated = { ...fieldDefinitions };
    if (!updated.units[readingType].includes(unit.trim())) {
      updated.units[readingType].push(unit.trim());
      onUpdateFieldDefinitions(updated);
    }
  };

  const handleRemoveUnit = (readingType: string, unit: string) => {
    const updated = { ...fieldDefinitions };
    updated.units[readingType] = updated.units[readingType].filter(u => u !== unit);
    onUpdateFieldDefinitions(updated);
  };

  const handleAddReadingType = () => {
    if (!newReadingType.trim()) return;

    const updated = { ...fieldDefinitions };
    const readingTypeKey = newReadingType.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Add to reading types if not already exists
    if (!updated.readingTypes.includes(readingTypeKey)) {
      updated.readingTypes.push(readingTypeKey);
      
      // Initialize units for this reading type
      const initialUnits = newReadingTypeUnits.trim() 
        ? newReadingTypeUnits.split(',').map(u => u.trim()).filter(u => u)
        : ['unit'];
      updated.units[readingTypeKey] = initialUnits;
      
      onUpdateFieldDefinitions(updated);
    }
    
    setNewReadingType('');
    setNewReadingTypeUnits('');
  };

  const handleRemoveReadingType = (readingType: string) => {
    if (confirm(`Remove reading type "${readingType}" and all its units? This cannot be undone.`)) {
      const updated = { ...fieldDefinitions };
      updated.readingTypes = updated.readingTypes.filter(rt => rt !== readingType);
      delete updated.units[readingType];
      onUpdateFieldDefinitions(updated);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all field definitions to defaults? This cannot be undone.')) {
      onUpdateFieldDefinitions({ ...DEFAULT_FIELD_DEFINITIONS });
    }
  };

  const exportConfig = () => {
    const config = JSON.stringify(fieldDefinitions, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'field-definitions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        onUpdateFieldDefinitions(config);
        alert('Configuration imported successfully!');
      } catch (error) {
        alert('Invalid configuration file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="super-admin-interface">
      <header className="app-header">
        <div className="header-content">
          <h1>🔧 Super Admin - Field Configuration</h1>
          <p>Define dropdown options for consistent data entry across the system</p>
        </div>
        
        <nav className="navigation">
          <button 
            className={`nav-tab ${activeTab === 'buildings' ? 'active' : ''}`}
            onClick={() => setActiveTab('buildings')}
          >
            🏢 Buildings
          </button>
          <button 
            className={`nav-tab ${activeTab === 'floors' ? 'active' : ''}`}
            onClick={() => setActiveTab('floors')}
          >
            🏗️ Floors
          </button>
          <button 
            className={`nav-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            🚪 Rooms
          </button>
          <button 
            className={`nav-tab ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => setActiveTab('components')}
          >
            ⚙️ Components
          </button>
          <button 
            className={`nav-tab ${activeTab === 'reading-types' ? 'active' : ''}`}
            onClick={() => setActiveTab('reading-types')}
          >
            📊 Reading Types
          </button>
          <button 
            className={`nav-tab ${activeTab === 'units' ? 'active' : ''}`}
            onClick={() => setActiveTab('units')}
          >
            📏 Units
          </button>
          <button 
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
        </nav>
      </header>

      <main className="container">
        <div className="super-admin-controls">
          <div className="control-buttons">
            <button onClick={resetToDefaults} className="btn btn-warning">
              🔄 Reset to Defaults
            </button>
            <button onClick={exportConfig} className="btn btn-secondary">
              📤 Export Config
            </button>
            <label className="btn btn-secondary file-input-label">
              📥 Import Config
              <input 
                type="file" 
                accept=".json" 
                onChange={importConfig}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="field-management">
          {activeTab === 'reading-types' ? (
            <div className="reading-types-section">
              <h3>Manage Reading Types</h3>
              <p className="section-description">
                Add new measurement types that can be collected. Each reading type needs at least one unit.
              </p>

              <div className="add-reading-type-form">
                <h4>Add New Reading Type</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Reading Type Name:</label>
                    <input
                      type="text"
                      value={newReadingType}
                      onChange={(e) => setNewReadingType(e.target.value)}
                      placeholder="e.g., pressure, vibration, noise"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Units (comma-separated):</label>
                    <input
                      type="text"
                      value={newReadingTypeUnits}
                      onChange={(e) => setNewReadingTypeUnits(e.target.value)}
                      placeholder="e.g., psi, bar, Pa"
                      className="form-control"
                    />
                  </div>
                  <button 
                    onClick={handleAddReadingType}
                    className="btn btn-primary"
                    disabled={!newReadingType.trim()}
                  >
                    Add Reading Type
                  </button>
                </div>
              </div>

              <div className="reading-types-list">
                <h4>Current Reading Types ({fieldDefinitions.readingTypes.length})</h4>
                <div className="reading-types-grid">
                  {fieldDefinitions.readingTypes.map((readingType, index) => (
                    <div key={index} className="reading-type-item">
                      <div className="reading-type-info">
                        <strong>{readingType.replace('_', ' ').toUpperCase()}</strong>
                        <div className="reading-type-units">
                          Units: {fieldDefinitions.units[readingType]?.join(', ') || 'None'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveReadingType(readingType)}
                        className="btn btn-danger btn-sm"
                        title="Remove reading type"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab !== 'units' && activeTab !== 'users' ? (
            <div className="field-section">
              <h3>Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <p className="section-description">
                Add or remove options that will appear in dropdown menus for {activeTab}.
              </p>

              <div className="add-value-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={`Enter new ${activeTab.slice(0, -1)}...`}
                    className="form-control"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const fieldKey = activeTab as keyof FieldDefinitions;
                        handleAddValue(fieldKey);
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const fieldKey = activeTab as keyof FieldDefinitions;
                      handleAddValue(fieldKey);
                    }}
                    className="btn btn-primary"
                    disabled={!newValue.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="values-list">
                <h4>Current Options ({(fieldDefinitions[activeTab as keyof FieldDefinitions] as string[]).length})</h4>
                <div className="values-grid">
                  {(fieldDefinitions[activeTab as keyof FieldDefinitions] as string[]).map((value, index) => (
                    <div key={index} className="value-item">
                      <span className="value-text">{value}</span>
                      <button
                        onClick={() => {
                          const fieldKey = activeTab as keyof FieldDefinitions;
                          handleRemoveValue(fieldKey, value);
                        }}
                        className="btn btn-danger btn-sm"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'users' ? (
            <UserManagement />
          ) : (
            <div className="units-section">
              <h3>Manage Units by Reading Type</h3>
              <p className="section-description">
                Configure available units for each reading type. These will appear as dropdown options.
              </p>

              {fieldDefinitions.readingTypes.map(readingType => (
                <div key={readingType} className="unit-type-section">
                  <h4>{readingType.replace('_', ' ').toUpperCase()}</h4>
                  
                  <div className="add-unit-form">
                    <div className="input-group">
                      <input
                        type="text"
                        value={editingField === readingType ? newValue : ''}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={`Add unit for ${readingType}...`}
                        className="form-control"
                        onFocus={() => setEditingField(readingType)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddUnit(readingType, newValue);
                            setNewValue('');
                            setEditingField('');
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          handleAddUnit(readingType, newValue);
                          setNewValue('');
                          setEditingField('');
                        }}
                        className="btn btn-primary btn-sm"
                        disabled={editingField !== readingType || !newValue.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="units-list">
                    {fieldDefinitions.units[readingType].map((unit, index) => (
                      <div key={index} className="unit-item">
                        <span className="unit-text">{unit}</span>
                        <button
                          onClick={() => handleRemoveUnit(readingType, unit)}
                          className="btn btn-danger btn-sm"
                          title="Remove unit"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="field-summary">
          <h3>Configuration Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Buildings:</strong> {fieldDefinitions.buildings.length} options
            </div>
            <div className="summary-item">
              <strong>Floors:</strong> {fieldDefinitions.floors.length} options
            </div>
            <div className="summary-item">
              <strong>Rooms:</strong> {fieldDefinitions.rooms.length} options
            </div>
            <div className="summary-item">
              <strong>Components:</strong> {fieldDefinitions.components.length} options
            </div>
            <div className="summary-item">
              <strong>Reading Types:</strong> {fieldDefinitions.readingTypes.length} types
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminInterface;