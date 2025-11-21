import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import OperationCard from '@/components/OperationCard';
import { getOperations } from '@/lib/api';
import { Operation } from '@/lib/types';
import { Calendar, Activity } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [todayOps, setTodayOps] = useState<Operation[]>([]);
  const [tomorrowOps, setTomorrowOps] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'today' | 'tomorrow'>('today');

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    try {
      setIsLoading(true);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

      const [todayData, tomorrowData] = await Promise.all([
        getOperations({ date: today }),
        getOperations({ date: tomorrow }),
      ]);

      setTodayOps(todayData);
      setTomorrowOps(tomorrowData);
    } catch (error: any) {
      console.error('Error loading operations:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayedOps = activeFilter === 'today' ? todayOps : tomorrowOps;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Live operation tracking and monitoring</p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Operations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{todayOps.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Calendar size={24} className="text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tomorrow's Operations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{tomorrowOps.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Operations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {todayOps.filter(op => op.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Activity size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveFilter('today')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeFilter === 'today'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Today ({todayOps.length})
            </button>
            <button
              onClick={() => setActiveFilter('tomorrow')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeFilter === 'tomorrow'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tomorrow ({tomorrowOps.length})
            </button>
          </div>
        </div>

        {/* Operations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : displayedOps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No operations scheduled</h3>
            <p className="text-gray-600 mb-6">
              There are no operations scheduled for {activeFilter === 'today' ? 'today' : 'tomorrow'}
            </p>
            <button
              onClick={() => router.push('/operations')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              View All Operations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedOps.map((operation) => (
              <OperationCard key={operation._id} operation={operation} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

