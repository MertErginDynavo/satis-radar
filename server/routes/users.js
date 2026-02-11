import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/permissions.js';
import { sendUserInviteEmail } from '../services/emailService.js';

const router = express.Router();

// Get all users in the same hotel - ADMIN ONLY
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.query(
      'SELECT id, email, name, role FROM users WHERE hotel_id = (SELECT hotel_id FROM users WHERE id = ?)',
      [req.user.id]
    );
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
});

// Add new user (invite) - ADMIN ONLY
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Get hotel info
    const hotels = db.query(
      'SELECT h.*, (SELECT COUNT(*) FROM users WHERE hotel_id = h.id) as current_users FROM hotels h WHERE h.id = (SELECT hotel_id FROM users WHERE id = ?)',
      [req.user.id]
    );
    
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Otel bulunamadı' });
    }
    
    const hotel = hotels[0];
    const maxUsers = hotel.included_users + hotel.extra_users;
    
    // Check user limit
    if (hotel.current_users >= maxUsers) {
      return res.status(403).json({ 
        error: 'Kullanıcı limitine ulaştınız',
        message: 'Paketinize ek kullanıcı ekleyebilirsiniz'
      });
    }
    
    // Check if email already exists
    const existingUsers = db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }
    
    // Create temporary password (user will set their own)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(tempPassword, 10);
    
    const result = db.run(
      'INSERT INTO users (email, password, name, role, hotel_id) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, role || 'sales', hotel.id]
    );
    
    // Get inviter info
    const inviter = db.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const inviterName = inviter[0]?.name || 'Yönetici';
    
    // Send invitation email
    try {
      await sendUserInviteEmail(hotel.name, email, name, tempPassword, inviterName);
      console.log(`✅ Invitation email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Invitation email error:', emailError);
      // Don't fail user creation if email fails
    }
    
    res.json({ 
      success: true, 
      message: 'Kullanıcı davet edildi',
      tempPassword: tempPassword // Only for demo/testing
    });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ error: 'Kullanıcı eklenemedi' });
  }
});

// Update user - ADMIN ONLY
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;
    
    // Kullanıcının kendi otelinden olduğunu kontrol et
    const users = db.query(
      'SELECT u.*, (SELECT hotel_id FROM users WHERE id = ?) as admin_hotel_id FROM users u WHERE u.id = ?',
      [req.user.id, userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    // Aynı otelden mi kontrol et
    if (user.hotel_id !== user.admin_hotel_id) {
      return res.status(403).json({ error: 'Bu kullanıcıyı düzenleme yetkiniz yok' });
    }
    
    // Kendi rolünü değiştiremez
    if (parseInt(userId) === req.user.id && role && role !== user.role) {
      return res.status(403).json({ error: 'Kendi rolünüzü değiştiremezsiniz' });
    }
    
    // E-posta değişikliği kontrolü
    if (email && email !== user.email) {
      const existingUsers = db.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
      }
    }
    
    // Kullanıcıyı güncelle
    db.run(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name || user.name, email || user.email, role || user.role, userId]
    );
    
    res.json({ success: true, message: 'Kullanıcı güncellendi' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
  }
});

// Delete user - ADMIN ONLY
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    
    // Kendi hesabını silemez
    if (parseInt(userId) === req.user.id) {
      return res.status(403).json({ error: 'Kendi hesabınızı silemezsiniz' });
    }
    
    // Kullanıcının kendi otelinden olduğunu kontrol et
    const users = db.query(
      'SELECT u.*, (SELECT hotel_id FROM users WHERE id = ?) as admin_hotel_id FROM users u WHERE u.id = ?',
      [req.user.id, userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    // Aynı otelden mi kontrol et
    if (user.hotel_id !== user.admin_hotel_id) {
      return res.status(403).json({ error: 'Bu kullanıcıyı silme yetkiniz yok' });
    }
    
    // Kullanıcıyı sil
    db.run('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Kullanıcı silinemedi' });
  }
});

// Deactivate/Activate user - ADMIN ONLY
router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    const { active } = req.body;
    
    // Kendi hesabını deaktive edemez
    if (parseInt(userId) === req.user.id) {
      return res.status(403).json({ error: 'Kendi hesabınızı deaktive edemezsiniz' });
    }
    
    // Kullanıcının kendi otelinden olduğunu kontrol et
    const users = db.query(
      'SELECT u.*, (SELECT hotel_id FROM users WHERE id = ?) as admin_hotel_id FROM users u WHERE u.id = ?',
      [req.user.id, userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    // Aynı otelden mi kontrol et
    if (user.hotel_id !== user.admin_hotel_id) {
      return res.status(403).json({ error: 'Bu kullanıcının durumunu değiştirme yetkiniz yok' });
    }
    
    // Kullanıcı durumunu güncelle
    db.run(
      'UPDATE users SET active = ? WHERE id = ?',
      [active ? 1 : 0, userId]
    );
    
    res.json({ 
      success: true, 
      message: active ? 'Kullanıcı aktif edildi' : 'Kullanıcı deaktive edildi' 
    });
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({ error: 'Kullanıcı durumu değiştirilemedi' });
  }
});

export default router;
