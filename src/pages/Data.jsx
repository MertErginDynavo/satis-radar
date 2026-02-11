import React, { useState, useEffect } from 'react';

export default function Data() {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    contact_person: '', 
    email: '', 
    phone: '',
    type: 'company'
  });

  // Yetki kontrolü
  const canEditCompanies = user?.role === 'admin';

  useEffect(() => {
    // Kullanıcı bilgisini al
    const token = localStorage.getItem('token');
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => console.error('User error:', err));
  }, []);

  const loadData = () => {
    const token = localStorage.getItem('token');
    fetch('/api/companies', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCompanies(data.filter(d => d.type === 'company'));
        setAgencies(data.filter(d => d.type === 'agency'));
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...formData, type: activeTab === 'companies' ? 'company' : 'agency' })
    });
    setFormData({ name: '', contact_person: '', email: '', phone: '', type: 'company' });
    setShowForm(false);
    loadData();
  };

  const toggleEmail = (email) => {
    setSelectedEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const toggleAllEmails = () => {
    const currentEmails = currentData.map(d => d.email).filter(e => e);
    if (selectedEmails.length === currentEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(currentEmails);
    }
  };

  const copyEmails = () => {
    const emailText = selectedEmails.join('; ');
    navigator.clipboard.writeText(emailText).then(() => {
      alert(`${selectedEmails.length} e-posta adresi kopyalandı!`);
    });
  };

  const currentData = activeTab === 'companies' ? companies : agencies;
  const currentLabel = activeTab === 'companies' ? 'Firma' : 'Acente';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Yönetimi</h1>
        <div className="flex space-x-3">
          {selectedEmails.length > 0 && (
            <button
              onClick={copyEmails}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>📋</span>
              <span>{selectedEmails.length} E-posta Kopyala</span>
            </button>
          )}
          {canEditCompanies ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Yeni {currentLabel}
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed" title="Sadece Satış Direktörü ekleyebilir">
              🔒 Yeni {currentLabel}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab('companies'); setSelectedEmails([]); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'companies'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Firmalar ({companies.length})
          </button>
          <button
            onClick={() => { setActiveTab('agencies'); setSelectedEmails([]); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'agencies'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Acentalar ({agencies.length})
          </button>
        </nav>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Yeni {currentLabel} Ekle</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={`${currentLabel} Adı`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="İletişim Kişisi"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="E-posta"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <div className="col-span-2 flex space-x-3">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Kaydet
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedEmails.length === currentData.filter(d => d.email).length && currentData.length > 0}
              onChange={toggleAllEmails}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Mailing için Tümünü Seç</span>
          </label>
          {selectedEmails.length > 0 && (
            <span className="text-sm text-gray-600">{selectedEmails.length} e-posta seçildi</span>
          )}
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">Seç</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{currentLabel} Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {item.email && (
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(item.email)}
                      onChange={() => toggleEmail(item.email)}
                      className="w-4 h-4"
                    />
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4">{item.contact_person}</td>
                <td className="px-6 py-4">{item.email}</td>
                <td className="px-6 py-4">{item.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEmails.length > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Seçili E-posta Adresleri:</h3>
          <p className="text-sm text-gray-700 break-all">{selectedEmails.join('; ')}</p>
        </div>
      )}
    </div>
  );
}
