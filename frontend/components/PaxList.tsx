import React from 'react';
import { CheckCircle, X, Clock, MapPin } from 'lucide-react';
import { Pax } from '@/lib/types';

interface PaxListProps {
  paxList: Pax[];
  onCheckin?: (paxId: string) => void;
  isLoading?: boolean;
}

export default function PaxList({ paxList, onCheckin, isLoading }: PaxListProps) {
  const statusIcons = {
    waiting: <Clock size={18} className="text-yellow-500" />,
    checked_in: <CheckCircle size={18} className="text-green-500" />,
    no_show: <X size={18} className="text-red-500" />,
  };

  const statusColors = {
    waiting: 'bg-yellow-50 border-yellow-200',
    checked_in: 'bg-green-50 border-green-200',
    no_show: 'bg-red-50 border-red-200',
  };

  return (
    <div className="space-y-3">
      {paxList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No passengers found
        </div>
      ) : (
        paxList.map((pax) => (
          <div
            key={pax._id}
            className={`border rounded-lg p-4 ${statusColors[pax.status]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {statusIcons[pax.status]}
                  <h4 className="font-semibold text-gray-900">{pax.name}</h4>
                  {pax.seatNo && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-mono">
                      Seat {pax.seatNo}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Phone:</span>
                    <span>{pax.phone}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin size={14} className="mr-2 mt-1 flex-shrink-0" />
                    <span>{pax.pickupPoint.address}</span>
                  </div>

                  {pax.notes && (
                    <div className="text-gray-500 italic">
                      Note: {pax.notes}
                    </div>
                  )}

                  {pax.checkinDetails && (
                    <div className="text-green-600 font-medium mt-2">
                      ✓ Checked in via {pax.checkinDetails.method} at{' '}
                      {new Date(pax.checkinDetails.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>

              {pax.status === 'waiting' && onCheckin && (
                <button
                  onClick={() => onCheckin(pax._id)}
                  disabled={isLoading}
                  className="ml-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check In
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

