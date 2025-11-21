import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import OperationCard from '@/components/OperationCard';
import { getOperations } from '@/lib/api';
import { Operation } from '@/lib/types';
import { Plus, Filter } from 'lucide-react';

export default function OperationsPage() {
  const router = useRouter();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOperations();
  }, [statusFilter]);

  const loadOperations = async () => {
    try {
      setIsLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await getOperations(params);
      setOperations(data);
    } catch (error: any) {
      console.error('Error loading operations:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Operations</h1>
            <p className="text-gray-600">Manage and monitor all tour operations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter size={20} className="text-gray-500" />
            <div className="flex space-x-2">
              {['all', 'planned', 'active', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Operations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : operations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No operations found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all'
                ? `No operations with status "${statusFilter}"`
                : 'No operations have been created yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {operations.map((operation) => (
              <OperationCard key={operation._id} operation={operation} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

