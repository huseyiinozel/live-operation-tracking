import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getLocations, getCustomers } from '@/lib/api';
import { Location, Customer } from '@/lib/types';
import { MapPin, Users } from 'lucide-react';

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [locData, custData] = await Promise.all([
        getLocations(),
        getCustomers(),
      ]);
      setLocations(locData);
      setCustomers(custData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomersForLocation = (locationId: string) => {
    return customers.filter(c => {
      const locId = typeof c.locationId === 'string' ? c.locationId : c.locationId._id;
      return locId === locationId;
    });
  };

  const typeColors = {
    hotel: 'bg-blue-100 text-blue-700',
    attraction: 'bg-purple-100 text-purple-700',
    pickup_point: 'bg-green-100 text-green-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Locations & Customers</h1>
          <p className="text-gray-600">Manage pickup points and customer assignments</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-600">No locations have been created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((location) => {
              const locationCustomers = getCustomersForLocation(location._id);
              
              return (
                <div
                  key={location._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {location.name}
                      </h3>
                      <div className="flex items-start text-sm text-gray-600 mb-2">
                        <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>{location.address || 'No address'}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[location.type]}`}>
                      {location.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4 font-mono">
                    {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                  </div>

                  {/* Customers */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <Users size={16} className="mr-2" />
                      <span>Customers ({locationCustomers.length})</span>
                    </div>

                    {locationCustomers.length === 0 ? (
                      <p className="text-sm text-gray-500">No customers assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {locationCustomers.map((customer) => (
                          <div
                            key={customer._id}
                            className="bg-gray-50 rounded p-3 text-sm"
                          >
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-gray-600">{customer.phone}</p>
                            {customer.email && (
                              <p className="text-gray-500 text-xs">{customer.email}</p>
                            )}
                            {customer.notes && (
                              <p className="text-gray-500 text-xs italic mt-1">
                                Note: {customer.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

