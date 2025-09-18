// Types for Table Management System

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