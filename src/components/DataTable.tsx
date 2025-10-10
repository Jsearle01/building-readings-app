import React from 'react';
import { BuildingReading } from '../types';
import { format } from 'date-fns';

interface DataTableProps {
  readings: BuildingReading[];
  onDeleteReading: (id: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ readings, onDeleteReading }) => {
  if (readings.length === 0) {
    return (
      <div className="no-data">
        <p>No readings found. Add some readings first or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-info">
        <p>Showing {readings.length} reading(s)</p>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Building</th>
              <th>Floor</th>
              <th>Room</th>
              <th>Reading Type</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Notes</th>
              <th>User Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr key={reading.id}>
                <td>
                  {format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm')}
                </td>
                <td>{reading.buildingName}</td>
                <td>{reading.floor}</td>
                <td>{reading.room}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  {reading.readingType.replace('_', ' ')}
                </td>
                <td>{reading.value.toFixed(2)}</td>
                <td>{reading.unit}</td>
                <td>{reading.notes || '-'}</td>
                <td>{reading.userInfo || '-'}</td>
                <td>
                  <button
                    onClick={() => onDeleteReading(reading.id)}
                    className="btn btn-danger"
                    style={{ 
                      backgroundColor: '#dc3545',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
