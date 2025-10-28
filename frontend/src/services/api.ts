import axios from 'axios';
import type { AuthResponse, LoginCredentials, RegisterData, User, TimeSlot, Reservation, CreateReservation, CreateTimeSlot } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const timeSlotsAPI = {
  getAll: async (startDate?: string, endDate?: string): Promise<TimeSlot[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`/time-slots/?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: number): Promise<TimeSlot> => {
    const response = await api.get(`/time-slots/${id}`);
    return response.data;
  },
  
  create: async (data: CreateTimeSlot): Promise<TimeSlot> => {
    const response = await api.post('/time-slots/', data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/time-slots/${id}`);
  },
};

export const reservationsAPI = {
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/');
    return response.data;
  },
  
  getAllReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/all');
    return response.data;
  },
  
  getById: async (id: number): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },
  
  create: async (data: CreateReservation): Promise<Reservation> => {
    const response = await api.post('/reservations/', data);
    return response.data;
  },
  
  update: async (id: number, data: { status: string; notes?: string }): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}`, data);
    return response.data;
  },
  
  cancel: async (id: number): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },
};

export default api;
