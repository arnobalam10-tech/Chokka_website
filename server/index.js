require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Paste this near the top, after your constants
const sendTelegramNotification = async (orderData) => {
  const TELEGRAM_TOKEN = '8279878052:AAH6w2UeFBDUkMHGxXutA4UoYwv1yJFRIFw';
  
  // --- UPDATED: LIST OF ADMIN IDS ---
  const CHAT_IDS = [
    '5865440292', // You
    '5043710380'  // Jafar Wasi
  ];

  // --- UPDATED: PRODUCT NAME MAPPING ---
  const productNames = {
    1: "The Syndicate",
    2: "TONG",
    3: "Chokka Bundle"
  };
  const gameTitle = productNames[orderData.product_id] || "Unknown Item";
  
  const message = `💰 *NEW ORDER RECEIVED!* 💰\n\n` +
                  `📦 *Item:* ${gameTitle}\n` + // Added Product Name here
                  `👤 *Name:* ${orderData.customer_name}\n` +
                  `📞 *Phone:* ${orderData.customer_phone}\n` +
                  `🏙️ *City:* ${orderData.city}\n` +
                  `💵 *Total:* ${orderData.total_price} BDT\n\n` +
                  `👉 [Open Admin Panel](https://chokka.shop/admin)`;

  // Loop through all IDs and send the message to everyone
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

// --- HELPER: Auto-deduct inventory on order ---
const deductInventoryForOrder = async (product_id) => {
  try {
    // Determine which products to deduct based on order type
    let productIds = [];
    if (product_id === 1) productIds = [1]; // Syndicate only
    else if (product_id === 2) productIds = [2]; // Tong only
    else if (product_id === 3) productIds = [1, 2]; // Bundle = both

    for (const pid of productIds) {
      // Deduct card_set, packet, and sticker for each product
      const itemTypes = ['card_set', 'packet', 'sticker'];
      for (const itemType of itemTypes) {
        await supabase.rpc('decrement_stock', {
          p_product_id: pid,
          p_item_type: itemType
        }).catch(() => {
          // Fallback: manual decrement if RPC doesn't exist
          return supabase
            .from('inventory')
            .select('id, stock')
            .eq('product_id', pid)
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
  } catch (error) {
    console.error("Inventory deduction error:", error.message);
  }
};

// --- 1. ORDERS ---

// Receive New Order (Checkout)
app.post('/api/create-order', async (req, res) => {
  const { customer_name, customer_phone, customer_address, city, product_id, quantity, total_price } = req.body;

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name,
          customer_phone,
          customer_address,
          city,
          product_id,
          quantity,
          total_price
        }
      ])
      .select();

    if (error) throw error;

    // Auto-deduct inventory
    await deductInventoryForOrder(product_id);

    await sendTelegramNotification(req.body);
    res.json({ success: true, orderId: data[0].id });

  } catch (error) {
    console.error("Database Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get All Orders (Admin Panel)
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- NEW ENDPOINT: Update Customer Details (Edit Modal) ---
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 2. PRODUCT SETTINGS (Prices & Fees) ---

// Get ALL products (For Admin)
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update specific product by ID
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
    res.status(500).json({ error: error.message });
  }
});

// --- 3. COUPONS ---

// Get All Coupons
app.get('/api/coupons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create New Coupon
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
    res.status(500).json({ error: error.message });
  }
});

// --- 4. VERIFY COUPON ---
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
    res.status(500).json({ error: error.message });
  }
});

// --- 5. MANAGE REVIEWS ---
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

// [FIX] Now accepts product_id
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
        product_id: product_id || 1 // Default to Syndicate if missing
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

// [FIX] Now accepts product_id
app.post('/api/gallery', async (req, res) => {
  const { image_url, caption, product_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert([{ 
        image_url, 
        caption,
        product_id: product_id || 1 // Default to Syndicate if missing
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

// --- STEADFAST COURIER INTEGRATION ---
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
  const { status, tracking_code } = req.body;

  try {
    const updateData = { status: status };
    if (tracking_code) updateData.tracking_code = tracking_code;

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
        // Default to 'Unassigned' because Steadfast puts bulk orders in 'in_review'
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

// --- FIXED: SYNC ALL STATUS (Uses tracking code endpoint) ---
app.post('/api/steadfast/sync-all', async (req, res) => {
  const API_KEY = process.env.STEADFAST_API_KEY;
  const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;
  const BASE_URL = 'https://portal.packzy.com/api/v1';

  try {
    // 1. Get all active orders from DB (Filter out delivered/cancelled)
    const { data: activeOrders, error } = await supabase
      .from('orders')
      .select('id, invoice_id, tracking_code, status')
      .not('tracking_code', 'is', null);

    if (error) throw error;

    // Filter out delivered/cancelled orders in JS (more reliable)
    const ordersToSync = activeOrders?.filter(o =>
      o.status !== 'Delivered' &&
      o.status !== 'Cancelled' &&
      !o.status?.includes('Delivered') &&
      !o.status?.includes('Cancelled')
    ) || [];
    if (!ordersToSync || ordersToSync.length === 0) {
      return res.json({ success: true, updated: 0, message: "No active orders to sync." });
    }

    let updatedCount = 0;
    const errors = [];

    // 2. Loop through each order and check status
    for (const order of ordersToSync) {
      if (!order.tracking_code) continue;

      try {
        // FIXED: Use status_by_trackingcode instead of status_by_cid
        const response = await fetch(`${BASE_URL}/status_by_trackingcode/${order.tracking_code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': API_KEY,
            'Secret-Key': SECRET_KEY
          }
        });

        const result = await response.json();

        if (result.status === 200 && result.delivery_status) {
          const sfStatus = result.delivery_status.toLowerCase();
          let newStatus = order.status;

          // --- MAP STEADFAST STATUSES TO INTERNAL STATUSES ---
          if (sfStatus === 'in_review') newStatus = 'Unassigned';
          else if (sfStatus === 'pending') newStatus = 'Assigned';
          else if (sfStatus === 'delivered') newStatus = 'Delivered';
          else if (sfStatus === 'partial_delivered') newStatus = 'Partial Delivered';
          else if (sfStatus === 'cancelled') newStatus = 'Cancelled';
          else if (sfStatus === 'hold') newStatus = 'Hold';

          // Detailed Approval Statuses
          else if (sfStatus === 'delivered_approval_pending') newStatus = 'Delivered (Pending Approval)';
          else if (sfStatus === 'partial_delivered_approval_pending') newStatus = 'Partial (Pending Approval)';
          else if (sfStatus === 'cancelled_approval_pending') newStatus = 'Cancelled (Pending Approval)';
          else if (sfStatus === 'unknown_approval_pending') newStatus = 'Unknown (Pending Approval)';

          // 3. Update DB only if status changed
          if (newStatus !== order.status) {
            await supabase
              .from('orders')
              .update({ status: newStatus })
              .eq('id', order.id);
            updatedCount++;
          }
        }
      } catch (orderError) {
        errors.push({ orderId: order.id, error: orderError.message });
      }
    }

    res.json({ success: true, updated: updatedCount, total: ordersToSync.length, errors: errors.length > 0 ? errors : undefined });

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// --- INVENTORY MANAGEMENT ---
// =============================================

// Get all inventory items
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

// Get low stock items (for alerts)
app.get('/api/inventory/low-stock', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*');

    if (error) throw error;

    // Filter items where stock <= reorder_level
    const lowStock = data.filter(item => item.stock <= item.reorder_level);
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create inventory item
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

// Update inventory item
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

// Delete inventory item
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

// Bulk update stock (for restocking)
app.post('/api/inventory/restock', async (req, res) => {
  const { items } = req.body; // Array of { id, add_quantity }
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
// --- EXPENSES MANAGEMENT ---
// =============================================

// Get all expenses
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

// Get expense totals
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

// Create expense
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

// Update expense
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

// Delete expense
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
// --- PAYOUTS MANAGEMENT ---
// =============================================

// Get all payouts
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

// Get payout total
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

// Create payout
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

// Update payout
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

// Delete payout
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
// --- DASHBOARD SUMMARY ---
// =============================================

// Get summary stats for dashboard
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's orders
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_price, status')
      .gte('created_at', today);

    // Get pending orders
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id')
      .or('status.is.null,status.eq.Pending,status.eq.Pickup Pending');

    // Get delivered today
    const { data: deliveredToday } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'Delivered')
      .gte('created_at', today);

    // Get low stock items (with error handling for missing table)
    let lowStock = [];
    try {
      const { data: inventory } = await supabase.from('inventory').select('*');
      lowStock = inventory ? inventory.filter(item => item.stock <= item.reorder_level) : [];
    } catch (e) { /* inventory table may not exist yet */ }

    // Get total expenses (with error handling for missing table)
    let totalExpenses = 0;
    try {
      const { data: expenses } = await supabase.from('expenses').select('print_cost, cutting_cost, packaging_cost, miscellaneous');
      totalExpenses = expenses ? expenses.reduce((sum, e) =>
        sum + Number(e.print_cost || 0) + Number(e.cutting_cost || 0) + Number(e.packaging_cost || 0) + Number(e.miscellaneous || 0), 0) : 0;
    } catch (e) { /* expenses table may not exist yet */ }

    // Get total payouts received (with error handling for missing table)
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