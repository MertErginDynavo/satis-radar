// Deneme süresi hatırlatma job'ı
// Bu dosya cron job veya scheduled task olarak çalıştırılmalı

import { query } from '../database.js';
import { sendTrialEndingEmail, sendTrialEndedEmail } from '../services/emailService.js';

// Her gün çalışacak - deneme süresi bitmek üzere olan otelleri kontrol eder
export async function checkTrialEndingHotels() {
  try {
    // 24 saat içinde deneme süresi bitecek otelleri bul
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hotels = query(`
      SELECT h.id, h.name, h.trial_ends_at, u.email, u.name as admin_name
      FROM hotels h
      JOIN users u ON u.hotel_id = h.id AND u.role = 'admin'
      WHERE h.trial_ends_at IS NOT NULL
        AND h.subscription_ends_at IS NULL
        AND datetime(h.trial_ends_at) BETWEEN datetime(?) AND datetime(?)
    `, [today.toISOString(), tomorrow.toISOString()]);

    console.log(`Found ${hotels.length} hotels with trial ending in 24 hours`);

    for (const hotel of hotels) {
      // E-posta gönder
      await sendTrialEndingEmail(hotel.name, hotel.email);
      
      console.log(`Trial ending email sent to ${hotel.name} (${hotel.email})`);
    }

    return { success: true, count: hotels.length };
  } catch (error) {
    console.error('Error checking trial ending hotels:', error);
    return { success: false, error: error.message };
  }
}

// Deneme süresi bitmiş otelleri kontrol et
export async function checkTrialEndedHotels() {
  try {
    const now = new Date();

    const hotels = query(`
      SELECT h.id, h.name, h.trial_ends_at, u.email, u.name as admin_name
      FROM hotels h
      JOIN users u ON u.hotel_id = h.id AND u.role = 'admin'
      WHERE h.trial_ends_at IS NOT NULL
        AND h.subscription_ends_at IS NULL
        AND datetime(h.trial_ends_at) < datetime(?)
    `, [now.toISOString()]);

    console.log(`Found ${hotels.length} hotels with expired trial`);

    for (const hotel of hotels) {
      // E-posta gönder (sadece bir kez gönderilmesi için flag eklenebilir)
      await sendTrialEndedEmail(hotel.name, hotel.email);
      
      console.log(`Trial ended email sent to ${hotel.name} (${hotel.email})`);
    }

    return { success: true, count: hotels.length };
  } catch (error) {
    console.error('Error checking trial ended hotels:', error);
    return { success: false, error: error.message };
  }
}

// Manuel test için
export async function testTrialReminder() {
  console.log('=== Testing Trial Reminder System ===');
  
  console.log('\n1. Checking hotels with trial ending in 24 hours...');
  const endingResult = await checkTrialEndingHotels();
  console.log('Result:', endingResult);
  
  console.log('\n2. Checking hotels with expired trial...');
  const endedResult = await checkTrialEndedHotels();
  console.log('Result:', endedResult);
  
  console.log('\n=== Test Complete ===');
}
