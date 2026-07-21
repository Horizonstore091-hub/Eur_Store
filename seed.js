require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, initialize } = require('./database');

async function seed() {
  await initialize();
  console.log('Seeding database...');

  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
  db.prepare(`INSERT OR IGNORE INTO users (email, password, first_name, last_name, is_admin)
    VALUES (?, ?, ?, ?, 1)`).run(process.env.ADMIN_EMAIL || 'admin@eurocool.shop', hash, 'Admin', 'User');

  const categories = [
    { name: 'Air Conditioners', slug: 'air-conditioners', description: 'Portable and window air conditioning units for efficient home cooling', sort_order: 1 },
    { name: 'Tower Fans', slug: 'tower-fans', description: 'Slim powerful tower fans for quiet air circulation', sort_order: 2 },
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
  const cat = {};
  for (const c of allCats) {
    cat[c.slug] = c.id;
  }

  const products = [
    {
      name: 'Inventor Chilly II 12000 BTU Portable AC', slug: 'inventor-chilly-12000',
      description: 'Top-rated portable air conditioner from Inventor, the leading Greek AC brand. Features inverter technology with A++ energy rating. Cools rooms up to 40m2 with whisper-quiet operation. Includes heat pump for winter use, dehumidifier, and 24-hour programmable timer. R32 eco-friendly refrigerant.',
      short_description: 'Inventor 12000 BTU portable AC, A++ energy, heat pump, cools 40m2',
      price: 349.99, compare_price: 449.99, sku: 'INV-CHILLY-1200-EU', stock: 30,
      category_id: cat['air-conditioners'], brand: 'Inventor', weight: 26, dimensions: '45 x 36 x 72 cm',
      energy_rating: 'A++', noise_level: '34 dB', coverage_area: '40 m2', power_consumption: '1050W',
      features: JSON.stringify(['Inverter compressor', 'Heat pump function', '24-hour timer', 'Sleep mode', 'Dehumidifier', 'R32 refrigerant', 'Remote control', 'Schuko plug']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'Dyson Purifier Hot+Cool HP07', slug: 'dyson-hp07-purifier',
      description: 'Dyson HP07 purifying fan heater that cools, heats, and purifies the air. HEPA H13 filter captures 99.95% of allergens. Air Multiplier technology projects powerful airflow. Automatically senses and reacts to air quality. Works as a bladeless fan in summer and a heater in winter.',
      short_description: 'Dyson HP07 3-in-1 purifier fan heater, HEPA H13, bladeless, air quality sensing',
      price: 449.99, compare_price: 599.99, sku: 'DY-HP07-EU', stock: 20,
      category_id: cat['tower-fans'], brand: 'Dyson', weight: 5.6, dimensions: '22 x 22 x 105 cm',
      energy_rating: 'A+', noise_level: '26 dB', coverage_area: '40 m2', power_consumption: '40W',
      features: JSON.stringify(['HEPA H13 filter', 'Air Multiplier', 'Air quality sensing', 'Cool and heat', '10 speeds', 'Sleep timer', 'Remote control', 'Night mode']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1624898135772-0e4991a9d80c?w=400&h=400&fit=crop'
    },
    {
      name: 'Olimpia Splendid Dolceclima Pro 9000', slug: 'olimpia-splendid-dolceclima',
      description: 'Italian-designed evaporative air cooler from Olimpia Splendid. Uses natural water evaporation to drop temperatures by up to 7C. 30L water tank for overnight operation, ice packs for extra cooling, and 3-speed centrifugal fan. Ideal for dry climates in Spain, Italy, and Southern France.',
      short_description: 'Olimpia Splendid evaporative cooler, 30L tank, cools 35m2, Italian design',
      price: 149.99, compare_price: 199.99, sku: 'OS-DOLCE-9000-EU', stock: 40,
      category_id: cat['evaporative-coolers'], brand: 'Olimpia Splendid', weight: 10.5, dimensions: '38 x 32 x 82 cm',
      energy_rating: 'A+', noise_level: '40 dB', coverage_area: '35 m2', power_consumption: '160W',
      features: JSON.stringify(['30L tank', 'Ice pack compartment', '3 speeds', 'Auto shut-off', 'Castor wheels', 'Water level indicator', 'Remote control']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1602523366596-7c5df2fe7323?w=400&h=400&fit=crop'
    },
    {
      name: 'Tado Smart Thermostat V3+', slug: 'tado-smart-thermostat-v3',
      description: 'Tado V3+ smart thermostat with intelligent scheduling and geofencing. Automatically adjusts temperature when you leave or return. Works with Alexa, Google Home, and Apple HomeKit. Reduces heating and cooling energy by up to 31%. EU-standard backplate fits most European systems.',
      short_description: 'Tado V3+ smart thermostat, geofencing, Alexa/Google/HomeKit, saves 31% energy',
      price: 79.99, compare_price: 99.99, sku: 'TADO-V3PLUS-EU', stock: 80,
      category_id: cat['smart-cooling'], brand: 'Tado', weight: 0.25, dimensions: '8 x 8 x 2.5 cm',
      energy_rating: 'A+++', noise_level: '0 dB', coverage_area: null, power_consumption: '1.5W',
      features: JSON.stringify(['Geofencing', 'Alexa/Google/HomeKit', 'Weather adaptation', 'Energy reports', 'EU backplate', 'Touch display', 'App control']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop'
    },
    {
      name: 'Rowi Silent Storm 40 USB Desk Fan', slug: 'rowi-silent-storm-40',
      description: 'German-engineered USB desk fan from Rowi with brushless DC motor. Features 4 speed settings, 180 tilt, whisper-quiet 18dB operation. USB-C powered, works with laptops, power banks, and wall adapters. Non-slip rubber base, removable front cover for cleaning.',
      short_description: 'Rowi USB desk fan, 18dB silent, 4 speeds, 180 tilt, USB-C, German design',
      price: 24.99, compare_price: 34.99, sku: 'ROW-SS-40-EU', stock: 250,
      category_id: cat['desk-fans'], brand: 'Rowi', weight: 0.7, dimensions: '14 x 9 x 17 cm',
      energy_rating: 'A+++', noise_level: '18 dB', coverage_area: null, power_consumption: '4W',
      features: JSON.stringify(['USB-C powered', '4 speeds', '180 tilt', 'Brushless DC', '18 dB silent', 'Non-slip base', 'Removable cover']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1617201833818-6a0b4c4b6f5c?w=400&h=400&fit=crop'
    },
    {
      name: 'Fakir Stand-Lufter 50cm Pedestal Fan', slug: 'fakir-stand-lufter-50',
      description: 'Powerful 50cm pedestal fan from Fakir, trusted German brand since 1957. 3 speed settings, 120 oscillation, adjustable height 120-150cm. 5-year motor warranty, CE certified, sturdy metal base. Ideal for living rooms, bedrooms, and offices.',
      short_description: 'Fakir 50cm pedestal fan, 3 speeds, 120 oscillation, 5-year warranty, German quality',
      price: 59.99, compare_price: 79.99, sku: 'FAK-SL-50-EU', stock: 55,
      category_id: cat['pedestal-fans'], brand: 'Fakir', weight: 6.8, dimensions: '45 x 45 x 120-150 cm',
      energy_rating: 'A+', noise_level: '36 dB', coverage_area: '50 m2', power_consumption: '60W',
      features: JSON.stringify(['50cm blades', '3 speeds', '120 oscillation', 'Adjustable height', '5-year warranty', 'CE certified', 'Metal base']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop'
    },
    {
      name: 'Westinghouse Bendan 56" DC Ceiling Fan', slug: 'westinghouse-bendan-ceiling',
      description: 'Westinghouse Bendan 56-inch ceiling fan with DC motor for whisper-quiet operation. Integrated LED light with warm to cool switching. Reversible motor for summer and winter use. 6 speed settings with remote control. Scandinavian walnut design suits modern European interiors.',
      short_description: 'Westinghouse 56" DC ceiling fan with LED light, reversible, 6 speeds, remote',
      price: 199.99, compare_price: 259.99, sku: 'WH-BENDAN-56-EU', stock: 25,
      category_id: cat['ceiling-fans'], brand: 'Westinghouse', weight: 6.2, dimensions: '56 inch (142 cm) blade span',
      energy_rating: 'A++', noise_level: '19 dB', coverage_area: '35 m2', power_consumption: '30W',
      features: JSON.stringify(['DC motor', 'LED light', 'Warm/cool switching', 'Reversible', '6 speeds', 'Remote control', 'Walnut finish']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585128792020-5e9f3e0b1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'EMERIO CoolFlow Gel Mattress Topper', slug: 'emerio-gel-topper',
      description: 'EMERIO cooling gel mattress topper with phase-change material. Regulates sleeping temperature by absorbing and releasing heat. 4cm thick gel-infused memory foam, breathable bamboo cover, machine washable. EU King size 180x200cm. Reduces night sweats and improves sleep quality.',
      short_description: 'EMERIO cooling gel mattress topper, phase-change, 4cm, EU King, machine washable',
      price: 79.99, compare_price: 109.99, sku: 'EM-GEL-TOPPER-EU', stock: 70,
      category_id: cat['accessories'], brand: 'EMERIO', weight: 3.2, dimensions: '180 x 200 x 4 cm (EU King)',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: null,
      features: JSON.stringify(['Phase-change material', 'Gel-infused memory foam', '4 cm thick', 'Bamboo cover', 'Machine washable', 'Hypoallergenic']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop'
    },
    {
      name: 'JISULIFE Handheld Neck Fan Pro3', slug: 'jisulife-neck-fan-pro3',
      description: 'JISULIFE Pro3 wearable neck fan, 2025 bestseller. 72 air outlets for 360 cooling, 4000mAh battery for up to 16 hours. 3 speed settings, USB-C charging, ultra-light 280g. Hands-free design ideal for commuting, outdoor events, and hot offices. 2025 German Design Award winner.',
      short_description: 'JISULIFE Pro3 neck fan, 16h battery, 360 cooling, 280g, award-winning design',
      price: 34.99, compare_price: 49.99, sku: 'JIS-PRO3-NECK-EU', stock: 180,
      category_id: cat['accessories'], brand: 'JISULIFE', weight: 0.28, dimensions: '15 x 20 x 5 cm',
      energy_rating: 'A+++', noise_level: '24 dB', coverage_area: null, power_consumption: '7W',
      features: JSON.stringify(['72 air outlets', '4000mAh battery', '16h runtime', '3 speeds', 'USB-C', '280g ultra-light', 'Award-winning']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1608058544420-3d0f3c9d1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'Midea Duo Smart 12000 BTU Window AC', slug: 'midea-duo-smart-window',
      description: 'Midea Duo Smart inverter window AC with U-shape design that lets you close your window. 12000 BTU cools rooms up to 35m2. Ultra-quiet 35dB operation, WiFi controlled, works with Alexa and Google Home. A++ energy rating, R32 refrigerant. Easy DIY installation.',
      short_description: 'Midea Duo 12000 BTU U-shaped window AC, WiFi, Alexa, A++, ultra-quiet',
      price: 399.99, compare_price: 499.99, sku: 'MID-DUO-12000-EU', stock: 18,
      category_id: cat['air-conditioners'], brand: 'Midea', weight: 24, dimensions: '56 x 38 x 42 cm',
      energy_rating: 'A++', noise_level: '35 dB', coverage_area: '35 m2', power_consumption: '900W',
      features: JSON.stringify(['U-shaped design', 'Inverter', 'WiFi control', 'Alexa/Google', '35 dB quiet', 'R32 refrigerant', 'DIY install']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'ProBreeze 3-in-1 Air Purifier Fan', slug: 'probreeze-3in1-purifier',
      description: 'ProBreeze 3-in-1 air purifier, cooling fan, and circulator. True HEPA H13 filter removes 99.97% of pollen, dust, smoke, and pet dander. 3 fan speeds with oscillation. Quiet 30dB operation, perfect for bedrooms and offices. Covers rooms up to 35m2.',
      short_description: 'ProBreeze 3-in-1 purifier fan, HEPA H13, covers 35m2, 30dB, oscillation',
      price: 119.99, compare_price: 159.99, sku: 'PB-3IN1-HEPA-EU', stock: 50,
      category_id: cat['tower-fans'], brand: 'ProBreeze', weight: 7.8, dimensions: '28 x 28 x 68 cm',
      energy_rating: 'A+', noise_level: '30 dB', coverage_area: '35 m2', power_consumption: '50W',
      features: JSON.stringify(['HEPA H13 filter', 'Activated carbon', '3 fan speeds', 'Oscillation', 'Auto mode', 'Sleep mode', 'Air quality sensor']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1617201833818-6a0b4c4b6f5c?w=400&h=400&fit=crop'
    },
    {
      name: 'Bionaire Solar-Powered Attic Ventilator', slug: 'bionaire-solar-attic',
      description: 'Bionaire solar-powered attic ventilator that reduces indoor temperature by up to 10C. Zero electricity cost, no wiring required, installs in minutes. Weatherproof design with automatic thermostat control. Ideal for Southern European homes looking to reduce cooling costs.',
      short_description: 'Bionaire solar attic fan, reduces temp 10C, zero electricity, no wiring',
      price: 129.99, compare_price: 169.99, sku: 'BIO-SOLAR-ATTIC-EU', stock: 35,
      category_id: cat['evaporative-coolers'], brand: 'Bionaire', weight: 4.2, dimensions: '48 x 48 x 18 cm',
      energy_rating: 'A+++', noise_level: '26 dB', coverage_area: null, power_consumption: '0W (solar)',
      features: JSON.stringify(['Solar powered', 'Zero electricity', 'Easy install', 'Thermostat control', 'Weatherproof', 'Reduces temp 10C']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
    },
    {
      name: 'Hama Mini Clip Fan USB-C', slug: 'hama-mini-clip-usbc',
      description: 'Hama compact USB-C clip-on fan from Germany. 360 adjustable head, 3 speeds, whisper-quiet 15dB. Runs up to 10 hours on a power bank. Perfect for desks, strollers, tents, and travel. Non-slip clip with rubber padding. Awarded Stiftung Warentest "Gut" (Good).',
      short_description: 'Hama USB-C clip fan, 15dB silent, 10h runtime, 360 head, Stiftung Warentest Gut',
      price: 14.99, compare_price: 19.99, sku: 'HAM-CLIP-USBC-EU', stock: 350,
      category_id: cat['desk-fans'], brand: 'Hama', weight: 0.22, dimensions: '9 x 9 x 13 cm',
      energy_rating: 'A+++', noise_level: '15 dB', coverage_area: null, power_consumption: '2.5W',
      features: JSON.stringify(['360 head', '3 speeds', 'USB-C', 'Clip-on', '15dB silent', '10h on power bank', 'Rubber padding']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=400&fit=crop'
    },
    {
      name: 'Duux Edge 120cm Tower Fan', slug: 'duux-edge-120-tower',
      description: 'Duux Edge 120cm premium tower fan with DC motor. Whisper-quiet 22dB operation, 12 speed settings, 90 oscillation. Sleek minimalist design with LED touch display. 8-hour timer, sleep mode, and natural wind simulation. Remote control included. Dutch design brand.',
      short_description: 'Duux Edge 120cm tower fan, 22dB quiet, 12 speeds, Dutch design, LED touch',
      price: 129.99, compare_price: 169.99, sku: 'DUUX-EDGE-120-EU', stock: 45,
      category_id: cat['tower-fans'], brand: 'Duux', weight: 7.2, dimensions: '28 x 28 x 120 cm',
      energy_rating: 'A++', noise_level: '22 dB', coverage_area: '50 m2', power_consumption: '45W',
      features: JSON.stringify(['DC motor', '12 speeds', '90 oscillation', 'LED touch', '8-hour timer', 'Sleep mode', 'Natural wind', 'Remote']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1624898135772-0e4991a9d80c?w=400&h=400&fit=crop'
    },
    {
      name: 'Matter Smart Plug with Energy Monitor', slug: 'matter-smart-plug-energy',
      description: 'Matter-compatible smart plug with real-time energy monitoring. Tracks power consumption of AC units and fans. Set schedules, timers, and power limits via app. Works with Alexa, Google Home, and Apple Home. 16A rating for EU Schuko sockets. Helps reduce energy bills by up to 25%.',
      short_description: 'Matter smart plug with energy monitor, 16A Schuko, Alexa/Google/Apple',
      price: 19.99, compare_price: 29.99, sku: 'MAT-SP-ENERGY-EU', stock: 220,
      category_id: cat['smart-cooling'], brand: 'Matter', weight: 0.07, dimensions: '5 x 5 x 7 cm',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: '0.5W',
      features: JSON.stringify(['Energy monitoring', 'Matter compatible', 'Alexa/Google/Apple', 'Schedule and timer', 'EU Schuko', '16A rating']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop'
    },
    {
      name: 'Sencor 45cm Industrial Pedestal Fan', slug: 'sencor-45-industrial',
      description: 'Sencor heavy-duty 45cm industrial pedestal fan for workshops and large spaces. All-metal construction, powder-coated finish. 3 powerful speeds, 90 tilt, wide sturdy base. 85W motor delivers exceptional airflow across 60m2. Thermal overload protection, carry handle.',
      short_description: 'Sencor 45cm industrial fan, all-metal, 85W, 3 speeds, for workshops 60m2',
      price: 89.99, compare_price: 119.99, sku: 'SEN-45-IND-EU', stock: 30,
      category_id: cat['pedestal-fans'], brand: 'Sencor', weight: 11.8, dimensions: '45 x 45 x 135 cm',
      energy_rating: 'A', noise_level: '46 dB', coverage_area: '60 m2', power_consumption: '85W',
      features: JSON.stringify(['45cm metal blades', 'All-metal body', '3 speeds', '90 tilt', 'Wide base', 'Carry handle', 'Overload protection']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop'
    },
    {
      name: 'Gree 14000 BTU Portable AC Smart', slug: 'gree-14000-portable-smart',
      description: 'Gree 14000 BTU portable air conditioner with WiFi control. Covers large rooms up to 55m2. Dual hose system for maximum efficiency, built-in heat pump for winter. A++ energy rating, R32 refrigerant. Includes dehumidifier mode, programmable thermostat, and 24-hour timer.',
      short_description: 'Gree 14000 BTU portable AC with WiFi, dual hose, heat pump, covers 55m2',
      price: 499.99, compare_price: 649.99, sku: 'GREE-14000-AC-EU', stock: 12,
      category_id: cat['air-conditioners'], brand: 'Gree', weight: 34, dimensions: '52 x 40 x 78 cm',
      energy_rating: 'A++', noise_level: '36 dB', coverage_area: '55 m2', power_consumption: '1300W',
      features: JSON.stringify(['14000 BTU', 'WiFi control', 'Dual hose', 'Heat pump', 'Dehumidifier', 'Programmable', 'R32 refrigerant']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'Eurom AC 1200 Misting Fan', slug: 'eurom-ac-1200-misting',
      description: 'Eurom AC 1200 personal water misting fan for outdoor cooling. 500ml tank provides 4 hours of cooling mist. 3 fan speeds with adjustable mist intensity. USB powered, perfect for patios, gardens, and outdoor dining. Lightweight 1.2kg, carry handle.',
      short_description: 'Eurom misting fan, 500ml tank, 4h runtime, USB, outdoor cooling',
      price: 29.99, compare_price: 39.99, sku: 'EUR-AC1200-MIST-EU', stock: 90,
      category_id: cat['evaporative-coolers'], brand: 'Eurom', weight: 1.2, dimensions: '14 x 14 x 22 cm',
      energy_rating: 'A++', noise_level: '32 dB', coverage_area: null, power_consumption: '12W',
      features: JSON.stringify(['500ml tank', '4h misting', '3 speeds', 'Adjustable mist', 'USB powered', 'Carry handle']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1602523366596-7c5df2fe7323?w=400&h=400&fit=crop'
    },
    {
      name: 'Hunter Pacific 42" Low Profile Ceiling Fan', slug: 'hunter-pacific-42-low',
      description: 'Hunter Pacific 42-inch low-profile ceiling fan for rooms under 15m2. DC motor for silent 18dB operation. 3-color LED light (warm/neutral/cool). 6 speeds with reversible airflow for summer and winter. Wall control included. Ideal for bedrooms, studies, and small apartments.',
      short_description: 'Hunter Pacific 42" low-profile DC ceiling fan, 3-color LED, 6 speeds, 18dB',
      price: 149.99, compare_price: 199.99, sku: 'HP-42-LOW-EU', stock: 40,
      category_id: cat['ceiling-fans'], brand: 'Hunter Pacific', weight: 4.8, dimensions: '42 inch (107 cm) blade span',
      energy_rating: 'A++', noise_level: '18 dB', coverage_area: '15 m2', power_consumption: '22W',
      features: JSON.stringify(['42 inch', 'DC motor', '3-color LED', '6 speeds', 'Reversible', 'Wall control', 'Low profile']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585128792020-5e9f3e0b1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'Thermo-ICE Bamboo Cooling Blanket', slug: 'thermo-ice-bamboo-blanket',
      description: 'Thermo-ICE premium bamboo rayon cooling blanket. Ultra-breathable, moisture-wicking fabric keeps you cool all night. Lightweight summer weight, machine washable. 220x240cm EU King size. OEKO-TEX certified, hypoallergenic. Perfect for hot sleepers without AC.',
      short_description: 'Thermo-ICE bamboo blanket, moisture-wicking, OEKO-TEX, EU King, summer weight',
      price: 44.99, compare_price: 59.99, sku: 'TI-BAMBOO-BLK-EU', stock: 120,
      category_id: cat['accessories'], brand: 'Thermo-ICE', weight: 1.3, dimensions: '220 x 240 cm (EU King)',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: null,
      features: JSON.stringify(['Bamboo rayon', 'Moisture-wicking', 'Breathable', 'Machine washable', 'OEKO-TEX', 'Hypoallergenic']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop'
    },
    {
      name: 'Klarbare Portable 3-in-1 Air Cooler', slug: 'klarbare-portable-3in1',
      description: 'Klarbare portable 3-in-1 air cooler, fan, and humidifier. Fill with water and ice for powerful cooling. 7-color ambient LED, 3 speeds, 12-hour timer. Ultra-quiet 30dB, low power consumption at 55W. 6L tank provides up to 10 hours of cooling. Ideal for bedrooms and offices.',
      short_description: 'Klarbare 3-in-1 portable cooler, fan, humidifier, 6L tank, 10h, 30dB',
      price: 69.99, compare_price: 89.99, sku: 'KLAR-3IN1-COOL-EU', stock: 75,
      category_id: cat['evaporative-coolers'], brand: 'Klarbare', weight: 5.0, dimensions: '26 x 22 x 60 cm',
      energy_rating: 'A+', noise_level: '30 dB', coverage_area: '20 m2', power_consumption: '55W',
      features: JSON.stringify(['3-in-1 cooler fan humidifier', 'Ice water', '7-color LED', '3 speeds', '12-hour timer', '6L tank', 'Carry handle']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1602523366596-7c5df2fe7323?w=400&h=400&fit=crop'
    },
    {
      name: 'Ardes USB Desk Fan with Wireless Charger', slug: 'ardes-wireless-desk-fan',
      description: 'Ardes USB desk fan with built-in 15W wireless charging pad. Charge your phone while cooling. 4000mAh battery for up to 20h cordless use. 4 speeds with natural wind mode. USB-C input and output (power bank function). Tilt 180, Italian design.',
      short_description: 'Ardes desk fan with 15W wireless charger, 4000mAh, 20h, Italian design',
      price: 49.99, compare_price: 64.99, sku: 'ARD-WIRELESS-FAN-EU', stock: 85,
      category_id: cat['desk-fans'], brand: 'Ardes', weight: 1.0, dimensions: '17 x 11 x 21 cm',
      energy_rating: 'A+++', noise_level: '22 dB', coverage_area: null, power_consumption: '7W',
      features: JSON.stringify(['15W wireless charger', '4000mAh battery', '20h runtime', '4 speeds', 'Natural wind', 'USB-C', '180 tilt']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=400&fit=crop'
    },
    {
      name: 'Under-Desk Personal AC by Klarstein', slug: 'klarstein-under-desk-ac',
      description: 'Klarstein Ice-Cube under-desk personal air conditioner. Cools your workspace without cooling the whole room. 6000 BTU, directional air vents, 4 fan speeds. Self-evaporating system, no drain hose needed. Ultra-quiet 30dB, perfect for home offices. Compact 48x24x32cm fits under any desk.',
      short_description: 'Klarstein Ice-Cube under-desk AC, 6000 BTU, 30dB, self-evaporating, compact',
      price: 249.99, compare_price: 319.99, sku: 'KL-ICECUBE-AC-EU', stock: 22,
      category_id: cat['air-conditioners'], brand: 'Klarstein', weight: 14, dimensions: '48 x 24 x 32 cm',
      energy_rating: 'A+', noise_level: '30 dB', coverage_area: '12 m2', power_consumption: '650W',
      features: JSON.stringify(['6000 BTU', 'Under-desk', 'Directional vents', '4 speeds', 'Self-evaporating', 'Remote control']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'JISULIFE Handheld Neck Fan Pro3', slug: 'jisulife-pro3-outdoor',
      description: 'JISULIFE Pro3 weather-resistant neck fan for outdoor activities. IPX4 water resistant, 6000mAh battery for 20h runtime. 78 air outlets for full 360 cooling. Built-in LED light for evening use. 2025 Red Dot Design Award winner. Perfect for gardening, walking, and sports.',
      short_description: 'JISULIFE Pro3 outdoor neck fan, IPX4, 6000mAh/20h, 360 cool, LED, Red Dot award',
      price: 44.99, compare_price: 59.99, sku: 'JIS-PRO3-OUT-EU', stock: 110,
      category_id: cat['accessories'], brand: 'JISULIFE', weight: 0.32, dimensions: '16 x 22 x 5 cm',
      energy_rating: 'A+++', noise_level: '26 dB', coverage_area: null, power_consumption: '9W',
      features: JSON.stringify(['IPX4 water resistant', '6000mAh battery', '20h runtime', '78 outlets', 'LED light', 'Red Dot award']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1608058544420-3d0f3c9d1b8a?w=400&h=400&fit=crop'
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
    'Learn about EuroCool Shop, Europe\'s trusted cooling products retailer', 1
  );

  console.log('Database seeded successfully!');
  console.log('  - ' + categories.length + ' categories');
  console.log('  - ' + products.length + ' products');
  console.log('  - Admin user: admin@eurocool.shop / Admin123!');
  console.log('  - About page created');
}

if (require.main === module) {
  seed().then(() => {
    console.log('Run "npm start" to launch the shop!');
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
