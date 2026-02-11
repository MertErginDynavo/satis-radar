# 🚀 Vercel Deployment Guide

Bu dokümantasyon, Satış Radar uygulamasını Vercel'e deploy etmek için gerekli adımları içerir.

## ⚠️ Önemli Not

Bu uygulama SQLite veritabanı kullanıyor. Vercel serverless fonksiyonları stateless olduğu için, production ortamında **PostgreSQL** veya **MongoDB** gibi harici bir veritabanına geçiş yapmanız önerilir.

## 📋 Ön Hazırlık

### 1. Vercel Hesabı
- [Vercel](https://vercel.com) hesabı oluşturun
- GitHub/GitLab/Bitbucket ile bağlayın

### 2. Git Repository
Projenizi bir Git repository'sine push edin:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

## 🔧 Deployment Adımları

### Adım 1: Vercel'e Proje İmport Et

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. "Add New Project" butonuna tıklayın
3. GitHub repository'nizi seçin
4. "Import" butonuna tıklayın

### Adım 2: Build Ayarları

Vercel otomatik olarak ayarları algılayacak, ancak kontrol edin:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Adım 3: Environment Variables

Vercel Dashboard'da "Environment Variables" bölümüne gidin ve şu değişkenleri ekleyin:

#### Zorunlu:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-vercel
NODE_ENV=production
```

#### Opsiyonel (E-posta için):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Satış Radar <noreply@satisradar.com>
```

#### Opsiyonel (Ödeme için):
```
IYZICO_API_KEY=your-production-api-key
IYZICO_SECRET_KEY=your-production-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com
```

#### Frontend URL (CORS için):
```
FRONTEND_URL=https://your-app.vercel.app
```

### Adım 4: Deploy

"Deploy" butonuna tıklayın. Vercel otomatik olarak:
1. Bağımlılıkları yükler
2. Projeyi build eder
3. Deploy eder
4. Size bir URL verir

## 🗄️ Veritabanı Geçişi (Önerilen)

### PostgreSQL'e Geçiş

1. **Supabase** (Ücretsiz tier mevcut):
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Neon** (Serverless PostgreSQL):
   ```bash
   npm install @neondatabase/serverless
   ```

3. **PlanetScale** (MySQL uyumlu):
   ```bash
   npm install @planetscale/database
   ```

### Veritabanı Bağlantısı

`server/database.js` dosyasını güncelleyin:

```javascript
// PostgreSQL örneği
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const query = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows;
};
```

Environment variable ekleyin:
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

## 🔄 Otomatik Deployment

Her `git push` sonrası Vercel otomatik olarak deploy eder:

```bash
git add .
git commit -m "Update feature"
git push
```

## 🌐 Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Domain adınızı ekleyin
3. DNS kayıtlarını güncelleyin
4. SSL otomatik olarak yapılandırılır

## 📊 Monitoring

Vercel Dashboard'da:
- **Analytics**: Ziyaretçi istatistikleri
- **Logs**: Hata logları
- **Speed Insights**: Performans metrikleri

## 🔒 Güvenlik

### Production Checklist:

- [ ] JWT_SECRET güçlü ve benzersiz
- [ ] CORS ayarları production URL'i ile
- [ ] Rate limiting aktif
- [ ] HTTPS zorunlu
- [ ] Environment variables güvenli
- [ ] Veritabanı şifreleri güçlü
- [ ] API key'ler production versiyonları

## 🐛 Troubleshooting

### Build Hatası
```bash
# Lokal olarak test edin
npm run build
```

### API Çalışmıyor
- `vercel.json` dosyasını kontrol edin
- Environment variables'ı kontrol edin
- Vercel logs'u inceleyin

### Database Hatası
- SQLite Vercel'de çalışmaz (stateless)
- PostgreSQL/MongoDB'ye geçin

## 📱 Vercel CLI (Opsiyonel)

```bash
# Vercel CLI yükle
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

## 🔗 Faydalı Linkler

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [PlanetScale](https://planetscale.com)

## 💡 Öneriler

1. **Staging Environment**: Production'dan önce test için staging ortamı oluşturun
2. **Database Backup**: Düzenli veritabanı yedekleri alın
3. **Monitoring**: Sentry veya LogRocket gibi hata izleme araçları ekleyin
4. **CDN**: Statik dosyalar için Vercel CDN'i kullanın
5. **Edge Functions**: Kritik API'ler için edge functions kullanın

## 🎉 Deploy Sonrası

Deploy başarılı olduktan sonra:

1. ✅ Tüm sayfaları test edin
2. ✅ API endpoint'lerini test edin
3. ✅ Giriş/kayıt işlemlerini test edin
4. ✅ Ödeme sistemini test edin (sandbox mode)
5. ✅ E-posta gönderimini test edin
6. ✅ Mobil responsive'i kontrol edin

---

**Not**: Bu proje şu anda SQLite kullanıyor. Production için mutlaka PostgreSQL veya benzeri bir veritabanına geçiş yapın!
