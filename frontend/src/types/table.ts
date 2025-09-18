// Types for Table Management System

// Legacy table interface for backward compatibility
export interface Table {
  id: number;
  nome_tavolo: string | null;
  capacita_max: number;
  lato: string | null;
  created_at: string | null;
  user_id?: string; // Add user_id for RLS compliance
}

export interface TableFormData {
  nome_tavolo: string;
  capacita_max: number;
  lato: string;
}

export interface SavedSeatingPlan {
  id: number;
  invitato_id: number;
  tavolo_id: number;
  created_at: string | null;
}

export type TableSide = "sposo" | "sposa" | "centro";

export const TABLE_SIDE_LABELS: Record<TableSide, string> = {
  "sposo": "Lato Sposo",
  "sposa": "Lato Sposa", 
  "centro": "Centro"
};

export interface TableStats {
  total: number;
  totalCapacity: number;
  occupiedSeats: number;
  availableSeats: number;
  bySide: Record<TableSide, number>;
}

// New advanced table system types
export interface AdvancedTable {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square';
  seats: number;
  x: number;
  y: number;
  venue_id?: string;
  user_id: string;
  assignedGuests: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Venue {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: VenueElement[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface VenueElement {
  id: string;
  type: 'dancefloor' | 'stage' | 'bar' | 'entrance' | 'kitchen' | 'bathroom';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface TableAssignment {
  id: string;
  guest_id: string;
  table_id: string;
  seat_number?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TableGuest {
  id: string;
  name: string;
  email?: string;
  category: string;
  dietaryRestrictions?: string;
  tableId?: string;
  seatNumber?: number;
  user_id: string;
}

export interface GuestCategory {
  id: string;
  name: string;
  color?: string;
  user_id: string;
}

export interface TableShape {
  id: string;
  name: string;
  maxSeats: number;
}