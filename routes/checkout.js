const express = require('express');
const router = express.Router();
const { db, getSetting } = require('../database');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');

  const items = [];
  let subtotal = 0;
  let invalidStock = false;

  for (const item of cart) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
    if (!product) continue;
    if (product.stock < item.quantity) invalidStock = true;
    const total = product.price * item.quantity;
    subtotal += total;
    items.push({ ...product, quantity: item.quantity, total });
  }

  const freeThreshold = parseFloat(getSetting('shipping_free_threshold') || 99);
  const shippingCost = subtotal >= freeThreshold ? 0 : parseFloat(getSetting('shipping_europe') || 9.99);
  const taxRate = parseFloat(getSetting('tax_rate') || 19);
  const tax = (subtotal + shippingCost) * (taxRate / 100);

  res.render('checkout/index', {
    title: 'Checkout',
    items,
    subtotal,
    shippingCost,
    tax,
    total: subtotal + shippingCost + tax,
    invalidStock,
    user: req.session.user
  });
});

router.post('/place', requireAuth, (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');

  const { first_name, last_name, email, address, city, postal_code, country, phone, payment_method } = req.body;

  const items = [];
  let subtotal = 0;

  for (const item of cart) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
    if (!product || product.stock < item.quantity) {
      return res.redirect('/checkout?error=Stock unavailable');
    }
    const total = product.price * item.quantity;
    subtotal += total;
    items.push({ product, quantity: item.quantity, total });
  }

  const freeThreshold = parseFloat(getSetting('shipping_free_threshold') || 99);
  const shippingCost = subtotal >= freeThreshold ? 0 : parseFloat(getSetting('shipping_europe') || 9.99);
  const taxRate = parseFloat(getSetting('tax_rate') || 19);
  const tax = (subtotal + shippingCost) * (taxRate / 100);
  const total = subtotal + shippingCost + tax;

  const orderNumber = 'ECO-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const placeOrder = db.transaction(() => {
    const orderResult = db.prepare(`
      INSERT INTO orders (order_number, user_id, email, first_name, last_name, address, city, postal_code, country, phone, status, payment_status, payment_method, subtotal, shipping_cost, tax, total, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'pending', ?, ?, ?, ?, ?, 'EUR')
    `).run(orderNumber, req.session.user.id, email, first_name, last_name, address, city, postal_code, country, phone, payment_method, subtotal, shippingCost, tax, total);

    const orderId = orderResult.lastInsertRowid;

    for (const item of items) {
      db.prepare('INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(orderId, item.product.id, item.product.name, item.product.sku, item.quantity, item.product.price, item.total);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product.id);
    }

    return orderId;
  });

  const orderId = placeOrder();
  req.session.cart = [];
  req.session.lastOrder = orderNumber;

  res.redirect(`/checkout/payment/${orderNumber}`);
});

router.get('/payment/:orderNumber', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ? AND user_id = ?').get(req.params.orderNumber, req.session.user.id);
  if (!order) return res.redirect('/');

  const cryptoAddresses = {
    btc: getSetting('crypto_btc') || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: getSetting('crypto_eth') || '0x742d35Cc6634C0532925a3b844Bc876e5505B3b9',
    usdt: getSetting('crypto_usdt') || '0x742d35Cc6634C0532925a3b844Bc876e5505B3b9',
    usdc: getSetting('crypto_usdc') || '0x742d35Cc6634C0532925a3b844Bc876e5505B3b9',
  };

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

  res.render('checkout/payment', { title: 'Complete Payment', order, items, cryptoAddresses });
});

router.post('/payment/:orderNumber/confirm', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ? AND user_id = ?').get(req.params.orderNumber, req.session.user.id);
  if (!order) return res.redirect('/');

  const { txid, gift_code } = req.body;

  let notes = '';
  if (order.payment_method.startsWith('crypto')) {
    notes = 'Transaction ID: ' + (txid || 'N/A');
  } else if (order.payment_method.startsWith('gift')) {
    notes = 'Gift Card Code: ' + (gift_code || 'N/A');
  }

  db.prepare("UPDATE orders SET payment_status = 'paid', notes = ? WHERE id = ?").run(notes, order.id);

  res.redirect(`/checkout/confirmation/${order.order_number}`);
});

router.get('/confirmation/:orderNumber', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ? AND user_id = ?').get(req.params.orderNumber, req.session.user.id);
  if (!order) return res.redirect('/');

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

  res.render('checkout/confirmation', { title: 'Order Confirmed', order, items });
});

module.exports = router;
