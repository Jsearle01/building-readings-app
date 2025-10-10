import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { BuildingReading, ChartType } from '../types';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartViewProps {
  readings: BuildingReading[];
  chartType: ChartType;
}

const ChartView: React.FC<ChartViewProps> = ({ readings, chartType }) => {
  if (readings.length === 0) {
    return (
      <div className="no-data">
        <p>No data available for charting. Add some readings or adjust your filters.</p>
      </div>
    );
  }

  // Sort readings by timestamp for proper chart display
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group readings by reading type for multiple series
  const groupedReadings = sortedReadings.reduce((acc, reading) => {
    if (!acc[reading.readingType]) {
      acc[reading.readingType] = [];
    }
    acc[reading.readingType].push(reading);
    return acc;
  }, {} as Record<string, BuildingReading[]>);

  const colors = [
    '#646cff',
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#feca57',
    '#ff9ff3',
    '#54a0ff'
  ];

  const datasets = Object.entries(groupedReadings).map(([readingType, data], index) => {
    const color = colors[index % colors.length];
    
    return {
      label: readingType.replace('_', ' ').toUpperCase(),
      data: data.map(reading => ({
        x: format(new Date(reading.timestamp), 'MMM dd HH:mm'),
        y: reading.value
      })),
      backgroundColor: chartType === 'area' ? `${color}20` : color,
      borderColor: color,
      borderWidth: 2,
      fill: chartType === 'area',
      tension: 0.1,
    };
  });

  const chartData = {
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Building Readings Over Time',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const reading = sortedReadings.find(r => 
              format(new Date(r.timestamp), 'MMM dd HH:mm') === context.parsed.x &&
              r.value === context.parsed.y
            );
            if (reading) {
              return [
                `Building: ${reading.buildingName}`,
                `Location: ${reading.floor} - ${reading.room}`,
                `Unit: ${reading.unit}`,
                ...(reading.notes ? [`Notes: ${reading.notes}`] : [])
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        },
        ticks: {
          maxTicksLimit: 10,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'area':
      case 'line':
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <div className="chart-container">
      <div style={{ height: '400px', position: 'relative' }}>
        {renderChart()}
      </div>
      
      <div className="chart-summary">
        <h3>Summary Statistics</h3>
        <div className="grid">
          {Object.entries(groupedReadings).map(([readingType, data]) => {
            const values = data.map(r => r.value);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const unit = data[0]?.unit || '';

            return (
              <div key={readingType} className="summary-card">
                <h4>{readingType.replace('_', ' ').toUpperCase()}</h4>
                <p><strong>Average:</strong> {avg.toFixed(2)} {unit}</p>
                <p><strong>Min:</strong> {min.toFixed(2)} {unit}</p>
                <p><strong>Max:</strong> {max.toFixed(2)} {unit}</p>
                <p><strong>Readings:</strong> {data.length}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartView;
