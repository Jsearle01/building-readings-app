// Authentication types and database
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  roles: UserRole[]; // Array of roles the user can access
  email?: string;
  fullName?: string;
  createdAt: string;
  lastLogin?: string;
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
    username: 'manager',
    password: 'manager123', // In production: hash this password
    roles: ['admin', 'user'],
    email: 'manager@company.com',
    fullName: 'Building Manager',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
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
        USER_DATABASE.length = 0;
        USER_DATABASE.push(...users);
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

// Authentication functions
export const authenticateUser = (username: string, password: string): User | null => {
  const user = USER_DATABASE.find(u => u.username === username && u.password === password);
  if (user) {
    // Update last login
    user.lastLogin = new Date().toISOString();
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
    localStorage.setItem('authState', JSON.stringify(authState));
  } catch (error) {
    console.error('Failed to save auth state:', error);
  }
};

export const loadAuthState = (): AuthState | null => {
  try {
    const saved = localStorage.getItem('authState');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load auth state:', error);
    return null;
  }
};

export const clearAuthState = (): void => {
  try {
    localStorage.removeItem('authState');
  } catch (error) {
    console.error('Failed to clear auth state:', error);
  }
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