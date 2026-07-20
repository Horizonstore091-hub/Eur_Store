const express = require('express');
const router = express.Router();
const { db } = require('../database');

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;
  const categorySlug = req.query.category;
  const sort = req.query.sort || 'newest';
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;
  const energyRating = req.query.energy;

  let where = 'WHERE p.is_active = 1';
  let params = [];

  if (categorySlug) {
    where += ' AND c.slug = ?';
    params.push(categorySlug);
  }
  if (minPrice) {
    where += ' AND p.price >= ?';
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    where += ' AND p.price <= ?';
    params.push(parseFloat(maxPrice));
  }
  if (energyRating) {
    const ratings = energyRating.split(',');
    where += ` AND p.energy_rating IN (${ratings.map(() => '?').join(',')})`;
    params.push(...ratings);
  }

  let orderBy = 'ORDER BY p.created_at DESC';
  if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
  else if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
  else if (sort === 'name') orderBy = 'ORDER BY p.name ASC';
  else if (sort === 'rating') orderBy = 'ORDER BY p.energy_rating ASC';

  const countQuery = `SELECT COUNT(*) as count FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`;
  const total = db.prepare(countQuery).get(...params);

  const query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${where}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const products = db.prepare(query).all(...params, limit, offset);
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all();

  res.render('products/index', {
    title: 'Cooling Products',
    products,
    categories,
    selectedCategory: categorySlug,
    sort,
    minPrice,
    maxPrice,
    energyRating,
    page,
    totalPages: Math.ceil(total.count / limit),
    total: total.count
  });
});

router.get('/:slug', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.is_active = 1
  `).get(req.params.slug);

  if (!product) return res.status(404).render('404', { title: 'Product Not Found' });

  const images = product.images ? JSON.parse(product.images) : [];
  const features = product.features ? JSON.parse(product.features) : [];

  const related = db.prepare(`
    SELECT * FROM products
    WHERE category_id = ? AND id != ? AND is_active = 1
    ORDER BY RANDOM() LIMIT 4
  `).all(product.category_id, product.id);

  const reviews = db.prepare(`
    SELECT r.*, u.first_name, u.last_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ? AND r.is_approved = 1
    ORDER BY r.created_at DESC
  `).all(product.id);

  const avgRating = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ? AND is_approved = 1').get(product.id);

  res.render('products/show', {
    title: product.name,
    product,
    images,
    features,
    related,
    reviews,
    avgRating
  });
});

router.post('/:id/review', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const { rating, title, comment } = req.body;
  db.prepare('INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.id, req.session.user.id, rating, title, comment);
  res.redirect(`/products/${req.params.slug || req.body.slug}#reviews`);
});

module.exports = router;
