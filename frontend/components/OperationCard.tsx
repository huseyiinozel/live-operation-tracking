import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, Users, CheckCircle, Car, MapPin } from 'lucide-react';
import { Operation, Vehicle, User } from '@/lib/types';

interface OperationCardProps {
  operation: Operation;
}

export default function OperationCard({ operation }: OperationCardProps) {
  const vehicle = operation.vehicleId as Vehicle;
  const guide = operation.guideId as User;
  const driver = operation.driverId as User;

  const statusColors = {
    planned: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const completionPercentage = operation.totalPax > 0
    ? Math.round((operation.checkedInCount / operation.totalPax) * 100)
    : 0;

  return (
    <Link href={`/operations/${operation._id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{operation.tourName}</h3>
            <p className="text-sm text-gray-500 font-mono">{operation.code}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[operation.status]}`}>
            {operation.status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2" />
            <span>
              {format(new Date(operation.date), 'MMM dd, yyyy')} at {operation.startTime}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Car size={16} className="mr-2" />
            <span>{vehicle?.plate || 'N/A'} - {vehicle?.vehicleModel || 'N/A'}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2" />
            <span>
              Guide: {guide?.name || 'N/A'} | Driver: {driver?.name || 'N/A'}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <CheckCircle size={16} className="mr-2" />
                <span>Check-in Progress</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {operation.checkedInCount} / {operation.totalPax}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

