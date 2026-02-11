import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, canViewAllOffers } from '../middleware/permissions.js';

const router = express.Router();

router.use(authenticateToken);

// GET all offers - Rol bazlı filtreleme + hotel_id
router.get('/', (req, res) => {
  try {
    console.log('Get offers for user:', req.user);
    
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Admin ve Manager tüm teklifleri görür, Sales sadece kendininkileri (kendi otelinden)
    const query = canViewAllOffers(req.user.role)
      ? 'SELECT o.*, c.name as company_name, u.name as agent_name FROM offers o JOIN companies c ON o.company_id = c.id JOIN users u ON o.agent_id = u.id WHERE o.hotel_id = ? ORDER BY o.follow_up_date'
      : 'SELECT o.*, c.name as company_name, u.name as agent_name FROM offers o JOIN companies c ON o.company_id = c.id JOIN users u ON o.agent_id = u.id WHERE o.agent_id = ? AND o.hotel_id = ? ORDER BY o.follow_up_date';
    
    const offers = canViewAllOffers(req.user.role)
      ? db.query(query, [hotelId])
      : db.query(query, [req.user.id, hotelId]);
    
    console.log('Offers found:', offers.length);
    res.json(offers);
  } catch (err) {
    console.error('Get offers error:', err);
    res.json([]);
  }
});

// POST - Herkes teklif ekleyebilir (otomatik hotel_id eklenir)
router.post('/', (req, res) => {
  try {
    const { company_id, title, status, price, amount, currency, check_in_date, check_out_date, guest_count, room_count, meeting_room, follow_up_date } = req.body;
    
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    const result = db.run(
      'INSERT INTO offers (company_id, agent_id, title, status, price, amount, currency, check_in_date, check_out_date, guest_count, room_count, meeting_room, follow_up_date, hotel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [company_id, req.user.id, title, status, price || null, amount, currency || 'TRY', check_in_date || null, check_out_date || null, guest_count || null, room_count || null, meeting_room || null, follow_up_date, hotelId]
    );
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error('Create offer error:', err);
    res.status(500).json({ error: 'Teklif eklenemedi' });
  }
});

// PUT - Admin/Manager tüm teklifleri, Sales sadece kendininkileri düzenleyebilir (kendi otelinden)
router.put('/:id', (req, res) => {
  try {
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Önce teklifi kontrol et (hotel_id ile)
    const offers = db.query('SELECT * FROM offers WHERE id = ? AND hotel_id = ?', [req.params.id, hotelId]);
    if (offers.length === 0) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }
    
    const offer = offers[0];
    
    // Yetki kontrolü
    if (!canViewAllOffers(req.user.role) && offer.agent_id !== req.user.id) {
      return res.status(403).json({ error: 'Bu teklifi düzenleme yetkiniz yok' });
    }
    
    const { status, follow_up_date, price, amount, currency, check_in_date, check_out_date, guest_count, room_count, meeting_room, lost_reason } = req.body;
    
    // Approved_at tarihini ayarla
    let approvedAt = offer.approved_at;
    if (status === 'approved' && offer.status !== 'approved') {
      approvedAt = new Date().toISOString();
    }
    
    db.run(
      'UPDATE offers SET status = ?, follow_up_date = ?, price = ?, amount = ?, currency = ?, check_in_date = ?, check_out_date = ?, guest_count = ?, room_count = ?, meeting_room = ?, lost_reason = ?, approved_at = ? WHERE id = ? AND hotel_id = ?', 
      [status, follow_up_date, price || null, amount, currency || 'TRY', check_in_date || null, check_out_date || null, guest_count || null, room_count || null, meeting_room || null, lost_reason || null, approvedAt, req.params.id, hotelId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Update offer error:', err);
    res.status(500).json({ error: 'Teklif güncellenemedi' });
  }
});

// DELETE - Sadece Admin (kendi otelinden)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Sadece kendi otelinin teklifini sil
    db.run('DELETE FROM offers WHERE id = ? AND hotel_id = ?', [req.params.id, hotelId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete offer error:', err);
    res.status(500).json({ error: 'Teklif silinemedi' });
  }
});

router.get('/:id/notes', (req, res) => {
  try {
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Teklif kendi otelinden mi kontrol et
    const offers = db.query('SELECT id FROM offers WHERE id = ? AND hotel_id = ?', [req.params.id, hotelId]);
    if (offers.length === 0) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }
    
    const notes = db.query(
      'SELECT n.*, u.name as user_name FROM notes n JOIN users u ON n.user_id = u.id WHERE n.offer_id = ? ORDER BY n.created_at DESC',
      [req.params.id]
    );
    res.json(notes);
  } catch (err) {
    console.error('Get notes error:', err);
    res.json([]);
  }
});

router.post('/:id/notes', (req, res) => {
  try {
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Teklif kendi otelinden mi kontrol et
    const offers = db.query('SELECT id FROM offers WHERE id = ? AND hotel_id = ?', [req.params.id, hotelId]);
    if (offers.length === 0) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }
    
    const { content } = req.body;
    const result = db.run(
      'INSERT INTO notes (offer_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Not eklenemedi' });
  }
});

// Excel export - CSV formatında
router.get('/export/csv', (req, res) => {
  try {
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Teklifleri al (rol bazlı filtreleme)
    const query = canViewAllOffers(req.user.role)
      ? 'SELECT o.*, c.name as company_name, u.name as agent_name FROM offers o JOIN companies c ON o.company_id = c.id JOIN users u ON o.agent_id = u.id WHERE o.hotel_id = ? ORDER BY o.created_at DESC'
      : 'SELECT o.*, c.name as company_name, u.name as agent_name FROM offers o JOIN companies c ON o.company_id = c.id JOIN users u ON o.agent_id = u.id WHERE o.agent_id = ? AND o.hotel_id = ? ORDER BY o.created_at DESC';
    
    const offers = canViewAllOffers(req.user.role)
      ? db.query(query, [hotelId])
      : db.query(query, [req.user.id, hotelId]);
    
    // CSV başlıkları
    const headers = [
      'ID',
      'Firma',
      'Tür',
      'Durum',
      'Kayıp Sebebi',
      'Giriş Tarihi',
      'Çıkış Tarihi',
      'Kişi Sayısı',
      'Oda Sayısı',
      'Salon',
      'Takip Tarihi',
      'Temsilci',
      'Fiyat',
      'Tutar',
      'Para Birimi',
      'Oluşturma Tarihi',
      'Onay Tarihi'
    ];
    
    // CSV satırları
    const rows = offers.map(offer => [
      offer.id,
      offer.company_name,
      offer.title,
      offer.status,
      offer.lost_reason || '',
      offer.check_in_date || '',
      offer.check_out_date || '',
      offer.guest_count || '',
      offer.room_count || '',
      offer.meeting_room || '',
      offer.follow_up_date,
      offer.agent_name,
      offer.price || '',
      offer.amount || '',
      offer.currency,
      offer.created_at,
      offer.approved_at || ''
    ]);
    
    // CSV oluştur
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // UTF-8 BOM ekle (Excel için Türkçe karakter desteği)
    const csvWithBOM = '\uFEFF' + csv;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="teklifler-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvWithBOM);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'CSV export başarısız' });
  }
});

export default router;
