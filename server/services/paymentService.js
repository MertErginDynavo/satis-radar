// Ödeme servisi - iyzico entegrasyonu
import Iyzipay from 'iyzipay';
import dotenv from 'dotenv';

dotenv.config();

// iyzico client oluştur
let iyzipay = null;

function getIyzipay() {
  if (!iyzipay) {
    iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY || 'sandbox-test-key',
      secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-test-secret',
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });
  }
  return iyzipay;
}

// Demo mode kontrolü
function isDemoMode() {
  return !process.env.IYZICO_API_KEY || process.env.IYZICO_API_KEY === 'sandbox-your-api-key';
}

/**
 * Abonelik ödemesi başlat
 * @param {Object} params - Ödeme parametreleri
 * @returns {Promise<Object>} - Ödeme sonucu
 */
export async function createSubscriptionPayment(params) {
  const {
    hotelId,
    hotelName,
    userEmail,
    userName,
    userPhone,
    userAddress,
    userCity,
    userCountry,
    packageType, // 'yearly' veya 'extra_users'
    extraUsers = 0,
    conversationId
  } = params;

  // Fiyat hesaplama
  let price = 0;
  let itemName = '';
  
  if (packageType === 'yearly') {
    price = 1990; // Yıllık paket: 1.990 TL
    itemName = 'Satış Radar - Yıllık Abonelik (4 kullanıcı dahil)';
  } else if (packageType === 'extra_users') {
    price = extraUsers * 350; // Ek kullanıcı: 350 TL/yıl
    itemName = `Satış Radar - Ek Kullanıcı (${extraUsers} kişi)`;
  }

  const totalPrice = price;
  const kdv = totalPrice * 0.20; // %20 KDV
  const totalWithKdv = totalPrice + kdv;

  // Demo mode - Simüle edilmiş ödeme
  if (isDemoMode()) {
    console.log('💳 DEMO MODE - Ödeme simüle ediliyor:');
    console.log('Tutar:', totalWithKdv.toFixed(2), 'TL');
    console.log('Paket:', itemName);
    
    return {
      success: true,
      demo: true,
      paymentId: `DEMO-${Date.now()}`,
      conversationId,
      price: totalWithKdv.toFixed(2),
      paidPrice: totalWithKdv.toFixed(2),
      currency: 'TRY',
      status: 'success',
      message: 'Demo ödeme başarılı'
    };
  }

  // Gerçek iyzico ödemesi
  try {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId || `SUB-${hotelId}-${Date.now()}`,
      price: totalPrice.toFixed(2),
      paidPrice: totalWithKdv.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: `BASKET-${hotelId}-${Date.now()}`,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      
      // Ödeme kartı bilgileri (frontend'den gelecek)
      paymentCard: {
        cardHolderName: params.cardHolderName,
        cardNumber: params.cardNumber,
        expireMonth: params.expireMonth,
        expireYear: params.expireYear,
        cvc: params.cvc,
        registerCard: '0'
      },
      
      // Alıcı bilgileri
      buyer: {
        id: `BUYER-${hotelId}`,
        name: userName.split(' ')[0] || 'Ad',
        surname: userName.split(' ').slice(1).join(' ') || 'Soyad',
        gsmNumber: userPhone || '+905555555555',
        email: userEmail,
        identityNumber: '11111111111', // TCKN - gerçek uygulamada kullanıcıdan alınmalı
        registrationAddress: userAddress || 'Adres bilgisi',
        ip: params.ip || '85.34.78.112',
        city: userCity || 'Istanbul',
        country: userCountry || 'Turkey',
        zipCode: '34000'
      },
      
      // Teslimat adresi
      shippingAddress: {
        contactName: userName,
        city: userCity || 'Istanbul',
        country: userCountry || 'Turkey',
        address: userAddress || 'Adres bilgisi',
        zipCode: '34000'
      },
      
      // Fatura adresi
      billingAddress: {
        contactName: userName,
        city: userCity || 'Istanbul',
        country: userCountry || 'Turkey',
        address: userAddress || 'Adres bilgisi',
        zipCode: '34000'
      },
      
      // Sepet ürünleri
      basketItems: [
        {
          id: packageType === 'yearly' ? 'YEARLY-SUB' : `EXTRA-USER-${extraUsers}`,
          name: itemName,
          category1: 'Abonelik',
          category2: 'SaaS',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: totalWithKdv.toFixed(2)
        }
      ]
    };

    return new Promise((resolve, reject) => {
      getIyzipay().payment.create(request, (err, result) => {
        if (err) {
          console.error('❌ iyzico ödeme hatası:', err);
          reject({
            success: false,
            error: err.message || 'Ödeme işlemi başarısız'
          });
        } else if (result.status === 'success') {
          console.log('✅ iyzico ödeme başarılı:', result.paymentId);
          resolve({
            success: true,
            demo: false,
            paymentId: result.paymentId,
            conversationId: result.conversationId,
            price: result.price,
            paidPrice: result.paidPrice,
            currency: result.currency,
            status: result.status,
            message: 'Ödeme başarılı'
          });
        } else {
          console.error('❌ iyzico ödeme reddedildi:', result.errorMessage);
          reject({
            success: false,
            error: result.errorMessage || 'Ödeme reddedildi'
          });
        }
      });
    });
  } catch (error) {
    console.error('❌ Ödeme servisi hatası:', error);
    throw {
      success: false,
      error: error.message || 'Ödeme işlemi sırasında hata oluştu'
    };
  }
}

/**
 * Ödeme doğrulama (3D Secure callback için)
 */
export async function verifyPayment(paymentId) {
  if (isDemoMode()) {
    return {
      success: true,
      demo: true,
      verified: true
    };
  }

  try {
    return new Promise((resolve, reject) => {
      getIyzipay().payment.retrieve({ paymentId }, (err, result) => {
        if (err) {
          reject({ success: false, error: err.message });
        } else {
          resolve({
            success: true,
            verified: result.status === 'success',
            result
          });
        }
      });
    });
  } catch (error) {
    throw { success: false, error: error.message };
  }
}

/**
 * İade işlemi
 */
export async function refundPayment(paymentId, price, ip) {
  if (isDemoMode()) {
    console.log('💳 DEMO MODE - İade simüle ediliyor');
    return {
      success: true,
      demo: true,
      message: 'Demo iade başarılı'
    };
  }

  try {
    const request = {
      paymentTransactionId: paymentId,
      price: price.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      ip: ip || '85.34.78.112'
    };

    return new Promise((resolve, reject) => {
      getIyzipay().refund.create(request, (err, result) => {
        if (err) {
          reject({ success: false, error: err.message });
        } else if (result.status === 'success') {
          resolve({
            success: true,
            message: 'İade başarılı'
          });
        } else {
          reject({ success: false, error: result.errorMessage });
        }
      });
    });
  } catch (error) {
    throw { success: false, error: error.message };
  }
}
