import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Tag, ArrowUpCircle, Package } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, product }) {
  // --- 1. STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    couponCode: ''
  });
  
  // The product currently being purchased (can be swapped to Bundle)
  const [activeProduct, setActiveProduct] = useState(product || { id: 1, title: 'The Syndicate', price: 360 });
  const [bundleData, setBundleData] = useState(null); // Stores Bundle info (ID: 3)
  const [thumbnail, setThumbnail] = useState(null); // Stores the product image
  
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [status, setStatus] = useState('idle');

  const API_URL = 'https://chokka-server.onrender.com';

  // Reset active product when the modal opens with a new selection
  useEffect(() => {
    if (product) setActiveProduct(product);
  }, [product, isOpen]);

  // --- 2. FETCH DATA (Images & Bundle Info) ---
  useEffect(() => {
    if (!isOpen) return;

    // A. Get Bundle Info (for the Upsell logic)
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const bundle = data.find(p => p.id === 3);
            if (bundle) setBundleData(bundle);
        }
      })
      .catch(err => console.error("Error fetching bundle info"));

    // B. Get Image for the Active Product
    fetch(`${API_URL}/api/gallery`)
      .then(res => res.json())
      .then(data => {
        // Find the first image that matches the current product ID
        const match = data.find(img => (img.product_id || 1) === activeProduct.id);
        setThumbnail(match ? match.image_url : null);
      })
      .catch(err => console.error("Error fetching image"));

  }, [activeProduct.id, isOpen]);


  // --- 3. UPSELL LOGIC ---
  const isSingleGame = activeProduct.id === 1 || activeProduct.id === 2;
  const canUpgrade = isSingleGame && bundleData;
  const upgradeCost = canUpgrade ? (bundleData.price - activeProduct.price) : 0;

  const handleUpgrade = () => {
    setActiveProduct(bundleData); // Swap to Bundle
    setDiscount(0); // Reset coupons on product change
    setCouponMsg('');
  };


  // --- 4. CALCULATIONS ---
  const deliveryDhaka = activeProduct.delivery_dhaka || 60;
  const deliveryOutside = activeProduct.delivery_outside || 120;
  const SHIPPING = formData.city === 'Dhaka' ? deliveryDhaka : deliveryOutside;
  const TOTAL = Math.max(0, (activeProduct.price + SHIPPING) - discount);


  // --- 5. ACTIONS ---
  const checkCoupon = async () => {
    if (!formData.couponCode) return;
    setCouponMsg('Checking...');
    try {
        const res = await fetch(`${API_URL}/api/verify-coupon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: formData.couponCode })
        });
        const data = await res.json();
        if (data.success) {
            setDiscount(data.discount);
            setCouponMsg(`✅ -${data.discount}৳ Applied!`);
        } else {
            setDiscount(0);
            setCouponMsg('❌ Invalid Code');
        }
    } catch (err) { setCouponMsg('❌ Error checking code'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          customer_address: formData.address,
          city: formData.city,
          product_id: activeProduct.id, // Sends the correct ID (1, 2, or 3)
          quantity: 1,
          total_price: TOTAL
        })
      });
      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setTimeout(() => {
            onClose();
            setStatus('idle');
            setFormData({ name: '', phone: '', email: '', address: '', city: 'Dhaka', couponCode: '' });
            setDiscount(0);
            setCouponMsg('');
        }, 3000);
      } else {
        alert("Error: " + data.error);
        setStatus('idle');
      }
    } catch (error) {
      alert("Server connection failed!");
      setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-[#f4e4bc] w-full max-w-lg border-4 border-[#1a3325] shadow-2xl p-6 max-h-full overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-[#1a3325] hover:rotate-90 transition-transform"><X size={28} /></button>

            {status === 'success' ? (
              <div className="text-center py-10">
                <div className="w-24 h-24 bg-[#2e8b57] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#1a3325] shadow-lg">
                  <Check size={48} color="white" strokeWidth={4} />
                </div>
                <h3 className="font-black text-3xl mb-2 text-[#1a3325] uppercase tracking-wide">Order Confirmed!</h3>
                <p className="font-bold opacity-70">We will call you shortly.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-[#1a3325]">
                
                {/* --- HEADER: PRODUCT VISUAL --- */}
                <div className="flex gap-4 items-center border-b-2 border-[#1a3325]/20 pb-4">
                    <div className="w-20 h-20 bg-white border-2 border-[#1a3325] shrink-0 overflow-hidden shadow-sm">
                        {thumbnail ? (
                            <img src={thumbnail} alt="Game" className="w-full h-full object-cover"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200"><Package size={24} className="opacity-30"/></div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-black text-2xl uppercase leading-none mb-1">{activeProduct.title}</h2>
                        <span className="font-bold text-[#2e8b57] text-lg">{activeProduct.price}৳</span>
                    </div>
                </div>

                {/* --- SMART UPSELL (Only shows if buying Single Game) --- */}
                {canUpgrade && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="bg-[#1a3325] text-[#f8f5e6] p-3 rounded flex items-center justify-between cursor-pointer hover:bg-black transition-colors shadow-md"
                        onClick={handleUpgrade}
                    >
                        <div className="flex items-center gap-3">
                            <ArrowUpCircle size={24} className="text-[#2e8b57] animate-bounce"/>
                            <div className="text-sm font-bold leading-tight">
                                <span className="block text-[#2e8b57] uppercase tracking-wider">Upgrade to Bundle</span>
                                <span className="opacity-80">Add {activeProduct.id === 1 ? 'Tong' : 'The Syndicate'} for just {upgradeCost}৳ more!</span>
                            </div>
                        </div>
                        <div className="bg-[#2e8b57] px-3 py-1 text-xs font-black rounded uppercase">Add</div>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
                  <input required type="text" className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                  <input required type="tel" className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Phone Number (017...)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                  <input type="email" className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Email (Optional)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                  
                  <div className="flex gap-2">
                      <select className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold focus:outline-none focus:border-[#2e8b57]" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                          <option value="Dhaka">Inside Dhaka ({deliveryDhaka}৳)</option>
                          <option value="Outside Dhaka">Outside Dhaka ({deliveryOutside}৳)</option>
                      </select>
                  </div>

                  <textarea required className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold h-20 resize-none placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Detailed Address (PLEASE STATE CITY eg. Dhaka/Chittagong)..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/>

                  {/* COUPON */}
                  <div className="flex gap-2 items-center">
                      <div className="relative w-full">
                          <Tag size={16} className="absolute left-3 top-3.5 opacity-50"/>
                          <input 
                              type="text" 
                              className="w-full bg-white border-2 border-[#1a3325] p-2 pl-9 font-bold uppercase placeholder:normal-case focus:outline-none focus:border-[#2e8b57]"
                              placeholder="Promo Code"
                              value={formData.couponCode}
                              onChange={e => setFormData({...formData, couponCode: e.target.value})}
                          />
                      </div>
                      <button type="button" onClick={checkCoupon} className="bg-[#1a3325] text-white font-bold px-4 py-2.5 border-2 border-transparent hover:bg-[#2e8b57] transition-colors">APPLY</button>
                  </div>
                  {couponMsg && <p className="text-xs font-bold text-right -mt-1 text-[#2e8b57]">{couponMsg}</p>}

                  {/* TOTAL CALCULATION */}
                  <div className="border-t-2 border-[#1a3325] pt-4 mt-2">
                      <div className="flex justify-between text-sm opacity-80 font-bold"><span>Subtotal:</span> <span>{activeProduct.price}৳</span></div>
                      <div className="flex justify-between text-sm opacity-80 font-bold"><span>Shipping:</span> <span>{SHIPPING}৳</span></div>
                      {discount > 0 && <div className="flex justify-between text-sm font-black text-[#2e8b57]"><span>Discount:</span> <span>-{discount}৳</span></div>}
                      <div className="flex justify-between font-black text-3xl mt-2 items-end">
                          <span>TOTAL</span> 
                          <span>{TOTAL}৳</span>
                      </div>
                  </div>

                  <button disabled={status === 'loading'} className="bg-[#1a3325] text-white font-black text-xl py-4 mt-2 hover:bg-[#2e8b57] transition-all disabled:opacity-50 uppercase tracking-widest shadow-lg hover:shadow-none hover:translate-y-[1px]">
                    {status === 'loading' ? 'PROCESSING...' : 'CONFIRM ORDER'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}