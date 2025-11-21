import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LogOut, User } from 'lucide-react';
import { logout, getCurrentUser } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Live Operation Tracking
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link 
                href="/"
                className={`text-sm font-medium hover:text-primary-600 transition-colors ${
                  router.pathname === '/' ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/operations"
                className={`text-sm font-medium hover:text-primary-600 transition-colors ${
                  router.pathname.startsWith('/operations') ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                Operations
              </Link>
              <Link 
                href="/locations"
                className={`text-sm font-medium hover:text-primary-600 transition-colors ${
                  router.pathname.startsWith('/locations') ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                Locations
              </Link>
            </nav>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={18} />
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-400">({user.role})</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

