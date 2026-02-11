import React, { useState, useEffect } from 'react';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', phone: '' });

  const loadCompanies = () => {
    const token = localStorage.getItem('token');
    fetch('/api/companies', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCompanies);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', contact_person: '', email: '', phone: '' });
    setShowForm(false);
    loadCompanies();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Firmalar & Acenteler</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Yeni Firma
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Firma Adı"
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
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Kaydet
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map(company => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{company.name}</td>
                <td className="px-6 py-4">{company.contact_person}</td>
                <td className="px-6 py-4">{company.email}</td>
                <td className="px-6 py-4">{company.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
