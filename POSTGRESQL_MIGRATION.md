# 🗄️ PostgreSQL Migration Guide

SQLite'dan PostgreSQL'e geçiş rehberi.

## 🎯 Neden PostgreSQL?

- ✅ Vercel serverless fonksiyonları ile uyumlu
- ✅ Production-ready
- ✅ Daha iyi performans
- ✅ Concurrent connections
- ✅ Ücretsiz hosting seçenekleri (Supabase, Neon)

## 📋 Adım 1: PostgreSQL Sağlayıcı Seç

### Seçenek 1: Supabase (Önerilen - Ücretsiz)

1. [supabase.com](https://supabase.com) → Sign up
2. "New Project" → Proje adı ve şifre belirle
3. Database → Connection string'i kopyala

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Seçenek 2: Neon (Serverless PostgreSQL)

1. [neon.tech](https://neon.tech) → Sign up
2. "Create Project"
3. Connection string'i kopyala

### Seçenek 3: Railway

1. [railway.app](https://railway.app) → Sign up
2. "New Project" → "Provision PostgreSQL"
3. Connection string'i kopyala

## 📦 Adım 2: Bağımlılıkları Yükle

```bash
npm install pg
```

## 🔧 Adım 3: Database Dosyasını Güncelle

`server/database.js` dosyasını değiştir:

```javascript
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

let pool;

export async function initDatabase() {
  // PostgreSQL connection
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Test connection
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully');
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
    throw err;
  }

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      included_users INTEGER DEFAULT 4,
      extra_users INTEGER DEFAULT 0,
      trial_ends_at TIMESTAMP,
      subscription_ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'sales' CHECK(role IN ('admin', 'manager', 'sales')),
      hotel_id INTEGER REFERENCES hotels(id),
      active INTEGER DEFAULT 1,
      trial_ends_at TIMESTAMP,
      subscription_ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      type TEXT DEFAULT 'company' CHECK(type IN ('company', 'agency')),
      hotel_id INTEGER NOT NULL REFERENCES hotels(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      agent_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('sent', 'waiting', 'revised', 'approved', 'lost')),
      lost_reason TEXT,
      price TEXT,
      amount DECIMAL(10,2),
      currency TEXT DEFAULT 'TRY' CHECK(currency IN ('TRY', 'EUR', 'USD')),
      check_in_date DATE,
      check_out_date DATE,
      guest_count INTEGER,
      room_count INTEGER,
      meeting_room TEXT,
      follow_up_date DATE NOT NULL,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      offer_id INTEGER NOT NULL REFERENCES offers(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      payment_id TEXT NOT NULL,
      conversation_id TEXT,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'TRY',
      package_type TEXT NOT NULL CHECK(package_type IN ('yearly', 'extra_users')),
      extra_users INTEGER DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending', 'refunded')),
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      refund_date TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_offers_hotel_id ON offers(hotel_id);
    CREATE INDEX IF NOT EXISTS idx_offers_agent_id ON offers(agent_id);
    CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
    CREATE INDEX IF NOT EXISTS idx_users_hotel_id ON users(hotel_id);
    CREATE INDEX IF NOT EXISTS idx_companies_hotel_id ON companies(hotel_id);
  `);

  // Create default admin user if not exists
  const result = await pool.query('SELECT COUNT(*) as count FROM users');
  if (result.rows[0].count === '0') {
    const hashedPassword = bcrypt.hashSync('demo123', 10);
    await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
      ['demo@satisradar.com', hashedPassword, 'Demo Kullanıcı', 'admin']
    );
  }

  console.log('Database initialized successfully');
}

export async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Query error:', err, sql, params);
    return [];
  }
}

export async function run(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return { 
      lastInsertRowid: result.rows[0]?.id || null 
    };
  } catch (err) {
    console.error('Run error:', err, sql, params);
    return { lastInsertRowid: null };
  }
}

export default { query, run };
```

## 🔄 Adım 4: SQL Sorgularını Güncelle

PostgreSQL farklılıkları:

### SQLite → PostgreSQL Değişiklikleri:

1. **AUTO_INCREMENT → SERIAL**
   ```sql
   -- SQLite
   id INTEGER PRIMARY KEY AUTOINCREMENT
   
   -- PostgreSQL
   id SERIAL PRIMARY KEY
   ```

2. **DATETIME → TIMESTAMP**
   ```sql
   -- SQLite
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   
   -- PostgreSQL
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   ```

3. **strftime → to_char**
   ```sql
   -- SQLite
   strftime('%Y-%m', created_at)
   
   -- PostgreSQL
   to_char(created_at, 'YYYY-MM')
   ```

4. **julianday → EXTRACT**
   ```sql
   -- SQLite
   julianday(datetime('now')) - julianday(created_at)
   
   -- PostgreSQL
   EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400
   ```

5. **COALESCE aynı kalır** ✅

6. **Parametre binding**
   ```javascript
   // SQLite
   db.query('SELECT * FROM users WHERE id = ?', [id])
   
   // PostgreSQL
   pool.query('SELECT * FROM users WHERE id = $1', [id])
   ```

## 🔧 Adım 5: Route Dosyalarını Güncelle

Tüm route dosyalarında `?` yerine `$1, $2, $3...` kullan:

```javascript
// Önce
db.query('SELECT * FROM users WHERE id = ?', [id])

// Sonra
db.query('SELECT * FROM users WHERE id = $1', [id])
```

## 🌍 Adım 6: Environment Variables

`.env` dosyasına ekle:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

Vercel'de de aynı değişkeni ekle!

## ✅ Adım 7: Test Et

```bash
# Lokal test
npm run dev

# Database bağlantısını kontrol et
# Console'da "PostgreSQL connected successfully" görmeli
```

## 🚀 Adım 8: Deploy

```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

Vercel otomatik deploy eder!

## 🔍 Troubleshooting

### Bağlantı hatası:
```
Error: connect ECONNREFUSED
```
**Çözüm**: DATABASE_URL doğru mu kontrol et

### SSL hatası:
```
Error: self signed certificate
```
**Çözüm**: `ssl: { rejectUnauthorized: false }` ekle

### Syntax hatası:
```
Error: syntax error at or near "?"
```
**Çözüm**: `?` yerine `$1, $2...` kullan

## 📊 Migration Script (Opsiyonel)

Mevcut SQLite verilerini PostgreSQL'e taşımak için:

```javascript
// migrate.js
import sqlite3 from 'sqlite3';
import pg from 'pg';

const sqliteDb = new sqlite3.Database('hotel-sales.db');
const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Her tablo için veri taşı
// ... migration logic
```

## 🎉 Tamamlandı!

Artık production-ready PostgreSQL kullanıyorsun! 🚀

---

**Yardım**: [PostgreSQL Docs](https://www.postgresql.org/docs/) | [Supabase Docs](https://supabase.com/docs)
