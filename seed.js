require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, initialize } = require('./database');

async function seed() {
  await initialize();
  console.log('🌱 Seeding database...');

  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
  db.prepare(`INSERT OR IGNORE INTO users (email, password, first_name, last_name, is_admin)
    VALUES (?, ?, ?, ?, 1)`).run(process.env.ADMIN_EMAIL || 'admin@eurocool.shop', hash, 'Admin', 'User');

  const categories = [
    { name: 'Air Conditioners', slug: 'air-conditioners', description: 'Portable and window air conditioning units for efficient home cooling', sort_order: 1 },
    { name: 'Tower Fans', slug: 'tower-fans', description: 'Slim, powerful tower fans for quiet air circulation', sort_order: 2 },
    { name: 'Pedestal Fans', slug: 'pedestal-fans', description: 'Adjustable standing fans for versatile room cooling', sort_order: 3 },
    { name: 'Desk Fans', slug: 'desk-fans', description: 'Compact personal fans for office and desktop use', sort_order: 4 },
    { name: 'Evaporative Coolers', slug: 'evaporative-coolers', description: 'Energy-efficient air coolers that use water evaporation', sort_order: 5 },
    { name: 'Ceiling Fans', slug: 'ceiling-fans', description: 'Modern ceiling fans for year-round comfort', sort_order: 6 },
    { name: 'Smart Cooling', slug: 'smart-cooling', description: 'WiFi-enabled smart thermostats and cooling devices', sort_order: 7 },
    { name: 'Accessories', slug: 'accessories', description: 'Cooling accessories including mattress toppers and neck fans', sort_order: 8 },
  ];

  const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)');
  for (const c of categories) {
    insertCat.run(c.name, c.slug, c.description, c.sort_order);
  }

  const allCats = db.prepare('SELECT * FROM categories').all();
  const categoryMap = {};
  for (const c of allCats) {
    categoryMap[c.slug] = c.id;
  }

  const products = [
    {
      name: 'ArcticFlow Pro 12000 BTU Portable AC', slug: 'arcticflow-pro-12000',
      description: 'Powerful portable air conditioner designed for European summers. Features energy-efficient inverter technology with EU A++ energy rating. Cools rooms up to 45m² with whisper-quiet operation. Includes heat pump function for year-round use.\n\nKey Specifications:\n- Cooling capacity: 12000 BTU (3.5 kW)\n- Coverage: up to 45 m²\n- Energy rating: A++\n- Noise level: 35 dB (low speed)\n- Dimensions: 45 × 35 × 70 cm\n- Weight: 28 kg\n- Refrigerant: R32 (eco-friendly)\n- EU plug: Schuko (Type F)',
      short_description: 'Powerful 12000 BTU portable AC with A++ energy rating — perfect for European apartments',
      price: 449.99, compare_price: 599.99, sku: 'AF-PRO-12000-EU', stock: 25,
      category_id: categoryMap['air-conditioners'], brand: 'ArcticFlow', weight: 28, dimensions: '45 × 35 × 70 cm',
      energy_rating: 'A++', noise_level: '35 dB', coverage_area: '45 m²', power_consumption: '1050W',
      features: JSON.stringify(['Inverter compressor', 'Heat pump function', 'Remote control', '24-hour timer', 'Sleep mode', 'Auto swing', 'Dehumidifier mode', 'Castor wheels', 'Schuko plug (Type F)']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'BreezeTower Silent 900 Tower Fan', slug: 'breezetower-silent-900',
      description: 'Ultra-slim tower fan with 90° oscillation and 12 speed settings. Features bladeless-style safe design with DC motor for silent operation — ideal for bedrooms and offices. Includes remote control and programmable timer.',
      short_description: 'Ultra-quiet tower fan with DC motor — 12 speeds, 90° oscillation, remote control',
      price: 129.99, compare_price: 169.99, sku: 'BT-SILENT-900-EU', stock: 50,
      category_id: categoryMap['tower-fans'], brand: 'BreezeTower', weight: 6.5, dimensions: '30 × 30 × 90 cm',
      energy_rating: 'A++', noise_level: '22 dB', coverage_area: '35 m²', power_consumption: '45W',
      features: JSON.stringify(['DC motor — ultra quiet', '12 speed settings', '90° oscillation', 'Remote control', '8-hour timer', 'Sleep mode', 'Natural wind mode']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1624898135772-0e4991a9d80c?w=400&h=400&fit=crop'
    },
    {
      name: 'EuroCool Mist 500 Evaporative Cooler', slug: 'eurocool-mist-500',
      description: 'Energy-efficient evaporative air cooler for dry European climates. Uses natural water evaporation to drop temperatures by up to 8°C. Features 40L water tank for all-night operation, ice compartments for extra cooling, and 3-speed fan.\n\nPerfect for: Spain, Italy, Greece, and Southern France where dry heat prevails.',
      short_description: 'Evaporative cooler with 40L tank — drops temperature by 8°C, perfect for Southern Europe',
      price: 199.99, compare_price: 259.99, sku: 'EC-MIST-500-EU', stock: 35,
      category_id: categoryMap['evaporative-coolers'], brand: 'EuroCool', weight: 12, dimensions: '40 × 35 × 85 cm',
      energy_rating: 'A+', noise_level: '42 dB', coverage_area: '40 m²', power_consumption: '180W',
      features: JSON.stringify(['40L water tank', 'Ice compartment', '3 fan speeds', 'Remote control', 'Auto shut-off', 'Castor wheels', 'Water level indicator']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1602523366596-7c5df2fe7323?w=400&h=400&fit=crop'
    },
    {
      name: 'SmartCool WiFi Thermostat Pro', slug: 'smartcool-wifi-thermostat',
      description: 'Intelligent WiFi thermostat for controlling your home cooling system from anywhere. Works with Alexa and Google Home. Features AI learning that adapts to your schedule, reducing energy consumption by up to 30%. EU-standard backplate compatible with most European heating/cooling systems.',
      short_description: 'Smart WiFi thermostat with AI learning — compatible with Alexa & Google Home',
      price: 89.99, compare_price: null, sku: 'SC-WIFI-THERM-EU', stock: 100,
      category_id: categoryMap['smart-cooling'], brand: 'SmartCool', weight: 0.3, dimensions: '8 × 8 × 2 cm',
      energy_rating: 'A+++', noise_level: '0 dB', coverage_area: null, power_consumption: '2W',
      features: JSON.stringify(['WiFi connected', 'Alexa & Google Home', 'AI learning schedule', 'Energy reports', 'Geofencing', 'EU standard backplate', 'Touch display']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop'
    },
    {
      name: 'DeskChill Pro USB Desk Fan', slug: 'deskchill-pro-usb',
      description: 'Premium USB-powered desk fan with brushless DC motor. Features 4 speed settings, 180° tilt, and ultra-quiet operation at just 18 dB. USB-C powered — works with laptops, power banks, and wall adapters. Ideal for home office and hot desks across Europe.',
      short_description: 'USB-C desk fan — whisper-quiet 18dB, 4 speeds, 180° tilt, perfect for home office',
      price: 34.99, compare_price: 44.99, sku: 'DC-PRO-USB-EU', stock: 200,
      category_id: categoryMap['desk-fans'], brand: 'DeskChill', weight: 0.8, dimensions: '15 × 10 × 18 cm',
      energy_rating: 'A+++', noise_level: '18 dB', coverage_area: null, power_consumption: '5W',
      features: JSON.stringify(['USB-C powered', '4 speed settings', '180° tilt', 'Brushless DC motor', '18 dB silent operation', 'Non-slip base', 'Removable front cover']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1617201833818-6a0b4c4b6f5c?w=400&h=400&fit=crop'
    },
    {
      name: 'ArcticBreeze 75cm Pedestal Fan', slug: 'arcticbreeze-75cm-pedestal',
      description: 'Heavy-duty 75cm pedestal fan with powerful airflow for large rooms. Features 3 speed settings, 120° oscillation, and adjustable height from 120-150cm. Built with European safety standards and a 5-year motor warranty.',
      short_description: '75cm pedestal fan with powerful airflow — adjustable height, 120° oscillation',
      price: 79.99, compare_price: 99.99, sku: 'AB-75-PED-EU', stock: 45,
      category_id: categoryMap['pedestal-fans'], brand: 'ArcticBreeze', weight: 7.2, dimensions: '45 × 45 × 120-150 cm',
      energy_rating: 'A+', noise_level: '38 dB', coverage_area: '50 m²', power_consumption: '65W',
      features: JSON.stringify(['75cm blade span', '3 speed settings', '120° oscillation', 'Adjustable height', '5-year motor warranty', 'CE certified', 'Metal base']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop'
    },
    {
      name: 'ChillCeiling Nordic 52" DC Fan', slug: 'chillceiling-nordic-52',
      description: 'Sleek Scandinavian-designed ceiling fan with DC motor for silent operation. Includes LED light kit with warm/cool switching. Reversible function for winter use (circulates warm air). 52" blade span suitable for living rooms up to 30m².',
      short_description: 'Scandinavian ceiling fan with LED light — DC motor, reversible for winter use',
      price: 249.99, compare_price: 319.99, sku: 'CC-NORDIC-52-EU', stock: 20,
      category_id: categoryMap['ceiling-fans'], brand: 'ChillCeiling', weight: 6.8, dimensions: '52" (132 cm) blade span',
      energy_rating: 'A++', noise_level: '20 dB', coverage_area: '30 m²', power_consumption: '35W',
      features: JSON.stringify(['DC motor', 'LED light kit', 'Warm/cool switching', 'Reversible for winter', '6 speeds', 'Remote control', 'Scandinavian design']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585128792020-5e9f3e0b1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'CoolRest Gel Mattress Topper', slug: 'coolrest-gel-topper',
      description: 'Advanced cooling gel mattress topper that regulates sleeping temperature. Features phase-change material that absorbs and releases heat throughout the night. Reduces night sweats and improves sleep quality during hot European summers. Machine washable cover.',
      short_description: 'Cooling gel mattress topper with phase-change material — reduces night sweats',
      price: 119.99, compare_price: 149.99, sku: 'CR-GEL-TOPPER-EU', stock: 60,
      category_id: categoryMap['accessories'], brand: 'CoolRest', weight: 3.5, dimensions: '180 × 200 × 4 cm (EU King)',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: null,
      features: JSON.stringify(['Phase-change material', 'Gel-infused memory foam', '4 cm thickness', 'Breathable cover', 'Machine washable', 'Hypoallergenic']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop'
    },
    {
      name: 'NeckBreeze Wearable Neck Fan', slug: 'neckbreeze-wearable',
      description: 'Hands-free wearable neck fan — perfect for commuting, outdoor events, and hot offices. Features 72 air outlets for 360° cooling, 4000mAh battery for up to 16 hours use, and 3 speed settings. USB-C charging. Ultra-lightweight at only 280g.',
      short_description: 'Wearable neck fan with 16h battery — 360° cooling, USB-C, only 280g',
      price: 49.99, compare_price: 69.99, sku: 'NB-WEARABLE-EU', stock: 150,
      category_id: categoryMap['accessories'], brand: 'NeckBreeze', weight: 0.28, dimensions: '15 × 20 × 5 cm',
      energy_rating: 'A+++', noise_level: '25 dB', coverage_area: null, power_consumption: '8W',
      features: JSON.stringify(['72 air outlets', '4000mAh battery', '16 hours runtime', '3 speeds', 'USB-C charging', '280g ultra-light', 'Hands-free design']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1608058544420-3d0f3c9d1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'WindowCool 9000 BTU Window AC', slug: 'windowcool-9000-window',
      description: 'Compact window air conditioner ideal for smaller European apartments. 9000 BTU cooling capacity covers rooms up to 28m². Features energy-saving Eco mode, dehumidifier function, and easy slide-in installation for standard European windows.',
      short_description: '9000 BTU window AC for small apartments — Eco mode, covers 28m²',
      price: 349.99, compare_price: 429.99, sku: 'WC-9000-WIN-EU', stock: 15,
      category_id: categoryMap['air-conditioners'], brand: 'WindowCool', weight: 22, dimensions: '45 × 35 × 40 cm',
      energy_rating: 'A+', noise_level: '40 dB', coverage_area: '28 m²', power_consumption: '800W',
      features: JSON.stringify(['9000 BTU cooling', 'Eco mode', 'Dehumidifier', 'Remote control', '24-hour timer', 'Sleep mode']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'PureAir Cool 3-in-1 Air Purifier & Fan', slug: 'pureair-cool-3in1',
      description: '3-in-1 air purifier, cooling fan, and air circulator. HEPA H13 filter removes 99.97% of airborne particles including pollen, dust, and smoke — ideal for allergy sufferers during hot weather. Cools while cleaning the air in rooms up to 35m².',
      short_description: '3-in-1 purifier & fan — HEPA H13 filter removes allergens while cooling',
      price: 179.99, compare_price: 219.99, sku: 'PA-COOL-3IN1-EU', stock: 40,
      category_id: categoryMap['tower-fans'], brand: 'PureAir', weight: 8.5, dimensions: '30 × 30 × 70 cm',
      energy_rating: 'A+', noise_level: '30 dB', coverage_area: '35 m²', power_consumption: '55W',
      features: JSON.stringify(['HEPA H13 filter', 'Activated carbon filter', '3 fan speeds', 'Auto mode', 'Air quality sensor', 'Sleep mode']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1617201833818-6a0b4c4b6f5c?w=400&h=400&fit=crop'
    },
    {
      name: 'SolarBreeze Solar-Powered Attic Fan', slug: 'solarbreeze-attic-fan',
      description: 'Solar-powered ventilation fan for attics, garages, and sheds. Reduces indoor temperature by up to 10°C using free solar energy. No wiring needed — installs in minutes. Perfect for Southern European homes looking to reduce cooling costs.',
      short_description: 'Solar-powered attic fan — reduces indoor temp by 10°C, no wiring needed',
      price: 159.99, compare_price: null, sku: 'SB-SOLAR-ATTIC-EU', stock: 30,
      category_id: categoryMap['evaporative-coolers'], brand: 'SolarBreeze', weight: 4.5, dimensions: '50 × 50 × 20 cm',
      energy_rating: 'A+++', noise_level: '28 dB', coverage_area: null, power_consumption: '0W (solar)',
      features: JSON.stringify(['Solar powered', 'No electricity cost', 'Easy installation', 'Automatic operation', 'Weatherproof', 'Reduces temp by 10°C']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
    },
  ];

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, slug, description, short_description, price, compare_price, sku, stock, category_id, brand, weight, dimensions, energy_rating, noise_level, coverage_area, power_consumption, features, is_featured, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p.name, p.slug, p.description, p.short_description, p.price, p.compare_price, p.sku, p.stock, p.category_id, p.brand, p.weight, p.dimensions, p.energy_rating, p.noise_level, p.coverage_area, p.power_consumption, p.features, p.is_featured, p.image);
    }
  });
  insertMany(products);

  db.prepare(`INSERT OR IGNORE INTO pages (title, slug, content, meta_description, is_active) VALUES (?, ?, ?, ?, ?)`).run(
    'About Us', 'about',
    'EuroCool Shop is Germany\'s premier online retailer of cooling products for the European market. Founded in 2020, we have helped thousands of European households stay comfortable during increasingly warm summers.\n\nOur mission is to provide energy-efficient, eco-friendly cooling solutions that are specifically designed for European homes and electrical standards. All our products carry CE certification and meet or exceed EU energy efficiency requirements.\n\nWe are based in Berlin, Germany and ship to all EU countries plus Switzerland, Norway, and the United Kingdom.',
    'Learn about EuroCool Shop — Europe\'s trusted cooling products retailer', 1
  );

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${products.length} products`);
  console.log('   - Admin user: admin@eurocool.shop / Admin123!');
  console.log('   - About page created');
}

if (require.main === module) {
  seed().then(() => {
    console.log('\n🚀 Run "npm start" to launch the shop!');
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
