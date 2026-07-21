const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, getSetting, updateSetting } = require('../database');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', (req, res) => {
  const stats = {
    totalProducts: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
    activeProducts: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count,
    totalOrders: db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
    pendingOrders: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending' OR status = 'confirmed'").get().count,
    totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    totalRevenue: db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status != 'refunded'").get().total,
    lowStock: db.prepare('SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= 5').get().count,
    outOfStock: db.prepare('SELECT COUNT(*) as count FROM products WHERE stock = 0 AND is_active = 1').get().count,
  };

  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
  const topProducts = db.prepare(`
    SELECT p.id, p.name, p.price, p.stock, p.sku, COALESCE(SUM(oi.quantity), 0) as total_sold
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 10
  `).all();

  const monthlyRevenue = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders_count
    FROM orders
    WHERE payment_status != 'refunded'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `).all();

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    stats,
    recentOrders,
    topProducts,
    monthlyRevenue
  });
});

router.get('/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let where = '';
  let params = [];
  if (search) {
    where = 'WHERE p.name LIKE ? OR p.sku LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM products p ${where}`).get(...params);
  const products = db.prepare(`
    SELECT p.*, c.name as category_name,
      COALESCE(SUM(oi.quantity), 0) as total_sold
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    ${where}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.render('admin/products', {
    title: 'Manage Products',
    products,
    search,
    page,
    totalPages: Math.ceil(total.count / limit),
    total: total.count
  });
});

router.get('/products/new', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  res.render('admin/product-form', { title: 'Add Product', product: null, categories });
});

router.post('/products/new', (req, res) => {
  const {
    name, description, short_description, price, compare_price, cost_price,
    sku, stock, category_id, brand, weight, dimensions, energy_rating,
    noise_level, coverage_area, power_consumption, features, is_featured
  } = req.body;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

  const featuresJson = features ? JSON.stringify(features.split('\n').filter(f => f.trim())) : '[]';

  db.prepare(`
    INSERT INTO products (name, slug, description, short_description, price, compare_price, cost_price, sku, stock, category_id, brand, weight, dimensions, energy_rating, noise_level, coverage_area, power_consumption, features, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, slug, description, short_description, parseFloat(price), compare_price ? parseFloat(compare_price) : null, cost_price ? parseFloat(cost_price) : null, sku, parseInt(stock), category_id || null, brand, weight ? parseFloat(weight) : null, dimensions, energy_rating, noise_level, coverage_area, power_consumption, featuresJson, is_featured ? 1 : 0);

  res.redirect('/admin/products?success=Product created');
});

router.get('/products/edit/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.redirect('/admin/products');
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  res.render('admin/product-form', { title: 'Edit Product', product, categories });
});

router.post('/products/edit/:id', (req, res) => {
  const {
    name, description, short_description, price, compare_price, cost_price,
    sku, stock, category_id, brand, weight, dimensions, energy_rating,
    noise_level, coverage_area, power_consumption, features, is_featured, is_active
  } = req.body;

  const featuresJson = features ? JSON.stringify(features.split('\n').filter(f => f.trim())) : '[]';

  db.prepare(`
    UPDATE products SET name=?, description=?, short_description=?, price=?, compare_price=?, cost_price=?,
    sku=?, stock=?, category_id=?, brand=?, weight=?, dimensions=?, energy_rating=?, noise_level=?,
    coverage_area=?, power_consumption=?, features=?, is_featured=?, is_active=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(name, description, short_description, parseFloat(price), compare_price ? parseFloat(compare_price) : null, cost_price ? parseFloat(cost_price) : null, sku, parseInt(stock), category_id || null, brand, weight ? parseFloat(weight) : null, dimensions, energy_rating, noise_level, coverage_area, power_consumption, featuresJson, is_featured ? 1 : 0, is_active ? 1 : 0, req.params.id);

  res.redirect('/admin/products?success=Product updated');
});

router.post('/products/delete/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.redirect('/admin/products?success=Product deleted');
});

router.get('/categories', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `).all();
  res.render('admin/categories', { title: 'Manage Categories', categories });
});

router.post('/categories/new', (req, res) => {
  const { name, description } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(name, slug, description);
  res.redirect('/admin/categories?success=Category created');
});

router.post('/categories/edit/:id', (req, res) => {
  const { name, description, sort_order } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  db.prepare('UPDATE categories SET name=?, slug=?, description=?, sort_order=? WHERE id=?').run(name, slug, description, parseInt(sort_order || 0), req.params.id);
  res.redirect('/admin/categories?success=Category updated');
});

router.post('/categories/delete/:id', (req, res) => {
  db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(req.params.id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.redirect('/admin/categories?success=Category deleted');
});

router.get('/orders', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const status = req.query.status || '';
  const search = req.query.search || '';

  let where = '';
  let params = [];
  if (status) {
    where = 'WHERE o.status = ?';
    params.push(status);
  }
  if (search) {
    where = where ? `${where} AND (o.order_number LIKE ? OR o.email LIKE ? OR o.first_name LIKE ? OR o.last_name LIKE ?)` : 'WHERE (o.order_number LIKE ? OR o.email LIKE ? OR o.first_name LIKE ? OR o.last_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM orders o ${where}`).get(...params);
  const orders = db.prepare(`SELECT * FROM orders o ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  res.render('admin/orders', {
    title: 'Manage Orders',
    orders,
    status,
    search,
    page,
    totalPages: Math.ceil(total.count / limit),
    total: total.count
  });
});

router.get('/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.redirect('/admin/orders');
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.render('admin/order-detail', { title: `Order ${order.order_number}`, order, items });
});

router.post('/orders/:id/status', (req, res) => {
  const { status, payment_status, notes } = req.body;
  db.prepare("UPDATE orders SET status=?, payment_status=?, notes=COALESCE(?, notes), updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .run(status, payment_status, notes, req.params.id);
  res.redirect(`/admin/orders/${req.params.id}?success=Order updated`);
});

router.get('/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let where = '';
  let params = [];
  if (search) {
    where = 'WHERE u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM users u ${where}`).get(...params);
  const users = db.prepare(`
    SELECT u.*, COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    ${where}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const totalCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  res.render('admin/users', { title: 'Manage Users', users, search, page, totalPages: Math.ceil(total.count / limit), total: totalCount });
});

router.get('/users/edit/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.redirect('/admin/users');
  res.render('admin/user-form', { title: 'Edit User', user });
});

router.post('/users/edit/:id', (req, res) => {
  const { first_name, last_name, email, password, address, city, postal_code, country, phone, is_admin } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.redirect('/admin/users');

  if (password && password.length > 0) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET first_name=?, last_name=?, email=?, password=?, address=?, city=?, postal_code=?, country=?, phone=?, is_admin=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .run(first_name, last_name, email, hash, address, city, postal_code, country, phone, is_admin ? 1 : 0, req.params.id);
  } else {
    db.prepare('UPDATE users SET first_name=?, last_name=?, email=?, address=?, city=?, postal_code=?, country=?, phone=?, is_admin=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .run(first_name, last_name, email, address, city, postal_code, country, phone, is_admin ? 1 : 0, req.params.id);
  }

  res.redirect('/admin/users?success=User updated');
});

router.post('/users/toggle-admin/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (user && user.id !== req.session.user.id) {
    db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(user.is_admin ? 0 : 1, req.params.id);
  }
  res.redirect('/admin/users?success=User updated');
});

router.get('/payments', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;
  const status = req.query.status || '';
  const search = req.query.search || '';

  let where = '';
  let params = [];
  if (status) {
    where = 'WHERE o.payment_status = ?';
    params.push(status);
  }
  if (search) {
    where = where ? `${where} AND (o.order_number LIKE ? OR o.email LIKE ?)` : 'WHERE (o.order_number LIKE ? OR o.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM orders o ${where}`).get(...params);
  const payments = db.prepare(`
    SELECT o.id, o.order_number, o.email, o.first_name, o.last_name,
      o.total, o.payment_method, o.payment_status, o.notes, o.created_at,
      o.currency
    FROM orders o
    ${where}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const paymentMethodLabels = {
    crypto_btc: 'Bitcoin (BTC)',
    crypto_eth: 'Ethereum (ETH)',
    crypto_usdt: 'Tether (USDT)',
    crypto_usdc: 'USD Coin (USDC)',
    gift_steam: 'Steam Gift Card',
    gift_razer: 'Razer Gold',
    gift_apple: 'Apple Gift Card',
  };

  res.render('admin/payments', {
    title: 'Payments',
    payments,
    paymentMethodLabels,
    status,
    search,
    page,
    totalPages: Math.ceil(total.count / limit),
    total: total.count
  });
});

router.post('/payments/update/:id', (req, res) => {
  const { payment_status, notes } = req.body;
  db.prepare("UPDATE orders SET payment_status=?, notes=COALESCE(?, notes), updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .run(payment_status, notes, req.params.id);
  res.redirect('/admin/payments?success=Payment updated');
});

router.get('/settings', (req, res) => {
  const settings = db.getAllSettings();
  res.render('admin/settings', { title: 'Settings', settings });
});

router.post('/settings', (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    updateSetting(key, value);
  }
  res.redirect('/admin/settings?success=Settings saved');
});

router.get('/reviews', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, p.name as product_name, u.first_name, u.last_name
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `).all();
  res.render('admin/reviews', { title: 'Manage Reviews', reviews });
});

router.post('/reviews/approve/:id', (req, res) => {
  db.prepare('UPDATE reviews SET is_approved = 1 WHERE id = ?').run(req.params.id);
  res.redirect('/admin/reviews?success=Review approved');
});

router.post('/reviews/delete/:id', (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.redirect('/admin/reviews?success=Review deleted');
});

router.get('/pages', (req, res) => {
  const pages = db.prepare('SELECT * FROM pages ORDER BY created_at DESC').all();
  res.render('admin/pages', { title: 'Manage Pages', pages });
});

router.get('/pages/new', (req, res) => {
  res.render('admin/page-form', { title: 'New Page', page: null });
});

router.post('/pages/new', (req, res) => {
  const { title, content, meta_description } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  db.prepare('INSERT INTO pages (title, slug, content, meta_description) VALUES (?, ?, ?, ?)').run(title, slug, content, meta_description);
  res.redirect('/admin/pages?success=Page created');
});

router.get('/pages/edit/:id', (req, res) => {
  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(req.params.id);
  if (!page) return res.redirect('/admin/pages');
  res.render('admin/page-form', { title: 'Edit Page', page });
});

router.post('/pages/edit/:id', (req, res) => {
  const { title, content, meta_description, is_active } = req.body;
  db.prepare('UPDATE pages SET title=?, content=?, meta_description=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(title, content, meta_description, is_active ? 1 : 0, req.params.id);
  res.redirect('/admin/pages?success=Page updated');
});

router.post('/pages/delete/:id', (req, res) => {
  db.prepare('DELETE FROM pages WHERE id = ?').run(req.params.id);
  res.redirect('/admin/pages?success=Page deleted');
});

module.exports = router;
