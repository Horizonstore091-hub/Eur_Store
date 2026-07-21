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
  const cat = {};
  for (const c of allCats) {
    cat[c.slug] = c.id;
  }

  const products = [
    {
      name: 'ArcticFlow Pro 12000 BTU Portable AC', slug: 'arcticflow-pro-12000',
      description: 'Powerful portable air conditioner designed for European summers. Features energy-efficient inverter technology with EU A++ energy rating. Cools rooms up to 45m2 with whisper-quiet operation. Includes heat pump function for year-round use.\n\nKey Specifications:\n- Cooling capacity: 12000 BTU (3.5 kW)\n- Coverage: up to 45 m2\n- Energy rating: A++\n- Noise level: 35 dB (low speed)\n- Dimensions: 45 x 35 x 70 cm\n- Weight: 28 kg\n- Refrigerant: R32 (eco-friendly)\n- EU plug: Schuko (Type F)',
      short_description: 'Powerful 12000 BTU portable AC with A++ energy rating for European apartments',
      price: 449.99, compare_price: 599.99, sku: 'AF-PRO-12000-EU', stock: 25,
      category_id: cat['air-conditioners'], brand: 'ArcticFlow', weight: 28, dimensions: '45 x 35 x 70 cm',
      energy_rating: 'A++', noise_level: '35 dB', coverage_area: '45 m2', power_consumption: '1050W',
      features: JSON.stringify(['Inverter compressor', 'Heat pump function', 'Remote control', '24-hour timer', 'Sleep mode', 'Auto swing', 'Dehumidifier mode', 'Castor wheels', 'Schuko plug (Type F)']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'BreezeTower Silent 900 Tower Fan', slug: 'breezetower-silent-900',
      description: 'Ultra-slim tower fan with 90 oscillation and 12 speed settings. Features bladeless-style safe design with DC motor for silent operation, ideal for bedrooms and offices. Includes remote control and programmable timer.',
      short_description: 'Ultra-quiet tower fan with DC motor, 12 speeds, 90 oscillation, remote control',
      price: 129.99, compare_price: 169.99, sku: 'BT-SILENT-900-EU', stock: 50,
      category_id: cat['tower-fans'], brand: 'BreezeTower', weight: 6.5, dimensions: '30 x 30 x 90 cm',
      energy_rating: 'A++', noise_level: '22 dB', coverage_area: '35 m2', power_consumption: '45W',
      features: JSON.stringify(['DC motor ultra quiet', '12 speed settings', '90 oscillation', 'Remote control', '8-hour timer', 'Sleep mode', 'Natural wind mode']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1624898135772-0e4991a9d80c?w=400&h=400&fit=crop'
    },
    {
      name: 'EuroCool Mist 500 Evaporative Cooler', slug: 'eurocool-mist-500',
      description: 'Energy-efficient evaporative air cooler for dry European climates. Uses natural water evaporation to drop temperatures by up to 8C. Features 40L water tank for all-night operation, ice compartments for extra cooling, and 3-speed fan. Perfect for Spain, Italy, Greece, and Southern France.',
      short_description: 'Evaporative cooler with 40L tank, drops temperature by 8C, for Southern Europe',
      price: 199.99, compare_price: 259.99, sku: 'EC-MIST-500-EU', stock: 35,
      category_id: cat['evaporative-coolers'], brand: 'EuroCool', weight: 12, dimensions: '40 x 35 x 85 cm',
      energy_rating: 'A+', noise_level: '42 dB', coverage_area: '40 m2', power_consumption: '180W',
      features: JSON.stringify(['40L water tank', 'Ice compartment', '3 fan speeds', 'Remote control', 'Auto shut-off', 'Castor wheels', 'Water level indicator']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1602523366596-7c5df2fe7323?w=400&h=400&fit=crop'
    },
    {
      name: 'SmartCool WiFi Thermostat Pro', slug: 'smartcool-wifi-thermostat',
      description: 'Intelligent WiFi thermostat for controlling your home cooling system from anywhere. Works with Alexa and Google Home. Features AI learning that adapts to your schedule, reducing energy consumption by up to 30%. EU-standard backplate compatible with most European heating and cooling systems.',
      short_description: 'Smart WiFi thermostat with AI learning, compatible with Alexa and Google Home',
      price: 89.99, compare_price: null, sku: 'SC-WIFI-THERM-EU', stock: 100,
      category_id: cat['smart-cooling'], brand: 'SmartCool', weight: 0.3, dimensions: '8 x 8 x 2 cm',
      energy_rating: 'A+++', noise_level: '0 dB', coverage_area: null, power_consumption: '2W',
      features: JSON.stringify(['WiFi connected', 'Alexa and Google Home', 'AI learning schedule', 'Energy reports', 'Geofencing', 'EU standard backplate', 'Touch display']),
      is_featured: 1, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop'
    },
    {
      name: 'DeskChill Pro USB Desk Fan', slug: 'deskchill-pro-usb',
      description: 'Premium USB-powered desk fan with brushless DC motor. Features 4 speed settings, 180 tilt, and ultra-quiet operation at just 18 dB. USB-C powered, works with laptops, power banks, and wall adapters. Ideal for home office and hot desks.',
      short_description: 'USB-C desk fan, whisper-quiet 18dB, 4 speeds, 180 tilt, for home office',
      price: 34.99, compare_price: 44.99, sku: 'DC-PRO-USB-EU', stock: 200,
      category_id: cat['desk-fans'], brand: 'DeskChill', weight: 0.8, dimensions: '15 x 10 x 18 cm',
      energy_rating: 'A+++', noise_level: '18 dB', coverage_area: null, power_consumption: '5W',
      features: JSON.stringify(['USB-C powered', '4 speed settings', '180 tilt', 'Brushless DC motor', '18 dB silent', 'Non-slip base', 'Removable cover']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1617201833818-6a0b4c4b6f5c?w=400&h=400&fit=crop'
    },
    {
      name: 'ArcticBreeze 75cm Pedestal Fan', slug: 'arcticbreeze-75cm-pedestal',
      description: 'Heavy-duty 75cm pedestal fan with powerful airflow for large rooms. Features 3 speed settings, 120 oscillation, and adjustable height from 120-150cm. Built with European safety standards and a 5-year motor warranty.',
      short_description: '75cm pedestal fan with powerful airflow, adjustable height, 120 oscillation',
      price: 79.99, compare_price: 99.99, sku: 'AB-75-PED-EU', stock: 45,
      category_id: cat['pedestal-fans'], brand: 'ArcticBreeze', weight: 7.2, dimensions: '45 x 45 x 120-150 cm',
      energy_rating: 'A+', noise_level: '38 dB', coverage_area: '50 m2', power_consumption: '65W',
      features: JSON.stringify(['75cm blade span', '3 speed settings', '120 oscillation', 'Adjustable height', '5-year motor warranty', 'CE certified', 'Metal base']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop'
    },
    {
      name: 'ChillCeiling Nordic 52" DC Ceiling Fan', slug: 'chillceiling-nordic-52',
      description: 'Sleek Scandinavian-designed ceiling fan with DC motor for silent operation. Includes LED light kit with warm and cool switching. Reversible function for winter use (circulates warm air). 52 inch blade span suitable for living rooms up to 30m2.',
      short_description: 'Scandinavian ceiling fan with LED light, DC motor, reversible for winter use',
      price: 249.99, compare_price: 319.99, sku: 'CC-NORDIC-52-EU', stock: 20,
      category_id: cat['ceiling-fans'], brand: 'ChillCeiling', weight: 6.8, dimensions: '52 inch (132 cm) blade span',
      energy_rating: 'A++', noise_level: '20 dB', coverage_area: '30 m2', power_consumption: '35W',
      features: JSON.stringify(['DC motor', 'LED light kit', 'Warm/cool switching', 'Reversible for winter', '6 speeds', 'Remote control', 'Scandinavian design']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585128792020-5e9f3e0b1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'CoolRest Gel Memory Foam Mattress Topper', slug: 'coolrest-gel-topper',
      description: 'Advanced cooling gel mattress topper that regulates sleeping temperature. Features phase-change material that absorbs and releases heat throughout the night. Reduces night sweats and improves sleep quality. Machine washable cover. EU King size 180x200cm.',
      short_description: 'Cooling gel mattress topper with phase-change material, reduces night sweats',
      price: 119.99, compare_price: 149.99, sku: 'CR-GEL-TOPPER-EU', stock: 60,
      category_id: cat['accessories'], brand: 'CoolRest', weight: 3.5, dimensions: '180 x 200 x 4 cm (EU King)',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: null,
      features: JSON.stringify(['Phase-change material', 'Gel-infused memory foam', '4 cm thickness', 'Breathable cover', 'Machine washable', 'Hypoallergenic']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop'
    },
    {
      name: 'NeckBreeze Wearable Neck Fan 16H', slug: 'neckbreeze-wearable',
      description: 'Hands-free wearable neck fan, perfect for commuting, outdoor events, and hot offices. Features 72 air outlets for 360 cooling, 4000mAh battery for up to 16 hours use, and 3 speed settings. USB-C charging. Ultra-lightweight at only 280g.',
      short_description: 'Wearable neck fan with 16h battery, 360 cooling, USB-C, only 280g',
      price: 49.99, compare_price: 69.99, sku: 'NB-WEARABLE-EU', stock: 150,
      category_id: cat['accessories'], brand: 'NeckBreeze', weight: 0.28, dimensions: '15 x 20 x 5 cm',
      energy_rating: 'A+++', noise_level: '25 dB', coverage_area: null, power_consumption: '8W',
      features: JSON.stringify(['72 air outlets', '4000mAh battery', '16 hours runtime', '3 speeds', 'USB-C charging', '280g ultra-light', 'Hands-free design']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1608058544420-3d0f3c9d1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'WindowCool 9000 BTU Window AC Unit', slug: 'windowcool-9000-window',
      description: 'Compact window air conditioner ideal for smaller European apartments. 9000 BTU cooling capacity covers rooms up to 28m2. Features energy-saving Eco mode, dehumidifier function, and easy slide-in installation for standard European windows.',
      short_description: '9000 BTU window AC for small apartments, Eco mode, covers 28m2',
      price: 349.99, compare_price: 429.99, sku: 'WC-9000-WIN-EU', stock: 15,
      category_id: cat['air-conditioners'], brand: 'WindowCool', weight: 22, dimensions: '45 x 35 x 40 cm',
      energy_rating: 'A+', noise_level: '40 dB', coverage_area: '28 m2', power_consumption: '800W',
      features: JSON.stringify(['9000 BTU cooling', 'Eco mode', 'Dehumidifier', 'Remote control', '24-hour timer', 'Sleep mode']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'PureAir Cool 3-in-1 Air Purifier and Fan', slug: 'pureair-cool-3in1',
      description: '3-in-1 air purifier, cooling fan, and air circulator. HEPA H13 filter removes 99.97% of airborne particles including pollen, dust, and smoke. Ideal for allergy sufferers during hot weather. Cools while cleaning the air in rooms up to 35m2.',
      short_description: '3-in-1 purifier and fan, HEPA H13 filter removes allergens while cooling',
      price: 179.99, compare_price: 219.99, sku: 'PA-COOL-3IN1-EU', stock: 40,
      category_id: cat['tower-fans'], brand: 'PureAir', weight: 8.5, dimensions: '30 x 30 x 70 cm',
      energy_rating: 'A+', noise_level: '30 dB', coverage_area: '35 m2', power_consumption: '55W',
      features: JSON.stringify(['HEPA H13 filter', 'Activated carbon filter', '3 fan speeds', 'Auto mode', 'Air quality sensor', 'Sleep mode']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1617201833818-6a0b4c4b6f5c?w=400&h=400&fit=crop'
    },
    {
      name: 'SolarBreeze Solar-Powered Attic Fan', slug: 'solarbreeze-attic-fan',
      description: 'Solar-powered ventilation fan for attics, garages, and sheds. Reduces indoor temperature by up to 10C using free solar energy. No wiring needed, installs in minutes. Perfect for Southern European homes looking to reduce cooling costs.',
      short_description: 'Solar-powered attic fan, reduces indoor temp by 10C, no wiring needed',
      price: 159.99, compare_price: null, sku: 'SB-SOLAR-ATTIC-EU', stock: 30,
      category_id: cat['evaporative-coolers'], brand: 'SolarBreeze', weight: 4.5, dimensions: '50 x 50 x 20 cm',
      energy_rating: 'A+++', noise_level: '28 dB', coverage_area: null, power_consumption: '0W (solar)',
      features: JSON.stringify(['Solar powered', 'No electricity cost', 'Easy installation', 'Automatic operation', 'Weatherproof', 'Reduces temp by 10C']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
    },
    {
      name: 'MiniBreeze Compact USB Clip Fan', slug: 'minibreeze-clip-fan',
      description: 'Ultra-compact clip-on fan for desks, strollers, tents, and beds. 360 adjustable head, 3 speed settings, USB powered. Runs up to 10 hours on power bank. Barely audible at 15 dB. Ideal for camping and travel across Europe.',
      short_description: 'Compact USB clip-on fan, 360 head, 3 speeds, runs 10h on power bank',
      price: 19.99, compare_price: 24.99, sku: 'MB-CLIP-USB-EU', stock: 300,
      category_id: cat['desk-fans'], brand: 'MiniBreeze', weight: 0.25, dimensions: '10 x 10 x 14 cm',
      energy_rating: 'A+++', noise_level: '15 dB', coverage_area: null, power_consumption: '3W',
      features: JSON.stringify(['360 adjustable head', '3 speed settings', 'USB powered', 'Clip-on design', '15 dB silent', '10h runtime on power bank']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=400&fit=crop'
    },
    {
      name: 'TowerBreeze 120cm Ultra Tower Fan', slug: 'towerbreeze-120cm',
      description: 'Extra-tall 120cm tower fan with powerful airflow and wide 90 oscillation. Features DC motor for energy efficiency, 12 speeds, and a sleek space-saving design. Includes remote control with LED display and programmable timer up to 12 hours.',
      short_description: '120cm ultra tower fan, DC motor, 12 speeds, 90 oscillation, remote control',
      price: 149.99, compare_price: 189.99, sku: 'TB-120-TOWER-EU', stock: 40,
      category_id: cat['tower-fans'], brand: 'TowerBreeze', weight: 7.8, dimensions: '30 x 30 x 120 cm',
      energy_rating: 'A++', noise_level: '25 dB', coverage_area: '45 m2', power_consumption: '50W',
      features: JSON.stringify(['120cm height', 'DC motor', '12 speed settings', '90 oscillation', 'LED display', '12-hour timer', 'Remote control']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1624898135772-0e4991a9d80c?w=400&h=400&fit=crop'
    },
    {
      name: 'SmartCool Smart AC Controller', slug: 'smartcool-ac-controller',
      description: 'Turn any air conditioner into a smart AC with this universal infrared controller. Works with all brands and remote-controlled AC units. Schedule cooling times, set temperature limits, and track energy usage from your phone. Compatible with Alexa, Google Home, and IFTTT.',
      short_description: 'Universal smart AC controller, works with any IR remote AC, Alexa and Google Home',
      price: 59.99, compare_price: 79.99, sku: 'SC-AC-CONTROLLER-EU', stock: 120,
      category_id: cat['smart-cooling'], brand: 'SmartCool', weight: 0.15, dimensions: '6 x 6 x 2 cm',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: '1W',
      features: JSON.stringify(['Universal IR controller', 'Alexa and Google Home', 'Energy tracking', 'Schedule cooling', 'Temperature limits', 'Smartphone app']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop'
    },
    {
      name: 'EcoBreeze 50cm Pedestal Industrial Fan', slug: 'ecobreeze-50cm-industrial',
      description: 'Heavy-duty 50cm industrial pedestal fan for workshops, warehouses, and large spaces. All-metal construction with powder-coated finish. Features 3 powerful speeds, 90 tilt, and sturdy wide-base stand. 100W motor delivers exceptional airflow.',
      short_description: '50cm industrial pedestal fan, all-metal, 3 speeds, for workshops and warehouses',
      price: 119.99, compare_price: 149.99, sku: 'EB-50-IND-EU', stock: 25,
      category_id: cat['pedestal-fans'], brand: 'EcoBreeze', weight: 12.5, dimensions: '50 x 50 x 140 cm',
      energy_rating: 'A', noise_level: '48 dB', coverage_area: '70 m2', power_consumption: '100W',
      features: JSON.stringify(['50cm metal blades', 'All-metal construction', '3 speeds', '90 tilt', 'Wide-base stand', 'Carry handle', 'Thermal overload protection']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop'
    },
    {
      name: 'CoolHome 14000 BTU Portable AC with Heat Pump', slug: 'coolhome-14000-portable',
      description: 'High-capacity 14000 BTU portable air conditioner for large living spaces up to 55m2. Features dual hose system for maximum efficiency, built-in heat pump for winter heating, and Euro A++ energy rating. Includes dehumidifier mode and programmable thermostat.',
      short_description: '14000 BTU portable AC with heat pump, dual hose, covers 55m2, A++ rated',
      price: 599.99, compare_price: 749.99, sku: 'CH-14000-AC-EU', stock: 15,
      category_id: cat['air-conditioners'], brand: 'CoolHome', weight: 32, dimensions: '50 x 38 x 75 cm',
      energy_rating: 'A++', noise_level: '38 dB', coverage_area: '55 m2', power_consumption: '1350W',
      features: JSON.stringify(['14000 BTU', 'Dual hose system', 'Heat pump', 'Dehumidifier', 'Programmable thermostat', 'Remote control', 'Castor wheels', 'Schuko plug']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'MistBreeze Personal Misting Fan', slug: 'mistbreeze-personal',
      description: 'Personal water misting fan for outdoor cooling. Built-in 500ml water tank provides up to 4 hours of cooling mist. 3 fan speeds with adjustable mist intensity. Uses standard USB power, perfect for patios, gardens, and outdoor dining across Europe.',
      short_description: 'Personal misting fan with 500ml tank, 4h runtime, USB powered for outdoor use',
      price: 39.99, compare_price: 49.99, sku: 'MB-MIST-PERSONAL-EU', stock: 80,
      category_id: cat['evaporative-coolers'], brand: 'MistBreeze', weight: 1.2, dimensions: '12 x 12 x 20 cm',
      energy_rating: 'A++', noise_level: '30 dB', coverage_area: null, power_consumption: '10W',
      features: JSON.stringify(['500ml water tank', '4 hours misting', '3 fan speeds', 'Adjustable mist', 'USB powered', 'Carry handle']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1602523366596-7c5df2fe7323?w=400&h=400&fit=crop'
    },
    {
      name: 'CeilingChic 36" DC Ceiling Fan with Remote', slug: 'ceilingchic-36-dc',
      description: 'Modern 36 inch low-profile ceiling fan for smaller rooms up to 15m2. DC motor for whisper-quiet operation. Includes 3-color LED light (warm, neutral, cool). 6 speed settings with reversible airflow for summer and winter. Wall control included.',
      short_description: '36 inch low-profile DC ceiling fan with 3-color LED light and remote',
      price: 179.99, compare_price: 219.99, sku: 'CC-36-DC-EU', stock: 35,
      category_id: cat['ceiling-fans'], brand: 'CeilingChic', weight: 5.2, dimensions: '36 inch (91 cm) blade span',
      energy_rating: 'A++', noise_level: '18 dB', coverage_area: '15 m2', power_consumption: '25W',
      features: JSON.stringify(['36 inch blades', 'DC motor', '3-color LED', '6 speeds', 'Reversible airflow', 'Wall control', 'Low profile']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585128792020-5e9f3e0b1b8a?w=400&h=400&fit=crop'
    },
    {
      name: 'SleepCool Bamboo Cooling Blanket', slug: 'sleepcool-bamboo-blanket',
      description: 'Ultra-breathable bamboo rayon cooling blanket. Designed for hot sleepers, this lightweight blanket wicks moisture and regulates temperature throughout the night. Machine washable. Available in twin, queen, and king sizes. Perfect for summer nights without AC.',
      short_description: 'Bamboo rayon cooling blanket, moisture-wicking, machine washable, summer weight',
      price: 59.99, compare_price: 79.99, sku: 'SC-BAMBOO-BLK-EU', stock: 100,
      category_id: cat['accessories'], brand: 'SleepCool', weight: 1.5, dimensions: '200 x 220 cm (EU King)',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: null,
      features: JSON.stringify(['Bamboo rayon fabric', 'Moisture-wicking', 'Temperature regulating', 'Machine washable', 'Hypoallergenic', 'Summer weight']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop'
    },
    {
      name: 'IceBreeze Portable Air Cooler 3-in-1', slug: 'icebreeze-portable-cooler',
      description: 'Compact 3-in-1 portable air cooler, fan, and humidifier. Fills with water and ice for powerful cooling. 7-color LED ambient lighting, 3 speed settings, and 12-hour timer. Low power consumption at only 65W. Ideal for bedrooms, offices, and caravans.',
      short_description: '3-in-1 portable cooler, fan, and humidifier with ice cooling and LED light',
      price: 89.99, compare_price: 119.99, sku: 'IB-PORTABLE-3IN1-EU', stock: 65,
      category_id: cat['evaporative-coolers'], brand: 'IceBreeze', weight: 5.5, dimensions: '28 x 24 x 62 cm',
      energy_rating: 'A+', noise_level: '35 dB', coverage_area: '25 m2', power_consumption: '65W',
      features: JSON.stringify(['3-in-1 cooler fan humidifier', 'Ice water cooling', '7-color LED', '3 speeds', '12-hour timer', 'Carry handle']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1602523366596-7c5df2fe7323?w=400&h=400&fit=crop'
    },
    {
      name: 'DeskBreeze Pro Wireless Charging Fan', slug: 'deskbreeze-wireless-fan',
      description: 'Premium desk fan with built-in 15W wireless charging pad. Charges your phone while keeping you cool. 4000mAh battery provides up to 20 hours of continuous operation. 4 speed settings with natural wind mode. USB-C input and output.',
      short_description: 'Desk fan with 15W wireless charger, 4000mAh battery, 20h runtime, USB-C',
      price: 69.99, compare_price: 89.99, sku: 'DB-WIRELESS-FAN-EU', stock: 75,
      category_id: cat['desk-fans'], brand: 'DeskBreeze', weight: 1.1, dimensions: '18 x 12 x 22 cm',
      energy_rating: 'A+++', noise_level: '20 dB', coverage_area: null, power_consumption: '8W',
      features: JSON.stringify(['15W wireless charger', '4000mAh battery', '20h runtime', '4 speeds', 'Natural wind mode', 'USB-C input/output']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=400&fit=crop'
    },
    {
      name: 'SmartCool Energy Monitor Plug', slug: 'smartcool-energy-plug',
      description: 'Smart WiFi energy monitoring plug for tracking AC and fan power consumption. Set schedules, timers, and power limits via smartphone app. Works with Alexa and Google Home. 16A rating for EU Schuko sockets. Reduce energy bills by up to 25%.',
      short_description: 'WiFi smart plug with energy monitoring, works with Alexa, 16A Schuko',
      price: 24.99, compare_price: 34.99, sku: 'SC-ENERGY-PLUG-EU', stock: 200,
      category_id: cat['smart-cooling'], brand: 'SmartCool', weight: 0.08, dimensions: '5 x 5 x 8 cm',
      energy_rating: null, noise_level: null, coverage_area: null, power_consumption: '0.5W',
      features: JSON.stringify(['Energy monitoring', 'WiFi connected', 'Alexa and Google Home', 'Schedule and timer', 'EU Schuko plug', '16A rating']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop'
    },
    {
      name: 'RoomCooler Under-Desk AC Unit', slug: 'roomcooler-under-desk',
      description: 'Compact under-desk air conditioner that cools your immediate workspace without cooling the whole room. 7000 BTU capacity, perfect for home offices. Features directional air vents, 4 fan speeds, and condensate evaporation technology. Ultra-quiet at 32 dB.',
      short_description: 'Under-desk personal AC unit, 7000 BTU, quiet 32dB, for home office',
      price: 299.99, compare_price: 379.99, sku: 'RC-UNDERDESK-EU', stock: 20,
      category_id: cat['air-conditioners'], brand: 'RoomCooler', weight: 15, dimensions: '50 x 25 x 35 cm',
      energy_rating: 'A+', noise_level: '32 dB', coverage_area: '15 m2', power_consumption: '700W',
      features: JSON.stringify(['7000 BTU', 'Under-desk design', 'Directional vents', '4 fan speeds', 'Self-evaporating', 'Remote control']),
      is_featured: 0, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop'
    },
    {
      name: 'BreezeSling Outdoor Neck Fan', slug: 'breezesling-outdoor-neck',
      description: 'Weather-resistant neck fan designed for outdoor activities. IPX4 water resistant, 6000mAh battery for 20h runtime. 78 air outlets for full 360 coverage. Built-in LED light for evening use. Perfect for gardening, walking, sports, and outdoor events.',
      short_description: 'Water-resistant outdoor neck fan, 6000mAh/20h battery, 360 cooling, LED light',
      price: 59.99, compare_price: 79.99, sku: 'BS-OUTDOOR-NECK-EU', stock: 90,
      category_id: cat['accessories'], brand: 'BreezeSling', weight: 0.32, dimensions: '16 x 22 x 5 cm',
      energy_rating: 'A+++', noise_level: '28 dB', coverage_area: null, power_consumption: '10W',
      features: JSON.stringify(['IPX4 water resistant', '6000mAh battery', '20h runtime', '78 air outlets', 'LED light', 'Hands-free']),
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
