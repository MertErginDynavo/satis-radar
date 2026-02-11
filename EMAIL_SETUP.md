# 📧 E-posta Kurulum Rehberi

## Genel Bakış

Satış Radar, aşağıdaki durumlarda otomatik e-posta gönderir:
- ✅ Yeni kayıt (Hoş geldiniz e-postası)
- ✅ Kullanıcı daveti (Davet e-postası + geçici şifre)
- ✅ Deneme süresi bitiş uyarısı (24 saat önce)
- ✅ Deneme süresi bitti bildirimi

## SMTP Yapılandırması

### 1. Gmail ile Kullanım (Önerilen - Test için)

1. Gmail hesabınızda 2FA'yı aktifleştirin
2. [App Password](https://myaccount.google.com/apppasswords) oluşturun
3. `.env` dosyasını düzenleyin:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
EMAIL_FROM=Satış Radar <noreply@satisradar.com>
```

### 2. Diğer SMTP Servisleri

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### AWS SES
```env
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASS=your-ses-smtp-password
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

## Demo Mode

Eğer SMTP ayarları yapılmamışsa, sistem **demo mode**'da çalışır:
- E-postalar gönderilmez
- Console'a log yazılır
- Uygulama normal çalışmaya devam eder

## Test Etme

### 1. Yeni Kayıt Testi
```bash
# Tarayıcıda kayıt ol
# Console'da e-posta logunu kontrol et
```

### 2. Kullanıcı Davet Testi
```bash
# Admin olarak giriş yap
# Kullanıcılar sayfasından yeni kullanıcı ekle
# Console'da davet e-postasını kontrol et
```

### 3. Deneme Süresi E-posta Testi
```bash
# Scheduler otomatik çalışır (günde 1 kez)
# Manuel test için:
node -e "import('./server/scheduler.js').then(m => m.runDailyChecks())"
```

## Sorun Giderme

### E-posta gönderilmiyor
1. `.env` dosyasının doğru yapılandırıldığından emin olun
2. SMTP bilgilerini kontrol edin
3. Firewall/antivirus SMTP portunu engelliyor olabilir
4. Console loglarını kontrol edin

### Gmail "Less secure app" hatası
- App Password kullanın (normal şifre değil)
- 2FA aktif olmalı

### "Connection timeout" hatası
- EMAIL_PORT'u kontrol edin (587 veya 465)
- EMAIL_SECURE ayarını kontrol edin
- Firewall ayarlarını kontrol edin

## Production Önerileri

1. **Profesyonel SMTP Servisi Kullanın**
   - SendGrid (ücretsiz 100 e-posta/gün)
   - AWS SES (çok ucuz, güvenilir)
   - Mailgun (ücretsiz 5000 e-posta/ay)

2. **E-posta Şablonlarını Özelleştirin**
   - `server/services/emailService.js` dosyasını düzenleyin
   - Logo ve marka renklerini ekleyin

3. **E-posta Kuyruğu Ekleyin**
   - Bull veya BullMQ kullanın
   - Başarısız e-postaları yeniden deneyin

4. **E-posta Loglarını Kaydedin**
   - Gönderilen e-postaları veritabanına kaydedin
   - Başarı/hata durumlarını takip edin

## Güvenlik

- ⚠️ `.env` dosyasını asla git'e commit etmeyin
- ⚠️ SMTP şifrelerini güvenli tutun
- ⚠️ Production'da güçlü JWT_SECRET kullanın
- ✅ HTTPS kullanın (production)
- ✅ Rate limiting ekleyin

## Destek

Sorun yaşıyorsanız:
1. Console loglarını kontrol edin
2. `.env` dosyasını kontrol edin
3. SMTP servis sağlayıcınızın dokümantasyonunu okuyun
