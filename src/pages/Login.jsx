import React, { useState } from 'react';
import Logo from '../components/Logo';

export default function Login({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? { name, email, password, hotel_name: hotelName }
        : { email, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } else {
        setError(data.error || (isRegister ? 'Kayıt başarısız' : 'Giriş başarısız'));
      }
    } catch (err) {
      setError('Sunucu hatası. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center mb-6">
          <Logo className="h-12" />
        </div>
        <div className="flex mb-6 border-b">
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 pb-2 text-sm font-medium ${!isRegister ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 pb-2 text-sm font-medium ${isRegister ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            Kayıt Ol
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Otel Adı</label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Örn: Grand Hotel"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700">
            {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </form>
        {isRegister && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center font-medium">
              🎯 7 gün ücretsiz dene. Kredi kartı gerekmez.<br />
              Beğenmezsen hiçbir şey ödemeden çık.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
