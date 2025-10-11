import React, { useState, useEffect } from 'react';
import AdminInterface from './components/AdminInterface';
import UserInterface from './components/UserInterface';
import SuperAdminInterface from './components/SuperAdminInterface';
import ReviewerInterface from './components/ReviewerInterface';
import Login from './components/Login';
import { BuildingReading, ReadingType, ChartType, ReadingPoint, ReadingPointList, FieldDefinitions, DEFAULT_FIELD_DEFINITIONS, ReviewSubmission, ReviewAction } from './types';
import { User, UserRole, AuthState, saveAuthState, loadAuthState, clearAuthState, initializeUserDatabase, getAllUsers } from './auth';
import { emailService } from './services/emailService';
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
  const [reviewSubmissions, setReviewSubmissions] = useState<ReviewSubmission[]>([]);

  // Debug function for localStorage - accessible from browser console
  (window as any).debugLocalStorage = () => {
    console.log('=== localStorage Debug ===');
    console.log('buildingReadings:', localStorage.getItem('buildingReadings'));
    console.log('readingPoints:', localStorage.getItem('readingPoints'));
    console.log('readingPointLists:', localStorage.getItem('readingPointLists'));
    console.log('fieldDefinitions:', localStorage.getItem('fieldDefinitions'));
    console.log('reviewSubmissions:', localStorage.getItem('reviewSubmissions'));
    console.log('=========================');
  };

  // Clear localStorage function - accessible from browser console
  (window as any).clearLocalStorage = () => {
    console.log('Clearing all localStorage data...');
    localStorage.removeItem('buildingReadings');
    localStorage.removeItem('readingPoints');
    localStorage.removeItem('readingPointLists');
    localStorage.removeItem('fieldDefinitions');
    localStorage.removeItem('reviewSubmissions');
    console.log('localStorage cleared! Refresh the page to see dummy data.');
  };

  // Reset to dummy data function - accessible from browser console
  (window as any).resetToDummyData = () => {
    console.log('Resetting to dummy data...');
    localStorage.removeItem('buildingReadings');
    localStorage.removeItem('readingPoints');
    localStorage.removeItem('readingPointLists');
    localStorage.removeItem('fieldDefinitions');
    localStorage.removeItem('reviewSubmissions');
    console.log('Data cleared! Refreshing page to load dummy data...');
    window.location.reload();
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
      const savedReviewSubmissions = localStorage.getItem('reviewSubmissions');
      
      console.log('Loading data from localStorage...');
      console.log('Auth state:', savedAuthState ? 'authenticated' : 'not authenticated');
      console.log('Raw savedPoints:', savedPoints);
      console.log('Saved readings:', savedReadings ? JSON.parse(savedReadings).length : 0);
      console.log('Saved points:', savedPoints ? JSON.parse(savedPoints).length : 0);
      console.log('Saved lists:', savedLists ? JSON.parse(savedLists).length : 0);
      console.log('Saved field definitions:', savedFieldDefinitions ? 'loaded' : 'using defaults');
      console.log('Saved review submissions:', savedReviewSubmissions ? JSON.parse(savedReviewSubmissions).length : 0);
      
      if (savedReadings) {
        const parsedReadings = JSON.parse(savedReadings);
        setReadings(parsedReadings);
        setFilteredReadings(parsedReadings);
      }
      
      if (savedPoints) {
        const parsedPoints = JSON.parse(savedPoints);
        console.log('Parsed points:', parsedPoints);
        setReadingPoints(parsedPoints);
      } else {
        // Create default dummy reading points if none exist
        const defaultPoints: ReadingPoint[] = [
          {
            id: 'point-1',
            name: 'Main Lobby Temperature Sensor',
            buildingName: 'Main Office Building',
            floor: 'Ground Floor',
            room: 'Lobby',
            readingType: 'temperature',
            unit: '°C',
            component: 'HVAC-01',
            description: 'Primary temperature monitoring for lobby HVAC system',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-1b',
            name: 'Lobby Occupancy Counter',
            buildingName: 'Main Office Building',
            floor: 'Ground Floor',
            room: 'Lobby',
            readingType: 'occupancy',
            unit: 'people',
            component: 'Security-01',
            description: 'People counting system for lobby area traffic monitoring',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-2',
            name: 'Server Room Humidity Monitor',
            buildingName: 'Main Office Building',
            floor: 'First Floor',
            room: 'Server Room',
            readingType: 'humidity',
            unit: '%',
            component: 'Environmental-01',
            description: 'Critical humidity monitoring for server equipment protection',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-2b',
            name: 'Server Room Temperature Control',
            buildingName: 'Main Office Building',
            floor: 'First Floor',
            room: 'Server Room',
            readingType: 'temperature',
            unit: '°C',
            component: 'HVAC-02',
            description: 'Precision temperature control for server rack cooling',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-3',
            name: 'Conference Room Energy Meter',
            buildingName: 'Main Office Building',
            floor: 'Second Floor',
            room: 'Conference Room A',
            readingType: 'energy',
            unit: 'kWh',
            component: 'Electrical-02',
            description: 'Energy consumption monitoring for conference room electrical systems',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-3b',
            name: 'Conference Room Lighting Control',
            buildingName: 'Main Office Building',
            floor: 'Second Floor',
            room: 'Conference Room A',
            readingType: 'lighting',
            unit: 'lux',
            component: 'Lighting-01',
            description: 'Automated lighting level monitoring and control system',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-4',
            name: 'Kitchen Water Flow Sensor',
            buildingName: 'Main Office Building',
            floor: 'Ground Floor',
            room: 'Kitchen',
            readingType: 'water',
            unit: 'L',
            component: 'Plumbing-01',
            description: 'Water usage monitoring for kitchen facilities',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-4b',
            name: 'Kitchen Gas Consumption Meter',
            buildingName: 'Main Office Building',
            floor: 'Ground Floor',
            room: 'Kitchen',
            readingType: 'gas',
            unit: 'm³',
            component: 'Gas-01',
            description: 'Natural gas consumption monitoring for kitchen equipment',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-5',
            name: 'Parking Garage Air Quality Monitor',
            buildingName: 'Main Office Building',
            floor: 'Basement',
            room: 'Parking Garage',
            readingType: 'air_quality',
            unit: 'ppm',
            component: 'Ventilation-01',
            description: 'Air quality monitoring for parking garage ventilation system',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'point-5b',
            name: 'Parking Garage Exhaust Fan Monitor',
            buildingName: 'Main Office Building',
            floor: 'Basement',
            room: 'Parking Garage',
            readingType: 'energy',
            unit: 'kWh',
            component: 'Ventilation-02',
            description: 'Energy consumption monitoring for parking garage exhaust fans',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];
        console.log('🎯 Creating default reading points:', defaultPoints);
        console.log('📊 DUMMY DATA LOADED: 10 reading points created (2 per room)!');
        setReadingPoints(defaultPoints);
      }
      
      if (savedLists) {
        const parsedLists = JSON.parse(savedLists);
        console.log('Parsed lists:', parsedLists);
        setReadingPointLists(parsedLists);
      } else {
        // Create default reading point list if none exist
        const defaultList: ReadingPointList = {
          id: 'list-1',
          name: 'Daily Building Monitoring Rounds',
          description: 'Comprehensive daily monitoring of all key building systems including HVAC, electrical, plumbing, environmental controls, occupancy, and energy consumption',
          pointIds: ['point-1', 'point-1b', 'point-2', 'point-2b', 'point-3', 'point-3b', 'point-4', 'point-4b', 'point-5', 'point-5b'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('📋 Creating default reading point list:', defaultList);
        console.log('📝 DUMMY DATA LOADED: 1 reading list created with all 10 points!');
        setReadingPointLists([defaultList]);
      }

      if (savedFieldDefinitions) {
        const parsedFieldDefinitions = JSON.parse(savedFieldDefinitions);
        console.log('Parsed field definitions:', parsedFieldDefinitions);
        setFieldDefinitions(parsedFieldDefinitions);
      }

      if (savedReviewSubmissions) {
        const parsedReviewSubmissions = JSON.parse(savedReviewSubmissions);
        console.log('Parsed review submissions:', parsedReviewSubmissions);
        setReviewSubmissions(parsedReviewSubmissions);
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

  useEffect(() => {
    if (isInitialLoad) return; // Don't save during initial load
    localStorage.setItem('reviewSubmissions', JSON.stringify(reviewSubmissions));
  }, [reviewSubmissions, isInitialLoad]);

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

  // Review system handlers
  const handleSubmitForReview = async (submission: Omit<ReviewSubmission, 'id' | 'status' | 'submittedAt'>) => {
    const newSubmission: ReviewSubmission = {
      ...submission,
      id: `review-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    setReviewSubmissions(prev => [...prev, newSubmission]);
    
    // Send email notifications to reviewers
    try {
      const allUsers = getAllUsers();
      const reviewers = allUsers.filter(user => user.roles.includes('reviewer'));
      const submitter = allUsers.find(user => user.id === submission.submittedBy);
      const submitterName = submitter?.fullName || submitter?.username || 'Unknown User';
      
      await emailService.notifyReviewersOfNewSubmission(
        newSubmission,
        reviewers,
        submitterName
      );
    } catch (error) {
      console.error('Failed to send email notifications:', error);
      // Don't fail the submission if email fails
    }
  };

  const handleReviewSubmission = async (submissionId: string, action: ReviewAction) => {
    setReviewSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        const newStatus = action.action === 'approve' ? 'approved' : 
                         action.action === 'reject' ? 'rejected' : 'needs_revision';
        
        const updatedSubmission = {
          ...submission,
          status: newStatus as any,
          reviewedBy: action.reviewedBy,
          reviewedAt: new Date().toISOString(),
          reviewComments: action.comments
        };

        // If approved, add readings to the main readings list
        if (action.action === 'approve') {
          setReadings(prev => [...prev, ...submission.readings]);
        }

        // Send email notification to submitter about status change
        (async () => {
          try {
            const allUsers = getAllUsers();
            const submitter = allUsers.find(user => user.id === submission.submittedBy);
            const reviewer = allUsers.find(user => user.id === action.reviewedBy);
            
            if (submitter?.email) {
              const submitterName = submitter.fullName || submitter.username;
              const reviewerName = reviewer?.fullName || reviewer?.username || 'System';
              
              await emailService.notifySubmitterOfStatusChange(
                updatedSubmission,
                submitter.email,
                submitterName,
                reviewerName
              );
            }
          } catch (error) {
            console.error('Failed to send status change notification:', error);
          }
        })();

        return updatedSubmission;
      }
      return submission;
    }));
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
                {authState.currentRole === 'reviewer' && '🔍 Reviewer'}
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
          ) : authState.currentRole === 'reviewer' ? (
            <ReviewerInterface
              submissions={reviewSubmissions}
              onReviewSubmission={handleReviewSubmission}
              currentUserId={authState.currentUser?.id || ''}
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
              currentUserId={authState.currentUser?.id || ''}
              currentUserName={authState.currentUser?.fullName || authState.currentUser?.username || ''}
              onAddBulkReadings={addBulkReadings}
              onSubmitForReview={handleSubmitForReview}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
