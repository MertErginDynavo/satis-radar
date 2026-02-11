# 💳 Ödeme Sistemi Kurulum Rehberi

## Genel Bakış

Satış Radar, **iyzico** ödeme gateway'i ile entegre edilmiştir. Türkiye'nin en popüler ödeme altyapısı ile güvenli ödeme alın.

## Özellikler

✅ **Yıllık Abonelik Ödemesi** (1.990 TL + KDV)
✅ **Ek Kullanıcı Ödemesi** (350 TL/yıl/kişi + KDV)
✅ **Ödeme Geçmişi** (Admin panelinde)
✅ **Demo Mode** (Test için gerçek ödeme yapmadan)
✅ **3D Secure Desteği** (Güvenli ödeme)
✅ **Otomatik Fatura Oluşturma** (Veritabanında kayıt)

## iyzico Kurulumu

### 1. iyzico Hesabı Oluşturun

1. [iyzico.com](https://www.iyzico.com) adresine gidin
2. "Üye Ol" butonuna tıklayın
3. İşletme bilgilerinizi doldurun
4. E-posta doğrulaması yapın

### 2. API Anahtarlarını Alın

1. iyzico Dashboard'a giriş yapın
2. **Ayarlar > API Anahtarları** bölümüne gidin
3. **Sandbox** (test) ve **Production** (canlı) anahtarlarınızı kopyalayın

### 3. .env Dosyasını Yapılandırın

#### Test Ortamı (Sandbox)
```env
IYZICO_API_KEY=sandbox-your-api-key
IYZICO_SECRET_KEY=sandbox-your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

#### Canlı Ortam (Production)
```env
IYZICO_API_KEY=your-production-api-key
IYZICO_SECRET_KEY=your-production-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com
```

## Demo Mode

Eğer iyzico API anahtarları ayarlanmamışsa, sistem **demo mode**'da çalışır:
- Gerçek ödeme yapılmaz
- Ödeme simüle edilir
- Abonelik aktif edilir
- Console'a log yazılır

Bu sayede ödeme entegrasyonunu test edebilirsiniz.

## Test Kartları (Sandbox)

iyzico sandbox ortamında test için kullanabileceğiniz kartlar:

### Başarılı Ödeme
```
Kart Numarası: 5528790000000008
Son Kullanma: 12/2030
CVV: 123
Kart Sahibi: Test User
```

### Başarısız Ödeme (Yetersiz Bakiye)
```
Kart Numarası: 5406670000000009
Son Kullanma: 12/2030
CVV: 123
```

### 3D Secure Test
```
Kart Numarası: 5528790000000008
Son Kullanma: 12/2030
CVV: 123
3D Şifre: (iyzico tarafından sağlanır)
```

## Ödeme Akışı

### 1. Kullanıcı Abonelik Sayfasına Gider
- `/subscription` rotası
- Paket seçimi yapar (yıllık + ek kullanıcı)
- Kullanım koşullarını kabul eder

### 2. Ödeme Formu Doldurulur
- Kart bilgileri
- İletişim bilgileri
- Fatura adresi

### 3. Ödeme İşlenir
- Backend'e POST `/api/payment/create-subscription`
- iyzico API'sine istek gönderilir
- Ödeme sonucu döner

### 4. Başarılı Ödeme
- Veritabanında `payments` tablosuna kayıt
- `hotels` tablosunda abonelik güncellenir
- Kullanıcıya başarı mesajı gösterilir

### 5. Başarısız Ödeme
- Hata mesajı gösterilir
- Veritabanı değişmez
- Kullanıcı tekrar deneyebilir

## API Endpoints

### POST /api/payment/create-subscription
Yeni abonelik ödemesi oluşturur.

**Request Body:**
```json
{
  "packageType": "yearly",
  "extraUsers": 2,
  "cardHolderName": "AHMET YILMAZ",
  "cardNumber": "5528790000000008",
  "expireMonth": "12",
  "expireYear": "2030",
  "cvc": "123",
  "userPhone": "+905551234567",
  "userAddress": "Test Mahallesi, Test Sokak No:1",
  "userCity": "Istanbul"
}
```

**Response (Success):**
```json
{
  "success": true,
  "demo": false,
  "paymentId": "12345678",
  "subscriptionEndsAt": "2027-02-10T10:00:00.000Z",
  "message": "Ödeme başarılı"
}
```

### GET /api/payment/history
Ödeme geçmişini getirir (Admin only).

**Response:**
```json
[
  {
    "id": 1,
    "payment_id": "12345678",
    "amount": 2390.00,
    "currency": "TRY",
    "package_type": "yearly",
    "extra_users": 0,
    "status": "success",
    "payment_date": "2026-02-10T10:00:00.000Z",
    "user_name": "Ahmet Yılmaz"
  }
]
```

### POST /api/payment/calculate
Fiyat hesaplama.

**Request Body:**
```json
{
  "packageType": "yearly",
  "extraUsers": 2
}
```

**Response:**
```json
{
  "itemName": "Yıllık Abonelik (4 kullanıcı dahil)",
  "basePrice": "2690.00",
  "kdv": "538.00",
  "total": "3228.00",
  "currency": "TRY"
}
```

## Veritabanı Şeması

### payments Tablosu
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  payment_id TEXT NOT NULL,
  conversation_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'TRY',
  package_type TEXT NOT NULL CHECK(package_type IN ('yearly', 'extra_users')),
  extra_users INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending', 'refunded')),
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  refund_date DATETIME,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Güvenlik

### PCI DSS Uyumluluğu
- ⚠️ Kart bilgileri asla veritabanına kaydedilmez
- ⚠️ Kart bilgileri sadece iyzico'ya gönderilir
- ✅ HTTPS kullanın (production)
- ✅ SSL sertifikası zorunlu

### Fraud Önleme
- IP adresi kaydedilir
- Kullanıcı bilgileri doğrulanır
- iyzico fraud detection sistemi aktif

## Production Checklist

- [ ] iyzico production API anahtarları ayarlandı
- [ ] HTTPS aktif
- [ ] SSL sertifikası kuruldu
- [ ] .env dosyası güvenli
- [ ] Webhook URL'i ayarlandı (opsiyonel)
- [ ] E-posta bildirimleri test edildi
- [ ] Ödeme geçmişi sayfası test edildi
- [ ] İade politikası sayfası hazır
- [ ] Kullanım koşulları sayfası hazır

## Sorun Giderme

### "Ödeme başarısız" hatası
1. API anahtarlarını kontrol edin
2. Sandbox/Production URL'ini kontrol edin
3. Kart bilgilerini kontrol edin
4. iyzico Dashboard'da logları kontrol edin

### "Connection timeout" hatası
- İnternet bağlantısını kontrol edin
- Firewall ayarlarını kontrol edin
- iyzico servis durumunu kontrol edin

### Demo mode çalışmıyor
- `.env` dosyasında `IYZICO_API_KEY` ayarlanmamış olmalı
- Console loglarını kontrol edin

## İleri Seviye

### Webhook Entegrasyonu
iyzico webhook'ları ile ödeme durumu güncellemelerini otomatik alabilirsiniz.

### Taksit Seçenekleri
iyzico API'si taksit desteği sunar. `installment` parametresini kullanın.

### Abonelik İptali
Kullanıcılar aboneliklerini iptal edebilir. İade politikanıza göre işlem yapın.

### Fatura Oluşturma
Ödeme sonrası otomatik PDF fatura oluşturabilirsiniz.

## Destek

- iyzico Dokümantasyon: https://dev.iyzipay.com
- iyzico Destek: destek@iyzico.com
- Satış Radar Destek: destek@satisradar.com

## Fiyatlandırma

iyzico komisyon oranları:
- Kredi Kartı: %2.9 + 0.25 TL
- Banka Kartı: %1.9 + 0.25 TL

Detaylı fiyatlandırma için iyzico ile iletişime geçin.
