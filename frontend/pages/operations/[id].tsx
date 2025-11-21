import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import OperationMap from '@/components/OperationMap';
import PaxList from '@/components/PaxList';
import { 
  getOperation, 
  getPaxByOperation, 
  startOperation, 
  completeOperation,
  checkinPax 
} from '@/lib/api';
import { initializeSocket, joinOperation, leaveOperation, getSocket } from '@/lib/socket';
import { Operation, Pax, Vehicle, User, VehiclePosition } from '@/lib/types';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Car, 
  MapPin, 
  Play, 
  CheckCircle,
  RefreshCw 
} from 'lucide-react';

export default function OperationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [operation, setOperation] = useState<Operation | null>(null);
  const [paxList, setPaxList] = useState<Pax[]>([]);
  const [vehiclePosition, setVehiclePosition] = useState<VehiclePosition | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (id) {
      loadOperationData();
      setupWebSocket();
    }

    return () => {
      if (id) {
        leaveOperation(id as string);
      }
    };
  }, [id]);

  const loadOperationData = async () => {
    try {
      setIsLoading(true);
      const [opData, paxData] = await Promise.all([
        getOperation(id as string),
        getPaxByOperation(id as string),
      ]);

      setOperation(opData);
      setPaxList(paxData);

      // Set initial vehicle position if available
      const vehicle = opData.vehicleId as Vehicle;
      if (vehicle.lastPing) {
        setVehiclePosition({
          vehicleId: vehicle._id,
          lat: vehicle.lastPing.lat,
          lng: vehicle.lastPing.lng,
          heading: vehicle.lastPing.heading,
          speed: vehicle.lastPing.speed,
          timestamp: vehicle.lastPing.timestamp,
        });
      }
    } catch (error: any) {
      console.error('Error loading operation:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = initializeSocket(token);
    
    socket.on('connect', () => {
      joinOperation(id as string);
    });

    // Listen for vehicle position updates
    socket.on('operation:vehicle_position', (data: any) => {
      setVehiclePosition({
        vehicleId: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
        timestamp: data.timestamp,
      });
    });

    // Listen for pax check-in updates
    socket.on('pax:checkin', (data: any) => {
      // Reload pax data
      getPaxByOperation(id as string).then(setPaxList);
      
      // Update operation checked-in count
      if (operation) {
        setOperation({
          ...operation,
          checkedInCount: data.checkedInCount,
        });
      }
    });

    // Listen for operation status changes
    socket.on('operation:status_change', (data: any) => {
      if (operation) {
        setOperation({
          ...operation,
          status: data.status,
        });
      }
    });
  };

  const handleStartOperation = async () => {
    if (!operation) return;
    
    setIsStarting(true);
    try {
      const updated = await startOperation(operation._id);
      setOperation(updated);
    } catch (error) {
      console.error('Error starting operation:', error);
      alert('Failed to start operation');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteOperation = async () => {
    if (!operation) return;
    
    if (!confirm('Are you sure you want to complete this operation?')) {
      return;
    }

    setIsCompleting(true);
    try {
      const updated = await completeOperation(operation._id);
      setOperation(updated);
    } catch (error) {
      console.error('Error completing operation:', error);
      alert('Failed to complete operation');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCheckin = async (paxId: string) => {
    setIsCheckingIn(true);
    try {
      await checkinPax(paxId, {
        method: 'manual',
        gps: {
          lat: 13.750,
          lng: 100.491,
        },
      });
      
      // Reload pax data
      const updatedPax = await getPaxByOperation(id as string);
      setPaxList(updatedPax);
      
      // Update operation
      const updatedOp = await getOperation(id as string);
      setOperation(updatedOp);
    } catch (error) {
      console.error('Error checking in pax:', error);
      alert('Failed to check in passenger');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading || !operation) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  const vehicle = operation.vehicleId as Vehicle;
  const guide = operation.guideId as User;
  const driver = operation.driverId as User;

  const statusColors = {
    planned: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{operation.tourName}</h1>
              <p className="text-gray-600 font-mono">{operation.code}</p>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${statusColors[operation.status]}`}>
                {operation.status.toUpperCase()}
              </span>

              {operation.status === 'planned' && (
                <button
                  onClick={handleStartOperation}
                  disabled={isStarting}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Play size={18} />
                  <span>{isStarting ? 'Starting...' : 'Start Operation'}</span>
                </button>
              )}

              {operation.status === 'active' && (
                <button
                  onClick={handleCompleteOperation}
                  disabled={isCompleting}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  <span>{isCompleting ? 'Completing...' : 'Complete Operation'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center text-gray-600 mb-2">
              <Clock size={18} className="mr-2" />
              <span className="text-sm font-medium">Schedule</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {format(new Date(operation.date), 'MMM dd, yyyy')}
            </p>
            <p className="text-sm text-gray-600">{operation.startTime}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center text-gray-600 mb-2">
              <Car size={18} className="mr-2" />
              <span className="text-sm font-medium">Vehicle</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{vehicle.plate}</p>
            <p className="text-sm text-gray-600">{vehicle.vehicleModel}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center text-gray-600 mb-2">
              <Users size={18} className="mr-2" />
              <span className="text-sm font-medium">Team</span>
            </div>
            <p className="text-sm text-gray-900 font-medium">Guide: {guide.name}</p>
            <p className="text-sm text-gray-600">Driver: {driver.name}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center text-gray-600 mb-2">
              <CheckCircle size={18} className="mr-2" />
              <span className="text-sm font-medium">Check-in</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {operation.checkedInCount} / {operation.totalPax}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${operation.totalPax > 0 ? (operation.checkedInCount / operation.totalPax) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Tracking</h2>
          <OperationMap
            operation={operation}
            paxList={paxList}
            vehiclePosition={vehiclePosition}
          />
        </div>

        {/* Passenger Manifest */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Passenger Manifest</h2>
            <button
              onClick={loadOperationData}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
          <PaxList
            paxList={paxList}
            onCheckin={handleCheckin}
            isLoading={isCheckingIn}
          />
        </div>
      </div>
    </Layout>
  );
}

