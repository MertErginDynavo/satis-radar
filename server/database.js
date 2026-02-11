import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

let db;

export async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  let buffer;
  try {
    buffer = fs.readFileSync('hotel-sales.db');
  } catch (err) {
    buffer = null;
  }
  
  db = new SQL.Database(buffer);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'sales' CHECK(role IN ('admin', 'manager', 'sales')),
      hotel_id INTEGER,
      active INTEGER DEFAULT 1,
      trial_ends_at DATETIME,
      subscription_ends_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      included_users INTEGER DEFAULT 4,
      extra_users INTEGER DEFAULT 0,
      trial_ends_at DATETIME,
      subscription_ends_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      type TEXT DEFAULT 'company' CHECK(type IN ('company', 'agency')),
      hotel_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      agent_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('sent', 'waiting', 'revised', 'approved', 'lost')),
      lost_reason TEXT,
      price TEXT,
      amount REAL,
      currency TEXT DEFAULT 'TRY' CHECK(currency IN ('TRY', 'EUR', 'USD')),
      check_in_date DATE,
      check_out_date DATE,
      guest_count INTEGER,
      room_count INTEGER,
      meeting_room TEXT,
      follow_up_date DATE NOT NULL,
      hotel_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (agent_id) REFERENCES users(id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (offer_id) REFERENCES offers(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      payment_id TEXT NOT NULL,
      conversation_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'TRY',
      package_type TEXT NOT NULL CHECK(package_type IN ('yearly', 'extra_users')),
      extra_users INTEGER DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending', 'refunded')),
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      refund_date DATETIME,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const result = db.exec('SELECT COUNT(*) as count FROM users');
  if (result.length === 0 || result[0].values[0][0] === 0) {
    // Create a default admin user
    const hashedPassword = bcrypt.hashSync('demo123', 10);
    const stmt = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    stmt.bind(['demo@satisradar.com', hashedPassword, 'Demo Kullanıcı', 'admin']);
    stmt.step();
    stmt.free();
  }

  saveDatabase();
  console.log('Database initialized successfully');
}

export function saveDatabase() {
  const data = db.export();
  fs.writeFileSync('hotel-sales.db', data);
}

export function query(sql, params = []) {
  try {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    db.run('COMMIT');
    
    return rows;
  } catch (err) {
    console.error('Query error:', err, sql, params);
    db.run('ROLLBACK');
    return [];
  }
}

export function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    
    const lastId = db.exec('SELECT last_insert_rowid()');
    saveDatabase();
    
    return { 
      lastInsertRowid: lastId.length > 0 ? lastId[0].values[0][0] : null 
    };
  } catch (err) {
    console.error('Run error:', err, sql, params);
    return { lastInsertRowid: null };
  }
}

export default { query, run };
