import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/permissions.js';
import { createSubscriptionPayment, verifyPayment } from '../services/paymentService.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticateToken);

// Ödeme başlat - ADMIN ONLY
router.post('/create-subscription', requireAdmin, paymentLimiter, async (req, res) => {
  try {
    const {
      packageType, // 'yearly' veya 'extra_users'
      extraUsers,
      cardHolderName,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      userPhone,
      userAddress,
      userCity
    } = req.body;

    // Kullanıcı ve otel bilgilerini al
    const users = db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const user = users[0];

    const hotels = db.query('SELECT * FROM hotels WHERE id = ?', [user.hotel_id]);
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Otel bulunamadı' });
    }
    const hotel = hotels[0];

    // Ödeme parametrelerini hazırla
    const paymentParams = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      userEmail: user.email,
      userName: user.name,
      userPhone,
      userAddress,
      userCity,
      userCountry: 'Turkey',
      packageType,
      extraUsers: extraUsers || 0,
      conversationId: `SUB-${hotel.id}-${Date.now()}`,
      cardHolderName,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      ip: req.ip || req.connection.remoteAddress
    };

    // Ödeme işlemini başlat
    const paymentResult = await createSubscriptionPayment(paymentParams);

    if (paymentResult.success) {
      // Ödeme başarılı - Veritabanını güncelle
      const now = new Date();
      const subscriptionEndsAt = new Date();
      subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1); // 1 yıl ekle

      if (packageType === 'yearly') {
        // Yıllık abonelik
        db.run(
          'UPDATE hotels SET subscription_ends_at = ? WHERE id = ?',
          [subscriptionEndsAt.toISOString(), hotel.id]
        );
      } else if (packageType === 'extra_users') {
        // Ek kullanıcı
        const currentExtraUsers = hotel.extra_users || 0;
        db.run(
          'UPDATE hotels SET extra_users = ? WHERE id = ?',
          [currentExtraUsers + extraUsers, hotel.id]
        );
      }

      // Ödeme kaydını oluştur
      db.run(
        `INSERT INTO payments (
          hotel_id, user_id, payment_id, conversation_id, 
          amount, currency, package_type, extra_users, 
          status, payment_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hotel.id,
          user.id,
          paymentResult.paymentId,
          paymentResult.conversationId,
          paymentResult.paidPrice,
          paymentResult.currency || 'TRY',
          packageType,
          extraUsers || 0,
          'success',
          now.toISOString()
        ]
      );

      res.json({
        success: true,
        message: 'Ödeme başarılı',
        demo: paymentResult.demo,
        paymentId: paymentResult.paymentId,
        subscriptionEndsAt: packageType === 'yearly' ? subscriptionEndsAt.toISOString() : null
      });
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error || 'Ödeme başarısız'
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message || 'Ödeme işlemi sırasında hata oluştu'
    });
  }
});

// Ödeme geçmişi - ADMIN ONLY
router.get('/history', requireAdmin, (req, res) => {
  try {
    const user = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const payments = db.query(
      `SELECT p.*, u.name as user_name 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.hotel_id = ? 
       ORDER BY p.payment_date DESC`,
      [user[0].hotel_id]
    );

    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Ödeme geçmişi alınamadı' });
  }
});

// Fiyat hesaplama
router.post('/calculate', requireAdmin, (req, res) => {
  try {
    const { packageType, extraUsers } = req.body;

    let basePrice = 0;
    let itemName = '';

    if (packageType === 'yearly') {
      basePrice = 1990;
      itemName = 'Yıllık Abonelik (4 kullanıcı dahil)';
    } else if (packageType === 'extra_users') {
      basePrice = (extraUsers || 0) * 350;
      itemName = `Ek Kullanıcı (${extraUsers} kişi)`;
    }

    const kdv = basePrice * 0.20;
    const total = basePrice + kdv;

    res.json({
      itemName,
      basePrice: basePrice.toFixed(2),
      kdv: kdv.toFixed(2),
      total: total.toFixed(2),
      currency: 'TRY'
    });
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({ error: 'Fiyat hesaplanamadı' });
  }
});

export default router;
