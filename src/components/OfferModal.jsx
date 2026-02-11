import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function OfferModal({ offer, user, onClose, onSave }) {
  const [companies, setCompanies] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [formData, setFormData] = useState({
    company_id: '',
    title: '',
    status: 'sent',
    lost_reason: '',
    price: '',
    amount: '',
    currency: 'TRY',
    check_in_date: '',
    check_out_date: '',
    guest_count: '',
    room_count: '',
    meeting_room: '',
    follow_up_date: ''
  });

  // Yetki kontrolü - Satış Temsilcisi sadece kendi tekliflerini düzenleyebilir
  const canEdit = !offer || 
    user?.role === 'admin' || 
    user?.role === 'manager' || 
    offer.agent_id === user?.id;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/companies', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCompanies);

    if (offer) {
      setFormData({
        company_id: offer.company_id,
        title: offer.title,
        status: offer.status,
        lost_reason: offer.lost_reason || '',
        price: offer.price || '',
        amount: offer.amount,
        currency: offer.currency || 'TRY',
        check_in_date: offer.check_in_date || '',
        check_out_date: offer.check_out_date || '',
        guest_count: offer.guest_count || '',
        room_count: offer.room_count || '',
        meeting_room: offer.meeting_room || '',
        follow_up_date: offer.follow_up_date
      });

      fetch(`/api/offers/${offer.id}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setNotes);
    }
  }, [offer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = offer ? `/api/offers/${offer.id}` : '/api/offers';
    const method = offer ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });

    onSave();
    onClose();
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/offers/${offer.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: newNote })
    });
    setNewNote('');
    const res = await fetch(`/api/offers/${offer.id}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotes(await res.json());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{offer ? 'Teklifi Düzenle' : 'Yeni Teklif'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tür</label>
            <select
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Firma Seçin</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tür</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Örn: Toplantı, Konaklama, Düğün, vb."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Durum</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="sent">Gönderildi</option>
                <option value="waiting">Bekliyor</option>
                <option value="revised">Revize Edildi</option>
                <option value="approved">Onaylandı</option>
                <option value="lost">Kaybedildi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Para Birimi</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="TRY">₺ TRY</option>
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          </div>
          
          {/* Kayıp Sebebi - Sadece status=lost ise göster */}
          {formData.status === 'lost' && (
            <div>
              <label className="block text-sm font-medium mb-1">Kayıp Sebebi</label>
              <select
                value={formData.lost_reason}
                onChange={(e) => setFormData({ ...formData, lost_reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-red-50"
              >
                <option value="">Sebep Seçin</option>
                <option value="Fiyat yüksek">Fiyat yüksek</option>
                <option value="Rakip kazandı">Rakip kazandı</option>
                <option value="Tarih müsait değil">Tarih müsait değil</option>
                <option value="Bütçe yetersiz">Bütçe yetersiz</option>
                <option value="İptal edildi">İptal edildi</option>
                <option value="Yanıt yok">Yanıt yok</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Fiyat</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Örn: 15.000 TL veya 12,500 EUR"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gelir</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Giriş Tarihi</label>
              <input
                type="date"
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Çıkış Tarihi</label>
              <input
                type="date"
                value={formData.check_out_date}
                onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kişi Sayısı</label>
              <input
                type="number"
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Oda Sayısı</label>
              <input
                type="number"
                value={formData.room_count}
                onChange={(e) => setFormData({ ...formData, room_count: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Toplantı Salon</label>
            <input
              type="text"
              value={formData.meeting_room}
              onChange={(e) => setFormData({ ...formData, meeting_room: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Örn: Kristal Salon, Mavi Salon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Takip Tarihi</label>
            <input
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          {!canEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Bu teklifi düzenleme yetkiniz yok. Sadece görüntüleme modundasınız.
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            {canEdit && (
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Kaydet
              </button>
            )}
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">
              {canEdit ? 'İptal' : 'Kapat'}
            </button>
          </div>
        </form>

        {offer && (
          <div className="border-t pt-4">
            <h3 className="font-bold mb-3">Not Geçmişi</h3>
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Not ekleyin..."
                className="w-full px-3 py-2 border rounded-lg mb-2"
                rows="3"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Not Ekle
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notes.map(note => (
                <div key={note.id} className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {note.user_name} - {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
