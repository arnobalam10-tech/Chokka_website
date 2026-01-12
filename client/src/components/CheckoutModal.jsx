import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Tag } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, product }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    couponCode: ''
  });
  
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [status, setStatus] = useState('idle');

  // DEFAULTS
  const safeProduct = product || { id: 1, title: 'The Syndicate', price: 360, delivery_dhaka: 60, delivery_outside: 120 };
  const GAME_PRICE = safeProduct.price;

  // MATH
  const deliveryDhaka = safeProduct.delivery_dhaka || 60;
  const deliveryOutside = safeProduct.delivery_outside || 120;
  const SHIPPING = formData.city === 'Dhaka' ? deliveryDhaka : deliveryOutside;
  
  // Final Total logic
  const TOTAL = Math.max(0, (GAME_PRICE + SHIPPING) - discount);

  // --- COUPON CHECKER ---
  const checkCoupon = async () => {
    if (!formData.couponCode) return;
    setCouponMsg('Checking...');
    
    try {
        const res = await fetch('http://localhost:5000/api/verify-coupon', {
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
    } catch (err) {
        setCouponMsg('❌ Error checking code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          customer_address: formData.address,
          city: formData.city,
          product_id: safeProduct.id,
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
            onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[#f4e4bc] w-full max-w-lg border-4 border-[#1a3325] shadow-2xl p-4 md:p-8 max-h-full overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-2 right-2 text-[#1a3325] hover:rotate-90 transition-transform"><X size={24} /></button>

            {status === 'success' ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-[#2e8b57] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#1a3325]">
                  <Check size={40} color="white" strokeWidth={4} />
                </div>
                <h3 className="font-bold text-3xl mb-2 text-[#1a3325]">ORDER PLACED!</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-[#1a3325]">
                <h2 className="font-bold text-2xl md:text-3xl mb-2">SECURE YOUR COPY</h2>
                
                <input required type="text" className="w-full bg-white border-2 border-[#1a3325] p-2 font-bold" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                <input required type="tel" className="w-full bg-white border-2 border-[#1a3325] p-2 font-bold" placeholder="017..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                <input type="email" className="w-full bg-white border-2 border-[#1a3325] p-2 font-bold" placeholder="Email (Optional)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                
                <div className="flex gap-2">
                    <select className="w-full bg-white border-2 border-[#1a3325] p-2 font-bold" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                        <option value="Dhaka">Dhaka ({deliveryDhaka}৳)</option>
                        <option value="Outside Dhaka">Outside ({deliveryOutside}৳)</option>
                    </select>
                </div>

                <textarea required className="w-full bg-white border-2 border-[#1a3325] p-2 font-bold h-20 resize-none" placeholder="Address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/>

                {/* --- COUPON SECTION --- */}
                <div className="flex gap-2 items-center">
                    <div className="relative w-full">
                        <Tag size={16} className="absolute left-3 top-3 opacity-50"/>
                        <input 
                            type="text" 
                            className="w-full bg-white border-2 border-[#1a3325] p-2 pl-9 font-bold uppercase placeholder:normal-case"
                            placeholder="Promo Code"
                            value={formData.couponCode}
                            onChange={e => setFormData({...formData, couponCode: e.target.value})}
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={checkCoupon}
                        className="bg-[#1a3325] text-white font-bold px-4 py-2 border-2 border-transparent hover:bg-[#2e8b57]"
                    >
                        APPLY
                    </button>
                </div>
                {couponMsg && <p className="text-sm font-bold text-right -mt-2">{couponMsg}</p>}

                {/* TOTAL */}
                <div className="border-t-2 border-[#1a3325] pt-3 mt-1">
                    <div className="flex justify-between text-sm opacity-80">
                        <span>Price:</span> <span>{GAME_PRICE}৳</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-80">
                        <span>Shipping:</span> <span>{SHIPPING}৳</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm font-bold text-[#2e8b57]">
                            <span>Discount:</span> <span>-{discount}৳</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-3xl mt-2">
                        <span>TOTAL</span> <span>{TOTAL}৳</span>
                    </div>
                </div>

                <button disabled={status === 'loading'} className="bg-[#1a3325] text-white font-bold text-xl py-3 mt-2 hover:bg-[#2e8b57] transition-all disabled:opacity-50">
                  {status === 'loading' ? 'PROCESSING...' : 'CONFIRM ORDER'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}