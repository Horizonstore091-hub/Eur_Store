require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initialize } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cartCount = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  res.locals.siteName = process.env.SITE_NAME || 'EuroCool Shop';
  res.locals.currentPath = req.path;
  next();
});

initialize().then(async () => {
  const { db } = require('./database');

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (!userCount || userCount.count === 0) {
    console.log('Empty database detected — seeding...');
    const seed = require('./seed');
    await seed();
    console.log('✅ Auto-seed complete');
  }

  app.use((req, res, next) => {
    try {
      res.locals.categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all();
    } catch (e) {
      res.locals.categories = [];
    }
    next();
  });

  const indexRoutes = require('./routes/index');
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const cartRoutes = require('./routes/cart');
  const checkoutRoutes = require('./routes/checkout');
  const adminRoutes = require('./routes/admin');

  app.use('/', indexRoutes);
  app.use('/auth', authRoutes);
  app.use('/products', productRoutes);
  app.use('/cart', cartRoutes);
  app.use('/checkout', checkoutRoutes);
  app.use('/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EuroCool Shop running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
