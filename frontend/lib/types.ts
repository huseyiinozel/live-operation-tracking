export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ops_manager' | 'driver' | 'guide';
  phone?: string;
}

export interface Location {
  _id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  type: 'hotel' | 'attraction' | 'pickup_point' | 'other';
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  locationId: Location | string;
  notes?: string;
}

export interface Vehicle {
  _id: string;
  plate: string;
  vehicleModel: string;
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance';
  lastPing?: {
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    timestamp: string;
  };
}

export interface Operation {
  _id: string;
  code: string;
  tourName: string;
  date: string;
  startTime: string;
  vehicleId: Vehicle | string;
  driverId: User | string;
  guideId: User | string;
  totalPax: number;
  checkedInCount: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  route?: Array<{ lat: number; lng: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface Pax {
  _id: string;
  paxId: string;
  name: string;
  phone: string;
  pickupPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  seatNo?: string;
  status: 'waiting' | 'checked_in' | 'no_show';
  reservationId: string;
  operationId: Operation | string;
  notes?: string;
  checkinDetails?: {
    method: 'qr' | 'manual';
    gps?: {
      lat: number;
      lng: number;
    };
    photoUrl?: string;
    timestamp: string;
    eventId: string;
  };
}

export interface VehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export interface PaxCheckinEvent {
  paxId: string;
  paxName: string;
  operationId: string;
  checkedInCount: number;
  totalPax: number;
  timestamp: string;
}

export interface OperationStatusEvent {
  operationId: string;
  status: string;
  timestamp: string;
}

