import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal({ isOpen, onClose, product }) {
  const [step, setStep] = useState(1); // 1=Form, 2=Processing, 3=Success
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    email: '', // Optional
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // CALCULATIONS
  const basePrice = product?.price || 360;
  const shipping = formData.city === 'Dhaka' ? 80 : 150;
  const total = basePrice + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // VALIDATION
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      // --- THE FIX: Point to the Live Server ---
      const API_URL = 'https://chokka-server.onrender.com'; 

      const response = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          city: formData.city,
          product_id: product.id,
          quantity: 1,
          total_price: total
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(3); // Show Success Screen
      } else {
        setError('Order failed. Please try again.');
      }
    } catch (err) {
      setError('Server connection failed. Please check your internet.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#f8f5e6] w-full max-w-md rounded-xl border-4 border-[#1a3325] shadow-2xl overflow-hidden relative"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-[#1a3325]/50 hover:text-red-600 transition-colors">
            <X size={24} />
          </button>

          {/* --- STEP 1: ORDER FORM --- */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-black uppercase text-[#1a3325] mb-6 flex items-center gap-2">
                Secure Checkout
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-[#1a3325]/70">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-[#1a3325]/70">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
                    placeholder="017..."
                  />
                </div>

                {/* City Selection (Affects Shipping) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-[#1a3325]/70">Shipping Area</label>
                  <select 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
                  >
                    <option value="Dhaka">Inside Dhaka (80৳)</option>
                    <option value="Outside">Outside Dhaka (150৳)</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-[#1a3325]/70">Detailed Address</label>
                  <textarea 
                    name="address" 
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
                    placeholder="House, Road, Area..."
                  ></textarea>
                </div>

                {/* Order Summary */}
                <div className="bg-[#1a3325]/5 p-4 rounded border-2 border-[#1a3325]/10 mt-6">
                    <div className="flex justify-between text-sm font-bold opacity-70 mb-2">
                        <span>Subtotal</span>
                        <span>{basePrice}৳</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold opacity-70 mb-2">
                        <span>Shipping</span>
                        <span>{shipping}৳</span>
                    </div>
                    <div className="flex justify-between text-xl font-black text-[#1a3325] border-t-2 border-[#1a3325]/20 pt-2 mt-2">
                        <span>TOTAL</span>
                        <span>{total}৳</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 text-sm font-bold flex items-center gap-2 rounded border border-red-200">
                    <AlertTriangle size={16}/> {error}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#1a3325] text-white py-4 font-black uppercase tracking-widest hover:bg-[#2e8b57] transition-colors flex justify-center items-center gap-2"
                >
                  {loading ? 'Processing...' : 'Confirm Order - Cash on Delivery'}
                </button>

              </form>
            </div>
          )}

          {/* --- STEP 3: SUCCESS --- */}
          {step === 3 && (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-[#2e8b57] rounded-full flex items-center justify-center mb-6 shadow-xl"
              >
                <CheckCircle size={48} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-black uppercase text-[#1a3325] mb-2">Order Received!</h2>
              <p className="font-bold opacity-70 mb-8 max-w-xs mx-auto">
                Thanks, {formData.name}. We will call you shortly to confirm delivery.
              </p>
              <button 
                onClick={onClose}
                className="bg-[#1a3325] text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-[#2e8b57] transition-all"
              >
                Close & Continue
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}