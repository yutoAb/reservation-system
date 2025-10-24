export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  capacity: number;
}

export interface Reservation {
  id: number;
  user_id: number;
  time_slot_id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface CreateReservation {
  time_slot_id: number;
  notes?: string;
}

export interface CreateTimeSlot {
  start_time: string;
  end_time: string;
  capacity: number;
}
