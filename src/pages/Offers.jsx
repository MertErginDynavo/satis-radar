import React, { useState, useEffect } from 'react';
import { format, isPast, isToday } from 'date-fns';
import OfferModal from '../components/OfferModal';

export default function Offers({ user }) {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Yetki kontrolleri
  const canDeleteOffer = user?.role === 'admin';
  const canViewAllOffers = user?.role === 'admin' || user?.role === 'manager';
  const canEditAllOffers = user?.role === 'admin' || user?.role === 'manager';

  const loadOffers = () => {
    const token = localStorage.getItem('token');
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
      .catch(err => console.error('Load offers error:', err));
  };

  useEffect(() => {
    loadOffers();
  }, [user, canViewAllOffers]);

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

  const isOverdue = (date, status) => {
    return isPast(new Date(date)) && !isToday(new Date(date)) && !['approved', 'lost'].includes(status);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      TRY: '₺',
      EUR: '€',
      USD: '$'
    };
    return symbols[currency] || '₺';
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    fetch('/api/offers/export/csv', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teklifler-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Export error:', err));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Follow Up</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel İndir
          </button>
          <button
            onClick={() => { setSelectedOffer(null); setShowModal(true); }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Yeni Teklif
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Şirket/Acenta</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Tür</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Durum</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Giriş</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Çıkış</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Kişi</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Oda</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Salon</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Takip</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Temsilci</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Fiyat</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Gelir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map(offer => (
              <tr
                key={offer.id}
                onClick={() => { setSelectedOffer(offer); setShowModal(true); }}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-4 whitespace-nowrap">{offer.company_name}</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap">{offer.title}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(offer.status)}`}>
                    {offer.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap">
                  {offer.check_in_date ? format(new Date(offer.check_in_date), 'dd.MM.yy') : '-'}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap">
                  {offer.check_out_date ? format(new Date(offer.check_out_date), 'dd.MM.yy') : '-'}
                </td>
                <td className="px-3 py-4 text-center whitespace-nowrap">{offer.guest_count || '-'}</td>
                <td className="px-3 py-4 text-center whitespace-nowrap">{offer.room_count || '-'}</td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  {offer.meeting_room || '-'}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap">
                  <span className={isOverdue(offer.follow_up_date, offer.status) ? 'text-red-600 font-medium' : ''}>
                    {format(new Date(offer.follow_up_date), 'dd.MM.yy')}
                    {isOverdue(offer.follow_up_date, offer.status) && ' ⚠️'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{offer.agent_name}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {offer.price || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getCurrencySymbol(offer.currency)}{offer.amount?.toLocaleString() || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <OfferModal
          offer={selectedOffer}
          user={user}
          onClose={() => setShowModal(false)}
          onSave={loadOffers}
        />
      )}
    </div>
  );
}
