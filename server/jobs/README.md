# Otomatik E-posta Hatırlatma Sistemi

## Genel Bakış

Bu sistem, deneme süresi bitmek üzere olan veya bitmiş otellere otomatik e-posta gönderir.

## Dosyalar

### 1. `emailService.js`
E-posta şablonlarını içerir:
- **sendTrialEndingEmail**: Deneme bitimine 24 saat kala gönderilir
- **sendTrialEndedEmail**: Deneme süresi bittikten sonra gönderilir
- **sendWelcomeEmail**: Kayıt sonrası hoş geldin e-postası

### 2. `trialReminder.js`
Deneme süresi kontrollerini yapar:
- **checkTrialEndingHotels**: 24 saat içinde bitecek denemeleri bulur
- **checkTrialEndedHotels**: Bitmiş denemeleri bulur

### 3. `scheduler.js`
Zamanlanmış görevleri yönetir:
- Her 24 saatte bir otomatik kontrol yapar
- Gerçek uygulamada `node-cron` kullanılabilir

## Kullanım

### Manuel Test
```bash
npm run test:trial-reminder
```

### Otomatik Çalıştırma
Server başlatıldığında otomatik olarak çalışır:
```bash
npm run dev
```

## Gerçek Uygulamada Yapılması Gerekenler

### 1. E-posta Servisi Kurulumu
```bash
npm install nodemailer
```

`emailService.js` dosyasında nodemailer yapılandırması:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### 2. Cron Job Kurulumu
```bash
npm install node-cron
```

`scheduler.js` dosyasında:
```javascript
const cron = require('node-cron');

// Her gün saat 10:00'da çalış
cron.schedule('0 10 * * *', async () => {
  await runDailyChecks();
});
```

### 3. Ortam Değişkenleri
`.env` dosyası oluşturun:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
APP_URL=https://satisradar.com
PAYMENT_URL=https://satisradar.com/subscription
```

### 4. E-posta Gönderim Logları
Veritabanına `email_logs` tablosu ekleyin:
```sql
CREATE TABLE email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER,
  email_type TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);
```

## E-posta Zamanlaması

| Olay | Zaman | E-posta Tipi |
|------|-------|--------------|
| Kayıt | Hemen | Hoş Geldin |
| Deneme Bitişi | -24 saat | Hatırlatma |
| Deneme Bitti | 0 saat | Son Hatırlatma |

## Test Senaryoları

### Senaryo 1: Yarın Bitecek Deneme
```javascript
// Veritabanında test verisi oluştur
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

db.prepare(`
  UPDATE hotels 
  SET trial_ends_at = ? 
  WHERE id = 1
`).run(tomorrow.toISOString());
```

### Senaryo 2: Bugün Biten Deneme
```javascript
const today = new Date();

db.prepare(`
  UPDATE hotels 
  SET trial_ends_at = ? 
  WHERE id = 1
`).run(today.toISOString());
```

## Performans Notları

- E-posta gönderimi asenkron yapılmalı
- Toplu e-posta için rate limiting uygulanmalı
- Başarısız gönderimlerde retry mekanizması olmalı
- E-posta kuyruğu sistemi (Bull, BullMQ) kullanılabilir

## Güvenlik

- E-posta şablonlarında XSS koruması
- SMTP kimlik bilgileri environment variables'da
- E-posta gönderim logları tutulmalı
- Spam önleme mekanizmaları
