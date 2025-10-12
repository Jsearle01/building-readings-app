// Base reading types that are always available
export const BASE_READING_TYPES = [
  'temperature',
  'humidity', 
  'energy',
  'water',
  'gas',
  'occupancy',
  'air_quality',
  'lighting'
] as const;

export type BaseReadingType = typeof BASE_READING_TYPES[number];

// ReadingType is now a string to allow custom types
export type ReadingType = string;

export type ChartType = 'line' | 'bar' | 'area';

export interface BuildingReading {
  id: string;
  buildingName: string;
  floor: string;
  room: string;
  readingType: ReadingType;
  value: number | string; // Can be numeric value or 'SAT'/'UNSAT'
  unit: string;
  timestamp: string;
  notes?: string;
  userInfo?: string;
  pointId?: string; // Reference to a reading point
}

export interface ReadingFormData {
  buildingName: string;
  floor: string;
  room: string;
  readingType: ReadingType;
  value: number | string; // Can be numeric value or 'SAT'/'UNSAT'
  unit: string;
  notes?: string;
  pointId?: string;
}

// New interfaces for reading points and lists
export interface ReadingPoint {
  id: string;
  name: string;
  buildingName: string;
  floor: string;
  room: string;
  readingType: ReadingType;
  component?: string; // Custom component/system category
  unit: string;
  description?: string;
  validationType?: 'range' | 'sat_unsat'; // Type of validation: range (min/max) or SAT/UNSAT
  minValue?: number; // Minimum acceptable value (only used if validationType is 'range')
  maxValue?: number; // Maximum acceptable value (only used if validationType is 'range')
  isActive: boolean;
  createdAt: string;
}

export interface ReadingPointList {
  id: string;
  name: string;
  description?: string;
  pointIds: string[];
  expectedCompletionDate?: string; // Expected completion date in YYYY-MM-DD format
  createdBy?: string; // User ID of who created the list
  createdAt: string;
  updatedAt: string;
  isModel?: boolean; // True if this list is a template/model that should not be worked
}

export interface BulkReadingEntry {
  pointId: string;
  value: number | string; // Can be numeric value or 'SAT'/'UNSAT'
  notes?: string;
}

// Point completion tracking with timestamps
export interface PointCompletion {
  pointId: string;
  completedAt: string;
  completedBy?: string;
  value?: number | string; // Can be numeric value or 'SAT'/'UNSAT'
  notes?: string;
}

// Field definitions for super admin configuration
export interface FieldDefinitions {
  buildings: string[];
  floors: string[];
  rooms: string[];
  components: string[];
  readingTypes: string[]; // Changed from ReadingType[] to string[]
  units: Record<string, string[]>; // Changed from Record<ReadingType, string[]> to Record<string, string[]>
}

export interface SystemConfiguration {
  id: string;
  fieldDefinitions: FieldDefinitions;
  createdAt: string;
  updatedAt: string;
}

// Default field definitions
export const DEFAULT_FIELD_DEFINITIONS: FieldDefinitions = {
  buildings: ['Building A', 'Building B', 'Building C'],
  floors: ['GF', '1', '2', '3', '4', '5', 'Basement', 'Roof'],
  rooms: ['101', '102', '103', 'Lobby', 'Office', 'Conference Room', 'Storage', 'Mechanical Room'],
  components: ['HVAC System', 'Electrical Panel', 'Water System', 'Lighting System', 'Security System'],
  readingTypes: [...BASE_READING_TYPES], // Start with base types, allow additions
  units: {
    temperature: ['°C', '°F', 'K'],
    humidity: ['%', 'g/kg'],
    energy: ['kWh', 'MWh', 'BTU', 'kJ'],
    water: ['L', 'gal', 'm³', 'ft³'],
    gas: ['m³', 'ft³', 'L', 'gal'],
    occupancy: ['people', 'count'],
    air_quality: ['ppm', 'µg/m³', 'AQI'],
    lighting: ['lux', 'lm', 'cd/m²']
  }
};

// Review system types
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export interface ReviewSubmission {
  id: string;
  submittedBy: string; // User ID who submitted
  submittedAt: string;
  listId?: string; // If submitted from a reading point list
  listName?: string; // Name of the list used
  readings: BuildingReading[];
  status: ReviewStatus;
  reviewedBy?: string; // User ID who reviewed
  reviewerName?: string; // Name of the reviewer for display
  reviewedAt?: string;
  reviewComments?: string;
  submissionNotes?: string; // Notes from the submitter
}

export interface ReviewAction {
  action: 'approve' | 'reject' | 'request_revision';
  comments?: string;
  reviewedBy: string;
}

// Email notification types
export interface EmailConfig {
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  notifyOnSubmission: boolean;
  notifyOnApproval: boolean;
  notifyOnRejection: boolean;
  notifyOnRevisionRequest: boolean;
}

export interface NotificationPreferences {
  email: EmailNotificationSettings;
}