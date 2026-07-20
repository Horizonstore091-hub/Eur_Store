const express = require('express');
const router = express.Router();
const { db } = require('../database');

router.get('/', (req, res) => {
  const featured = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = 1 AND p.is_active = 1
    ORDER BY p.created_at DESC
    LIMIT 8
  `).all();

  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all();

  const bestsellers = db.prepare(`
    SELECT p.*, c.name as category_name,
      COALESCE(SUM(oi.quantity), 0) as total_sold
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    WHERE p.is_active = 1
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 4
  `).all();

  res.render('index', {
    title: 'Home',
    featured,
    categories,
    bestsellers
  });
});

router.get('/search', (req, res) => {
  const q = req.query.q || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const products = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(`%${q}%`, `%${q}%`, `%${q}%`, limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) as count
    FROM products p
    WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)
  `).get(`%${q}%`, `%${q}%`, `%${q}%`);

  res.render('search', {
    title: `Search: ${q}`,
    products,
    query: q,
    page,
    totalPages: Math.ceil(total.count / limit),
    total: total.count
  });
});

router.get('/page/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM pages WHERE slug = ? AND is_active = 1').get(req.params.slug);
  if (!page) return res.status(404).render('404', { title: 'Page Not Found' });
  res.render('page', { title: page.title, page });
});

module.exports = router;
