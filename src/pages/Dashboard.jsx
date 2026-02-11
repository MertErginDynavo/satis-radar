import React, { useState, useEffect } from 'react';
import { format, isPast, isToday, differenceInDays, addDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Rol kontrolü
  const canViewAllOffers = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setStats)
      .catch(err => console.error('Stats error:', err));

    fetch('/api/offers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const allOffers = Array.isArray(data) ? data : [];
        // Satış Temsilcisi sadece kendi tekliflerini görür
        const filteredOffers = canViewAllOffers 
          ? allOffers 
          : allOffers.filter(o => o.agent_id === user?.id);
        setOffers(filteredOffers);
      })
      .catch(err => console.error('Offers error:', err));
  }, [user, canViewAllOffers]);

  const today = new Date();
  const overdueOffers = Array.isArray(offers) ? offers.filter(o => 
    isPast(parseISO(o.follow_up_date)) && 
    !isToday(parseISO(o.follow_up_date)) && 
    !['approved', 'lost'].includes(o.status)
  ).sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date)) : [];

  const todayOffers = Array.isArray(offers) ? offers.filter(o => 
    isToday(parseISO(o.follow_up_date)) && 
    !['approved', 'lost'].includes(o.status)
  ) : [];

  const upcomingOffers = Array.isArray(offers) ? offers.filter(o => {
    const followUpDate = parseISO(o.follow_up_date);
    const daysUntil = differenceInDays(followUpDate, today);
    return daysUntil > 0 && daysUntil <= 7 && !['approved', 'lost'].includes(o.status);
  }).sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date)) : [];

  const approvedThisMonth = Array.isArray(offers) ? offers.filter(o => 
    o.status === 'approved' && 
    new Date(o.created_at).getMonth() === today.getMonth()
  ).length : 0;

  const getOverdueDays = (date) => {
    return Math.abs(differenceInDays(parseISO(date), today));
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      waiting: 'bg-yellow-100 text-yellow-800',
      revised: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      lost: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100';
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { TRY: '₺', EUR: '€', USD: '$' };
    return symbols[currency] || '₺';
  };

  const handleQuickAction = (offerId, action) => {
    const token = localStorage.getItem('token');
    if (action === 'call') {
      const note = prompt('Arama notu:');
      if (note) {
        fetch(`/api/offers/${offerId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: `📞 Arandı: ${note}` })
        }).then(() => window.location.reload());
      }
    } else if (action === 'note') {
      const note = prompt('Not ekle:');
      if (note) {
        fetch(`/api/offers/${offerId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: note })
        }).then(() => window.location.reload());
      }
    }
  };

  const filteredOffers = filterStatus === 'all' ? offers : offers.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* KPI Cards - Üst Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">🔴 GECİKEN</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{overdueOffers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Acil aksiyon gerekli!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">📅 BUGÜN</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{todayOffers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Bugün yapılacak</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">⏳ YAKLASAN</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{upcomingOffers.length}</p>
              <p className="text-xs text-gray-500 mt-1">7 gün içinde</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">✅ ONAYLANAN</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{approvedThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">Bu ay</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ana Alan - Geciken ve Bugün */}
        <div className="lg:col-span-2 space-y-6">
          {/* GECİKEN FOLLOW-UP'LAR */}
          {overdueOffers.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <h2 className="text-lg font-bold text-red-900 flex items-center">
                  🔴 GECİKEN FOLLOW-UP'LAR
                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">{overdueOffers.length}</span>
                </h2>
                <p className="text-sm text-red-700 mt-1">Öncelikli olarak bunları takip edin!</p>
              </div>
              <div className="divide-y">
                {overdueOffers.map(offer => (
                  <div key={offer.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{offer.company_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(offer.status)}`}>
                            {offer.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{offer.title}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>💰 {getCurrencySymbol(offer.currency)}{offer.amount?.toLocaleString()}</span>
                          <span className="text-red-600 font-semibold">
                            🔴 {getOverdueDays(offer.follow_up_date)} gün gecikti
                          </span>
                          <span>📅 {format(parseISO(offer.follow_up_date), 'dd MMM yyyy', { locale: tr })}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleQuickAction(offer.id, 'call')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          📞 Ara
                        </button>
                        <button
                          onClick={() => handleQuickAction(offer.id, 'note')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          📝 Not
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUGÜN YAPILACAKLAR */}
          {todayOffers.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <h2 className="text-lg font-bold text-blue-900 flex items-center">
                  📅 BUGÜN YAPILACAKLAR
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{todayOffers.length}</span>
                </h2>
              </div>
              <div className="divide-y">
                {todayOffers.map(offer => (
                  <div key={offer.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{offer.company_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(offer.status)}`}>
                            {offer.status}
                          </span>
                          <span className="text-xs text-gray-500">• {offer.title}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>💰 {getCurrencySymbol(offer.currency)}{offer.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleQuickAction(offer.id, 'call')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          📞 Ara
                        </button>
                        <button
                          onClick={() => handleQuickAction(offer.id, 'note')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          📝 Not
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YAKLAŞAN FOLLOW-UP'LAR */}
          {upcomingOffers.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
                <h2 className="text-lg font-bold text-yellow-900 flex items-center">
                  ⏳ YAKLAŞAN (7 Gün İçinde)
                  <span className="ml-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">{upcomingOffers.length}</span>
                </h2>
              </div>
              <div className="divide-y">
                {upcomingOffers.slice(0, 5).map(offer => (
                  <div key={offer.id} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{offer.company_name}</h3>
                        <span className="text-xs text-gray-500">• {offer.title}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-yellow-700">
                        {differenceInDays(parseISO(offer.follow_up_date), today)} gün sonra
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(offer.follow_up_date), 'dd MMM', { locale: tr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Panel - Filtreler ve Özet */}
        <div className="space-y-6">
          {/* Hızlı Filtre */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">🏷️ Hızlı Filtre</h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`w-full text-left px-3 py-2 rounded ${filterStatus === 'all' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Tümü ({offers.length})
              </button>
              <button
                onClick={() => setFilterStatus('waiting')}
                className={`w-full text-left px-3 py-2 rounded ${filterStatus === 'waiting' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Bekliyor ({offers.filter(o => o.status === 'waiting').length})
              </button>
              <button
                onClick={() => setFilterStatus('revised')}
                className={`w-full text-left px-3 py-2 rounded ${filterStatus === 'revised' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Revize ({offers.filter(o => o.status === 'revised').length})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`w-full text-left px-3 py-2 rounded ${filterStatus === 'approved' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Onaylanan ({offers.filter(o => o.status === 'approved').length})
              </button>
            </div>
          </div>

          {/* Aylık Pipeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">📊 Bu Ay</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Teklif</span>
                <span className="font-bold text-gray-900">{stats?.monthlyStats?.reduce((sum, s) => sum + s.count, 0) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bekliyor</span>
                <span className="font-bold text-yellow-600">{stats?.monthlyStats?.find(s => s.status === 'waiting')?.count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Onaylanan</span>
                <span className="font-bold text-green-600">{stats?.monthlyStats?.find(s => s.status === 'approved')?.count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kaybedilen</span>
                <span className="font-bold text-red-600">{stats?.monthlyStats?.find(s => s.status === 'lost')?.count || 0}</span>
              </div>
            </div>
          </div>

          {/* Motivasyon */}
          {overdueOffers.length === 0 && todayOffers.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-4xl mb-2">🎉</p>
              <p className="font-bold text-green-900">Harika İş!</p>
              <p className="text-sm text-green-700 mt-1">Tüm takipler güncel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
