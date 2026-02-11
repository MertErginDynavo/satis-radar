import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import SubscriptionBanner from './SubscriptionBanner';
import { getRoleIcon, getRoleLabel, getRoleTooltip } from '../utils/roleLabels';

export default function Layout({ user, setUser }) {
  const location = useLocation();
  const [hotelName, setHotelName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/hotel-info', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHotelName(data.name || ''))
      .catch(err => console.error('Hotel name error:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <div className="flex items-center">
                <Logo />
              </div>
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Kontrol Paneli
              </Link>
              {/* Direktör Dashboard - Sadece Admin */}
              {user?.role === 'admin' && (
                <Link
                  to="/director"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/director') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🎯 Direktör Dashboard
                </Link>
              )}
              <Link
                to="/offers"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/offers') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Follow Up
              </Link>
              <Link
                to="/data"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/data') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Data
              </Link>
              {/* Kullanıcılar - Sadece Admin */}
              {user?.role === 'admin' && (
                <Link
                  to="/users"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/users') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Kullanıcılar
                </Link>
              )}
              {/* Raporlar - Admin ve Satış Müdürü */}
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Link
                  to="/reports"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/reports') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Raporlar
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span 
                className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full cursor-help"
                title={getRoleTooltip(user?.role)}
              >
                {getRoleIcon(user?.role)} {getRoleLabel(user?.role)}
              </span>
              <span className="text-sm text-gray-700 font-medium">{hotelName}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SubscriptionBanner />
        <Outlet />
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>© 2024 Satış Radar. Tüm hakları saklıdır.</p>
            <div className="flex space-x-6">
              <a href="/privacy" className="hover:text-gray-900">KVKK & Gizlilik</a>
              <a href="/terms" className="hover:text-gray-900">Kullanım Koşulları</a>
              <a href="/contact" className="hover:text-gray-900">İletişim</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
