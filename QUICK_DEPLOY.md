# ⚡ Hızlı Vercel Deployment

## 🚀 5 Dakikada Deploy Et

### 1️⃣ Git Repository Oluştur

```bash
git init
git add .
git commit -m "Initial commit - Satış Radar"
```

GitHub'da yeni repo oluştur ve push et:
```bash
git remote add origin https://github.com/kullanici-adi/satis-radar.git
git branch -M main
git push -u origin main
```

### 2️⃣ Vercel'e Deploy

1. [vercel.com](https://vercel.com) → Sign up with GitHub
2. "Add New Project" → Repository'ni seç
3. "Import" butonuna tıkla

### 3️⃣ Environment Variables Ekle

Vercel Dashboard → Settings → Environment Variables:

**Zorunlu:**
```
JWT_SECRET=satis-radar-super-secret-key-2024-production
NODE_ENV=production
```

**Opsiyonel (E-posta):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Satış Radar <noreply@satisradar.com>
```

**Opsiyonel (Ödeme):**
```
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com
```

### 4️⃣ Deploy!

"Deploy" butonuna tıkla → 2-3 dakika bekle → Hazır! 🎉

URL'in: `https://your-project.vercel.app`

---

## ⚠️ ÖNEMLİ UYARI

**SQLite Vercel'de çalışmaz!** Production için:

### Hızlı Çözüm: Supabase (Ücretsiz)

1. [supabase.com](https://supabase.com) → Yeni proje oluştur
2. Database URL'i kopyala
3. Vercel'e ekle:
   ```
   DATABASE_URL=postgresql://...
   ```
4. `server/database.js` dosyasını PostgreSQL için güncelle

### Alternatifler:
- **Neon**: [neon.tech](https://neon.tech) (Serverless PostgreSQL)
- **PlanetScale**: [planetscale.com](https://planetscale.com) (MySQL)
- **Railway**: [railway.app](https://railway.app) (PostgreSQL)

---

## 🔄 Güncelleme

```bash
git add .
git commit -m "Update"
git push
```

Vercel otomatik deploy eder! ✨

---

## 🐛 Sorun mu var?

### Build hatası:
```bash
npm run build  # Lokal test
```

### API çalışmıyor:
- Environment variables kontrol et
- Vercel logs'a bak

### Database hatası:
- SQLite yerine PostgreSQL kullan
- DATABASE_URL doğru mu kontrol et

---

## 📞 Yardım

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Discord Community](https://discord.gg/vercel)

---

**Başarılar! 🚀**
