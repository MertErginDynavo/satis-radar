# 🎯 Satış Radar - Hotel Sales Follow-up SaaS

Otel satış ekipleri için geliştirilmiş, teklif ve follow-up yönetim platformu.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/satis-radar)

## ✨ Özellikler

### 🔐 Kullanıcı Yönetimi
- 3 seviyeli rol sistemi: Satış Direktörü (Admin), Satış Müdürü (Manager), Satış Temsilcisi (Sales)
- İlk kayıt olan kullanıcı otomatik olarak Satış Direktörü olur
- Kullanıcı ekleme, düzenleme, silme ve aktif/pasif yapma
- Rol bazlı yetkilendirme ve veri erişim kontrolü
- JWT tabanlı güvenli kimlik doğrulama
- Şifre sıfırlama ve değiştirme

### 🏢 Multi-tenant Mimari
- Otel bazlı veri izolasyonu
- Her otel kendi verilerine erişir
- Oteller arası veri sızıntısı önleme
- Hotel_id bazlı tüm sorgular

### 📊 Teklif Yönetimi (Follow Up)
- 5 durum: Gönderildi, Bekliyor, Revize Edildi, Onaylandı, Kaybedildi
- Kayıp sebep analizi (7 farklı sebep)
- Otomatik onay tarihi kaydı
- Excel/CSV export (UTF-8 BOM ile Türkçe karakter desteği)
- Not geçmişi ve timeline
- Gecikmiş follow-up uyarıları
- Para birimi desteği (TRY, EUR, USD)

### 📈 Dashboard & Raporlama
- **Satış Temsilcisi Dashboard**: Kişisel takip listesi, geciken ve bugünkü follow-up'lar
- **Satış Direktörü Dashboard**: 
  - KPI kartları (Pipeline, Gelir, Win Rate, Geciken, Ort. Kapanma)
  - Pipeline dağılımı grafiği
  - Follow-up disiplin skoru
  - Aylık gelir trendi
  - Temsilci performans tablosu
  - Kayıp sebep analizi
- **Raporlar**: Haftalık, aylık, yıllık raporlar
  - Durum dağılımı
  - Para birimi bazında gelir
  - Temsilci performansı
  - En başarılı firmalar
  - Misafir ve oda istatistikleri

### 💰 Ödeme Sistemi
- iyzico entegrasyonu
- Yıllık abonelik: 1.990 TL + KDV (4 kullanıcı dahil)
- Ek kullanıcı: 350 TL/yıl + KDV
- 7 gün ücretsiz deneme
- Demo mode (test için)
- Ödeme geçmişi

### 📧 E-posta Entegrasyonu
- SMTP ile e-posta gönderimi
- 5 farklı e-posta şablonu:
  - Hoş geldiniz
  - Kullanıcı daveti
  - Deneme süresi bitiyor (24 saat önce)
  - Deneme süresi bitti
  - Şifre sıfırlama
- Günlük otomatik kontroller (scheduler)
- Demo mode (SMTP olmadan test)

### 🔒 Güvenlik
- Rate limiting (genel, login, register, payment, email)
- JWT_SECRET environment variable
- CORS yapılandırması
- Şifre hashleme (bcrypt)
- Aktif kullanıcı kontrolü
- Password reset token sistemi

### 📱 Data Yönetimi
- Firma ve acente yönetimi
- Toplu e-posta seçimi ve kopyalama
- Mailing list oluşturma

### 📄 Yasal Sayfalar
- İletişim (form + bilgiler)
- KVKK Aydınlatma Metni
- Gizlilik Politikası
- Kullanım Koşulları
- Fatura & İade Şartları

## 🛠️ Teknoloji Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite (sql.js)
- **Authentication**: JWT + bcrypt
- **Charts**: Recharts
- **Date**: date-fns
- **Email**: Nodemailer
- **Payment**: iyzipay
- **Security**: express-rate-limit

## 📦 Kurulum

```bash
npm install
```

## 🚀 Çalıştırma

```bash
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## 🌐 Vercel'e Deploy

### Hızlı Deploy:
1. GitHub'a push edin
2. [Vercel](https://vercel.com)'e import edin
3. Environment variables ekleyin
4. Deploy edin!

Detaylı rehber: [DEPLOYMENT.md](./DEPLOYMENT.md) | Hızlı başlangıç: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

**⚠️ Önemli**: Production için SQLite yerine PostgreSQL kullanın (Supabase, Neon, PlanetScale)

## 🔑 Test Kullanıcıları

İlk kayıt olan kullanıcı otomatik olarak **Satış Direktörü** (Admin) olur.

Demo kullanıcı:
- Email: demo@satisradar.com
- Şifre: demo123

## 📁 Proje Yapısı

```
├── server/
│   ├── routes/              # API endpoints
│   │   ├── auth.js          # Kimlik doğrulama
│   │   ├── users.js         # Kullanıcı yönetimi
│   │   ├── companies.js     # Firma/acente
│   │   ├── offers.js        # Teklif yönetimi
│   │   ├── dashboard.js     # Dashboard stats
│   │   ├── director.js      # Direktör dashboard
│   │   ├── reports.js       # Raporlar
│   │   └── payment.js       # Ödeme sistemi
│   ├── middleware/
│   │   ├── auth.js          # JWT middleware
│   │   ├── permissions.js   # Rol kontrolü
│   │   └── rateLimiter.js   # Rate limiting
│   ├── services/
│   │   ├── emailService.js  # E-posta servisi
│   │   └── paymentService.js # Ödeme servisi
│   ├── jobs/
│   │   └── trialReminder.js # Deneme hatırlatıcı
│   ├── database.js          # Database setup
│   ├── scheduler.js         # Cron jobs
│   ├── seed.js              # Test verisi
│   └── index.js             # Server entry
├── src/
│   ├── components/
│   │   ├── Layout.jsx       # Ana layout
│   │   ├── Logo.jsx         # Logo
│   │   ├── OfferModal.jsx   # Teklif modal
│   │   └── SubscriptionBanner.jsx # Abonelik banner
│   ├── pages/
│   │   ├── Login.jsx        # Giriş
│   │   ├── Dashboard.jsx    # Temsilci dashboard
│   │   ├── DirectorDashboard.jsx # Direktör dashboard
│   │   ├── Offers.jsx       # Follow-up listesi
│   │   ├── Companies.jsx    # Firma yönetimi
│   │   ├── Users.jsx        # Kullanıcı yönetimi
│   │   ├── Reports.jsx      # Raporlar
│   │   ├── Data.jsx         # Data yönetimi
│   │   ├── Subscription.jsx # Abonelik & ödeme
│   │   ├── Contact.jsx      # İletişim
│   │   ├── Privacy.jsx      # KVKK & Gizlilik
│   │   └── Terms.jsx        # Kullanım koşulları
│   ├── utils/
│   │   └── roleLabels.js    # Rol etiketleri
│   ├── App.jsx              # Ana uygulama
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
├── .env.example             # Örnek env dosyası
├── EMAIL_SETUP.md           # E-posta kurulum
├── PAYMENT_SETUP.md         # Ödeme kurulum
├── SECURITY.md              # Güvenlik dokümantasyonu
├── MULTI_TENANT.md          # Multi-tenant dokümantasyonu
└── package.json
```

## ⚙️ Environment Variables

`.env` dosyası oluşturun:

```env
# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# SMTP Email Configuration (optional - demo mode if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Satış Radar <noreply@satisradar.com>

# iyzico Payment Configuration (optional - demo mode if not set)
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

## 🎨 Rol Matrisi

| Özellik | Satış Direktörü | Satış Müdürü | Satış Temsilcisi |
|---------|----------------|--------------|------------------|
| Kullanıcı Ekle/Düzenle/Sil | ✅ | ❌ | ❌ |
| Tüm Teklifleri Görüntüle | ✅ | ✅ | Sadece Kendi |
| Tüm Teklifleri Düzenle | ✅ | ✅ | Sadece Kendi |
| Teklif Sil | ✅ | ❌ | ❌ |
| Firma Ekle/Düzenle | ✅ | ❌ | ❌ |
| Raporlar | ✅ | ✅ | ❌ |
| Direktör Dashboard | ✅ | ❌ | ❌ |
| Ödeme Yönetimi | ✅ | ❌ | ❌ |

## 📊 Veritabanı Tabloları

- **hotels**: Otel bilgileri
- **users**: Kullanıcılar (hotel_id ile bağlı)
- **companies**: Firma/acenteler (hotel_id ile bağlı)
- **offers**: Teklifler (hotel_id ile bağlı)
- **notes**: Teklif notları
- **payments**: Ödeme kayıtları
- **password_resets**: Şifre sıfırlama token'ları

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Kullanıcı bilgisi
- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
- `POST /api/auth/reset-password` - Şifre sıfırlama
- `POST /api/auth/change-password` - Şifre değiştirme

### Users
- `GET /api/users` - Kullanıcı listesi
- `POST /api/users` - Kullanıcı ekle (Admin)
- `PUT /api/users/:id` - Kullanıcı düzenle (Admin)
- `DELETE /api/users/:id` - Kullanıcı sil (Admin)
- `PATCH /api/users/:id/status` - Aktif/pasif (Admin)

### Companies
- `GET /api/companies` - Firma listesi
- `POST /api/companies` - Firma ekle (Admin)

### Offers
- `GET /api/offers` - Teklif listesi
- `POST /api/offers` - Teklif ekle
- `PUT /api/offers/:id` - Teklif güncelle
- `DELETE /api/offers/:id` - Teklif sil (Admin)
- `GET /api/offers/:id/notes` - Notlar
- `POST /api/offers/:id/notes` - Not ekle
- `GET /api/offers/export/csv` - Excel export

### Dashboard
- `GET /api/dashboard/stats` - Dashboard istatistikleri
- `GET /api/dashboard/director/kpi` - KPI özeti (Admin)
- `GET /api/dashboard/director/pipeline` - Pipeline (Admin)
- `GET /api/dashboard/director/revenue` - Gelir trendi (Admin)
- `GET /api/dashboard/director/agents` - Temsilci performansı (Admin)
- `GET /api/dashboard/director/lost-reasons` - Kayıp analizi (Admin)
- `GET /api/dashboard/director/followup-discipline` - Disiplin skoru (Admin)

### Reports
- `GET /api/reports/weekly` - Haftalık rapor (Manager+)
- `GET /api/reports/monthly` - Aylık rapor (Manager+)
- `GET /api/reports/yearly` - Yıllık rapor (Manager+)

### Payment
- `POST /api/payment/create-subscription` - Abonelik oluştur (Admin)
- `GET /api/payment/history` - Ödeme geçmişi (Admin)
- `POST /api/payment/calculate` - Fiyat hesapla (Admin)

## 🚀 Gelecek Özellikler

- [ ] Takvim görünümü
- [ ] Mobil uygulama
- [ ] WhatsApp entegrasyonu
- [ ] Otomatik teklif oluşturma (AI)
- [ ] Gelişmiş analitik
- [ ] CRM entegrasyonu
- [ ] Çoklu dil desteği

## 📝 Lisans

Proprietary - Tüm hakları saklıdır.

## 📞 Destek

- E-posta: destek@satisradar.com
- Telefon: +90 (212) 909 16 73
- Adres: Merkez Mah. Ayazma Cad. Papirüs Plaza No: 37/149 Kağıthane / İstanbul
