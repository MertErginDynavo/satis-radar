# 🏨 Multi-Tenant İzolasyon Rehberi

## Genel Bakış

Satış Radar, **multi-tenant SaaS** mimarisi ile geliştirilmiştir. Her otel kendi verilerine erişebilir, diğer otellerin verilerini göremez.

## Multi-Tenant Nedir?

Multi-tenant (çok kiracılı) mimari, tek bir uygulama instance'ının birden fazla müşteriyi (tenant) servis ettiği bir yazılım mimarisidir.

### Avantajları
- ✅ **Maliyet Etkin** - Tek sunucu, birden fazla müşteri
- ✅ **Kolay Bakım** - Tek kod tabanı, tüm müşteriler için güncelleme
- ✅ **Ölçeklenebilir** - Yeni müşteri eklemek kolay
- ✅ **Veri İzolasyonu** - Her müşteri sadece kendi verilerini görür

### Dezavantajları
- ⚠️ **Güvenlik Riski** - Veri sızıntısı riski (doğru yapılmazsa)
- ⚠️ **Performans** - Bir müşteri tüm kaynakları tüketebilir
- ⚠️ **Özelleştirme** - Müşteri bazlı özelleştirme zor

## Satış Radar'da Multi-Tenant Yapısı

### Tenant Tanımı
- **Tenant = Hotel (Otel)**
- Her otel bir `hotel_id` ile tanımlanır
- Tüm veriler `hotel_id` ile filtrelenir

### Veri Modeli

```
hotels (tenant)
  ├── users (kullanıcılar)
  ├── companies (firmalar)
  ├── offers (teklifler)
  ├── notes (notlar)
  └── payments (ödemeler)
```

### Database Schema

```sql
-- Tenant (Otel)
CREATE TABLE hotels (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  ...
);

-- Kullanıcılar (hotel_id ile bağlı)
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  hotel_id INTEGER NOT NULL,
  ...
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

-- Firmalar (hotel_id ile bağlı)
CREATE TABLE companies (
  id INTEGER PRIMARY KEY,
  hotel_id INTEGER NOT NULL,
  ...
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

-- Teklifler (hotel_id ile bağlı)
CREATE TABLE offers (
  id INTEGER PRIMARY KEY,
  hotel_id INTEGER NOT NULL,
  ...
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);
```

## Veri İzolasyonu Stratejisi

### 1. Query-Level Filtering

Her sorguya `hotel_id` filtresi eklenir:

```javascript
// ❌ Kötü - Tüm firmalar
const companies = db.query('SELECT * FROM companies');

// ✅ İyi - Sadece kendi otelinin firmaları
const hotelId = getUserHotelId(req.user.id);
const companies = db.query(
  'SELECT * FROM companies WHERE hotel_id = ?', 
  [hotelId]
);
```

### 2. Automatic hotel_id Injection

Yeni kayıt eklenirken otomatik `hotel_id` eklenir:

```javascript
// Kullanıcının hotel_id'sini al
const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
const hotelId = users[0].hotel_id;

// Yeni firma ekle (otomatik hotel_id)
db.run(
  'INSERT INTO companies (name, hotel_id) VALUES (?, ?)',
  [name, hotelId]
);
```

### 3. Update/Delete Protection

Güncelleme ve silme işlemlerinde `hotel_id` kontrolü:

```javascript
// ❌ Kötü - Herhangi bir firmayı silebilir
db.run('DELETE FROM companies WHERE id = ?', [companyId]);

// ✅ İyi - Sadece kendi otelinin firmasını silebilir
const hotelId = getUserHotelId(req.user.id);
db.run(
  'DELETE FROM companies WHERE id = ? AND hotel_id = ?', 
  [companyId, hotelId]
);
```

## Uygulanan İzolasyon Kontrolleri

### ✅ Companies (Firmalar)
- **GET** - Sadece kendi otelinin firmaları
- **POST** - Otomatik hotel_id eklenir
- **PUT** - Sadece kendi otelinin firması güncellenebilir
- **DELETE** - Sadece kendi otelinin firması silinebilir

### ✅ Offers (Teklifler)
- **GET** - Sadece kendi otelinin teklifleri (+ rol bazlı filtreleme)
- **POST** - Otomatik hotel_id eklenir
- **PUT** - Sadece kendi otelinin teklifi güncellenebilir
- **DELETE** - Sadece kendi otelinin teklifi silinebilir

### ✅ Notes (Notlar)
- **GET** - Sadece kendi otelinin tekliflerine ait notlar
- **POST** - Sadece kendi otelinin tekliflerine not eklenebilir

### ✅ Dashboard
- **Stats** - Sadece kendi otelinin istatistikleri
- **KPI** - Sadece kendi otelinin KPI'ları

### ✅ Reports
- **All Reports** - Sadece kendi otelinin raporları

### ✅ Users
- **GET** - Sadece kendi otelinin kullanıcıları
- **POST** - Yeni kullanıcı otomatik aynı otele eklenir

### ✅ Payments
- **GET** - Sadece kendi otelinin ödemeleri
- **POST** - Ödeme otomatik kendi oteline kaydedilir

## Güvenlik Kontrol Listesi

### Backend Kontrolleri

- [x] Her endpoint'te `hotel_id` filtresi var
- [x] Yeni kayıtlarda otomatik `hotel_id` ekleniyor
- [x] Güncelleme/silme işlemlerinde `hotel_id` kontrolü yapılıyor
- [x] JOIN sorgularında `hotel_id` filtreleri var
- [x] Aggregate sorgularda `hotel_id` filtreleri var

### Test Senaryoları

#### 1. Veri Sızıntısı Testi
```bash
# Otel A kullanıcısı olarak giriş yap
# Otel B'nin company_id'sini kullanarak GET isteği at
# Sonuç: 404 veya boş array dönmeli
```

#### 2. Cross-Tenant Update Testi
```bash
# Otel A kullanıcısı olarak giriş yap
# Otel B'nin company_id'sini kullanarak PUT isteği at
# Sonuç: 403 veya 404 dönmeli
```

#### 3. Cross-Tenant Delete Testi
```bash
# Otel A kullanıcısı olarak giriş yap
# Otel B'nin company_id'sini kullanarak DELETE isteği at
# Sonuç: 403 veya 404 dönmeli
```

## Helper Functions

### getUserHotelId()
```javascript
function getUserHotelId(userId) {
  const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    throw new Error('User not found');
  }
  return users[0].hotel_id;
}
```

### Middleware: requireSameHotel()
```javascript
export function requireSameHotel(req, res, next) {
  try {
    const hotelId = getUserHotelId(req.user.id);
    req.hotelId = hotelId;
    next();
  } catch (err) {
    res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  }
}
```

Kullanım:
```javascript
router.get('/companies', authenticateToken, requireSameHotel, (req, res) => {
  // req.hotelId kullanılabilir
  const companies = db.query(
    'SELECT * FROM companies WHERE hotel_id = ?', 
    [req.hotelId]
  );
  res.json(companies);
});
```

## Best Practices

### 1. Her Zaman hotel_id Filtrele
```javascript
// ❌ Asla böyle yapma
SELECT * FROM offers WHERE id = ?

// ✅ Her zaman hotel_id ekle
SELECT * FROM offers WHERE id = ? AND hotel_id = ?
```

### 2. JOIN Sorgularında Dikkatli Ol
```javascript
// ❌ Kötü - hotel_id kontrolü yok
SELECT o.*, c.name 
FROM offers o 
JOIN companies c ON o.company_id = c.id 
WHERE o.id = ?

// ✅ İyi - Her tabloda hotel_id kontrolü
SELECT o.*, c.name 
FROM offers o 
JOIN companies c ON o.company_id = c.id 
WHERE o.id = ? 
  AND o.hotel_id = ? 
  AND c.hotel_id = ?
```

### 3. Aggregate Sorgularda Filtrele
```javascript
// ❌ Kötü - Tüm otellerin toplamı
SELECT SUM(amount) FROM offers WHERE status = 'approved'

// ✅ İyi - Sadece kendi otelinin toplamı
SELECT SUM(amount) 
FROM offers 
WHERE status = 'approved' 
  AND hotel_id = ?
```

### 4. Subquery'lerde Dikkatli Ol
```javascript
// ❌ Kötü - Subquery'de hotel_id yok
SELECT * FROM users 
WHERE id IN (
  SELECT agent_id FROM offers WHERE status = 'approved'
)

// ✅ İyi - Subquery'de de hotel_id var
SELECT * FROM users 
WHERE id IN (
  SELECT agent_id FROM offers 
  WHERE status = 'approved' AND hotel_id = ?
) AND hotel_id = ?
```

## Monitoring & Logging

### Veri Sızıntısı Tespiti

```javascript
// Log her hotel_id erişimini
console.log(`User ${userId} accessing hotel ${hotelId} data`);

// Şüpheli aktivite tespiti
if (userHotelId !== requestedHotelId) {
  console.error(`⚠️ SECURITY: User ${userId} tried to access hotel ${requestedHotelId} data`);
  // Alert gönder
}
```

### Audit Log

```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  hotel_id INTEGER,
  action TEXT,
  resource TEXT,
  resource_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Performans Optimizasyonu

### 1. Index Oluştur
```sql
-- hotel_id için index
CREATE INDEX idx_companies_hotel_id ON companies(hotel_id);
CREATE INDEX idx_offers_hotel_id ON offers(hotel_id);
CREATE INDEX idx_users_hotel_id ON users(hotel_id);

-- Composite index (sık kullanılan sorgular için)
CREATE INDEX idx_offers_hotel_status ON offers(hotel_id, status);
CREATE INDEX idx_offers_hotel_agent ON offers(hotel_id, agent_id);
```

### 2. Query Optimization
```javascript
// ❌ Yavaş - N+1 problem
for (const offer of offers) {
  const company = db.query('SELECT * FROM companies WHERE id = ?', [offer.company_id]);
}

// ✅ Hızlı - JOIN kullan
const offers = db.query(`
  SELECT o.*, c.name as company_name 
  FROM offers o 
  JOIN companies c ON o.company_id = c.id 
  WHERE o.hotel_id = ?
`, [hotelId]);
```

## Migration Strategy

### Mevcut Sistemden Multi-Tenant'a Geçiş

1. **hotel_id Kolonları Ekle**
```sql
ALTER TABLE companies ADD COLUMN hotel_id INTEGER;
ALTER TABLE offers ADD COLUMN hotel_id INTEGER;
```

2. **Mevcut Verilere hotel_id Ata**
```sql
UPDATE companies SET hotel_id = 1 WHERE hotel_id IS NULL;
UPDATE offers SET hotel_id = 1 WHERE hotel_id IS NULL;
```

3. **NOT NULL Constraint Ekle**
```sql
-- SQLite'da ALTER COLUMN desteklenmez, tablo yeniden oluşturulmalı
```

4. **Foreign Key Constraint Ekle**
```sql
-- Yeni tabloda foreign key tanımla
```

## Troubleshooting

### "Veri görünmüyor" Sorunu
- hotel_id filtresi doğru mu?
- Kullanıcının hotel_id'si doğru mu?
- JOIN sorgularında tüm tablolarda hotel_id var mı?

### "Başka otelin verisi görünüyor" Sorunu
- ⚠️ KRİTİK GÜVENLİK SORUNU
- Hemen logları kontrol et
- Hangi endpoint'te sorun var?
- hotel_id filtresi eksik mi?

### Performans Sorunu
- Index'ler oluşturuldu mu?
- N+1 query problemi var mı?
- Gereksiz JOIN var mı?

## Destek

Multi-tenant güvenlik sorunu için:
- **Acil:** security@satisradar.com
- **Genel:** destek@satisradar.com

## Kaynaklar

- [Multi-Tenancy Best Practices](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [SaaS Security Checklist](https://www.sqreen.com/checklists/saas-cto-security-checklist)
- [Database Multi-Tenancy Patterns](https://martinfowler.com/articles/multi-tenant-saas.html)
