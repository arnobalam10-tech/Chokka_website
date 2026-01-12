import React, { useEffect, useState } from 'react';
import { Package, Truck, Tag, DollarSign, Save, Plus, Star, Trash2, Image as ImageIcon, Upload, Send, CheckCircle, BarChart3, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const supabaseUrl = 'https://sqflulpuxotfkjsjqquv.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZmx1bHB1eG90Zmtqc2pxcXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTAxODEsImV4cCI6MjA4MzcyNjE4MX0.ByYhjp6lwpZxwnYI1zDUwtR6cI0ekUWWPHKRhKsDw8M'; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orderSubTab, setOrderSubTab] = useState('All'); 
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  // Added 'cost' to product state
  const [product, setProduct] = useState({ price: 0, cost: 0, stock: 0, delivery_dhaka: 60, delivery_outside: 120 });
  const [gallery, setGallery] = useState([]);
  
  // UI State
  const [uploading, setUploading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [isBulkSending, setIsBulkSending] = useState(false);

  useEffect(() => {
    fetchOrders(); fetchProduct(); fetchCoupons(); fetchReviews(); fetchGallery();
  }, []);

  // --- API CALLS ---
  const fetchOrders = () => fetch('http://localhost:5000/api/orders').then(r => r.json()).then(setOrders);
  const fetchProduct = () => fetch('http://localhost:5000/api/product').then(r => r.json()).then(setProduct);
  const fetchCoupons = () => fetch('http://localhost:5000/api/coupons').then(r => r.json()).then(setCoupons);
  const fetchReviews = () => fetch('http://localhost:5000/api/reviews').then(r => r.json()).then(setReviews);
  const fetchGallery = () => fetch('http://localhost:5000/api/gallery').then(r => r.json()).then(setGallery);

  // --- NEW: SALES ANALYTICS LOGIC ---
  const getStats = () => {
    // Filter out cancelled orders
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    
    // 1. Total Sales (Based on CURRENT Product Price * Count, as requested)
    const totalSales = validOrders.length * (product.price || 0);
    
    // 2. Total Cost (Product Cost * Count)
    const totalCost = validOrders.length * (product.cost || 0);
    
    // 3. Gross Profit
    const grossProfit = totalSales - totalCost;

    // 4. Graph Data (Last 7 Days)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
        const count = validOrders.filter(o => o.created_at.startsWith(date)).length;
        return { date: date.slice(5), count }; // slice to show MM-DD
    });

    return { totalSales, totalCost, grossProfit, count: validOrders.length, chartData };
  };

  const stats = getStats();

  // --- STEADFAST LOGIC ---
  const sendToSteadfast = async (order) => {
    if(!confirm(`Send Order #${order.id} to Steadfast Courier?`)) return;
    setProcessingOrder(order.id);
    try {
        const response = await fetch('http://localhost:5000/api/steadfast/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                invoice: `INV-${order.id}`,
                name: order.customer_name,
                address: order.customer_address,
                phone: order.customer_phone,
                amount: order.total_price,
                note: 'Handle with care'
            })
        });
        const result = await response.json();
        if (result.status === 200) {
            alert(`✅ Sent! Tracking: ${result.consignment.tracking_code}`);
            await updateOrderStatus(order.id, 'Steadfast_Posted', result.consignment.tracking_code);
        } else {
            alert(`❌ Steadfast Error: ${JSON.stringify(result)}`);
        }
    } catch (error) { alert("Server Error"); } finally { setProcessingOrder(null); }
  };

  // --- NEW: BULK SEND LOGIC ---
  const sendAllPending = async () => {
    // Filter orders that are Pending or Pickup Pending
    const pendingOrders = orders.filter(o => !o.status || o.status === 'Pending' || o.status === 'Pickup Pending');
    
    if (pendingOrders.length === 0) return alert("No pending orders to send!");
    if (!confirm(`Are you sure you want to send ${pendingOrders.length} orders to Steadfast?`)) return;

    setIsBulkSending(true);
    try {
        const response = await fetch('http://localhost:5000/api/steadfast/bulk-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders: pendingOrders })
        });
        const result = await response.json();
        if (result.success) {
            alert(`✅ Successfully sent ${result.count} orders!`);
            fetchOrders();
        } else {
            alert("❌ Bulk Error: " + result.message);
        }
    } catch (e) { alert("Server Error"); } finally { setIsBulkSending(false); }
  };

  const updateOrderStatus = async (id, newStatus, trackingCode = null) => {
    await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_code: trackingCode })
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if(!confirm("⚠️ Delete this order permanently?")) return;
    await fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' });
    fetchOrders();
  };

  const getFilteredOrders = () => {
    if (orderSubTab === 'All') return orders;
    if (orderSubTab === 'Pickup Pending') return orders.filter(o => !o.status || o.status === 'Pending' || o.status === 'Pickup Pending');
    if (orderSubTab === 'Pickup Sent') return orders.filter(o => o.status === 'Steadfast_Posted');
    if (orderSubTab === 'Dispatched') return orders.filter(o => o.status === 'Dispatched' || o.status === 'Shipped');
    if (orderSubTab === 'Delivered') return orders.filter(o => o.status === 'Delivered');
    return orders;
  };

  // --- OTHER ACTIONS ---
  const updateProduct = async () => { const res = await fetch('http://localhost:5000/api/product', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) }); if(res.ok) alert("✅ Updated!"); };
  const createCoupon = async (e) => { e.preventDefault(); await fetch('http://localhost:5000/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: e.target.code.value.toUpperCase(), discount: e.target.discount.value }) }); e.target.reset(); fetchCoupons(); };
  const createReview = async (e) => { e.preventDefault(); await fetch('http://localhost:5000/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_name: e.target.name.value, rating: e.target.rating.value, comment: e.target.comment.value }) }); e.target.reset(); fetchReviews(); };
  const deleteReview = async (id) => { if(!confirm("Delete?")) return; await fetch(`http://localhost:5000/api/reviews/${id}`, { method: 'DELETE' }); fetchReviews(); };
  const deleteImage = async (id) => { if(!confirm("Remove?")) return; await fetch(`http://localhost:5000/api/gallery/${id}`, { method: 'DELETE' }); fetchGallery(); };
  
  const handleUploadAndSave = async (e) => {
    e.preventDefault(); const file = e.target.file_input.files[0]; const caption = e.target.caption.value; if (!file) return alert("Select a file!"); setUploading(true);
    try {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`; const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        await fetch('http://localhost:5000/api/gallery', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ image_url: urlData.publicUrl, caption: caption }) });
        alert("✅ Upload Successful!"); e.target.reset(); fetchGallery();
    } catch (error) { alert("Upload Error: " + error.message); } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-mono text-chokka-dark">
      {/* SIDEBAR */}
      <div className="w-64 bg-chokka-dark text-white p-6 flex flex-col gap-6 fixed h-full z-10 overflow-y-auto">
        <h1 className="text-2xl font-bold tracking-widest border-b border-gray-600 pb-4">ADMIN</h1>
        <nav className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('analytics')} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-chokka-green text-chokka-dark' : ''}`}><BarChart3 size={20}/> ANALYTICS</button>
            <button onClick={() => setActiveTab('orders')} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'orders' ? 'bg-chokka-green text-chokka-dark' : ''}`}><Package size={20}/> ORDERS</button>
            <button onClick={() => setActiveTab('products')} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'products' ? 'bg-chokka-green text-chokka-dark' : ''}`}><DollarSign size={20}/> PRICES & COST</button>
            <button onClick={() => setActiveTab('coupons')} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'coupons' ? 'bg-chokka-green text-chokka-dark' : ''}`}><Tag size={20}/> COUPONS</button>
            <button onClick={() => setActiveTab('reviews')} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'reviews' ? 'bg-chokka-green text-chokka-dark' : ''}`}><Star size={20}/> REVIEWS</button>
            <button onClick={() => setActiveTab('visuals')} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'visuals' ? 'bg-chokka-green text-chokka-dark' : ''}`}><ImageIcon size={20}/> VISUALS</button>
        </nav>
      </div>

      {/* CONTENT */}
      <div className="ml-64 p-10 w-full">
        
        {/* --- 1. NEW ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
            <div>
                <h2 className="text-3xl font-bold mb-8">SALES SUMMARY</h2>
                
                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 shadow-lg border-2 border-black">
                        <div className="text-gray-500 font-bold mb-2 flex items-center gap-2"><Package/> Total Orders</div>
                        <div className="text-4xl font-black">{stats.count}</div>
                    </div>
                    <div className="bg-white p-6 shadow-lg border-2 border-black">
                        <div className="text-gray-500 font-bold mb-2 flex items-center gap-2"><TrendingUp/> Product Sales</div>
                        <div className="text-4xl font-black text-blue-600">{stats.totalSales}৳</div>
                    </div>
                    <div className="bg-white p-6 shadow-lg border-2 border-black bg-green-50">
                        <div className="text-gray-500 font-bold mb-2 flex items-center gap-2"><DollarSign/> Gross Profit</div>
                        <div className="text-4xl font-black text-green-600">+{stats.grossProfit}৳</div>
                        <div className="text-xs text-gray-500 mt-2 font-bold">Calculation: (Price {product.price} - Cost {product.cost}) * Orders</div>
                    </div>
                </div>

                {/* Simple Bar Chart */}
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar/> Order Volume (Last 7 Days)</h3>
                <div className="bg-white p-8 shadow-lg border-2 border-black h-64 flex items-end justify-around gap-2">
                    {stats.chartData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center w-full group">
                            <div className="font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</div>
                            <div 
                                className="w-full max-w-[40px] bg-chokka-green hover:bg-chokka-dark transition-all rounded-t"
                                style={{ height: `${d.count > 0 ? (d.count * 20) + 10 : 2}px` }} 
                            ></div>
                            <div className="text-xs font-bold mt-2 text-gray-500">{d.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- 2. ORDERS TAB (UPDATED) --- */}
        {activeTab === 'orders' && (
            <div>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-3xl font-bold">ORDER MANAGEMENT</h2>
                    {/* NEW BULK BUTTON */}
                    <button 
                        onClick={sendAllPending}
                        disabled={isBulkSending}
                        className="bg-green-600 text-white px-6 py-3 font-bold shadow-lg hover:bg-green-700 flex items-center gap-2 border-2 border-black transition-transform active:scale-95 disabled:opacity-50"
                    >
                        {isBulkSending ? 'SENDING...' : <><Send size={20}/> SEND ALL PENDING TO STEADFAST</>}
                    </button>
                </div>
                
                {/* SUB TABS */}
                <div className="flex gap-2 mb-6 border-b-2 border-gray-300 pb-2 overflow-x-auto">
                    {['All', 'Pickup Pending', 'Pickup Sent', 'Dispatched', 'Delivered'].map(tab => (
                        <button key={tab} onClick={() => setOrderSubTab(tab)} className={`px-4 py-2 font-bold whitespace-nowrap rounded-t-lg transition-colors ${orderSubTab === tab ? 'bg-chokka-dark text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{tab}</button>
                    ))}
                </div>

                <div className="bg-white shadow-lg border-2 border-black overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-200 border-b-2 border-black">
                            <tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Steadfast</th><th className="p-4">Manual</th><th className="p-4">Delete</th></tr>
                        </thead>
                        <tbody>
                            {getFilteredOrders().length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-bold">No orders found in "{orderSubTab}"</td></tr>
                            ) : (
                                getFilteredOrders().map(o => (
                                    <tr key={o.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono">#{o.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold">{o.customer_name}</div>
                                            <div className="text-sm text-gray-500">{o.customer_phone}</div>
                                            <div className="text-xs text-gray-400 max-w-[200px]">{o.customer_address}</div>
                                        </td>
                                        <td className="p-4 font-bold text-lg">{o.total_price}৳</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide
                                                ${!o.status || o.status === 'Pending' || o.status === 'Pickup Pending' ? 'bg-yellow-200 text-yellow-800' : ''}
                                                ${o.status === 'Steadfast_Posted' ? 'bg-blue-200 text-blue-800' : ''}
                                                ${o.status === 'Dispatched' ? 'bg-purple-200 text-purple-800' : ''}
                                                ${o.status === 'Delivered' ? 'bg-green-200 text-green-800' : ''}
                                                ${o.status === 'Cancelled' ? 'bg-red-200 text-red-800' : ''}`}>
                                                {o.status || 'Pending'}
                                            </span>
                                            {o.tracking_code && <div className="text-xs font-mono mt-1 text-gray-500">Track: {o.tracking_code}</div>}
                                        </td>
                                        <td className="p-4">
                                            {(!o.status || o.status === 'Pending' || o.status === 'Pickup Pending') ? (
                                                <button onClick={() => sendToSteadfast(o)} disabled={processingOrder === o.id} className="bg-green-600 text-white px-4 py-2 text-sm font-bold hover:bg-green-700 flex items-center gap-2 rounded shadow disabled:opacity-50">
                                                    {processingOrder === o.id ? '...' : <><Send size={16}/> Send</>}
                                                </button>
                                            ) : ( o.status === 'Steadfast_Posted' && <span className="text-blue-600 font-bold text-sm flex items-center gap-1"><CheckCircle size={14}/> Sent</span> )}
                                        </td>
                                        <td className="p-4">
                                            <select className="border-2 border-gray-300 p-1 text-sm font-bold rounded" value={o.status || 'Pending'} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                                                <option value="Pickup Pending">Pickup Pending</option>
                                                <option value="Steadfast_Posted" disabled>Pickup Sent</option>
                                                <option value="Dispatched">Dispatched</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => deleteOrder(o.id)} className="text-red-500 hover:bg-red-100 p-2 rounded transition-colors"><Trash2 size={20} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- 3. PRODUCTS TAB (UPDATED WITH COST) --- */}
        {activeTab === 'products' && (
            <div className="max-w-xl">
                <h2 className="text-3xl font-bold mb-6">GAME SETTINGS</h2>
                <div className="bg-white p-8 shadow-lg border-2 border-black flex flex-col gap-6">
                    <div><label className="block font-bold mb-2">Selling Price (Taka)</label><input type="number" className="w-full p-3 border-2 border-gray-300 font-bold text-lg" value={product.price} onChange={e => setProduct({...product, price: Number(e.target.value)})}/></div>
                    
                    {/* NEW COST INPUT */}
                    <div><label className="block font-bold mb-2 text-red-600 flex items-center gap-2"><AlertCircle size={16}/> Manufacturing Cost (For Profit Calc)</label><input type="number" className="w-full p-3 border-2 border-red-200 font-bold text-lg" value={product.cost || 0} onChange={e => setProduct({...product, cost: Number(e.target.value)})}/></div>

                    <div className="flex gap-4">
                        <div className="w-1/2"><label className="block font-bold mb-2 text-sm">Dhaka Ship</label><input type="number" className="w-full p-3 border-2 border-gray-300 font-bold" value={product.delivery_dhaka} onChange={e => setProduct({...product, delivery_dhaka: Number(e.target.value)})}/></div>
                        <div className="w-1/2"><label className="block font-bold mb-2 text-sm">Outside Ship</label><input type="number" className="w-full p-3 border-2 border-gray-300 font-bold" value={product.delivery_outside} onChange={e => setProduct({...product, delivery_outside: Number(e.target.value)})}/></div>
                    </div>
                    <button onClick={updateProduct} className="bg-chokka-green text-chokka-dark py-4 font-bold text-xl hover:bg-green-400 border-2 border-black flex justify-center gap-2"><Save /> SAVE CHANGES</button>
                </div>
            </div>
        )}

        {/* --- COUPONS TAB (Restored) --- */}
        {activeTab === 'coupons' && (
            <div className="max-w-4xl">
                <h2 className="text-3xl font-bold mb-6">COUPON MANAGER</h2>
                <form onSubmit={createCoupon} className="bg-white p-6 shadow-md border-2 border-black mb-8 flex gap-4 items-end flex-wrap">
                    <div><label className="font-bold block text-sm mb-1">Coupon Code</label><input name="code" required type="text" placeholder="e.g. SUMMER20" className="border-2 border-gray-300 p-2 font-bold uppercase w-48"/></div>
                    <div><label className="font-bold block text-sm mb-1">Discount (Tk)</label><input name="discount" required type="number" placeholder="50" className="border-2 border-gray-300 p-2 font-bold w-32"/></div>
                    <button className="bg-chokka-dark text-white px-6 py-2.5 font-bold hover:bg-black flex items-center gap-2"><Plus size={18}/> CREATE</button>
                </form>
                <div className="bg-white shadow-lg border-2 border-black"><table className="w-full text-left"><thead className="bg-gray-200 border-b-2 border-black"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Status</th></tr></thead><tbody>{coupons.map(c => <tr key={c.id} className="border-b"><td className="p-3 font-bold text-green-700">{c.code}</td><td className="p-3 font-bold">{c.discount}৳ OFF</td><td className="p-3 text-sm">Active</td></tr>)}</tbody></table></div>
            </div>
        )}
        
        {/* --- REVIEWS TAB (Restored) --- */}
        {activeTab === 'reviews' && (
            <div className="max-w-4xl">
                 <h2 className="text-3xl font-bold mb-6">CUSTOMER REVIEWS</h2>
                 <form onSubmit={createReview} className="bg-white p-6 shadow-md border-2 border-black mb-8 flex gap-4 items-end flex-wrap">
                    <div><label className="font-bold block text-sm mb-1">Name</label><input name="name" required type="text" placeholder="Sakib" className="border-2 border-gray-300 p-2 font-bold w-48"/></div>
                    <div><label className="font-bold block text-sm mb-1">Rating</label><select name="rating" className="border-2 border-gray-300 p-2 font-bold w-24"><option value="5">5 ★</option><option value="4">4 ★</option></select></div>
                    <div className="w-full"><label className="font-bold block text-sm mb-1">Comment</label><textarea name="comment" required placeholder="Comment..." className="border-2 border-gray-300 p-2 font-bold w-full h-20 resize-none"/></div>
                    <button className="bg-chokka-dark text-white px-6 py-2.5 font-bold hover:bg-black flex items-center gap-2"><Plus size={18}/> POST REVIEW</button>
                 </form>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{reviews.map(r => <div key={r.id} className="bg-white border-2 border-black p-4 shadow-md relative group"><div className="flex justify-between"><div><div className="text-yellow-500">{"★".repeat(r.rating)}</div><h4 className="font-bold">{r.customer_name}</h4></div><button onClick={() => deleteReview(r.id)} className="text-red-500 hover:bg-red-50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button></div><p className="mt-2 text-gray-600 italic text-sm">"{r.comment}"</p></div>)}</div>
            </div>
        )}
        
        {/* --- VISUALS TAB (Restored) --- */}
        {activeTab === 'visuals' && (
            <div className="max-w-5xl">
                <h2 className="text-3xl font-bold mb-6">PRODUCT VISUALS</h2>
                <form onSubmit={handleUploadAndSave} className="bg-white p-6 shadow-md border-2 border-black mb-8 flex flex-col md:flex-row gap-4 items-end bg-green-50">
                    <div className="w-full"><label className="font-bold block text-sm mb-1">Select Photo</label><input name="file_input" required type="file" accept="image/*" className="border-2 border-black p-2 font-bold w-full bg-white"/></div>
                    <div><label className="font-bold block text-sm mb-1">Caption</label><input name="caption" type="text" placeholder="Detail Shot" className="border-2 border-black p-2 font-bold w-48"/></div>
                    <button disabled={uploading} className="bg-black text-white px-6 py-2.5 font-bold hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">{uploading ? 'UPLOADING...' : <><Upload size={18}/> UPLOAD</>}</button>
                </form>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{gallery.map(img => <div key={img.id} className="bg-white border-2 border-black p-2 relative group shadow-lg"><img src={img.image_url} alt="Visual" className="w-full h-48 object-cover border border-gray-200 bg-gray-100"/>{img.caption && <div className="mt-2 font-bold text-xs text-center uppercase tracking-wider">{img.caption}</div>}<button onClick={() => deleteImage(img.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"><Trash2 size={16} /></button></div>)}</div>
            </div>
        )}
      </div>
    </div>
  );
}