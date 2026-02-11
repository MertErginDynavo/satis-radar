import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/permissions.js';

const router = express.Router();

// Tüm endpoint'ler sadece Admin (Satış Direktörü) için
router.use(authenticateToken, requireAdmin);

// 1. KPI Özet
router.get('/kpi', (req, res) => {
  try {
    const hotelId = req.user.hotel_id;
    
    // Total Pipeline Value (açık teklifler)
    const pipelineResult = db.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM offers 
      WHERE hotel_id = ? 
      AND status IN ('sent', 'waiting', 'revised')
    `, [hotelId]);
    const totalPipelineValue = pipelineResult[0]?.total || 0;
    
    // Approved Revenue
    const approvedResult = db.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM offers 
      WHERE hotel_id = ? 
      AND status = 'approved'
    `, [hotelId]);
    const approvedRevenue = approvedResult[0]?.total || 0;
    
    // Win Rate
    const winRateResult = db.query(`
      SELECT 
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status IN ('approved', 'lost') THEN 1 ELSE 0 END) as total
      FROM offers 
      WHERE hotel_id = ?
    `, [hotelId]);
    const winRate = winRateResult[0]?.total > 0 
      ? ((winRateResult[0]?.approved / winRateResult[0]?.total) * 100).toFixed(1)
      : 0;
    
    // Overdue Follow-ups
    const today = new Date().toISOString().split('T')[0];
    const overdueResult = db.query(`
      SELECT COUNT(*) as count 
      FROM offers 
      WHERE hotel_id = ? 
      AND follow_up_date < ? 
      AND status NOT IN ('approved', 'lost')
    `, [hotelId, today]);
    const overdueFollowUps = overdueResult[0]?.count || 0;
    
    // Average Closing Days
    const closingDaysResult = db.query(`
      SELECT AVG(
        CAST((julianday(datetime('now')) - julianday(created_at)) AS INTEGER)
      ) as avg_days
      FROM offers 
      WHERE hotel_id = ? 
      AND status = 'approved'
    `, [hotelId]);
    const averageClosingDays = closingDaysResult[0]?.avg_days 
      ? parseFloat(closingDaysResult[0].avg_days).toFixed(1)
      : 0;
    
    res.json({
      totalPipelineValue,
      approvedRevenue,
      winRate: parseFloat(winRate),
      overdueFollowUps,
      averageClosingDays: parseFloat(averageClosingDays)
    });
  } catch (err) {
    console.error('Director KPI error:', err);
    res.status(500).json({ error: 'KPI verileri alınamadı' });
  }
});

// 2. Pipeline Dağılımı
router.get('/pipeline', (req, res) => {
  try {
    const hotelId = req.user.hotel_id;
    
    const pipelineResult = db.query(`
      SELECT status, COUNT(*) as count
      FROM offers 
      WHERE hotel_id = ?
      GROUP BY status
    `, [hotelId]);
    
    const pipeline = {
      sent: 0,
      waiting: 0,
      revised: 0,
      approved: 0,
      lost: 0
    };
    
    pipelineResult.forEach(row => {
      pipeline[row.status] = row.count;
    });
    
    res.json(pipeline);
  } catch (err) {
    console.error('Pipeline error:', err);
    res.status(500).json({ error: 'Pipeline verileri alınamadı' });
  }
});

// 3. Aylık Gelir Trendi
router.get('/revenue', (req, res) => {
  try {
    const hotelId = req.user.hotel_id;
    const year = req.query.year || new Date().getFullYear();
    
    const revenueResult = db.query(`
      SELECT 
        strftime('%m', created_at) as month_num,
        COALESCE(SUM(amount), 0) as amount
      FROM offers 
      WHERE hotel_id = ? 
      AND status = 'approved'
      AND strftime('%Y', created_at) = ?
      GROUP BY month_num
      ORDER BY month_num
    `, [hotelId, year.toString()]);
    
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const revenue = months.map((month, index) => {
      const monthData = revenueResult.find(r => parseInt(r.month_num) === index + 1);
      return {
        month,
        amount: monthData?.amount || 0
      };
    });
    
    res.json(revenue);
  } catch (err) {
    console.error('Revenue trend error:', err);
    res.status(500).json({ error: 'Gelir verileri alınamadı' });
  }
});

// 4. Satış Temsilcisi Performansı
router.get('/agents', (req, res) => {
  try {
    const hotelId = req.user.hotel_id;
    
    const agentsResult = db.query(`
      SELECT 
        u.id as userId,
        u.name,
        COUNT(o.id) as offers,
        SUM(CASE WHEN o.status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN o.status = 'approved' THEN o.amount ELSE 0 END) as revenue,
        AVG(CASE 
          WHEN o.status = 'approved' 
          THEN CAST((julianday(datetime('now')) - julianday(o.created_at)) AS INTEGER)
          ELSE NULL 
        END) as avgCloseDays
      FROM users u
      LEFT JOIN offers o ON u.id = o.agent_id
      WHERE u.hotel_id = ?
      AND u.role IN ('sales', 'manager')
      GROUP BY u.id, u.name
      ORDER BY revenue DESC
    `, [hotelId]);
    
    const agents = agentsResult.map(agent => {
      const totalClosed = agent.approved + (agent.offers - agent.approved);
      const winRate = totalClosed > 0 ? ((agent.approved / totalClosed) * 100).toFixed(1) : 0;
      
      return {
        userId: agent.userId,
        name: agent.name,
        offers: agent.offers || 0,
        approved: agent.approved || 0,
        winRate: parseFloat(winRate),
        revenue: agent.revenue || 0,
        avgCloseDays: agent.avgCloseDays ? parseFloat(agent.avgCloseDays).toFixed(1) : 0
      };
    });
    
    res.json(agents);
  } catch (err) {
    console.error('Agents performance error:', err);
    res.status(500).json({ error: 'Temsilci verileri alınamadı' });
  }
});

// 5. Kayıp Teklif Analizi
router.get('/lost-reasons', (req, res) => {
  try {
    const hotelId = req.user.hotel_id;
    
    // Gerçek verilerden kayıp sebeplerini al
    const reasonsResult = db.query(`
      SELECT 
        COALESCE(lost_reason, 'Belirtilmemiş') as reason,
        COUNT(*) as count
      FROM offers 
      WHERE hotel_id = ? 
      AND status = 'lost'
      GROUP BY lost_reason
      ORDER BY count DESC
    `, [hotelId]);
    
    res.json(reasonsResult);
  } catch (err) {
    console.error('Lost reasons error:', err);
    res.status(500).json({ error: 'Kayıp sebep verileri alınamadı' });
  }
});

// 6. Follow-up Disiplin Skoru
router.get('/followup-discipline', (req, res) => {
  try {
    const hotelId = req.user.hotel_id;
    const today = new Date().toISOString().split('T')[0];
    
    const disciplineResult = db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN follow_up_date >= ? THEN 1 ELSE 0 END) as onTimeCount
      FROM offers 
      WHERE hotel_id = ?
      AND status NOT IN ('approved', 'lost')
    `, [today, hotelId]);
    
    const total = disciplineResult[0]?.total || 0;
    const onTimeCount = disciplineResult[0]?.onTimeCount || 0;
    const lateCount = total - onTimeCount;
    
    const onTime = total > 0 ? Math.round((onTimeCount / total) * 100) : 100;
    const late = total > 0 ? Math.round((lateCount / total) * 100) : 0;
    
    res.json({ onTime, late });
  } catch (err) {
    console.error('Follow-up discipline error:', err);
    res.status(500).json({ error: 'Disiplin verileri alınamadı' });
  }
});

export default router;
