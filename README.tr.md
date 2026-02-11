# Otel Satış Takip Yönetimi

Otel satış takipleri, teklifler ve müşteri ilişkilerini yönetmek için web tabanlı SaaS uygulaması.

## Özellikler

- Kullanıcı kimlik doğrulama (Admin ve Satış Temsilcisi rolleri)
- Firma/Acente yönetimi
- Çoklu durum ile teklif takibi (Gönderildi, Bekliyor, Revize Edildi, Onaylandı, Kaybedildi)
- Gecikme tespiti ile takip tarihi yönetimi
- Her teklif için not geçmişi
- Kontrol paneli:
  - Bugünkü takipler
  - Gecikmiş takipler
  - Aylık satış istatistikleri
- Responsive tasarım
- Temiz B2B arayüz
- Çoklu kullanıcı desteği
- Firma bazlı veri saklama (multi-tenant hazır)

## Teknoloji

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Veritabanı: SQLite (PostgreSQL'e kolayca yükseltilebilir)
- Kimlik Doğrulama: JWT

## Kurulum

```bash
npm install
```

## Uygulamayı Çalıştırma

```bash
npm run dev
```

Bu komut hem backend sunucusunu (port 3001) hem de frontend geliştirme sunucusunu (port 3000) başlatır.

## Varsayılan Giriş

- E-posta: admin@hotel.com
- Şifre: admin123

## Proje Yapısı

```
├── server/
│   ├── routes/          # API endpoint'leri
│   ├── middleware/      # Kimlik doğrulama middleware
│   ├── database.js      # Veritabanı kurulumu
│   └── index.js         # Sunucu giriş noktası
├── src/
│   ├── components/      # React bileşenleri
│   ├── pages/           # Sayfa bileşenleri
│   ├── App.jsx          # Ana uygulama
│   └── main.jsx         # Giriş noktası
└── package.json
```

## Multi-tenant Hazır

Veritabanı yapısı multi-tenant mimarisini destekler. Tenant izolasyonu eklemek için:
1. Tüm tablolara `tenant_id` kolonu ekleyin
2. Tüm sorguları `tenant_id` ile filtreleyin
3. Kimlik doğrulamaya tenant seçimi ekleyin

## Gelecek Geliştirmeler

- Gecikmiş takipler için e-posta bildirimleri
- Rapor dışa aktarma (PDF/Excel)
- Takipler için takvim görünümü
- Mobil uygulama
- Gelişmiş analitik
