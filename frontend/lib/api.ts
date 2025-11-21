import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (data: any) => {
  const response = await api.post('/auth/register', data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null; // Server-side check
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Operations
export const getOperations = async (params?: { date?: string; status?: string }) => {
  const response = await api.get('/operations', { params });
  return response.data;
};

export const getOperation = async (id: string) => {
  const response = await api.get(`/operations/${id}`);
  return response.data;
};

export const createOperation = async (data: any) => {
  const response = await api.post('/operations', data);
  return response.data;
};

export const startOperation = async (id: string) => {
  const response = await api.post(`/operations/${id}/start`);
  return response.data;
};

export const completeOperation = async (id: string) => {
  const response = await api.post(`/operations/${id}/complete`);
  return response.data;
};

export const updateOperation = async (id: string, data: any) => {
  const response = await api.put(`/operations/${id}`, data);
  return response.data;
};

export const deleteOperation = async (id: string) => {
  const response = await api.delete(`/operations/${id}`);
  return response.data;
};

// Pax
export const getPaxByOperation = async (operationId: string) => {
  const response = await api.get(`/pax/operation/${operationId}`);
  return response.data;
};

export const getPax = async (id: string) => {
  const response = await api.get(`/pax/${id}`);
  return response.data;
};

export const createPax = async (data: any) => {
  const response = await api.post('/pax', data);
  return response.data;
};

export const checkinPax = async (id: string, data: any) => {
  const response = await api.post(`/pax/${id}/checkin`, data);
  return response.data;
};

export const updatePax = async (id: string, data: any) => {
  const response = await api.put(`/pax/${id}`, data);
  return response.data;
};

export const deletePax = async (id: string) => {
  const response = await api.delete(`/pax/${id}`);
  return response.data;
};

// Vehicles
export const getVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const getVehicle = async (id: string) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const sendVehicleHeartbeat = async (id: string, data: any) => {
  const response = await api.post(`/vehicles/${id}/heartbeat`, data);
  return response.data;
};

export const getVehicleTelemetry = async (id: string, limit?: number) => {
  const response = await api.get(`/vehicles/${id}/telemetry`, {
    params: { limit },
  });
  return response.data;
};

// Locations
export const getLocations = async () => {
  const response = await api.get('/locations');
  return response.data;
};

export const getLocation = async (id: string) => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

export const createLocation = async (data: any) => {
  const response = await api.post('/locations', data);
  return response.data;
};

export const updateLocation = async (id: string, data: any) => {
  const response = await api.put(`/locations/${id}`, data);
  return response.data;
};

export const deleteLocation = async (id: string) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

// Customers
export const getCustomers = async (locationId?: string) => {
  const response = await api.get('/customers', {
    params: locationId ? { locationId } : {},
  });
  return response.data;
};

export const getCustomer = async (id: string) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: any) => {
  const response = await api.post('/customers', data);
  return response.data;
};

export const updateCustomer = async (id: string, data: any) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

export default api;

