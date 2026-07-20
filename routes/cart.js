const express = require('express');
const router = express.Router();
const { db, getSetting } = require('../database');

router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  const items = [];
  let subtotal = 0;

  for (const item of cart) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
    if (product) {
      const total = product.price * item.quantity;
      subtotal += total;
      items.push({ ...product, quantity: item.quantity, total });
    }
  }

  const freeThreshold = parseFloat(getSetting('shipping_free_threshold') || 99);
  const shippingCost = parseFloat(getSetting('shipping_europe') || 9.99);

  res.render('cart/index', {
    title: 'Shopping Cart',
    items,
    subtotal,
    freeThreshold,
    shippingCost,
    shippingFree: subtotal >= freeThreshold
  });
});

router.post('/add', (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) return res.redirect('/products');

  if (!req.session.cart) req.session.cart = [];
  const existing = req.session.cart.find(item => item.product_id == product_id);
  if (existing) {
    existing.quantity += qty;
  } else {
    req.session.cart.push({ product_id: parseInt(product_id), quantity: qty });
  }

  res.redirect('/cart');
});

router.post('/update', (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = parseInt(quantity);

  if (!req.session.cart) return res.redirect('/cart');

  if (qty <= 0) {
    req.session.cart = req.session.cart.filter(item => item.product_id != product_id);
  } else {
    const item = req.session.cart.find(item => item.product_id == product_id);
    if (item) item.quantity = qty;
  }

  res.redirect('/cart');
});

router.post('/remove', (req, res) => {
  const { product_id } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.product_id != product_id);
  }
  res.redirect('/cart');
});

module.exports = router;
