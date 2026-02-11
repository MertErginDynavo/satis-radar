import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireManager } from '../middleware/permissions.js';

const router = express.Router();

// Helper function to get date range
function getDateRange(type) {
  const now = new Date();
  let startDate, endDate;

  switch (type) {
    case 'weekly':
      // Start of week (Monday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay() + 1);
      startDate.setHours(0, 0, 0, 0);
      
      // End of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'monthly':
      // Start of month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // End of month
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'yearly':
      // Start of year
      startDate = new Date(now.getFullYear(), 0, 1);
      
      // End of year
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    default:
      startDate = new Date(0);
      endDate = now;
  }

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
}

// Get report by type (weekly, monthly, yearly) - Admin ve Manager
router.get('/:type', authenticateToken, requireManager, (req, res) => {
  try {
    const { type } = req.params;
    const { start, end } = getDateRange(type);
    
    // Get hotel_id
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;

    // Total offers
    const totalOffers = db.query(
      'SELECT COUNT(*) as count FROM offers WHERE hotel_id = ? AND created_at BETWEEN ? AND ?',
      [hotelId, start, end]
    );

    // Approved offers
    const approvedOffers = db.query(
      'SELECT COUNT(*) as count FROM offers WHERE hotel_id = ? AND status = ? AND created_at BETWEEN ? AND ?',
      [hotelId, 'approved', start, end]
    );

    // Pending offers (sent, waiting, revised)
    const pendingOffers = db.query(
      'SELECT COUNT(*) as count FROM offers WHERE hotel_id = ? AND status IN (?, ?, ?) AND created_at BETWEEN ? AND ?',
      [hotelId, 'sent', 'waiting', 'revised', start, end]
    );

    // Lost offers
    const lostOffers = db.query(
      'SELECT COUNT(*) as count FROM offers WHERE hotel_id = ? AND status = ? AND created_at BETWEEN ? AND ?',
      [hotelId, 'lost', start, end]
    );

    // Revenue by currency (approved only)
    const revenueByCurrency = db.query(
      'SELECT currency, SUM(amount) as total_revenue FROM offers WHERE hotel_id = ? AND status = ? AND created_at BETWEEN ? AND ? GROUP BY currency',
      [hotelId, 'approved', start, end]
    );

    // Potential revenue (pending)
    const potentialRevenue = db.query(
      'SELECT currency, SUM(amount) as total_revenue FROM offers WHERE hotel_id = ? AND status IN (?, ?, ?) AND created_at BETWEEN ? AND ? GROUP BY currency',
      [hotelId, 'sent', 'waiting', 'revised', start, end]
    );

    // Average offer value
    const avgOfferValue = db.query(
      'SELECT currency, AVG(amount) as avg_value FROM offers WHERE hotel_id = ? AND created_at BETWEEN ? AND ? GROUP BY currency',
      [hotelId, start, end]
    );

    // Status breakdown
    const statusBreakdown = db.query(
      'SELECT status, COUNT(*) as count FROM offers WHERE hotel_id = ? AND created_at BETWEEN ? AND ? GROUP BY status',
      [hotelId, start, end]
    );

    // Top agents
    const topAgents = db.query(
      `SELECT u.name as agent_name, 
              COUNT(*) as total_count,
              SUM(CASE WHEN o.status = 'approved' THEN 1 ELSE 0 END) as approved_count
       FROM offers o
       JOIN users u ON o.agent_id = u.id
       WHERE o.hotel_id = ? AND o.created_at BETWEEN ? AND ?
       GROUP BY o.agent_id, u.name
       ORDER BY approved_count DESC, total_count DESC
       LIMIT 5`,
      [hotelId, start, end]
    );

    // Top companies
    const topCompanies = db.query(
      `SELECT c.name as company_name,
              COUNT(*) as offer_count,
              SUM(CASE WHEN o.status = 'approved' THEN 1 ELSE 0 END) as approved_count
       FROM offers o
       JOIN companies c ON o.company_id = c.id
       WHERE o.hotel_id = ? AND o.created_at BETWEEN ? AND ?
       GROUP BY o.company_id, c.name
       ORDER BY offer_count DESC
       LIMIT 5`,
      [hotelId, start, end]
    );

    // Total guests and rooms (approved only)
    const guestRoomStats = db.query(
      'SELECT SUM(guest_count) as total_guests, SUM(room_count) as total_rooms FROM offers WHERE hotel_id = ? AND status = ? AND created_at BETWEEN ? AND ?',
      [hotelId, 'approved', start, end]
    );

    res.json({
      period: type,
      date_range: { start, end },
      total_offers: totalOffers[0]?.count || 0,
      approved_offers: approvedOffers[0]?.count || 0,
      pending_offers: pendingOffers[0]?.count || 0,
      lost_offers: lostOffers[0]?.count || 0,
      revenue_by_currency: revenueByCurrency,
      potential_revenue_by_currency: potentialRevenue,
      avg_offer_value_by_currency: avgOfferValue,
      status_breakdown: statusBreakdown,
      top_agents: topAgents,
      top_companies: topCompanies,
      total_guests: guestRoomStats[0]?.total_guests || 0,
      total_rooms: guestRoomStats[0]?.total_rooms || 0
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Rapor oluşturulamadı' });
  }
});

export default router;
