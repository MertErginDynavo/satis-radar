import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../database.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { loginLimiter, registerLimiter, emailLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, password, hotel_name } = req.body;
    console.log('Register attempt:', email);
    
    // Check if user already exists
    const existingUsers = db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Create hotel with 7-day trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    const hotelResult = db.run(
      'INSERT INTO hotels (name, included_users, extra_users, trial_ends_at) VALUES (?, ?, ?, ?)',
      [hotel_name || 'Otelim', 4, 0, trialEndsAt.toISOString()]
    );
    const hotelId = hotelResult.lastInsertRowid;

    // Hash password and create user as admin (first user is always admin/Satış Direktörü)
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userResult = db.run(
      'INSERT INTO users (email, password, name, role, hotel_id) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, 'admin', hotelId]
    );

    const userId = userResult.lastInsertRowid;
    const token = jwt.sign({ id: userId, role: 'admin', hotel_id: hotelId }, JWT_SECRET, { expiresIn: '24h' });
    
    // Send welcome email
    try {
      await sendWelcomeEmail(hotel_name || 'Otelim', email, name);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
      // Don't fail registration if email fails
    }
    
    res.json({ 
      token, 
      user: { id: userId, email, name, role: 'admin', hotel_id: hotelId } 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Kayıt hatası' });
  }
});

router.post('/login', loginLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    const users = db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    console.log('User found:', user ? 'yes' : 'no');

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Geçersiz giriş bilgileri' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Giriş hatası' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    const users = db.query('SELECT id, email, name, role, trial_ends_at, subscription_ends_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.json(users[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı' });
  }
});

router.post('/subscribe', authenticateToken, (req, res) => {
  try {
    const { subscription_ends_at, extra_users } = req.body;
    
    // Update hotel subscription
    db.run(
      'UPDATE hotels SET subscription_ends_at = ?, extra_users = ? WHERE id = (SELECT hotel_id FROM users WHERE id = ?)',
      [subscription_ends_at, extra_users || 0, req.user.id]
    );
    
    res.json({ success: true, message: 'Abonelik başarıyla oluşturuldu' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Abonelik oluşturulamadı' });
  }
});

router.get('/hotel-info', authenticateToken, (req, res) => {
  try {
    const hotels = db.query(
      'SELECT h.*, (SELECT COUNT(*) FROM users WHERE hotel_id = h.id) as total_users FROM hotels h WHERE h.id = (SELECT hotel_id FROM users WHERE id = ?)',
      [req.user.id]
    );
    
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Otel bulunamadı' });
    }
    
    res.json(hotels[0]);
  } catch (err) {
    console.error('Hotel info error:', err);
    res.status(500).json({ error: 'Otel bilgisi alınamadı' });
  }
});

router.post('/purchase-extra-users', authenticateToken, (req, res) => {
  try {
    const { extra_users } = req.body;
    
    // Get current hotel info
    const hotels = db.query(
      'SELECT extra_users FROM hotels WHERE id = (SELECT hotel_id FROM users WHERE id = ?)',
      [req.user.id]
    );
    
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Otel bulunamadı' });
    }
    
    const currentExtraUsers = hotels[0].extra_users || 0;
    const newExtraUsers = currentExtraUsers + extra_users;
    
    // Update hotel extra users
    db.run(
      'UPDATE hotels SET extra_users = ? WHERE id = (SELECT hotel_id FROM users WHERE id = ?)',
      [newExtraUsers, req.user.id]
    );
    
    res.json({ 
      success: true, 
      message: 'Ek kullanıcılar başarıyla eklendi',
      new_extra_users: newExtraUsers
    });
  } catch (err) {
    console.error('Purchase extra users error:', err);
    res.status(500).json({ error: 'Ek kullanıcı satın alınamadı' });
  }
});

// Şifre sıfırlama talebi
router.post('/forgot-password', emailLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Kullanıcıyı bul
    const users = db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Güvenlik için kullanıcı bulunamasa bile başarılı mesaj dön
      return res.json({ 
        success: true, 
        message: 'Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama linki gönderildi.' 
      });
    }
    
    const user = users[0];
    
    // Reset token oluştur (güvenli random string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli
    
    // Token'ı veritabanına kaydet
    db.run(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt.toISOString()]
    );
    
    // E-posta gönder
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Password reset email error:', emailError);
      return res.status(500).json({ error: 'E-posta gönderilemedi' });
    }
    
    res.json({ 
      success: true, 
      message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Şifre sıfırlama talebi işlenemedi' });
  }
});

// Şifre sıfırlama (token ile)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token ve yeni şifre gerekli' });
    }
    
    // Token'ı kontrol et
    const resets = db.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND datetime(expires_at) > datetime("now")',
      [token]
    );
    
    if (resets.length === 0) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }
    
    const reset = resets[0];
    
    // Yeni şifreyi hashle
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    // Kullanıcının şifresini güncelle
    db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, reset.user_id]
    );
    
    // Token'ı kullanılmış olarak işaretle
    db.run(
      'UPDATE password_resets SET used = 1 WHERE id = ?',
      [reset.id]
    );
    
    res.json({ 
      success: true, 
      message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Şifre sıfırlanamadı' });
  }
});

// Şifre değiştirme (giriş yapmış kullanıcı için)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut şifre ve yeni şifre gerekli' });
    }
    
    // Kullanıcıyı bul
    const users = db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    // Mevcut şifreyi kontrol et
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Mevcut şifre yanlış' });
    }
    
    // Yeni şifreyi hashle ve güncelle
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    res.json({ 
      success: true, 
      message: 'Şifreniz başarıyla değiştirildi' 
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Şifre değiştirilemedi' });
  }
});

export default router;
