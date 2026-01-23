import React, { useEffect, useState } from 'react';
import { Package, Truck, Tag, DollarSign, Save, Plus, Star, Trash2, Image as ImageIcon, Upload, Send, CheckCircle, BarChart3, TrendingUp, Calendar, AlertCircle, Edit3, RefreshCw, Menu, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const supabaseUrl = 'https://sqflulpuxotfkjsjqquv.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZmx1bHB1eG90Zmtqc2pxcXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTAxODEsImV4cCI6MjA4MzcyNjE4MX0.ByYhjp6lwpZxwnYI1zDUwtR6cI0ekUWWPHKRhKsDw8M'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// --- LIVE SERVER ---
const API_URL = 'https://chokka-server.onrender.com';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orderSubTab, setOrderSubTab] = useState('All'); 
  const [contentSubTab, setContentSubTab] = useState(1);
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]); 
  const [gallery, setGallery] = useState([]);
  
  // UI State
  const [uploading, setUploading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

  // --- NEW: EDIT STATE ---
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({ customer_name: '', customer_phone: '', customer_address: '', total_price: 0 });

  useEffect(() => {
    fetchOrders(); fetchProducts(); fetchCoupons(); fetchReviews(); fetchGallery();
  }, []);

  // --- API CALLS ---
  const fetchOrders = () => fetch(`${API_URL}/api/orders`).then(r => r.json()).then(setOrders);
  const fetchProducts = () => fetch(`${API_URL}/api/products`).then(r => r.json()).then(setProducts);
  const fetchCoupons = () => fetch(`${API_URL}/api/coupons`).then(r => r.json()).then(setCoupons);
  const fetchReviews = () => fetch(`${API_URL}/api/reviews`).then(r => r.json()).then(setReviews);
  const fetchGallery = () => fetch(`${API_URL}/api/gallery`).then(r => r.json()).then(setGallery);

  // --- HELPER: Unified "Pending" Logic (Case Insensitive) ---
  const isPending = (status) => {
    if (!status) return true;
    const s = status.toLowerCase();
    return s === '' || s === 'pending' || s === 'pickup pending';
  };

  const getStats = () => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    let totalSales = 0;
    let totalCost = 0;

    validOrders.forEach(order => {
        const prod = products.find(p => p.id === (order.product_id || 1));
        if (prod) {
            totalSales += Number(prod.price);
            totalCost += Number(prod.cost);
        }
    });

    const grossProfit = totalSales - totalCost;
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();
    const chartData = last7Days.map(date => {
        const count = validOrders.filter(o => o.created_at.startsWith(date)).length;
        return { date: date.slice(5), count };
    });
    return { totalSales, totalCost, grossProfit, count: validOrders.length, chartData };
  };

  const stats = getStats();

  const getProductName = (id) => {
    const p = products.find(prod => prod.id === (id || 1));
    return p ? p.title : "Syndicate";
  };

  // --- ACTIONS ---

  const sendToSteadfast = async (order) => {
    if(!confirm(`Send Order #${order.id} to Steadfast Courier?`)) return;
    setProcessingOrder(order.id);
    try {
        const response = await fetch(`${API_URL}/api/steadfast/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                invoice: `INV-${order.id}`,
                name: order.customer_name,
                address: order.customer_address,
                phone: order.customer_phone,
                amount: order.total_price,
                note: `Game: ${getProductName(order.product_id)}`
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

  const sendAllPending = async () => {
    const pendingOrders = orders.filter(o => isPending(o.status));
    if (pendingOrders.length === 0) return alert("No pending orders to send!");
    if (!confirm(`Are you sure you want to send ${pendingOrders.length} orders to Steadfast?`)) return;
    setIsBulkSending(true);
    try {
        const response = await fetch(`${API_URL}/api/steadfast/bulk-create`, {
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

  const syncAllStatus = async () => {
    setIsSyncing(true);
    try {
        const response = await fetch(`${API_URL}/api/steadfast/sync-all`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            alert(`✅ Synced! ${result.updated} orders updated.`);
            fetchOrders(); 
        } else {
            alert("Sync failed: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Sync Error", error);
    } finally {
        setIsSyncing(false);
    }
  };

  const updateOrderStatus = async (id, newStatus, trackingCode = null) => {
    await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_code: trackingCode })
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if(!confirm("⚠️ Delete this order permanently?")) return;
    await fetch(`${API_URL}/api/orders/${id}`, { method: 'DELETE' });
    fetchOrders();
  };

  // --- NEW: EDIT FUNCTIONS ---
  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditForm({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        total_price: order.total_price
    });
  };

  const saveOrderChanges = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
        const response = await fetch(`${API_URL}/api/orders/${editingOrder.id}/update-details`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        });
        const result = await response.json();
        if (result.success) {
            alert("✅ Order details updated!");
            setEditingOrder(null);
            fetchOrders();
        } else {
            alert("Update failed: " + (result.error || "Unknown error"));
        }
    } catch (error) { alert("Server error while updating."); }
  };

  const getFilteredOrders = () => {
    if (orderSubTab === 'All') return orders;
    if (orderSubTab === 'Pickup Pending') return orders.filter(o => isPending(o.status));
    if (orderSubTab === 'Pickup Sent') return orders.filter(o => o.status === 'Steadfast_Posted');
    if (orderSubTab === 'Dispatched') return orders.filter(o => o.status === 'Dispatched' || o.status === 'Shipped' || o.status === 'in_review');
    if (orderSubTab === 'Delivered') return orders.filter(o => o.status === 'Delivered');
    return orders;
  };

  // ... (Other update functions kept exactly as is)
  const updateProduct = async (id, updatedData) => { const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }); if(res.ok) fetchProducts(); };
  const createCoupon = async (e) => { e.preventDefault(); await fetch(`${API_URL}/api/coupons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: e.target.code.value.toUpperCase(), discount: e.target.discount.value }) }); e.target.reset(); fetchCoupons(); };
  const updateCoupon = async (id, updatedData) => { const { error } = await supabase.from('coupons').update(updatedData).eq('id', id); if (!error) { fetchCoupons(); } else { alert("Error updating coupon"); } };
  const deleteCoupon = async (id) => { if(!confirm("Delete this coupon?")) return; const { error } = await supabase.from('coupons').delete().eq('id', id); if (!error) { fetchCoupons(); } else { alert("Error deleting coupon"); } };
  const createReview = async (e) => { e.preventDefault(); await fetch(`${API_URL}/api/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_name: e.target.name.value, rating: e.target.rating.value, comment: e.target.comment.value, product_id: contentSubTab }) }); e.target.reset(); fetchReviews(); };
  const deleteReview = async (id) => { if(!confirm("Delete?")) return; await fetch(`${API_URL}/api/reviews/${id}`, { method: 'DELETE' }); fetchReviews(); };
  const deleteImage = async (id) => { if(!confirm("Remove?")) return; await fetch(`${API_URL}/api/gallery/${id}`, { method: 'DELETE' }); fetchGallery(); };
  const handleUploadAndSave = async (e) => { e.preventDefault(); const file = e.target.file_input.files[0]; const caption = e.target.caption.value; if (!file) return alert("Select a file!"); setUploading(true); try { const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`; const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error; const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName); await fetch(`${API_URL}/api/gallery`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ image_url: urlData.publicUrl, caption: caption, product_id: contentSubTab }) }); alert("✅ Upload Successful!"); e.target.reset(); fetchGallery(); } catch (error) { alert("Upload Error: " + error.message); } finally { setUploading(false); } };

  return (
    <div className="min-h-screen bg-gray-100 flex font-mono text-chokka-dark relative">
      
      {/* MOBILE MENU */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-chokka-dark text-white p-4 z-20 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-widest">ADMIN PANEL</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`
        bg-chokka-dark text-white p-6 flex flex-col gap-6 fixed h-full z-30 transition-transform duration-300 w-64
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 top-0 left-0 pt-20 md:pt-6
      `}>
        <h1 className="text-2xl font-bold tracking-widest border-b border-gray-600 pb-4 hidden md:block">ADMIN</h1>
        <nav className="flex flex-col gap-2">
            <button onClick={() => {setActiveTab('analytics'); setMobileMenuOpen(false);}} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-chokka-green text-chokka-dark' : ''}`}><BarChart3 size={20}/> ANALYTICS</button>
            <button onClick={() => {setActiveTab('orders'); setMobileMenuOpen(false);}} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'orders' ? 'bg-chokka-green text-chokka-dark' : ''}`}><Package size={20}/> ORDERS</button>
            <button onClick={() => {setActiveTab('products'); setMobileMenuOpen(false);}} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'products' ? 'bg-chokka-green text-chokka-dark' : ''}`}><DollarSign size={20}/> GAME SETTINGS</button>
            <button onClick={() => {setActiveTab('coupons'); setMobileMenuOpen(false);}} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'coupons' ? 'bg-chokka-green text-chokka-dark' : ''}`}><Tag size={20}/> COUPONS</button>
            <button onClick={() => {setActiveTab('reviews'); setMobileMenuOpen(false);}} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'reviews' ? 'bg-chokka-green text-chokka-dark' : ''}`}><Star size={20}/> REVIEWS</button>
            <button onClick={() => {setActiveTab('visuals'); setMobileMenuOpen(false);}} className={`text-left p-3 font-bold hover:bg-gray-800 flex items-center gap-3 ${activeTab === 'visuals' ? 'bg-chokka-green text-chokka-dark' : ''}`}><ImageIcon size={20}/> VISUALS</button>
        </nav>
      </div>

      <div className="w-full md:ml-64 p-4 md:p-10 mt-16 md:mt-0">
        {mobileMenuOpen && <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden"></div>}

        {activeTab === 'analytics' && (
            <div>
                <h2 className="text-3xl font-bold mb-8">SALES SUMMARY</h2>
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
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar/> Order Volume (Last 7 Days)</h3>
                <div className="bg-white p-8 shadow-lg border-2 border-black h-64 flex items-end justify-around gap-2">
                    {stats.chartData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center w-full group">
                            <div className="font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</div>
                            <div className="w-full max-w-[40px] bg-chokka-green hover:bg-chokka-dark transition-all rounded-t" style={{ height: `${d.count > 0 ? (d.count * 20) + 10 : 2}px` }}></div>
                            <div className="text-xs font-bold mt-2 text-gray-500">{d.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'orders' && (
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <h2 className="text-3xl font-bold">ORDER MANAGEMENT</h2>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={syncAllStatus} disabled={isSyncing} className="bg-blue-600 text-white px-4 py-3 font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 border-2 border-black transition-transform active:scale-95 disabled:opacity-50 text-xs md:text-sm">
                            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""}/> {isSyncing ? 'SYNCING...' : 'CHECK DELIVERY STATUS'}
                        </button>
                        <button onClick={sendAllPending} disabled={isBulkSending} className="bg-green-600 text-white px-4 py-3 font-bold shadow-lg hover:bg-green-700 flex items-center gap-2 border-2 border-black transition-transform active:scale-95 disabled:opacity-50 text-xs md:text-sm">
                            {isBulkSending ? 'SENDING...' : <><Send size={18}/> SEND PENDING TO STEADFAST</>}
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 mb-6 border-b-2 border-gray-300 pb-2 overflow-x-auto">
                    {['All', 'Pickup Pending', 'Pickup Sent', 'Dispatched', 'Delivered'].map(tab => (
                        <button key={tab} onClick={() => setOrderSubTab(tab)} className={`px-4 py-2 font-bold whitespace-nowrap rounded-t-lg transition-colors ${orderSubTab === tab ? 'bg-chokka-dark text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{tab}</button>
                    ))}
                </div>
                <div className="bg-white shadow-lg border-2 border-black overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-200 border-b-2 border-black text-xs uppercase font-black">
                            <tr><th className="p-4">ID</th><th className="p-4">Game</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Steadfast</th><th className="p-4">Manual</th><th className="p-4">Actions</th></tr>
                        </thead>
                        <tbody>
                            {getFilteredOrders().length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500 font-bold">No orders found</td></tr>
                            ) : (
                                getFilteredOrders().map(o => (
                                    <tr key={o.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-400">#{o.id}</td>
                                        <td className="p-4 font-bold text-[10px]"><span className="bg-blue-50 text-blue-700 px-2 py-1 border border-blue-200 uppercase">{getProductName(o.product_id)}</span></td>
                                        <td className="p-4">
                                            <div className="font-bold">{o.customer_name}</div>
                                            <div className="text-xs text-gray-500">{o.customer_phone}</div>
                                            {/* --- UPDATED: ADDRESS SHOWN --- */}
                                            <div className="text-[10px] text-gray-400 mt-1 leading-tight max-w-[150px]">{o.customer_address}</div>
                                        </td>
                                        <td className="p-4 font-bold text-lg">{o.total_price}৳</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                                ${isPending(o.status) ? 'bg-yellow-200 text-yellow-800' : ''}
                                                ${o.status === 'Steadfast_Posted' ? 'bg-blue-200 text-blue-800' : ''}
                                                ${o.status === 'Dispatched' ? 'bg-purple-200 text-purple-800' : ''}
                                                ${o.status === 'Delivered' ? 'bg-green-200 text-green-800' : ''}
                                                ${o.status === 'Cancelled' ? 'bg-red-200 text-red-800' : ''}`}>
                                                {o.status || 'Pending'}
                                            </span>
                                            {o.tracking_code && <div className="text-[10px] font-mono mt-1 text-gray-400">Track: {o.tracking_code}</div>}
                                        </td>
                                        <td className="p-4">
                                            {isPending(o.status) ? (
                                                <button onClick={() => sendToSteadfast(o)} disabled={processingOrder === o.id} className="bg-green-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-green-700 flex items-center gap-1.5 rounded shadow disabled:opacity-50">
                                                    {processingOrder === o.id ? '...' : <><Send size={14}/> Send</>}
                                                </button>
                                            ) : ( o.status === 'Steadfast_Posted' && <span className="text-blue-600 font-bold text-[10px] flex items-center gap-1"><CheckCircle size={12}/> Posted</span> )}
                                        </td>
                                        <td className="p-4">
                                            <select className="border-2 border-gray-300 p-1 text-[10px] font-bold rounded" value={o.status || 'Pending'} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                                                <option value="Pickup Pending">Pickup Pending</option>
                                                <option value="Steadfast_Posted" disabled>Pickup Sent</option>
                                                <option value="Dispatched">Dispatched</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            {/* --- UPDATED: EDIT & DELETE --- */}
                                            <button onClick={() => openEditModal(o)} className="text-blue-500 hover:bg-blue-100 p-2 rounded transition-colors"><Edit3 size={20}/></button>
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

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
            <div>
                <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">Game Settings</h2>
                <div className="grid grid-cols-1 gap-4 max-w-4xl">
                  {products.length > 0 ? products.map(p => (
                    <div key={p.id} className="bg-white p-6 shadow-lg border-2 border-black flex flex-col gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-chokka-dark uppercase">{p.title}</h3>
                        <p className="text-xs font-bold text-gray-400">DATABASE ID: {p.id}</p>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase">Selling Price</label><input type="number" className="w-24 p-2 border-2 border-gray-300 font-black focus:border-chokka-green outline-none" defaultValue={p.price} onBlur={(e) => updateProduct(p.id, { price: Number(e.target.value) })} /></div>
                        <div><label className="block text-[10px] font-bold text-red-500 uppercase">Mfg Cost</label><input type="number" className="w-24 p-2 border-2 border-red-100 font-black focus:border-red-500 outline-none" defaultValue={p.cost} onBlur={(e) => updateProduct(p.id, { cost: Number(e.target.value) })} /></div>
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase">Dhaka Ship</label><input type="number" className="w-20 p-2 border-2 border-gray-100 font-bold focus:border-black outline-none" defaultValue={p.delivery_dhaka} onBlur={(e) => updateProduct(p.id, { delivery_dhaka: Number(e.target.value) })} /></div>
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase">Outside Ship</label><input type="number" className="w-20 p-2 border-2 border-gray-100 font-bold focus:border-black outline-none" defaultValue={p.delivery_outside} onBlur={(e) => updateProduct(p.id, { delivery_outside: Number(e.target.value) })} /></div>
                      </div>
                      <div className="bg-chokka-green p-3 border-l-4 border-chokka-dark"><span className="text-[10px] font-black block leading-tight">PROFIT/BOX</span><span className="text-xl font-black tracking-tighter">+{p.price - p.cost}৳</span></div>
                    </div>
                  )) : ( <div className="p-10 text-center border-2 border-dashed border-gray-300 font-bold text-gray-400 uppercase tracking-widest italic">Fetching Game Data...</div> )}
                </div>
            </div>
        )}

        {/* --- COUPONS TAB --- */}
        {activeTab === 'coupons' && (
            <div className="max-w-4xl">
                <h2 className="text-3xl font-bold mb-6">COUPON MANAGER</h2>
                <form onSubmit={createCoupon} className="bg-white p-6 shadow-md border-2 border-black mb-8 flex flex-col md:flex-row gap-4 items-end flex-wrap">
                    <div><label className="font-bold block text-sm mb-1">Coupon Code</label><input name="code" required type="text" placeholder="e.g. SUMMER20" className="border-2 border-gray-300 p-2 font-bold uppercase w-full md:w-48"/></div>
                    <div><label className="font-bold block text-sm mb-1">Discount (Tk)</label><input name="discount" required type="number" placeholder="50" className="border-2 border-gray-300 p-2 font-bold w-full md:w-32"/></div>
                    <button className="bg-chokka-dark text-white px-6 py-2.5 font-bold hover:bg-black flex items-center gap-2 w-full md:w-auto justify-center"><Plus size={18}/> CREATE</button>
                </form>
                <div className="bg-white shadow-lg border-2 border-black overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-gray-200 border-b-2 border-black"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Actions</th></tr></thead>
                    <tbody>
                      {coupons.map(c => (
                        <tr key={c.id} className="border-b">
                          <td className="p-3"><input className="font-bold text-green-700 bg-transparent border-b border-transparent hover:border-gray-400 focus:border-green-700 focus:outline-none uppercase w-full" defaultValue={c.code} onBlur={(e) => updateCoupon(c.id, { code: e.target.value.toUpperCase() })} /></td>
                          <td className="p-3"><div className="flex items-center gap-1"><input type="number" className="font-bold bg-transparent border-b border-transparent hover:border-gray-400 focus:border-black focus:outline-none w-20" defaultValue={c.discount} onBlur={(e) => updateCoupon(c.id, { discount: Number(e.target.value) })} /><span>৳</span></div></td>
                          <td className="p-3"><button onClick={() => deleteCoupon(c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"><Trash2 size={18}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
        )}
        
        {/* --- REVIEWS TAB --- */}
        {activeTab === 'reviews' && (
            <div className="max-w-4xl">
                 <h2 className="text-3xl font-bold mb-6 text-chokka-dark uppercase tracking-tight">Customer Reviews</h2>
                 <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button onClick={() => setContentSubTab(1)} className={`px-4 md:px-6 py-2 font-bold border-2 border-black whitespace-nowrap transition-all ${contentSubTab === 1 ? 'bg-chokka-dark text-white scale-105 shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>THE SYNDICATE</button>
                    <button onClick={() => setContentSubTab(2)} className={`px-4 md:px-6 py-2 font-bold border-2 border-black whitespace-nowrap transition-all ${contentSubTab === 2 ? 'bg-chokka-dark text-white scale-105 shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>TONG</button>
                    <button onClick={() => setContentSubTab(3)} className={`px-4 md:px-6 py-2 font-bold border-2 border-black whitespace-nowrap transition-all ${contentSubTab === 3 ? 'bg-chokka-dark text-white scale-105 shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>BUNDLE</button>
                 </div>
                 <form onSubmit={createReview} className="bg-white p-6 shadow-md border-2 border-black mb-8 flex gap-4 items-end flex-wrap">
                    <div className="w-full md:w-auto"><label className="font-bold block text-sm mb-1">Name</label><input name="name" required type="text" placeholder="Sakib" className="border-2 border-gray-300 p-2 font-bold w-full md:w-48"/></div>
                    <div className="w-full md:w-auto"><label className="font-bold block text-sm mb-1">Rating</label><select name="rating" className="border-2 border-gray-300 p-2 font-bold w-full md:w-24"><option value="5">5 ★</option><option value="4">4 ★</option></select></div>
                    <div className="w-full"><label className="font-bold block text-sm mb-1">Comment</label><textarea name="comment" required placeholder="Comment..." className="border-2 border-gray-300 p-2 font-bold w-full h-20 resize-none"/></div>
                    <button className="bg-chokka-dark text-white px-6 py-2.5 font-bold hover:bg-black flex items-center gap-2 w-full md:w-auto justify-center"><Plus size={18}/> POST REVIEW</button>
                 </form>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.filter(r => (r.product_id || 1) === contentSubTab).map(r => (
                        <div key={r.id} className="bg-white border-2 border-black p-4 shadow-md relative group transition-transform hover:scale-[1.01]">
                            <div className="flex justify-between">
                                <div><div className="text-yellow-500">{"★".repeat(r.rating)}</div><h4 className="font-bold">{r.customer_name}</h4></div>
                                <button onClick={() => deleteReview(r.id)} className="text-red-500 hover:bg-red-50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            </div>
                            <p className="mt-2 text-gray-600 italic text-sm">"{r.comment}"</p>
                        </div>
                    ))}
                 </div>
            </div>
        )}
        
        {/* --- VISUALS TAB --- */}
        {activeTab === 'visuals' && (
            <div className="max-w-5xl">
                <h2 className="text-3xl font-bold mb-6 text-chokka-dark uppercase tracking-tight">Product Visuals</h2>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button onClick={() => setContentSubTab(1)} className={`px-4 md:px-6 py-2 font-bold border-2 border-black whitespace-nowrap transition-all ${contentSubTab === 1 ? 'bg-chokka-dark text-white scale-105 shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>THE SYNDICATE</button>
                    <button onClick={() => setContentSubTab(2)} className={`px-4 md:px-6 py-2 font-bold border-2 border-black whitespace-nowrap transition-all ${contentSubTab === 2 ? 'bg-chokka-dark text-white scale-105 shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>TONG</button>
                    <button onClick={() => setContentSubTab(3)} className={`px-4 md:px-6 py-2 font-bold border-2 border-black whitespace-nowrap transition-all ${contentSubTab === 3 ? 'bg-chokka-dark text-white scale-105 shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>BUNDLE</button>
                </div>
                <form onSubmit={handleUploadAndSave} className="bg-white p-6 shadow-md border-2 border-black mb-8 flex flex-col md:flex-row gap-4 items-end bg-green-50">
                    <div className="w-full"><label className="font-bold block text-sm mb-1">Select Photo</label><input name="file_input" required type="file" accept="image/*" className="border-2 border-black p-2 font-bold w-full bg-white"/></div>
                    <div className="w-full md:w-auto"><label className="font-bold block text-sm mb-1">Caption</label><input name="caption" type="text" placeholder="Detail Shot" className="border-2 border-black p-2 font-bold w-full md:w-48"/></div>
                    <button disabled={uploading} className="bg-black text-white px-6 py-2.5 font-bold hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 min-w-[140px] w-full md:w-auto justify-center">{uploading ? 'UPLOADING...' : <><Upload size={18}/> UPLOAD</>}</button>
                </form>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {gallery.filter(img => (img.product_id || 1) === contentSubTab).map(img => (
                        <div key={img.id} className="bg-white border-2 border-black p-2 relative group shadow-lg overflow-hidden">
                            <img src={img.image_url} alt="Visual" className="w-full h-48 object-cover border border-gray-200 bg-gray-100 transition-transform group-hover:scale-105"/>
                            {img.caption && <div className="mt-2 font-bold text-[10px] text-center uppercase tracking-wider text-gray-600">{img.caption}</div>}
                            <button onClick={() => deleteImage(img.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* --- NEW: EDIT ORDER MODAL --- */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded shadow-2xl w-full max-w-md border-4 border-chokka-dark relative">
                <button onClick={() => setEditingOrder(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black"><X size={24}/></button>
                <h2 className="text-2xl font-bold mb-4">Edit Order #{editingOrder.id}</h2>
                <form onSubmit={saveOrderChanges} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Customer Name</label>
                        <input className="w-full border-2 border-gray-300 p-2 font-bold" value={editForm.customer_name} onChange={e => setEditForm({...editForm, customer_name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Phone Number</label>
                        <input className="w-full border-2 border-gray-300 p-2 font-bold" value={editForm.customer_phone} onChange={e => setEditForm({...editForm, customer_phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Total Price (BDT)</label>
                        <input type="number" className="w-full border-2 border-gray-300 p-2 font-bold" value={editForm.total_price} onChange={e => setEditForm({...editForm, total_price: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Address</label>
                        <textarea className="w-full border-2 border-gray-300 p-2 font-bold h-24 resize-none" value={editForm.customer_address} onChange={e => setEditForm({...editForm, customer_address: e.target.value})} />
                    </div>
                    <button className="bg-green-600 text-white font-bold py-3 mt-2 hover:bg-green-700 flex items-center justify-center gap-2">
                        <Save size={18}/> SAVE CHANGES
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}