require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5000;

// --- FIXED CORS: Allows Local, Vercel, and Custom Domain ---
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://chokka-website.vercel.app',
    'https://www.chokka-website.vercel.app',
    'https://chokka.shop',
    'https://www.chokka.shop'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// --- SECURITY: Stricter Rate Limiting for Orders (3 per 30 min per IP) ---
const orderLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  message: {
    success: false,
    message: "Too many orders from this IP. Please try again in 30 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- MAINTENANCE MODE: Controlled via env var, togglable at runtime ---
let maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

// --- ADMIN AUTHENTICATION MIDDLEWARE ---
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

// --- GLOBAL AUTH: Protect all non-public endpoints ---
// Public endpoints are only the ones customers need. Everything else requires admin auth.
app.use((req, res, next) => {
  const publicRoutes = [
    { method: null,   path: '/health' },
    { method: 'POST', path: '/api/admin/login' },
    { method: 'POST', path: '/api/create-order' },
    { method: 'GET',  path: '/api/products' },
    { method: 'POST', path: '/api/verify-coupon' },
    { method: 'GET',  path: '/api/reviews' },
    { method: 'GET',  path: '/api/gallery' },
  ];
  const isPublic = publicRoutes.some(r =>
    (r.method === null || r.method === req.method) && r.path === req.path
  );
  if (isPublic) return next();
  return requireAdmin(req, res, next);
});

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
  res.send(`Chokka Server is Live${maintenanceMode ? ' (Maintenance Mode Active)' : ''}`);
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ADMIN: Login Endpoint (validates password, returns session token) ---
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }
  res.json({ success: true, token: process.env.ADMIN_SECRET });
});

// --- ADMIN: Toggle Maintenance Mode (no redeploy needed) ---
app.post('/api/admin/maintenance', (req, res) => {
  const { enabled } = req.body;
  maintenanceMode = !!enabled;
  console.log(`[Admin] Maintenance mode ${maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
  res.json({ success: true, maintenance: maintenanceMode });
});

app.get('/api/admin/maintenance', (req, res) => {
  res.json({ maintenance: maintenanceMode });
});

// --- TELEGRAM NOTIFICATION (token from env, not hardcoded) ---
const sendTelegramNotification = async (orderData) => {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  if (!TELEGRAM_TOKEN) return;

  const CHAT_IDS = [
    '5865440292', // You
    '5043710380', // Jafar Wasi
    '8033841967'  // Yasir
  ];

  const productNames = {
    1: "The Syndicate",
    2: "TONG",
    3: "Syndicate + Tong Bundle",
    4: "Sholo Ana",
    5: "Syndicate + Sholo Ana Bundle",
    6: "Tong + Sholo Ana Bundle",
    7: "Chokka Complete Bundle"
  };

  const ids = Array.isArray(orderData.product_ids) && orderData.product_ids.length > 0
    ? orderData.product_ids
    : [orderData.product_id];
  const gameTitle = ids.map(id => productNames[id] || `Item #${id}`).join(' + ');

  const message = `💰 *NEW ORDER RECEIVED!* 💰\n\n` +
                  `📦 *Item:* ${gameTitle}\n` +
                  `👤 *Name:* ${orderData.customer_name}\n` +
                  `📞 *Phone:* ${orderData.customer_phone}\n` +
                  `🏙️ *City:* ${orderData.city}\n` +
                  `💵 *Total:* ${orderData.total_price} BDT\n\n` +
                  `👉 [Open Admin Panel](https://chokka.shop/admin)`;

  for (const chatId of CHAT_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error(`Telegram Error for ID ${chatId}:`, error);
    }
  }
};

// Bundle → component individual game IDs (for inventory deduction)
const BUNDLE_COMPONENTS = {
  3: [1, 2],      // Syndicate + Tong
  5: [1, 4],      // Syndicate + Sholo Ana
  6: [2, 4],      // Tong + Sholo Ana
  7: [1, 2, 4],   // All 3
};

// Deduct inventory for a single product_id (resolves bundles to components)
const deductInventoryForProduct = async (product_id) => {
  const pid = Number(product_id);
  const components = BUNDLE_COMPONENTS[pid] || [pid];

  for (const componentPid of components) {
    const itemTypes = ['card_set', 'packet', 'sticker'];
    for (const itemType of itemTypes) {
      await supabase.rpc('decrement_stock', {
        p_product_id: componentPid,
        p_item_type: itemType
      }).catch(() => {
        return supabase
          .from('inventory')
          .select('id, stock')
          .eq('product_id', componentPid)
          .eq('item_type', itemType)
          .single()
          .then(({ data }) => {
            if (data && data.stock > 0) {
              return supabase
                .from('inventory')
                .update({ stock: data.stock - 1 })
                .eq('id', data.id);
            }
          });
      });
    }
  }
};

// Deduct inventory for all product_ids in an order
const deductInventoryForOrder = async (product_ids_array) => {
  try {
    for (const pid of product_ids_array) {
      await deductInventoryForProduct(pid);
    }
  } catch (error) {
    console.error("Inventory deduction error:", error.message);
  }
};

// --- 1. ORDERS ---

// Receive New Order (Checkout) - PUBLIC with rate limiting and strong validation
app.post('/api/create-order', orderLimiter, async (req, res) => {
  if (maintenanceMode) {
    return res.status(503).json({
      success: false,
      message: "Order system is temporarily closed for security maintenance. Please try again later."
    });
  }

  const { customer_name, customer_phone, customer_address, city, product_ids, quantity, total_price, hp_field } = req.body;

  // --- BOT PROTECTION: Honeypot Check ---
  if (hp_field) {
    console.warn(`[BOT ALERT] Blocked order with honeypot field filled: ${customer_name}`);
    return res.status(403).json({ success: false, message: "Bot detected. Order rejected." });
  }

  // --- SERVER-SIDE VALIDATION ---
  const VALID_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7];

  const nameStr    = String(customer_name || '').trim();
  const phoneStr   = String(customer_phone || '').trim();
  const addressStr = String(customer_address || '').trim();
  const cityStr    = String(city || '').trim();
  const qty        = Number(quantity);
  const price      = Number(total_price);

  // Normalise product_ids — must be a non-empty array of valid IDs
  const productIdsArr = Array.isArray(product_ids)
    ? product_ids.map(Number).filter(id => VALID_PRODUCT_IDS.includes(id))
    : [];

  if (!nameStr || nameStr.length < 3 || nameStr.length > 100) {
    return res.status(400).json({ success: false, message: "Please enter a valid name (3-100 characters)." });
  }

  // Bangladesh phone: starts with 01, 11 digits, valid operator prefix
  if (!/^01[3-9]\d{8}$/.test(phoneStr)) {
    return res.status(400).json({ success: false, message: "Please enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX)." });
  }

  if (!addressStr || addressStr.length < 10) {
    return res.status(400).json({ success: false, message: "Please enter a more detailed delivery address." });
  }

  if (!['Dhaka', 'Outside Dhaka'].includes(cityStr)) {
    return res.status(400).json({ success: false, message: "Invalid city selection." });
  }

  if (productIdsArr.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid product selection." });
  }

  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    return res.status(400).json({ success: false, message: "Invalid quantity." });
  }

  if (isNaN(price) || price < 100 || price > 10000) {
    return res.status(400).json({ success: false, message: "Invalid order amount." });
  }

  // --- DUPLICATE ORDER DETECTION: Block same phone within 10 minutes ---
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_phone', phoneStr)
      .gte('created_at', tenMinutesAgo);

    if (recentOrders && recentOrders.length > 0) {
      console.warn(`[DUPLICATE BLOCKED] Phone: ${phoneStr}`);
      return res.status(429).json({
        success: false,
        message: "An order was recently placed with this number. Please wait a few minutes before ordering again."
      });
    }
  } catch (dupError) {
    console.error("Duplicate check error:", dupError.message);
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: nameStr,
        customer_phone: phoneStr,
        customer_address: addressStr,
        city: cityStr,
        product_id: productIdsArr[0],   // backward compat: first product
        product_ids: productIdsArr,      // full array for new orders
        quantity: qty,
        total_price: price
      }])
      .select();

    if (error) throw error;

    await deductInventoryForOrder(productIdsArr);
    await sendTelegramNotification({
      ...req.body,
      customer_name: nameStr,
      customer_phone: phoneStr,
      city: cityStr,
      product_ids: productIdsArr,
    });
    res.json({ success: true, orderId: data[0].id });

  } catch (error) {
    console.error("Database Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server database error. Please contact support or try again later.",
      error: error.message 
    });
  }
});


// --- ADMIN: Place Order (no rate limit, no honeypot, protected by requireAdmin via global middleware) ---
app.post('/api/admin/create-order', async (req, res) => {
  const { customer_name, customer_phone, customer_address, city, product_ids, quantity, total_price } = req.body;

  const VALID_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7];

  const nameStr    = String(customer_name || '').trim();
  const phoneStr   = String(customer_phone || '').trim();
  const addressStr = String(customer_address || '').trim();
  const cityStr    = String(city || '').trim();
  const qty        = Number(quantity) || 1;
  const price      = Number(total_price);

  const productIdsArr = Array.isArray(product_ids)
    ? product_ids.map(Number).filter(id => VALID_PRODUCT_IDS.includes(id))
    : [];

  if (!nameStr || nameStr.length < 2) {
    return res.status(400).json({ success: false, message: "Please enter a customer name." });
  }
  if (!/^01[3-9]\d{8}$/.test(phoneStr)) {
    return res.status(400).json({ success: false, message: "Invalid Bangladeshi phone number." });
  }
  if (!addressStr || addressStr.length < 5) {
    return res.status(400).json({ success: false, message: "Please enter a delivery address." });
  }
  if (!['Dhaka', 'Outside Dhaka'].includes(cityStr)) {
    return res.status(400).json({ success: false, message: "Invalid city. Use 'Dhaka' or 'Outside Dhaka'." });
  }
  if (productIdsArr.length === 0) {
    return res.status(400).json({ success: false, message: "Select at least one valid product." });
  }
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ success: false, message: "Invalid total price." });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: nameStr,
        customer_phone: phoneStr,
        customer_address: addressStr,
        city: cityStr,
        product_id: productIdsArr[0],
        product_ids: productIdsArr,
        quantity: qty,
        total_price: price
      }])
      .select();

    if (error) throw error;

    await deductInventoryForOrder(productIdsArr);
    await sendTelegramNotification({
      customer_name: nameStr,
      customer_phone: phoneStr,
      city: cityStr,
      product_ids: productIdsArr,
      total_price: price,
    });

    console.log(`[Admin Order] Placed by admin: ${nameStr} | ${phoneStr} | Products: ${productIdsArr}`);
    res.json({ success: true, orderId: data[0].id });

  } catch (error) {
    console.error("Admin Order Error:", error.message);
    res.status(500).json({ success: false, message: "Database error.", error: error.message });
  }
});

// Get All Orders (Admin Panel) - PROTECTED by global middleware
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status (Mark as Shipped)
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update order status", error: error.message });
  }
});


// Update Customer Details (Edit Modal)
app.put('/api/orders/:id/update-details', async (req, res) => {
  const { id } = req.params;
  const { customer_name, customer_phone, customer_address, total_price } = req.body;

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ customer_name, customer_phone, customer_address, total_price })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update customer details", error: error.message });
  }
});


// --- 2. PRODUCT SETTINGS (Prices & Fees) ---

// Get ALL products (also used by checkout modal - PUBLIC)
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
});


// Update specific product by ID - PROTECTED
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { price, cost, stock, delivery_dhaka, delivery_outside } = req.body;

  try {
    const { data, error } = await supabase
      .from('products')
      .update({ price, cost, stock, delivery_dhaka, delivery_outside })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update product", error: error.message });
  }
});


// --- 3. COUPONS ---

// Get All Coupons - PROTECTED
app.get('/api/coupons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch coupons", error: error.message });
  }
});


// Create New Coupon - PROTECTED
app.post('/api/coupons', async (req, res) => {
  const { code, discount } = req.body;

  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert([{ code, discount }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create coupon", error: error.message });
  }
});


// --- 4. VERIFY COUPON - PUBLIC (needed at checkout) ---
app.post('/api/verify-coupon', async (req, res) => {
  const { code } = req.body;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return res.json({ success: false, message: 'Invalid Coupon' });
    }

    if (!data.is_active) {
       return res.json({ success: false, message: 'Coupon Expired' });
    }

    res.json({ success: true, discount: data.discount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying coupon", error: error.message });
  }
});


// --- 5. MANAGE REVIEWS ---

// Get reviews - PUBLIC (displayed on site)
app.get('/api/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review - PROTECTED (admin only)
app.post('/api/reviews', async (req, res) => {
  const { customer_name, rating, comment, product_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        customer_name,
        rating,
        comment,
        is_approved: true,
        product_id: product_id || 1
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 6. MANAGE GALLERY ---

// Get gallery - PUBLIC (used by checkout modal and site)
app.get('/api/gallery', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add gallery image - PROTECTED
app.post('/api/gallery', async (req, res) => {
  const { image_url, caption, product_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert([{
        image_url,
        caption,
        product_id: product_id || 1
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STEADFAST COURIER INTEGRATION - PROTECTED ---
app.post('/api/steadfast/create', async (req, res) => {
  const { invoice, name, address, phone, amount, note } = req.body;
  const API_KEY = process.env.STEADFAST_API_KEY;
  const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;
  const BASE_URL = 'https://portal.packzy.com/api/v1';

  try {
    const response = await fetch(`${BASE_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
        'Secret-Key': SECRET_KEY
      },
      body: JSON.stringify({
        invoice: invoice,
        recipient_name: name,
        recipient_phone: phone,
        recipient_address: address,
        cod_amount: amount,
        note: note || 'None'
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Steadfast Error:", error);
    res.status(500).json({ status: 500, message: "Server Error connecting to Steadfast" });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, tracking_code, dispatched_by } = req.body;

  try {
    const updateData = {};
    if (status) updateData.status = status;
    if (tracking_code) updateData.tracking_code = tracking_code;
    if (dispatched_by !== undefined) updateData.dispatched_by = dispatched_by;

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post('/api/steadfast/bulk-create', async (req, res) => {
  const { orders } = req.body;
  const API_KEY = process.env.STEADFAST_API_KEY;
  const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;
  const BASE_URL = 'https://portal.packzy.com/api/v1';

  const bulkArray = orders.map(o => ({
    invoice: `INV-${o.id}`,
    recipient_name: o.customer_name,
    recipient_address: o.customer_address,
    recipient_phone: o.customer_phone,
    cod_amount: o.total_price,
    note: 'Handle with care'
  }));

  try {
    const payload = JSON.stringify(bulkArray);
    const response = await fetch(`${BASE_URL}/create_order/bulk-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
        'Secret-Key': SECRET_KEY
      },
      body: JSON.stringify({ data: payload })
    });

    const result = await response.json();
    if (result.status === 200 || Array.isArray(result)) {
        const ids = orders.map(o => o.id);
        await supabase
          .from('orders')
          .update({ status: 'Unassigned' })
          .in('id', ids);
        res.json({ success: true, count: orders.length, details: result });
    } else {
        res.json({ success: false, message: "Steadfast Rejected: " + JSON.stringify(result) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SYNC ALL STATUS ---
app.post('/api/steadfast/sync-all', async (req, res) => {
  const API_KEY = process.env.STEADFAST_API_KEY;
  const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;
  const BASE_URL = 'https://portal.packzy.com/api/v1';

  if (!API_KEY || !SECRET_KEY) {
    return res.status(500).json({ success: false, error: "Missing Steadfast API credentials" });
  }

  try {
    const { data: activeOrders, error } = await supabase
      .from('orders')
      .select('id, tracking_code, status')
      .not('tracking_code', 'is', null);

    if (error) {
      return res.status(500).json({ success: false, error: "Database error: " + error.message });
    }

    const ordersToSync = (activeOrders || []).filter(o =>
      o.tracking_code &&
      o.status !== 'Delivered' &&
      o.status !== 'Cancelled' &&
      !o.status?.includes('Delivered') &&
      !o.status?.includes('Cancelled')
    );

    if (ordersToSync.length === 0) {
      return res.json({ success: true, updated: 0, message: "No active orders to sync." });
    }

    let updatedCount = 0;
    const errors = [];
    const results = [];

    for (const order of ordersToSync) {
      try {
        const url = `${BASE_URL}/status_by_trackingcode/${order.tracking_code}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': API_KEY,
            'Secret-Key': SECRET_KEY
          }
        });

        const result = await response.json();
        results.push({ orderId: order.id, tracking: order.tracking_code, response: result });

        let deliveryStatus = result.delivery_status ||
                             (result.consignment && result.consignment.delivery_status) ||
                             (result.data && result.data.delivery_status);

        if ((result.status === 200 || result.status === 'success') && deliveryStatus) {
          const sfStatus = deliveryStatus.toLowerCase();
          let newStatus = order.status;

          if (sfStatus === 'in_review') newStatus = 'Unassigned';
          else if (sfStatus === 'pending') newStatus = 'Assigned';
          else if (sfStatus === 'delivered') newStatus = 'Delivered';
          else if (sfStatus === 'partial_delivered') newStatus = 'Partial Delivered';
          else if (sfStatus === 'cancelled') newStatus = 'Cancelled';
          else if (sfStatus === 'hold') newStatus = 'Hold';
          else if (sfStatus === 'delivered_approval_pending') newStatus = 'Delivered (Pending Approval)';
          else if (sfStatus === 'partial_delivered_approval_pending') newStatus = 'Partial (Pending Approval)';
          else if (sfStatus === 'cancelled_approval_pending') newStatus = 'Cancelled (Pending Approval)';
          else if (sfStatus === 'unknown_approval_pending') newStatus = 'Unknown (Pending Approval)';

          if (newStatus !== order.status) {
            await supabase
              .from('orders')
              .update({ status: newStatus })
              .eq('id', order.id);
            updatedCount++;
          }
        }
      } catch (orderError) {
        errors.push({ orderId: order.id, tracking: order.tracking_code, error: orderError.message });
      }
    }

    res.json({
      success: true,
      updated: updatedCount,
      total: ordersToSync.length,
      errors: errors.length > 0 ? errors : undefined,
      debug: results.slice(0, 3)
    });

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// =============================================
// --- INVENTORY MANAGEMENT - PROTECTED ---
// =============================================

app.get('/api/inventory', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory/low-stock', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*');

    if (error) throw error;

    const lowStock = data.filter(item => item.stock <= item.reorder_level);
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { category, item_name, stock, reorder_level, product_id, item_type } = req.body;
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert([{ category, item_name, stock, reorder_level, product_id, item_type }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { stock, reorder_level, item_name, category } = req.body;
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ stock, reorder_level, item_name, category, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory/restock', async (req, res) => {
  const { items } = req.body;
  try {
    for (const item of items) {
      const { data: current } = await supabase
        .from('inventory')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (current) {
        await supabase
          .from('inventory')
          .update({ stock: current.stock + item.add_quantity, updated_at: new Date() })
          .eq('id', item.id);
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// --- EXPENSES MANAGEMENT - PROTECTED ---
// =============================================

app.get('/api/expenses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/expenses/totals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('print_cost, cutting_cost, packaging_cost, miscellaneous');

    if (error) throw error;

    const totals = data.reduce((acc, row) => ({
      print: acc.print + Number(row.print_cost || 0),
      cutting: acc.cutting + Number(row.cutting_cost || 0),
      packaging: acc.packaging + Number(row.packaging_cost || 0),
      miscellaneous: acc.miscellaneous + Number(row.miscellaneous || 0),
      total: acc.total + Number(row.print_cost || 0) + Number(row.cutting_cost || 0) + Number(row.packaging_cost || 0) + Number(row.miscellaneous || 0)
    }), { print: 0, cutting: 0, packaging: 0, miscellaneous: 0, total: 0 });

    res.json(totals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { date, print_cost, cutting_cost, packaging_cost, miscellaneous, particular, note } = req.body;
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ date, print_cost, cutting_cost, packaging_cost, miscellaneous, particular, note }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { date, print_cost, cutting_cost, packaging_cost, miscellaneous, particular, note } = req.body;
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({ date, print_cost, cutting_cost, packaging_cost, miscellaneous, particular, note })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// --- PAYOUTS MANAGEMENT - PROTECTED ---
// =============================================

app.get('/api/payouts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payouts/total', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('amount');

    if (error) throw error;

    const total = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payouts', async (req, res) => {
  const { date, invoice_no, amount, note } = req.body;
  try {
    const { data, error } = await supabase
      .from('payouts')
      .insert([{ date, invoice_no, amount, note }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/payouts/:id', async (req, res) => {
  const { id } = req.params;
  const { date, invoice_no, amount, note } = req.body;
  try {
    const { data, error } = await supabase
      .from('payouts')
      .update({ date, invoice_no, amount, note })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/payouts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('payouts').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// --- DASHBOARD SUMMARY - PROTECTED ---
// =============================================

app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_price, status')
      .gte('created_at', today);

    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id')
      .or('status.is.null,status.eq.Pending,status.eq.Pickup Pending');

    const { data: deliveredToday } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'Delivered')
      .gte('created_at', today);

    let lowStock = [];
    try {
      const { data: inventory } = await supabase.from('inventory').select('*');
      lowStock = inventory ? inventory.filter(item => item.stock <= item.reorder_level) : [];
    } catch (e) { /* inventory table may not exist yet */ }

    let totalExpenses = 0;
    try {
      const { data: expenses } = await supabase.from('expenses').select('print_cost, cutting_cost, packaging_cost, miscellaneous');
      totalExpenses = expenses ? expenses.reduce((sum, e) =>
        sum + Number(e.print_cost || 0) + Number(e.cutting_cost || 0) + Number(e.packaging_cost || 0) + Number(e.miscellaneous || 0), 0) : 0;
    } catch (e) { /* expenses table may not exist yet */ }

    let totalPayouts = 0;
    try {
      const { data: payouts } = await supabase.from('payouts').select('amount');
      totalPayouts = payouts ? payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0) : 0;
    } catch (e) { /* payouts table may not exist yet */ }

    res.json({
      todayOrders: todayOrders?.length || 0,
      todayRevenue: todayOrders?.reduce((sum, o) => sum + Number(o.total_price || 0), 0) || 0,
      pendingOrders: pendingOrders?.length || 0,
      deliveredToday: deliveredToday?.length || 0,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock,
      totalExpenses,
      totalPayouts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
