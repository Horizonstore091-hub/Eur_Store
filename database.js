const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const dbPath = path.join(__dirname, 'data', 'shop.db');
let db = null;
let ready = false;
let inTransaction = false;

function ensureDataDir() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveDb() {
  if (db && !inTransaction) {
    ensureDataDir();
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

function query(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function queryOne(sql, params) {
  const results = query(sql, params);
  return results[0];
}

function execute(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDb();
  const rows = db.exec("SELECT last_insert_rowid() as id");
  return { lastInsertRowid: rows[0]?.values[0]?.[0] };
}

const wrapper = {
  prepare(sql) {
    return {
      get: (...params) => queryOne(sql, params.length ? params : null),
      all: (...params) => query(sql, params.length ? params : null),
      run: (...params) => execute(sql, params.length ? params : null),
    };
  },
  exec(sql) { return db.exec(sql); },
  transaction(fn) {
    return function(...args) {
      inTransaction = true;
      db.exec("BEGIN");
      try {
        const result = fn.apply(this, args);
        db.exec("COMMIT");
        return result;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      } finally {
        inTransaction = false;
        saveDb();
      }
    };
  }
};

function initialize() {
  return new Promise((resolve, reject) => {
    if (ready) return resolve();
    initSqlJs().then(SQL => {
      ensureDataDir();
      if (fs.existsSync(dbPath)) {
        db = new SQL.Database(fs.readFileSync(dbPath));
      } else {
        db = new SQL.Database();
      }

      db.exec(`
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, address TEXT, city TEXT, postal_code TEXT, country TEXT DEFAULT 'DE', phone TEXT, is_admin INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, image TEXT, sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, short_description TEXT, price REAL NOT NULL, compare_price REAL, cost_price REAL, sku TEXT UNIQUE, stock INTEGER DEFAULT 0, category_id INTEGER, image TEXT, images TEXT, brand TEXT, weight REAL, dimensions TEXT, energy_rating TEXT, noise_level TEXT, coverage_area TEXT, power_consumption TEXT, features TEXT, is_featured INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL);
        CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_number TEXT UNIQUE NOT NULL, user_id INTEGER, email TEXT NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, postal_code TEXT NOT NULL, country TEXT NOT NULL, phone TEXT, status TEXT DEFAULT 'pending', payment_status TEXT DEFAULT 'pending', payment_method TEXT, subtotal REAL NOT NULL, shipping_cost REAL DEFAULT 0, tax REAL DEFAULT 0, total REAL NOT NULL, currency TEXT DEFAULT 'EUR', notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);
        CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER, product_name TEXT NOT NULL, product_sku TEXT, quantity INTEGER NOT NULL, price REAL NOT NULL, total REAL NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL);
        CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, user_id INTEGER, rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5), title TEXT, comment TEXT, is_approved INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);
        CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, content TEXT, meta_description TEXT, is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
      `);

      const settingCount = queryOne('SELECT COUNT(*) as count FROM settings');
      if (!settingCount || settingCount.count === 0) {
        for (const [k, v] of [
          ['site_name', 'EuroCool Shop'], ['site_description', 'Premium cooling solutions for European homes and offices'],
          ['currency', 'EUR'], ['shipping_europe', '9.99'], ['shipping_free_threshold', '99.00'],
          ['tax_rate', '19'], ['contact_email', 'hello@eurocool.shop'], ['contact_phone', '+49 30 12345678'],
          ['address', 'Friedrichstraße 123, 10117 Berlin, Germany'],
          ['footer_text', '© 2024 EuroCool Shop. All rights reserved.'],
          ['stripe_key', 'sk_test_placeholder'],
        ]) execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [k, v]);
      }

      saveDb();
      ready = true;
      resolve();
    }).catch(reject);
  });
}

function getSetting(key) {
  const row = queryOne('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : null;
}

function getAllSettings() {
  return query('SELECT key, value FROM settings').reduce((a, r) => { a[r.key] = r.value; return a; }, {});
}

function updateSetting(key, value) {
  execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

module.exports = { db: wrapper, initialize, getSetting, getAllSettings, updateSetting };
