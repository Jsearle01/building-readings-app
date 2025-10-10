import React, { useState } from 'react';
import { ReadingFormData, ReadingType } from '../types';

interface ReadingFormProps {
  onSubmit: (reading: any) => void;
}

const readingTypeUnits: Record<ReadingType, string> = {
  temperature: '°C',
  humidity: '%',
  energy: 'kWh',
  water: 'L',
  gas: 'm³',
  occupancy: 'people',
  air_quality: 'ppm',
  lighting: 'lux'
};

const ReadingForm: React.FC<ReadingFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ReadingFormData>({
    buildingName: '',
    floor: '',
    room: '',
    readingType: 'temperature',
    value: 0,
    unit: readingTypeUnits.temperature,
    notes: ''
  });

  const handleReadingTypeChange = (type: ReadingType) => {
    setFormData(prev => ({
      ...prev,
      readingType: type,
      unit: readingTypeUnits[type]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.buildingName || !formData.floor || !formData.room) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      ...formData,
      timestamp: new Date().toISOString()
    });

    // Reset form
    setFormData({
      buildingName: '',
      floor: '',
      room: '',
      readingType: 'temperature',
      value: 0,
      unit: readingTypeUnits.temperature,
      notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="reading-form">
      <div className="grid">
        <div className="form-group">
          <label htmlFor="buildingName">Building Name *</label>
          <input
            type="text"
            id="buildingName"
            value={formData.buildingName}
            onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
            placeholder="e.g., Main Office Building"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="floor">Floor *</label>
          <input
            type="text"
            id="floor"
            value={formData.floor}
            onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
            placeholder="e.g., Ground Floor, 2nd Floor"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="room">Room/Area *</label>
          <input
            type="text"
            id="room"
            value={formData.room}
            onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
            placeholder="e.g., Conference Room A, Lobby"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="readingType">Reading Type *</label>
          <select
            id="readingType"
            value={formData.readingType}
            onChange={(e) => handleReadingTypeChange(e.target.value as ReadingType)}
            required
          >
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="energy">Energy Consumption</option>
            <option value="water">Water Usage</option>
            <option value="gas">Gas Usage</option>
            <option value="occupancy">Occupancy</option>
            <option value="air_quality">Air Quality</option>
            <option value="lighting">Lighting Level</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="value">Value *</label>
          <input
            type="number"
            id="value"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="unit">Unit</label>
          <input
            type="text"
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            placeholder="Unit of measurement"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes or observations"
          rows={3}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <button type="submit" className="btn">
        Add Reading
      </button>
    </form>
  );
};

export default ReadingForm;
