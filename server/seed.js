import { query, run } from './database.js';
import bcrypt from 'bcryptjs';

export async function seedData() {
  // Check if data already exists
  const existingCompanies = query('SELECT COUNT(*) as count FROM companies');
  if (existingCompanies[0]?.count > 5) {
    console.log('Data already seeded, skipping...');
    return;
  }

  console.log('Seeding database with sample data...');

  // Add more users with different roles
  const hashedPassword = bcrypt.hashSync('agent123', 10);
  
  const newUsers = [
    { email: 'admin@hotel.com', name: 'Ahmet Yılmaz', role: 'admin' },
    { email: 'manager@hotel.com', name: 'Ayşe Demir', role: 'manager' },
    { email: 'agent1@hotel.com', name: 'Mehmet Kaya', role: 'sales' },
    { email: 'agent2@hotel.com', name: 'Zeynep Arslan', role: 'sales' }
  ];

  for (const user of newUsers) {
    const existing = query('SELECT id FROM users WHERE email = ?', [user.email]);
    if (existing.length === 0) {
      run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
        [user.email, hashedPassword, user.name, user.role]);
    }
  }

  // Add companies
  const companies = [
    { name: 'Tur Dünyası Turizm', contact_person: 'Mehmet Kaya', email: 'mehmet@turdunya.com', phone: '+90 212 555 0101', type: 'company' },
    { name: 'Gezgin Acentesi', contact_person: 'Zeynep Şahin', email: 'zeynep@gezgin.com', phone: '+90 212 555 0102', type: 'agency' },
    { name: 'Tatil Budur Travel', contact_person: 'Can Öztürk', email: 'can@tatilbudur.com', phone: '+90 212 555 0103', type: 'company' },
    { name: 'Jolly Tur', contact_person: 'Elif Yıldız', email: 'elif@jollytur.com', phone: '+90 212 555 0104', type: 'agency' },
    { name: 'Setur Turizm', contact_person: 'Burak Arslan', email: 'burak@setur.com', phone: '+90 212 555 0105', type: 'company' },
    { name: 'Anı Tur', contact_person: 'Selin Aydın', email: 'selin@anitur.com', phone: '+90 212 555 0106', type: 'agency' },
    { name: 'Etstur', contact_person: 'Emre Çelik', email: 'emre@etstur.com', phone: '+90 212 555 0107', type: 'company' },
    { name: 'Tatilsepeti', contact_person: 'Deniz Kara', email: 'deniz@tatilsepeti.com', phone: '+90 212 555 0108', type: 'agency' },
    { name: 'Odamax', contact_person: 'Murat Yılmaz', email: 'murat@odamax.com', phone: '+90 212 555 0109', type: 'company' },
    { name: 'Booking Türkiye', contact_person: 'Canan Öz', email: 'canan@booking.com.tr', phone: '+90 212 555 0110', type: 'agency' }
  ];

  // Get first hotel_id for seed data
  const hotels = query('SELECT id FROM hotels LIMIT 1');
  const hotelId = hotels[0]?.id || 1;

  const companyIds = [];
  for (const company of companies) {
    const result = run(
      'INSERT INTO companies (name, contact_person, email, phone, type, hotel_id) VALUES (?, ?, ?, ?, ?, ?)',
      [company.name, company.contact_person, company.email, company.phone, company.type, hotelId]
    );
    companyIds.push(result.lastInsertRowid);
  }

  // Get user IDs
  const users = query('SELECT id FROM users');
  const userIds = users.map(u => u.id);

  // Add offers
  const statuses = ['sent', 'waiting', 'revised', 'approved', 'lost'];
  const today = new Date();
  
  const offers = [
    { 
      company_id: companyIds[0], 
      agent_id: userIds[0], 
      title: 'Konaklama', 
      status: 'waiting', 
      price: '125.000 TL',
      amount: 125000,
      currency: 'TRY',
      check_in_date: '2025-06-15',
      check_out_date: '2025-06-22',
      guest_count: 100,
      room_count: 50,
      meeting_room: null,
      follow_up_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[1], 
      agent_id: userIds[0], 
      title: 'Konaklama-Toplantı', 
      status: 'sent', 
      price: '85.000 TL',
      amount: 85000,
      currency: 'TRY',
      check_in_date: '2025-07-01',
      check_out_date: '2025-07-05',
      guest_count: 30,
      room_count: 15,
      meeting_room: 'Kristal Salon',
      follow_up_date: today.toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[2], 
      agent_id: userIds[1] || userIds[0], 
      title: 'Düğün', 
      status: 'revised', 
      price: '180.000 TL',
      amount: 180000,
      currency: 'TRY',
      check_in_date: '2025-08-20',
      check_out_date: '2025-08-21',
      guest_count: 100,
      room_count: 40,
      meeting_room: null,
      follow_up_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[3], 
      agent_id: userIds[0], 
      title: 'Konaklama', 
      status: 'approved', 
      price: '95.000 TL',
      amount: 95000,
      currency: 'TRY',
      check_in_date: '2025-04-10',
      check_out_date: '2025-04-17',
      guest_count: 60,
      room_count: 30,
      meeting_room: null,
      follow_up_date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[4], 
      agent_id: userIds[1] || userIds[0], 
      title: 'Konaklama', 
      status: 'waiting', 
      price: '45.000 TL',
      amount: 45000,
      currency: 'TRY',
      check_in_date: '2025-05-15',
      check_out_date: '2025-05-17',
      guest_count: 20,
      room_count: 10,
      meeting_room: null,
      follow_up_date: today.toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[5], 
      agent_id: userIds[0], 
      title: 'Toplantı', 
      status: 'sent', 
      price: '12.500 EUR',
      amount: 12500,
      currency: 'EUR',
      check_in_date: '2025-09-05',
      check_out_date: '2025-09-08',
      guest_count: 150,
      room_count: 60,
      meeting_room: 'Mavi Salon',
      follow_up_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[6], 
      agent_id: userIds[1] || userIds[0], 
      title: 'Konaklama-Toplantı', 
      status: 'revised', 
      price: '220.000 TL',
      amount: 220000,
      currency: 'TRY',
      check_in_date: '2025-12-31',
      check_out_date: '2026-01-01',
      guest_count: 200,
      room_count: 80,
      meeting_room: 'Altın Salon',
      follow_up_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[7], 
      agent_id: userIds[0], 
      title: 'Konaklama', 
      status: 'lost', 
      price: '8.500 EUR',
      amount: 8500,
      currency: 'EUR',
      check_in_date: '2025-06-01',
      check_out_date: '2025-06-10',
      guest_count: 25,
      room_count: 12,
      meeting_room: null,
      follow_up_date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[8], 
      agent_id: userIds[1] || userIds[0], 
      title: 'Konaklama', 
      status: 'waiting', 
      price: '150.000 TL',
      amount: 150000,
      currency: 'TRY',
      check_in_date: '2025-03-01',
      check_out_date: '2025-03-31',
      guest_count: 50,
      room_count: 25,
      meeting_room: null,
      follow_up_date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    { 
      company_id: companyIds[9], 
      agent_id: userIds[0], 
      title: 'Konaklama', 
      status: 'approved', 
      price: '35.000 EUR',
      amount: 35000,
      currency: 'EUR',
      check_in_date: '2025-05-01',
      check_out_date: '2025-10-31',
      guest_count: 300,
      room_count: 150,
      meeting_room: null,
      follow_up_date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];

  const offerIds = [];
  for (const offer of offers) {
    const result = run(
      'INSERT INTO offers (company_id, agent_id, title, status, price, amount, currency, check_in_date, check_out_date, guest_count, room_count, meeting_room, follow_up_date, hotel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [offer.company_id, offer.agent_id, offer.title, offer.status, offer.price, offer.amount, offer.currency, offer.check_in_date, offer.check_out_date, offer.guest_count, offer.room_count, offer.meeting_room, offer.follow_up_date, hotelId]
    );
    offerIds.push(result.lastInsertRowid);
  }

  // Add notes to some offers
  const notes = [
    { offer_id: offerIds[0], user_id: userIds[0], content: 'Müşteri ile görüşme yapıldı. Fiyat konusunda olumlu geri dönüş aldık.' },
    { offer_id: offerIds[0], user_id: userIds[0], content: 'Yarın tekrar arayıp nihai kararı öğreneceğiz.' },
    { offer_id: offerIds[1], user_id: userIds[0], content: 'Teklif e-posta ile gönderildi. Karar için 3 gün süre istediler.' },
    { offer_id: offerIds[2], user_id: userIds[1] || userIds[0], content: 'Fiyat revize edildi. %10 indirim uygulandı.' },
    { offer_id: offerIds[2], user_id: userIds[1] || userIds[0], content: 'Müşteri yeni teklifi değerlendiriyor.' },
    { offer_id: offerIds[3], user_id: userIds[0], content: 'Sözleşme imzalandı. Ödeme planı oluşturuldu.' },
    { offer_id: offerIds[6], user_id: userIds[1] || userIds[0], content: 'Menü seçenekleri güncellendi. Yeni teklif hazırlandı.' },
    { offer_id: offerIds[8], user_id: userIds[1] || userIds[0], content: 'Müşteri ile acil görüşme gerekiyor. Rakip otel teklifi var.' }
  ];

  for (const note of notes) {
    run(
      'INSERT INTO notes (offer_id, user_id, content) VALUES (?, ?, ?)',
      [note.offer_id, note.user_id, note.content]
    );
  }

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${companies.length} firma eklendi`);
  console.log(`   - ${offers.length} teklif eklendi`);
  console.log(`   - ${notes.length} not eklendi`);
}
