import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionBanner() {
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/hotel-info', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.trial_ends_at || data.subscription_ends_at) {
          setSubscriptionInfo(data);
        }
      })
      .catch(err => console.error('Subscription info error:', err));
  }, []);

  if (!subscriptionInfo) return null;

  const now = new Date();
  const trialEndsAt = subscriptionInfo.trial_ends_at ? new Date(subscriptionInfo.trial_ends_at) : null;
  const subscriptionEndsAt = subscriptionInfo.subscription_ends_at ? new Date(subscriptionInfo.subscription_ends_at) : null;

  const isTrialActive = trialEndsAt && trialEndsAt > now;
  const isSubscriptionActive = subscriptionEndsAt && subscriptionEndsAt > now;

  if (!isTrialActive && !isSubscriptionActive) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-800 font-semibold">⚠️ Deneme Süreniz Doldu</h3>
            <p className="text-red-700 text-sm mt-1">
              Satış Radar'ı kullanmaya devam etmek için abonelik satın alın.
            </p>
          </div>
          <button 
            onClick={() => navigate('/subscription')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
          >
            Abone Ol - 1.990 TL/yıl
          </button>
        </div>
      </div>
    );
  }

  if (isTrialActive) {
    const daysLeft = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-blue-800 font-semibold">🎯 Ücretsiz Deneme Aktif</h3>
            <p className="text-blue-700 text-sm mt-1">
              {daysLeft} gün ücretsiz deneme hakkınız kaldı. Sonrasında yıllık 1.990 TL (aylık ~165 TL)
            </p>
          </div>
          <button 
            onClick={() => navigate('/subscription')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Şimdi Abone Ol
          </button>
        </div>
      </div>
    );
  }

  if (isSubscriptionActive) {
    const daysLeft = Math.ceil((subscriptionEndsAt - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-800 font-semibold">⏰ Abonelik Yenileme Zamanı</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Aboneliğiniz {daysLeft} gün içinde sona erecek.
              </p>
            </div>
            <button 
              onClick={() => navigate('/subscription')}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 font-semibold"
            >
              Yenile - 1.990 TL/yıl
            </button>
          </div>
        </div>
      );
    }
  }

  return null;
}
