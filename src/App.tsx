import React, { useState, useEffect } from 'react';
import AdminInterface from './components/AdminInterface';
import UserInterface from './components/UserInterface';
import SuperAdminInterface from './components/SuperAdminInterface';
import Login from './components/Login';
import { BuildingReading, ReadingType, ChartType, ReadingPoint, ReadingPointList, FieldDefinitions, DEFAULT_FIELD_DEFINITIONS } from './types';
import { User, UserRole, AuthState, saveAuthState, loadAuthState, clearAuthState, initializeUserDatabase } from './auth';
import './App.css';

function App() {
  const [readings, setReadings] = useState<BuildingReading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<BuildingReading[]>([]);
  const [readingPoints, setReadingPoints] = useState<ReadingPoint[]>([]);
  const [readingPointLists, setReadingPointLists] = useState<ReadingPointList[]>([]);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | 'all'>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    currentRole: null
  });
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinitions>(DEFAULT_FIELD_DEFINITIONS);

  // Debug function for localStorage - accessible from browser console
  (window as any).debugLocalStorage = () => {
    console.log('=== localStorage Debug ===');
    console.log('buildingReadings:', localStorage.getItem('buildingReadings'));
    console.log('readingPoints:', localStorage.getItem('readingPoints'));
    console.log('readingPointLists:', localStorage.getItem('readingPointLists'));
    console.log('fieldDefinitions:', localStorage.getItem('fieldDefinitions'));
    console.log('=========================');
  };

  // Clear localStorage function - accessible from browser console
  (window as any).clearLocalStorage = () => {
    console.log('Clearing all localStorage data...');
    localStorage.removeItem('buildingReadings');
    localStorage.removeItem('readingPoints');
    localStorage.removeItem('readingPointLists');
    localStorage.removeItem('fieldDefinitions');
    console.log('localStorage cleared! Refresh the page to see changes.');
  };

  // Authentication functions
  const handleLogin = (user: User, role: UserRole) => {
    const newAuthState: AuthState = {
      isAuthenticated: true,
      currentUser: user,
      currentRole: role
    };
    setAuthState(newAuthState);
    saveAuthState(newAuthState);
  };

  const handleLogout = () => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      currentUser: null,
      currentRole: null
    };
    setAuthState(newAuthState);
    clearAuthState();
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      // Load user database first
      initializeUserDatabase();
      
      // Load authentication state
      const savedAuthState = loadAuthState();
      if (savedAuthState && savedAuthState.isAuthenticated) {
        setAuthState(savedAuthState);
      }

      const savedReadings = localStorage.getItem('buildingReadings');
      const savedPoints = localStorage.getItem('readingPoints');
      const savedLists = localStorage.getItem('readingPointLists');
      const savedFieldDefinitions = localStorage.getItem('fieldDefinitions');
      
      console.log('Loading data from localStorage...');
      console.log('Auth state:', savedAuthState ? 'authenticated' : 'not authenticated');
      console.log('Raw savedPoints:', savedPoints);
      console.log('Saved readings:', savedReadings ? JSON.parse(savedReadings).length : 0);
      console.log('Saved points:', savedPoints ? JSON.parse(savedPoints).length : 0);
      console.log('Saved lists:', savedLists ? JSON.parse(savedLists).length : 0);
      console.log('Saved field definitions:', savedFieldDefinitions ? 'loaded' : 'using defaults');
      
      if (savedReadings) {
        const parsedReadings = JSON.parse(savedReadings);
        setReadings(parsedReadings);
        setFilteredReadings(parsedReadings);
      }
      
      if (savedPoints) {
        const parsedPoints = JSON.parse(savedPoints);
        console.log('Parsed points:', parsedPoints);
        setReadingPoints(parsedPoints);
      }
      
      if (savedLists) {
        const parsedLists = JSON.parse(savedLists);
        console.log('Parsed lists:', parsedLists);
        setReadingPointLists(parsedLists);
      }

      if (savedFieldDefinitions) {
        const parsedFieldDefinitions = JSON.parse(savedFieldDefinitions);
        console.log('Parsed field definitions:', parsedFieldDefinitions);
        setFieldDefinitions(parsedFieldDefinitions);
      }
      
      // Mark initial load as complete
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setIsInitialLoad(false);
    }
  }, []);

  // Save data to localStorage whenever data changes (but not on initial load)
  useEffect(() => {
    if (isInitialLoad) return; // Don't save during initial load
    
    try {
      console.log('Saving readings to localStorage:', readings.length);
      localStorage.setItem('buildingReadings', JSON.stringify(readings));
    } catch (error) {
      console.error('Error saving readings to localStorage:', error);
    }
  }, [readings, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return; // Don't save during initial load
    
    try {
      console.log('Saving reading points to localStorage:', readingPoints.length, readingPoints);
      localStorage.setItem('readingPoints', JSON.stringify(readingPoints));
      // Verify it was saved
      const saved = localStorage.getItem('readingPoints');
      console.log('Verified saved points:', saved ? JSON.parse(saved).length : 0);
    } catch (error) {
      console.error('Error saving reading points to localStorage:', error);
    }
  }, [readingPoints, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return; // Don't save during initial load
    localStorage.setItem('readingPointLists', JSON.stringify(readingPointLists));
  }, [readingPointLists, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return; // Don't save during initial load
    console.log('Saving field definitions to localStorage:', fieldDefinitions);
    localStorage.setItem('fieldDefinitions', JSON.stringify(fieldDefinitions));
  }, [fieldDefinitions, isInitialLoad]);

  // Filter readings based on selected criteria
  useEffect(() => {
    let filtered = readings;

    if (selectedReadingType !== 'all') {
      filtered = filtered.filter(reading => reading.readingType === selectedReadingType);
    }

    if (selectedBuilding !== 'all') {
      filtered = filtered.filter(reading => reading.buildingName === selectedBuilding);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredReadings(filtered);
  }, [readings, selectedReadingType, selectedBuilding]);

  const addBulkReadings = (readings: BuildingReading[]) => {
    setReadings(prev => [...prev, ...readings]);
  };

  const deleteReading = (id: string) => {
    setReadings(prev => prev.filter(reading => reading.id !== id));
  };

  const addReadingPoint = (point: ReadingPoint) => {
    console.log('Adding reading point:', point);
    setReadingPoints(prev => {
      const newPoints = [...prev, point];
      console.log('New points array:', newPoints);
      return newPoints;
    });
  };

  const updateReadingPoint = (id: string, updates: Partial<ReadingPoint>) => {
    setReadingPoints(prev => prev.map(point => 
      point.id === id ? { ...point, ...updates } : point
    ));
  };

  const deleteReadingPoint = (id: string) => {
    setReadingPoints(prev => prev.filter(point => point.id !== id));
  };

  const addReadingPointList = (list: ReadingPointList) => {
    setReadingPointLists(prev => [...prev, list]);
  };

  const updateReadingPointList = (id: string, updates: Partial<ReadingPointList>) => {
    setReadingPointLists(prev => prev.map(list => 
      list.id === id ? { ...list, ...updates, updatedAt: new Date().toISOString() } : list
    ));
  };

  const deleteReadingPointList = (id: string) => {
    setReadingPointLists(prev => prev.filter(list => list.id !== id));
  };

  const handleFilterChange = (readingType: ReadingType | 'all', building: string) => {
    setSelectedReadingType(readingType);
    setSelectedBuilding(building);
  };

  const handleChartTypeChange = (chartType: ChartType) => {
    setChartType(chartType);
  };

  return (
    <div className="App">
      {!authState.isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {/* User info and logout */}
          <div className="auth-header">
            <div className="user-info">
              <span className="welcome-text">
                Welcome, {authState.currentUser?.fullName || authState.currentUser?.username}
              </span>
              <span className="current-role">
                {authState.currentRole === 'superadmin' && '🔧 Super Admin'}
                {authState.currentRole === 'admin' && '⚙️ Administrator'}
                {authState.currentRole === 'user' && '👤 User'}
              </span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>

          {/* Render appropriate interface based on role */}
          {authState.currentRole === 'superadmin' ? (
            <SuperAdminInterface
              fieldDefinitions={fieldDefinitions}
              onUpdateFieldDefinitions={setFieldDefinitions}
            />
          ) : authState.currentRole === 'admin' ? (
            <AdminInterface
              readings={readings}
              filteredReadings={filteredReadings}
              readingPoints={readingPoints}
              readingPointLists={readingPointLists}
              selectedReadingType={selectedReadingType}
              selectedBuilding={selectedBuilding}
              chartType={chartType}
              fieldDefinitions={fieldDefinitions}
              onAddBulkReadings={addBulkReadings}
              onDeleteReading={deleteReading}
              onAddReadingPoint={addReadingPoint}
              onUpdateReadingPoint={updateReadingPoint}
              onDeleteReadingPoint={deleteReadingPoint}
              onAddReadingPointList={addReadingPointList}
              onUpdateReadingPointList={updateReadingPointList}
              onDeleteReadingPointList={deleteReadingPointList}
              onFilterChange={handleFilterChange}
              onChartTypeChange={handleChartTypeChange}
            />
          ) : (
            <UserInterface
              readingPoints={readingPoints}
              readingPointLists={readingPointLists}
              onAddBulkReadings={addBulkReadings}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
