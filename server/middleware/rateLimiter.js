import rateLimit from 'express-rate-limit';

// Genel API rate limiter - Tüm endpoint'ler için
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 15 dakikada maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login rate limiter - Brute force saldırılarını önlemek için
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 15 dakikada maksimum 5 başarısız giriş denemesi
  message: {
    error: 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  skipSuccessfulRequests: true, // Başarılı istekleri sayma
  standardHeaders: true,
  legacyHeaders: false,
});

// Register rate limiter - Spam kayıtları önlemek için
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // 1 saatte maksimum 3 kayıt
  message: {
    error: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment rate limiter - Ödeme işlemleri için
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10, // 1 saatte maksimum 10 ödeme denemesi
  message: {
    error: 'Çok fazla ödeme denemesi. Lütfen 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email rate limiter - E-posta gönderimi için
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 20, // 1 saatte maksimum 20 e-posta
  message: {
    error: 'Çok fazla e-posta gönderme denemesi. Lütfen 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
