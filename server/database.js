import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

let pool;

export async function initDatabase() {
  // PostgreSQL için connection pool oluştur
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected successfully');
    } catch (err) {
      console.error('❌ PostgreSQL connection error:', err);
      throw err;
    }
  } else {
    console.warn('⚠️ DATABASE_URL not found, using in-memory mode (data will not persist)');
    // Fallback: in-memory mode for development
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    // SQLite için eski kod
    return initSQLite(db);
  }

  // PostgreSQL tables oluştur

  // PostgreSQL tables oluştur
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      included_users INTEGER DEFAULT 4,
      extra_users INTEGER DEFAULT 0,
      trial_ends_at TIMESTAMP,
      subscription_ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'sales' CHECK(role IN ('admin', 'manager', 'sales')),
      hotel_id INTEGER REFERENCES hotels(id),
      active INTEGER DEFAULT 1,
      trial_ends_at TIMESTAMP,
      subscription_ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      type TEXT DEFAULT 'company' CHECK(type IN ('company', 'agency')),
      hotel_id INTEGER NOT NULL REFERENCES hotels(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      agent_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('sent', 'waiting', 'revised', 'approved', 'lost')),
      lost_reason TEXT,
      price TEXT,
      amount DECIMAL(10,2),
      currency TEXT DEFAULT 'TRY' CHECK(currency IN ('TRY', 'EUR', 'USD')),
      check_in_date DATE,
      check_out_date DATE,
      guest_count INTEGER,
      room_count INTEGER,
      meeting_room TEXT,
      follow_up_date DATE NOT NULL,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      offer_id INTEGER NOT NULL REFERENCES offers(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      payment_id TEXT NOT NULL,
      conversation_id TEXT,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'TRY',
      package_type TEXT NOT NULL CHECK(package_type IN ('yearly', 'extra_users')),
      extra_users INTEGER DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending', 'refunded')),
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      refund_date TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_offers_hotel_id ON offers(hotel_id);
    CREATE INDEX IF NOT EXISTS idx_offers_agent_id ON offers(agent_id);
    CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
    CREATE INDEX IF NOT EXISTS idx_users_hotel_id ON users(hotel_id);
    CREATE INDEX IF NOT EXISTS idx_companies_hotel_id ON companies(hotel_id);
  `);

  // Create default admin user if not exists
  const result = await pool.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(result.rows[0].count) === 0) {
    const hashedPassword = bcrypt.hashSync('demo123', 10);
    await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
      ['demo@satisradar.com', hashedPassword, 'Demo Kullanıcı', 'admin']
    );
    console.log('✅ Default admin user created');
  }

  console.log('✅ Database initialized successfully');
}

export async function query(sql, params = []) {
  try {
    if (pool) {
      // PostgreSQL
      const result = await pool.query(sql, params);
      return result.rows;
    } else {
      // Fallback
      return [];
    }
  } catch (err) {
    console.error('Query error:', err, sql, params);
    return [];
  }
}

export async function run(sql, params = []) {
  try {
    if (pool) {
      // PostgreSQL
      const result = await pool.query(sql + ' RETURNING id', params);
      return { 
        lastInsertRowid: result.rows[0]?.id || null 
      };
    } else {
      return { lastInsertRowid: null };
    }
  } catch (err) {
    console.error('Run error:', err, sql, params);
    return { lastInsertRowid: null };
  }
}

export default { query, run };
