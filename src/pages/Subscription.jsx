import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [extraUsers, setExtraUsers] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Ödeme formu state
  const [paymentData, setPaymentData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    userPhone: '',
    userAddress: '',
    userCity: 'Istanbul'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/hotel-info', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHotelInfo(data))
      .catch(err => console.error('Hotel info error:', err));
  }, []);

  const basePrice = 1990;
  const extraUserPrice = 350;
  const totalUsers = 4 + extraUsers;
  const totalPrice = basePrice + (extraUsers * extraUserPrice);
  const monthlyEquivalent = Math.round(totalPrice / 12);

  const handleSubscribe = async () => {
    if (!termsAccepted) {
      alert('Lütfen Kullanım Koşulları ve İade Politikası\'nı kabul edin.');
      return;
    }
    
    // Ödeme formunu göster
    setShowPaymentForm(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!paymentData.cardHolderName || !paymentData.cardNumber || !paymentData.expireMonth || 
        !paymentData.expireYear || !paymentData.cvc) {
      alert('Lütfen tüm kart bilgilerini doldurun.');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          packageType: 'yearly',
          extraUsers: extraUsers,
          ...paymentData
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const demoMessage = data.demo ? '\n\n⚠️ DEMO MODE - Gerçek ödeme yapılmadı' : '';
        alert(`🎉 Ödeme başarılı!${demoMessage}\n\nToplam: ${totalPrice.toLocaleString()} TL/yıl\n${totalUsers} kullanıcı\n\nAboneliğiniz aktif edildi.`);
        navigate('/');
      } else {
        alert(`Ödeme başarısız: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Satış Radar - Yıllık Paket</h1>
          <p className="text-xl text-gray-600">Satış takibinizi profesyonelleştirin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-white text-center">
            <div className="mb-4">
              <span className="text-5xl font-bold">{totalPrice.toLocaleString()} TL</span>
              <span className="text-2xl ml-2">/ yıl</span>
            </div>
            <p className="text-xl opacity-90">Aylık sadece ~{monthlyEquivalent} TL</p>
            <div className="mt-6 inline-block bg-white/20 px-6 py-2 rounded-full">
              <span className="text-lg">🎯 {totalUsers} kullanıcı dahil</span>
            </div>
          </div>

          <div className="px-8 py-12">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4">💼 Temel Paket</h2>
              <div className="space-y-2 text-blue-800">
                <p>✓ 1 Otel</p>
                <p>✓ 4 kullanıcı dahil</p>
                <p>✓ 7 gün ücretsiz deneme</p>
                <p className="font-bold text-2xl mt-4">1.990 TL / yıl</p>
              </div>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Ek Kullanıcı</h2>
              <p className="text-gray-700 mb-4">İhtiyacınız kadar kullanıcı ekleyebilirsiniz</p>
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setExtraUsers(Math.max(0, extraUsers - 1))}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  -
                </button>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{extraUsers}</p>
                  <p className="text-sm text-gray-600">ek kullanıcı</p>
                </div>
                <button
                  onClick={() => setExtraUsers(extraUsers + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  +
                </button>
              </div>
              <p className="text-gray-700">
                <span className="font-bold">350 TL / yıl / kişi</span>
                <span className="text-sm text-gray-500 ml-2">(~29 TL/ay)</span>
              </p>
              {extraUsers > 0 && (
                <div className="mt-4 p-4 bg-white rounded border border-gray-300">
                  <p className="text-gray-700">
                    Ek kullanıcı ücreti: <span className="font-bold">{(extraUsers * 350).toLocaleString()} TL</span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Fiyat Özeti</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Temel Paket (4 kullanıcı)</span>
                  <span className="font-semibold">1.990 TL</span>
                </div>
                {extraUsers > 0 && (
                  <div className="flex justify-between text-lg">
                    <span>Ek Kullanıcı ({extraUsers} × 350 TL)</span>
                    <span className="font-semibold">{(extraUsers * 350).toLocaleString()} TL</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-2xl font-bold">
                  <span>Toplam</span>
                  <span className="text-blue-600">{totalPrice.toLocaleString()} TL / yıl</span>
                </div>
                <p className="text-center text-gray-600 text-sm">
                  Toplam {totalUsers} kullanıcı • Aylık ~{monthlyEquivalent} TL
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Paket İçeriği</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <span className="text-green-600 text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Akıllı Follow-Up Sistemi</h3>
                  <p className="text-gray-600">Geciken ve yaklaşan takipleri otomatik göster</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Firma & Acenta Data</h3>
                  <p className="text-gray-600">Müşteri veritabanınızı organize edin</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Mailing Listesi</h3>
                  <p className="text-gray-600">Toplu e-posta gönderimi için liste oluşturun</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Dashboard & Raporlama</h3>
                  <p className="text-gray-600">Satış performansınızı anlık takip edin</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">4 Kullanıcı Dahil</h3>
                  <p className="text-gray-600">Ek kullanıcı başına +350 TL/yıl</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-green-900 mb-2">💚 Risk Yok Garantisi</h3>
              <p className="text-green-800">
                7 gün ücretsiz dene. Kredi kartı gerekmez.<br />
                Beğenmezsen hiçbir şey ödemeden çık.
              </p>
            </div>

            {/* Kullanım Koşulları Onay Checkbox */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 mr-3 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 leading-relaxed">
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline font-semibold">Kullanım Koşulları</a>'nı ve{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline font-semibold">İade Politikası</a>'nı okudum, kabul ediyorum. 
                  Abonelik ücretlerinin iade edilmediğini biliyorum.
                </span>
              </label>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading || !termsAccepted}
              className={`w-full py-4 rounded-lg text-xl font-bold transition-colors ${
                termsAccepted && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'İşleniyor...' : `🎯 Ödemeye Geç - ${totalPrice.toLocaleString()} TL/yıl`}
            </button>

            {!termsAccepted && (
              <p className="text-center text-red-600 text-sm mt-2">
                ⚠️ Devam etmek için kullanım koşullarını kabul etmelisiniz
              </p>
            )}

            <p className="text-center text-gray-500 text-sm mt-4">
              Güvenli ödeme. İstediğiniz zaman iptal edebilirsiniz.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>

      {/* Ödeme Formu Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">💳 Ödeme Bilgileri</h2>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  value={paymentData.cardHolderName}
                  onChange={(e) => setPaymentData({...paymentData, cardHolderName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="AHMET YILMAZ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kart Numarası</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (value.length <= 16 && /^\d*$/.test(value)) {
                      setPaymentData({...paymentData, cardNumber: value});
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="1234 5678 9012 3456"
                  maxLength="16"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ay</label>
                  <input
                    type="text"
                    value={paymentData.expireMonth}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 2 && /^\d*$/.test(value) && (value === '' || parseInt(value) <= 12)) {
                        setPaymentData({...paymentData, expireMonth: value});
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="MM"
                    maxLength="2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Yıl</label>
                  <input
                    type="text"
                    value={paymentData.expireYear}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 4 && /^\d*$/.test(value)) {
                        setPaymentData({...paymentData, expireYear: value});
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="YYYY"
                    maxLength="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvc}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 3 && /^\d*$/.test(value)) {
                        setPaymentData({...paymentData, cvc: value});
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="tel"
                  value={paymentData.userPhone}
                  onChange={(e) => setPaymentData({...paymentData, userPhone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="+90 555 123 4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adres</label>
                <textarea
                  value={paymentData.userAddress}
                  onChange={(e) => setPaymentData({...paymentData, userAddress: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Fatura adresi"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Şehir</label>
                <input
                  type="text"
                  value={paymentData.userCity}
                  onChange={(e) => setPaymentData({...paymentData, userCity: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Istanbul"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold">Ödenecek Tutar</p>
                <p className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString()} TL</p>
                <p className="text-xs text-blue-700 mt-1">KDV Dahil • Yıllık Ödeme</p>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300"
                >
                  {loading ? 'İşleniyor...' : '💳 Ödemeyi Tamamla'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-300 py-3 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
                >
                  İptal
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Ödeme bilgileriniz güvenli bir şekilde işlenir
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
