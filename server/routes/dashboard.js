import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { canViewAllOffers } from '../middleware/permissions.js';

const router = express.Router();

router.use(authenticateToken);

// Dashboard stats - Rol bazlı filtreleme + hotel_id
router.get('/stats', (req, res) => {
  try {
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Admin ve Manager tüm verileri, Sales sadece kendininkileri görür (kendi otelinden)
    const agentFilter = canViewAllOffers(req.user.role) 
      ? `WHERE hotel_id = ${hotelId}` 
      : `WHERE agent_id = ${req.user.id} AND hotel_id = ${hotelId}`;
    const today = new Date().toISOString().split('T')[0];
    
    const todayResult = db.query(
      `SELECT COUNT(*) as count FROM offers ${agentFilter ? agentFilter + ' AND' : 'WHERE'} follow_up_date = ?`,
      [today]
    );
    const todayFollowups = todayResult[0]?.count || 0;
    
    const overdueResult = db.query(
      `SELECT COUNT(*) as count FROM offers ${agentFilter ? agentFilter + ' AND' : 'WHERE'} follow_up_date < ? AND status NOT IN ('approved', 'lost')`,
      [today]
    );
    const overdueFollowups = overdueResult[0]?.count || 0;
    
    const monthlyStats = db.query(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM offers ${agentFilter ? agentFilter + ' AND' : 'WHERE'} strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') GROUP BY status`
    ) || [];

    res.json({ todayFollowups, overdueFollowups, monthlyStats });
  } catch (err) {
    console.error('Stats error:', err);
    res.json({ todayFollowups: 0, overdueFollowups: 0, monthlyStats: [] });
  }
});

export default router;
