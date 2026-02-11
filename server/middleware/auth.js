import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../database.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Warn if using default secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env file for production!');
}

export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth header:', authHeader);
    console.log('Token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Token bulunamadı' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.log('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Geçersiz token' });
      }
      
      // Kullanıcının aktif olup olmadığını kontrol et
      const users = db.query('SELECT active FROM users WHERE id = ?', [user.id]);
      if (users.length > 0 && users[0].active === 0) {
        return res.status(403).json({ error: 'Hesabınız deaktive edilmiş. Lütfen yöneticinizle iletişime geçin.' });
      }
      
      console.log('Token verified for user:', user);
      req.user = user;
      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Kimlik doğrulama hatası' });
  }
}

export function checkSubscription(req, res, next) {
  try {
    const hotels = db.query(
      'SELECT trial_ends_at, subscription_ends_at FROM hotels WHERE id = (SELECT hotel_id FROM users WHERE id = ?)',
      [req.user.id]
    );
    
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Otel bulunamadı' });
    }

    const hotel = hotels[0];
    const now = new Date();
    
    // Check if trial is active
    if (hotel.trial_ends_at && new Date(hotel.trial_ends_at) > now) {
      return next();
    }
    
    // Check if subscription is active
    if (hotel.subscription_ends_at && new Date(hotel.subscription_ends_at) > now) {
      return next();
    }
    
    // No active trial or subscription
    return res.status(402).json({ 
      error: 'Abonelik gerekli',
      message: 'Deneme süreniz doldu. Devam etmek için abonelik satın alın.',
      trial_ended: true
    });
  } catch (err) {
    console.error('Subscription check error:', err);
    return res.status(500).json({ error: 'Abonelik kontrolü başarısız' });
  }
}

export { JWT_SECRET };
