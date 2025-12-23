/**
 * Interface Reservation - Coincide con el modelo Laravel
 */
export interface Reservation {
  id: number;
  user_id: number;
  space_id: number;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Relaciones
  user?: User;
  space?: Space;
}

export interface ReservationPayload {
  space_id: number;
  start_time: string;
  end_time: string;
  notes?: string;
}

import { Space } from './space.interface';
import { User } from './user.interface';
