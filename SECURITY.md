# 🔒 Güvenlik Rehberi

## Genel Bakış

Satış Radar, modern güvenlik standartlarına uygun olarak geliştirilmiştir. Bu dokümanda uygulanan güvenlik önlemleri ve production için öneriler bulunmaktadır.

## Uygulanan Güvenlik Önlemleri

### ✅ 1. Rate Limiting (İstek Sınırlama)

Brute force ve DDoS saldırılarını önlemek için tüm endpoint'lerde rate limiting uygulanmıştır.

#### Genel API Limiti
- **15 dakikada 100 istek**
- Tüm `/api/*` endpoint'leri için geçerli

#### Login Limiti
- **15 dakikada 5 başarısız giriş**
- Brute force saldırılarını önler
- Başarılı girişler sayılmaz

#### Register Limiti
- **1 saatte 3 kayıt**
- Spam kayıtları önler

#### Payment Limiti
- **1 saatte 10 ödeme denemesi**
- Ödeme fraud'unu önler

#### Email Limiti
- **1 saatte 20 e-posta**
- E-posta spam'ini önler

### ✅ 2. JWT Authentication

- **Token-based authentication**
- **24 saat geçerlilik süresi**
- **Environment variable'dan secret key**
- **Güvenli token imzalama**

### ✅ 3. Password Security

- **bcrypt hashing** (10 rounds)
- **Şifre sıfırlama** (1 saatlik token)
- **Şifre değiştirme** (mevcut şifre kontrolü)
- **Güvenli token oluşturma** (crypto.randomBytes)

### ✅ 4. CORS Configuration

- **Production için domain kısıtlaması**
- **Credentials desteği**
- **Güvenli origin kontrolü**

### ✅ 5. Input Validation

- **SQL injection koruması** (parameterized queries)
- **XSS koruması** (input sanitization)
- **Type checking**
- **Required field validation**

### ✅ 6. Multi-tenant İzolasyonu

- **hotel_id filtreleme**
- **Kullanıcı bazlı veri erişimi**
- **Role-based access control (RBAC)**

### ✅ 7. Payment Security

- **PCI DSS uyumlu** (iyzico)
- **Kart bilgileri asla kaydedilmez**
- **HTTPS zorunlu** (production)
- **3D Secure desteği**

## Environment Variables

### Kritik Değişkenler

```env
# JWT Secret - Güçlü ve benzersiz olmalı
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Credentials - Güvenli tutulmalı
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Credentials - Asla paylaşılmamalı
IYZICO_API_KEY=your-production-api-key
IYZICO_SECRET_KEY=your-production-secret-key

# Frontend URL - Production domain
FRONTEND_URL=https://yourdomain.com
```

### Güvenlik Kontrol Listesi

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production'da güçlü JWT_SECRET kullanılıyor
- [ ] HTTPS aktif
- [ ] SSL sertifikası kuruldu
- [ ] CORS production domain'e kısıtlı
- [ ] Rate limiting aktif
- [ ] Database backup stratejisi var
- [ ] Log monitoring aktif

## Password Reset Akışı

### 1. Şifre Sıfırlama Talebi
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

- Kullanıcı e-posta adresi girer
- Sistem güvenli token oluşturur (32 byte random)
- Token 1 saat geçerli
- E-posta ile reset linki gönderilir

### 2. Şifre Sıfırlama
```
POST /api/auth/reset-password
Body: { 
  "token": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

- Kullanıcı e-postadaki linke tıklar
- Yeni şifre girer
- Token doğrulanır
- Şifre güncellenir
- Token kullanılmış olarak işaretlenir

### 3. Şifre Değiştirme (Giriş Yapmış Kullanıcı)
```
POST /api/auth/change-password
Headers: { "Authorization": "Bearer <token>" }
Body: { 
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

## Güvenlik Best Practices

### Backend

1. **Asla hassas bilgileri loglama**
   ```javascript
   // ❌ Kötü
   console.log('User password:', password);
   
   // ✅ İyi
   console.log('User login attempt:', email);
   ```

2. **Her zaman parameterized queries kullan**
   ```javascript
   // ❌ Kötü (SQL Injection riski)
   db.query(`SELECT * FROM users WHERE email = '${email}'`);
   
   // ✅ İyi
   db.query('SELECT * FROM users WHERE email = ?', [email]);
   ```

3. **Hassas hataları kullanıcıya gösterme**
   ```javascript
   // ❌ Kötü
   res.status(500).json({ error: err.stack });
   
   // ✅ İyi
   console.error('Error:', err);
   res.status(500).json({ error: 'Bir hata oluştu' });
   ```

### Frontend

1. **Token'ı güvenli sakla**
   ```javascript
   // ✅ localStorage kullan (XSS'e karşı dikkatli ol)
   localStorage.setItem('token', token);
   
   // 🔒 Daha güvenli: httpOnly cookie (backend'de ayarla)
   ```

2. **Hassas bilgileri URL'de gönderme**
   ```javascript
   // ❌ Kötü
   fetch(`/api/user?password=${password}`);
   
   // ✅ İyi
   fetch('/api/user', {
     method: 'POST',
     body: JSON.stringify({ password })
   });
   ```

3. **Input sanitization**
   ```javascript
   // XSS koruması için input'ları temizle
   const sanitizedInput = input.replace(/<script>/gi, '');
   ```

## Production Deployment

### 1. Environment Setup

```bash
# Production .env
NODE_ENV=production
JWT_SECRET=<güçlü-random-string-64-karakter>
FRONTEND_URL=https://yourdomain.com
APP_URL=https://yourdomain.com
IYZICO_BASE_URL=https://api.iyzipay.com
```

### 2. HTTPS Kurulumu

```bash
# Let's Encrypt ile ücretsiz SSL
sudo certbot --nginx -d yourdomain.com
```

### 3. Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4. Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 5. Database Backup

```bash
# Günlük otomatik backup
0 2 * * * cp /path/to/hotel-sales.db /path/to/backups/hotel-sales-$(date +\%Y\%m\%d).db
```

## Monitoring & Logging

### 1. Error Logging

```javascript
// Winston veya benzeri logging library kullan
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Security Monitoring

- **Failed login attempts** - Şüpheli aktivite tespiti
- **Rate limit violations** - Saldırı girişimleri
- **Payment failures** - Fraud tespiti
- **API errors** - Sistem sağlığı

## Incident Response

### Güvenlik İhlali Durumunda

1. **Hemen aksiyon al**
   - Etkilenen servisleri kapat
   - Veritabanı bağlantısını kes
   - Logları kaydet

2. **Analiz yap**
   - Hangi veriler etkilendi?
   - Kaç kullanıcı etkilendi?
   - Saldırı vektörü neydi?

3. **Kullanıcıları bilgilendir**
   - Şeffaf iletişim
   - Alınan önlemler
   - Yapılması gerekenler

4. **Önlem al**
   - Güvenlik açığını kapat
   - Tüm şifreleri sıfırla
   - JWT secret'ı değiştir
   - Sistem güncellemesi yap

## Compliance

### KVKK (Kişisel Verilerin Korunması Kanunu)

- ✅ Kullanıcı rızası alınıyor
- ✅ Veri minimizasyonu uygulanıyor
- ✅ Şifreler hashlenmiş
- ✅ Veri silme hakkı var
- ✅ Veri taşınabilirliği mevcut

### PCI DSS (Payment Card Industry)

- ✅ Kart bilgileri kaydedilmiyor
- ✅ iyzico PCI DSS Level 1 sertifikalı
- ✅ HTTPS zorunlu
- ✅ Güvenli ödeme akışı

## Güvenlik Testleri

### 1. Penetration Testing

```bash
# OWASP ZAP ile güvenlik taraması
zap-cli quick-scan --self-contained https://yourdomain.com
```

### 2. Dependency Audit

```bash
# npm paketlerini güvenlik açıkları için tara
npm audit
npm audit fix
```

### 3. SQL Injection Test

```bash
# sqlmap ile test
sqlmap -u "https://yourdomain.com/api/login" --data="email=test&password=test"
```

## Destek

Güvenlik açığı bildirimi için:
- **E-posta:** security@satisradar.com
- **Responsible Disclosure:** 90 gün içinde yanıt

## Kaynaklar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [KVKK Rehberi](https://www.kvkk.gov.tr/)
