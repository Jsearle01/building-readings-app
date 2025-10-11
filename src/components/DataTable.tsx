import React, { useState, useMemo } from 'react';
import { BuildingReading } from '../types';
import { format } from 'date-fns';

interface DataTableProps {
  readings: BuildingReading[];
  onDeleteReading: (id: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ readings, onDeleteReading }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to newest first

  // Memoized sorted readings
  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      
      if (sortOrder === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [readings, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDeleteReadingWithConfirmation = (reading: BuildingReading) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this reading?\n\n` +
      `Reading Type: ${reading.readingType.replace('_', ' ')}\n` +
      `Value: ${reading.value} ${reading.unit}\n` +
      `Date: ${format(new Date(reading.timestamp), 'PPpp')}\n` +
      `Location: ${reading.buildingName} - ${reading.floor} - ${reading.room}\n\n` +
      `This action cannot be undone.`
    );
    
    if (isConfirmed) {
      onDeleteReading(reading.id);
    }
  };

  return (
    <div className="table-container">
      <div className="table-info">
        <p>Showing {readings.length} reading(s)</p>
        <div className="sort-info">
          <span className="sort-label">
            Sorted by: Date & Time ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
          </span>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th 
                className="sortable-header" 
                onClick={toggleSortOrder}
                title="Click to sort by date"
              >
                Date & Time
                <span className="sort-indicator">
                  {sortOrder === 'desc' ? ' ↓' : ' ↑'}
                </span>
              </th>
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
            {sortedReadings.map((reading) => (
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
                <td>
                  {typeof reading.value === 'number' ? reading.value.toFixed(2) : reading.value}
                </td>
                <td>{reading.unit}</td>
                <td>{reading.notes || '-'}</td>
                <td>{reading.userInfo || '-'}</td>
                <td>
                  <button
                    onClick={() => handleDeleteReadingWithConfirmation(reading)}
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
