const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const { guestOnly, requireAuth } = require('../middleware/auth');

router.get('/login', guestOnly, (req, res) => {
  res.render('auth/login', { title: 'Login', redirect: req.query.redirect || '/' });
});

router.post('/login', guestOnly, (req, res) => {
  const { email, password, redirect } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('auth/login', { title: 'Login', error: 'Invalid email or password', redirect });
  }
  req.session.user = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_admin: user.is_admin
  };
  res.redirect(redirect || '/');
});

router.get('/register', guestOnly, (req, res) => {
  res.render('auth/register', { title: 'Create Account' });
});

router.post('/register', guestOnly, (req, res) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    return res.render('auth/register', { title: 'Create Account', error: 'Passwords do not match' });
  }
  if (password.length < 6) {
    return res.render('auth/register', { title: 'Create Account', error: 'Password must be at least 6 characters' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.render('auth/register', { title: 'Create Account', error: 'Email already registered' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)').run(first_name, last_name, email, hashed);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  req.session.user = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_admin: user.is_admin
  };
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/account', requireAuth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.session.user.id);
  res.render('auth/account', { title: 'My Account', orders });
});

router.post('/account/update', requireAuth, (req, res) => {
  const { first_name, last_name, address, city, postal_code, country, phone } = req.body;
  db.prepare('UPDATE users SET first_name = ?, last_name = ?, address = ?, city = ?, postal_code = ?, country = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(first_name, last_name, address, city, postal_code, country, phone, req.session.user.id);
  req.session.user.first_name = first_name;
  req.session.user.last_name = last_name;
  res.redirect('/auth/account?success=Profile updated');
});

module.exports = router;
