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
  value: number;
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
  value: number;
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
  isActive: boolean;
  createdAt: string;
}

export interface ReadingPointList {
  id: string;
  name: string;
  description?: string;
  pointIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BulkReadingEntry {
  pointId: string;
  value: number;
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
