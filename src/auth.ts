// Authentication types and database
import { NotificationPreferences } from './types';

export type UserRole = 'user' | 'admin' | 'reviewer' | 'superadmin';

export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  roles: UserRole[]; // Array of roles the user can access
  email?: string;
  fullName?: string;
  createdAt: string;
  lastLogin?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentRole: UserRole | null;
}

// Mock user database - In production, this would be a real database
export const USER_DATABASE: User[] = [
  {
    id: '1',
    username: 'superadmin',
    password: 'super123', // In production: hash this password
    roles: ['superadmin', 'admin', 'user'],
    email: 'superadmin@company.com',
    fullName: 'Super Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123', // In production: hash this password
    roles: ['admin', 'user'],
    email: 'admin@company.com',
    fullName: 'Building Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'user',
    password: 'user123', // In production: hash this password
    roles: ['user'],
    email: 'user@company.com',
    fullName: 'Data Collector',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    username: 'reviewer',
    password: 'reviewer123', // In production: hash this password
    roles: ['reviewer'],
    email: 'reviewer@company.com',
    fullName: 'Data Quality Reviewer',
    createdAt: new Date().toISOString(),
    notificationPreferences: {
      email: {
        enabled: true,
        notifyOnSubmission: true,
        notifyOnApproval: false,
        notifyOnRejection: false,
        notifyOnRevisionRequest: false
      }
    }
  },
  {
    id: '5',
    username: 'supervisor',
    password: 'supervisor123', // In production: hash this password
    roles: ['reviewer', 'admin'],
    email: 'supervisor@company.com',
    fullName: 'Department Supervisor',
    createdAt: new Date().toISOString(),
    notificationPreferences: {
      email: {
        enabled: true,
        notifyOnSubmission: true,
        notifyOnApproval: false,
        notifyOnRejection: false,
        notifyOnRevisionRequest: false
      }
    }
  },
  {
    id: '6',
    username: 'manager',
    password: 'manager123', // In production: hash this password
    roles: ['admin', 'user'],
    email: 'manager@company.com',
    fullName: 'Building Manager',
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    username: 'technician',
    password: 'tech123', // In production: hash this password
    roles: ['user'],
    email: 'tech@company.com',
    fullName: 'Field Technician',
    createdAt: new Date().toISOString()
  }
];

// Store default users for reset functionality
const DEFAULT_USERS: User[] = [...USER_DATABASE.map(user => ({...user}))];

// Initialize user database with defaults
export const initializeUserDatabase = (): void => {
  try {
    const saved = localStorage.getItem('userDatabase');
    if (saved) {
      const users = JSON.parse(saved);
      if (Array.isArray(users) && users.length > 0) {
        console.log('Loading users from localStorage:', users);
        // Check if we have all required users (especially reviewer and supervisor)
        const requiredUsernames = ['superadmin', 'admin', 'user', 'reviewer', 'supervisor', 'manager', 'technician'];
        const existingUsernames = users.map(u => u.username);
        const missingUsers = requiredUsernames.filter(username => !existingUsernames.includes(username));
        
        if (missingUsers.length > 0) {
          console.log('Missing users detected:', missingUsers, '- reinitializing with defaults');
          // If users are missing, reset to defaults
          USER_DATABASE.length = 0;
          USER_DATABASE.push(...DEFAULT_USERS.map(user => ({...user})));
          saveUsersToLocalStorage();
        } else {
          USER_DATABASE.length = 0;
          USER_DATABASE.push(...users);
        }
        return;
      }
    }
    
    // If no valid saved data, use defaults and save them
    console.log('No valid saved user data, using defaults');
    USER_DATABASE.length = 0;
    USER_DATABASE.push(...DEFAULT_USERS.map(user => ({...user})));
    saveUsersToLocalStorage();
  } catch (error) {
    console.error('Failed to initialize user database:', error);
    // Fallback to defaults
    USER_DATABASE.length = 0;
    USER_DATABASE.push(...DEFAULT_USERS.map(user => ({...user})));
  }
};

// Reset user database to defaults (useful for fixing missing users)
export const resetUserDatabase = (): void => {
  console.log('Resetting user database to defaults...');
  USER_DATABASE.length = 0;
  USER_DATABASE.push(...DEFAULT_USERS.map(user => ({...user})));
  saveUsersToLocalStorage();
  console.log('User database reset complete. Users:', USER_DATABASE.map(u => u.username));
};

// Authentication functions
export const authenticateUser = (username: string, password: string): User | null => {
  // Trim whitespace and normalize case
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim();
  
  console.log('Attempting authentication for user:', normalizedUsername);
  console.log('Current USER_DATABASE:', USER_DATABASE);
  
  const user = USER_DATABASE.find(u => 
    u.username.toLowerCase() === normalizedUsername && 
    u.password === normalizedPassword
  );
  
  if (user) {
    console.log('Authentication successful for:', normalizedUsername);
    // Update last login
    user.lastLogin = new Date().toISOString();
  } else {
    console.log('Authentication failed for:', normalizedUsername);
    console.log('Available users:', USER_DATABASE.map(u => u.username.toLowerCase()));
  }
  return user || null;
};

export const getUserById = (id: string): User | null => {
  return USER_DATABASE.find(u => u.id === id) || null;
};

export const canUserAccessRole = (user: User, role: UserRole): boolean => {
  return user.roles.includes(role);
};

// LocalStorage helpers for auth state
export const saveAuthState = (authState: AuthState): void => {
  try {
    sessionStorage.setItem('authState', JSON.stringify(authState));
  } catch (error) {
    console.error('Failed to save auth state:', error);
  }
};

export const loadAuthState = (): AuthState | null => {
  try {
    const saved = sessionStorage.getItem('authState');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load auth state:', error);
    return null;
  }
};

export const clearAuthState = (): void => {
  try {
    sessionStorage.removeItem('authState');
  } catch (error) {
    console.error('Failed to clear auth state:', error);
  }
};

// Debug function for users - accessible from browser console
(window as any).debugUsers = () => {
  console.log('=== USER DATABASE DEBUG ===');
  console.log('Current USER_DATABASE:', USER_DATABASE);
  console.log('LocalStorage userDatabase:', localStorage.getItem('userDatabase'));
  console.log('Available usernames:', USER_DATABASE.map(u => u.username));
  console.log('Available roles:', USER_DATABASE.map(u => ({ username: u.username, roles: u.roles })));
  console.log('===========================');
};

// Test specific user function
(window as any).testUser = (username: string, password: string) => {
  console.log(`Testing user: ${username} with password: ${password}`);
  const result = authenticateUser(username, password);
  console.log('Authentication result:', result);
  return result;
};

// Reset user database function - accessible from browser console
(window as any).resetUsers = () => {
  resetUserDatabase();
  console.log('User database has been reset. Please refresh the page.');
};

// Password validation (basic example)
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true, message: '' };
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'superadmin':
      return '🔧 Super Admin';
    case 'admin':
      return '⚙️ Administrator';
    case 'reviewer':
      return '🔍 Reviewer';
    case 'user':
      return '👤 User';
    default:
      return role;
  }
};

// User management functions
export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  USER_DATABASE.push(newUser);
  saveUsersToLocalStorage();
  return newUser;
};

export const updateUser = (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null => {
  const userIndex = USER_DATABASE.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;
  
  USER_DATABASE[userIndex] = { ...USER_DATABASE[userIndex], ...updates };
  saveUsersToLocalStorage();
  return USER_DATABASE[userIndex];
};

export const deleteUser = (userId: string): boolean => {
  const userIndex = USER_DATABASE.findIndex(u => u.id === userId);
  if (userIndex === -1) return false;
  
  USER_DATABASE.splice(userIndex, 1);
  saveUsersToLocalStorage();
  return true;
};

export const getAllUsers = (): User[] => {
  console.log('getAllUsers called, USER_DATABASE length:', USER_DATABASE.length);
  console.log('getAllUsers returning:', USER_DATABASE);
  return [...USER_DATABASE];
};

export const checkUsernameExists = (username: string, excludeUserId?: string): boolean => {
  return USER_DATABASE.some(u => u.username === username && u.id !== excludeUserId);
};

// LocalStorage helpers for user database
export const saveUsersToLocalStorage = (): void => {
  try {
    localStorage.setItem('userDatabase', JSON.stringify(USER_DATABASE));
  } catch (error) {
    console.error('Failed to save user database:', error);
  }
};