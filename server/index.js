require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase (Tries both key names to be safe)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
      .order('created_at', { ascending: false }); // Newest first

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

// --- 2. PRODUCT SETTINGS (Prices & Fees) ---

// Get Product Info (To show in Admin)
app.get('/api/product', async (req, res) => {
  try {
    // We assume you are editing Product #1 "The Syndicate"
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Price & Delivery Fees
app.put('/api/product', async (req, res) => {
  const { price, stock, delivery_dhaka, delivery_outside } = req.body;

  try {
    const { data, error } = await supabase
      .from('products')
      .update({ price, stock, delivery_dhaka, delivery_outside })
      .eq('id', 1) // Always updates Product #1
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
      .eq('code', code.toUpperCase()) // Case insensitive
      .single();

    if (error || !data) {
      return res.json({ success: false, message: 'Invalid Coupon' });
    }
    
    // Check if active
    if (!data.is_active) {
       return res.json({ success: false, message: 'Coupon Expired' });
    }

    res.json({ success: true, discount: data.discount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// --- 5. MANAGE REVIEWS ---
// Get All Reviews (For Admin & Website)
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

// Add a Review (From Admin)
app.post('/api/reviews', async (req, res) => {
  const { customer_name, rating, comment } = req.body;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ customer_name, rating, comment, is_approved: true }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a Review
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
// --- 6. MANAGE GALLERY (VISUALS) ---
// Get All Images
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

// Add New Image
app.post('/api/gallery', async (req, res) => {
  const { image_url, caption } = req.body;
  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert([{ image_url, caption }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Image
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

// 1. Send Order to Steadfast
app.post('/api/steadfast/create', async (req, res) => {
  const { invoice, name, address, phone, amount, note } = req.body;

  // ⚠️ REPLACE THESE WITH YOUR REAL STEADFAST KEYS ⚠️
  const API_KEY = 'w4aihx8gaakviwpxyuwcli49gdkx2fzq'; 
  const SECRET_KEY = '0lmrgricaoo2ghemqacnrt54';
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

// 2. Update Order Status Manually (For Dispatched/Delivered)
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, tracking_code } = req.body; // We can save tracking code if needed

  try {
    const updateData = { status: status };
    if (tracking_code) updateData.tracking_code = tracking_code;

    const { error } = await supabase
      .from('orders') // Assuming your table is named 'orders'
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// --- 9. DELETE ORDER ---
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
// --- 10. STEADFAST BULK UPLOAD (CORRECTED) ---
app.post('/api/steadfast/bulk-create', async (req, res) => {
  const { orders } = req.body;
  
  // ⚠️ PASTE YOUR REAL KEYS HERE IF THEY ARE MISSING ⚠️
  const API_KEY = 'w4aihx8gaakviwpxyuwcli49gdkx2fzq'; 
  const SECRET_KEY = '0lmrgricaoo2ghemqacnrt54';
  const BASE_URL = 'https://portal.packzy.com/api/v1';

  // 1. Format the array exactly as Steadfast wants
  const bulkArray = orders.map(o => ({
    invoice: `INV-${o.id}`,
    recipient_name: o.customer_name,
    recipient_address: o.customer_address,
    recipient_phone: o.customer_phone,
    cod_amount: o.total_price, // Ensure this is a number/string
    note: 'Handle with care'
  }));

  try {
    // 2. The critical fix: 'data' must be a JSON STRING, not an object
    const payload = JSON.stringify(bulkArray);

    const response = await fetch(`${BASE_URL}/create_order/bulk-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
        'Secret-Key': SECRET_KEY
      },
      body: JSON.stringify({ data: payload }) // Double wrapping
    });

    const result = await response.json();
    console.log("Steadfast Bulk Response:", JSON.stringify(result, null, 2)); // Detailed Log

    // 3. Handle their specific response format
    // Steadfast bulk response is usually an array of objects, not just { status: 200 }
    // We check if we got an array back, or a success status
    if (result.status === 200 || Array.isArray(result)) {
        
        // Mark all as posted in our DB
        const ids = orders.map(o => o.id);
        await supabase
          .from('orders')
          .update({ status: 'Steadfast_Posted' })
          .in('id', ids);
          
        res.json({ success: true, count: orders.length, details: result });
    } else {
        // If Steadfast returns an error object
        res.json({ success: false, message: "Steadfast Rejected: " + JSON.stringify(result) });
    }

  } catch (error) {
    console.error("Bulk Error:", error);
    res.status(500).json({ error: error.message });
  }
});
// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});