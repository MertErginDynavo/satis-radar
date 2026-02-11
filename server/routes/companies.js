import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/permissions.js';

const router = express.Router();

router.use(authenticateToken);

// GET - Herkes görebilir (sadece kendi otelinin firmaları)
router.get('/', (req, res) => {
  try {
    console.log('Get companies for user:', req.user);
    
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Sadece kendi otelinin firmalarını getir
    const companies = db.query('SELECT * FROM companies WHERE hotel_id = ? ORDER BY name', [hotelId]);
    console.log('Companies found:', companies.length);
    res.json(companies);
  } catch (err) {
    console.error('Get companies error:', err);
    res.json([]);
  }
});

// POST - Sadece Admin (otomatik hotel_id eklenir)
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, contact_person, email, phone, type } = req.body;
    
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    const result = db.run(
      'INSERT INTO companies (name, contact_person, email, phone, type, hotel_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, contact_person, email, phone, type || 'company', hotelId]
    );
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ error: 'Firma eklenemedi' });
  }
});

// PUT - Sadece Admin (sadece kendi otelinin firması)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { name, contact_person, email, phone, type } = req.body;
    
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Sadece kendi otelinin firmasını güncelle
    db.run(
      'UPDATE companies SET name = ?, contact_person = ?, email = ?, phone = ?, type = ? WHERE id = ? AND hotel_id = ?',
      [name, contact_person, email, phone, type, req.params.id, hotelId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({ error: 'Firma güncellenemedi' });
  }
});

// DELETE - Sadece Admin (sadece kendi otelinin firması)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    // Kullanıcının hotel_id'sini al
    const users = db.query('SELECT hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const hotelId = users[0].hotel_id;
    
    // Sadece kendi otelinin firmasını sil
    db.run('DELETE FROM companies WHERE id = ? AND hotel_id = ?', [req.params.id, hotelId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete company error:', err);
    res.status(500).json({ error: 'Firma silinemedi' });
  }
});

export default router;
