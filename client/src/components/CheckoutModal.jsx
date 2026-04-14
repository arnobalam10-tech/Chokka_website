import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Tag, Package, ArrowUpCircle } from 'lucide-react';
import { trackInitiateCheckout, trackPurchase, PRODUCT_NAMES } from '../utils/metaPixel';
import { useCart } from '../context/CartContext';

const API_URL = 'https://chokka-server.onrender.com';

// Cache products for upsell lookup (shared across opens)
let cachedProducts = null;
let cacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000;

// Upsell options — always shown in Buy Now mode
// Single game → best 2-game bundle + 3-game bundle
// 2-game bundle → always upgrade to All 3
const UPSELL_FOR = {
  1: [{ bundleId: 3, label: 'Add Tong',      saveDiff: 140 }, { bundleId: 7, label: 'Get All 3 Games', saveDiff: 341 }],
  2: [{ bundleId: 6, label: 'Add Sholo Ana', saveDiff: 150 }, { bundleId: 7, label: 'Get All 3 Games', saveDiff: 341 }],
  4: [{ bundleId: 6, label: 'Add Tong',      saveDiff: 150 }, { bundleId: 7, label: 'Get All 3 Games', saveDiff: 341 }],
  3: [{ bundleId: 7, label: 'Upgrade — Add Sholo Ana', saveDiff: 201 }],
  5: [{ bundleId: 7, label: 'Upgrade — Add Tong',      saveDiff: 201 }],
  6: [{ bundleId: 7, label: 'Upgrade — Add Syndicate', saveDiff: 191 }],
};

/**
 * CheckoutModal
 *
 * Two modes:
 *  A) Buy Now — receives `product` (single item). Shows upsell to bundles.
 *  B) Cart checkout — receives `cartItems` (array with quantities).
 */
export default function CheckoutModal({ isOpen, onClose, cartItems: cartItemsProp, product }) {
  const { clearCart } = useCart();

  // --- MODE ---
  const isBuyNow   = !!(product && (!cartItemsProp || cartItemsProp.length === 0));
  const isCartMode = !!(cartItemsProp && cartItemsProp.length > 0);

  // For Buy Now: which product is currently active (can be swapped to bundle via upsell)
  const [activeProduct, setActiveProduct] = useState(product || null);
  // Products fetched from API (needed for upsell)
  const [allProducts, setAllProducts]     = useState([]);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '',
    city: 'Dhaka', couponCode: '', hp_field: '',
  });
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [status, setStatus]     = useState('idle');

  // Reset active product when modal opens fresh with a new product
  useEffect(() => {
    if (product) setActiveProduct(product);
    setDiscount(0);
    setCouponMsg('');
  }, [product, isOpen]);

  // Fetch products for upsell (only in Buy Now mode)
  useEffect(() => {
    if (!isOpen || !isBuyNow) return;
    const now = Date.now();
    if (cachedProducts && now - cacheTs < CACHE_TTL) {
      setAllProducts(cachedProducts);
      return;
    }
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          cachedProducts = data;
          cacheTs = Date.now();
          setAllProducts(data);
        }
      })
      .catch(() => {});
  }, [isOpen, isBuyNow]);

  // Track InitiateCheckout
  useEffect(() => {
    if (!isOpen) return;
    if (isBuyNow && activeProduct) {
      trackInitiateCheckout({ content_name: PRODUCT_NAMES[activeProduct.id] || activeProduct.title, content_ids: String(activeProduct.id), value: activeProduct.price });
    } else if (isCartMode) {
      const total = cartItemsProp.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
      trackInitiateCheckout({ content_name: 'Cart Checkout', content_ids: String(cartItemsProp[0]?.id), value: total, num_items: cartItemsProp.length });
    }
  }, [isOpen]);

  // --- UPSELL (Buy Now mode only, shown for any product that has an entry) ---
  const upsellOptions = isBuyNow && activeProduct
    ? (UPSELL_FOR[activeProduct.id] || [])
        .map((u) => {
          const bp = allProducts.find((p) => p.id === u.bundleId);
          if (!bp) return null;
          return { ...u, bundleProduct: bp };
        })
        .filter(Boolean)
    : [];

  const handleUpsell = (bundleProduct) => {
    setActiveProduct(bundleProduct);
    setDiscount(0);
    setCouponMsg('');
  };

  // --- CALCULATIONS ---
  let subtotal = 0;
  let totalDelivery = 0;
  let displayItems = [];

  if (isBuyNow && activeProduct) {
    const del = formData.city === 'Dhaka' ? (activeProduct.delivery_dhaka ?? 80) : (activeProduct.delivery_outside ?? 80);
    subtotal      = activeProduct.price;
    totalDelivery = del;
    displayItems  = [{ ...activeProduct, quantity: 1, delivery: del }];
  } else if (isCartMode) {
    displayItems = cartItemsProp.map((item) => {
      const del = formData.city === 'Dhaka' ? (item.delivery_dhaka ?? 80) : (item.delivery_outside ?? 80);
      return { ...item, delivery: del };
    });
    subtotal      = displayItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
    totalDelivery = displayItems.reduce((s, i) => s + i.delivery, 0);
  }

  const TOTAL = Math.max(0, subtotal + totalDelivery - discount);

  // --- COUPON ---
  const checkCoupon = async () => {
    if (!formData.couponCode) return;
    setCouponMsg('Checking...');
    try {
      const res  = await fetch(`${API_URL}/api/verify-coupon`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: formData.couponCode }) });
      const data = await res.json();
      if (data.success) { setDiscount(data.discount); setCouponMsg(`✅ -${data.discount}৳ Applied!`); }
      else              { setDiscount(0);               setCouponMsg('❌ Invalid Code'); }
    } catch { setCouponMsg('❌ Error checking code'); }
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    // Build product_ids array (repeat ID for each unit)
    let productIds = [];
    if (isBuyNow && activeProduct) {
      productIds = [activeProduct.id];
    } else if (isCartMode) {
      productIds = cartItemsProp.flatMap((i) => Array(i.quantity || 1).fill(i.id));
    }
    if (productIds.length === 0) { setStatus('idle'); return; }

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
          product_ids: productIds,
          quantity: productIds.length,
          total_price: TOTAL,
          hp_field: formData.hp_field,
        }),
      });
      const data = await response.json();

      if (data.success) {
        trackPurchase({ content_name: productIds.map((id) => PRODUCT_NAMES[id] || `#${id}`).join(' + '), content_ids: String(productIds[0]), value: TOTAL, currency: 'BDT', num_items: productIds.length });
        setStatus('success');
        setTimeout(() => {
          clearCart();
          onClose();
          setStatus('idle');
          setFormData({ name: '', phone: '', email: '', address: '', city: 'Dhaka', couponCode: '', hp_field: '' });
          setDiscount(0); setCouponMsg('');
        }, 3000);
      } else {
        alert('Error: ' + (data.message || data.error || 'Unknown error'));
        setStatus('idle');
      }
    } catch {
      alert('Server connection failed!');
      setStatus('idle');
    }
  };

  if (!isOpen) return null;
  if (!isBuyNow && !isCartMode) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-[#f4e4bc] w-full max-w-lg border-4 border-[#1a3325] shadow-2xl p-6 max-h-full overflow-y-auto rounded-sm"
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

                {/* ORDER SUMMARY */}
                <div className="border-b-2 border-[#1a3325]/20 pb-4">
                  <h2 className="font-black text-xl uppercase tracking-wide mb-3">Your Order</h2>
                  <div className="space-y-2">
                    {displayItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-[#1a3325]/10 border border-[#1a3325]/20 rounded flex items-center justify-center shrink-0">
                          <Package size={14} className="opacity-40" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-sm uppercase leading-tight">
                            {item.title}
                            {item.quantity > 1 && <span className="text-[#2e8b57] ml-1">×{item.quantity}</span>}
                          </p>
                          {item.delivery === 0 && <p className="text-xs text-[#2e8b57] font-bold">Delivery included</p>}
                        </div>
                        <span className="font-bold text-sm">{item.price * (item.quantity || 1)}৳</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UPSELL — only in Buy Now mode for single individual games */}
                {isBuyNow && upsellOptions.length > 0 && (
                  <div className="space-y-2">
                    {upsellOptions.slice(0, 2).map((u) => (
                      <motion.div
                        key={u.bundleId}
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="bg-[#1a3325] text-[#f8f5e6] p-3 rounded flex items-center justify-between cursor-pointer hover:bg-black transition-colors shadow-md"
                        onClick={() => handleUpsell(u.bundleProduct)}
                      >
                        <div className="flex items-center gap-3">
                          <ArrowUpCircle size={22} className="text-[#2e8b57] animate-bounce shrink-0" />
                          <div className="text-sm font-bold leading-tight">
                            <span className="block text-[#2e8b57] uppercase tracking-wider text-xs">{u.label} — save {u.saveDiff}৳</span>
                            <span className="opacity-70 text-xs">Upgrade to {u.bundleProduct.title} • {u.bundleProduct.price}৳ delivery incl.</span>
                          </div>
                        </div>
                        <div className="bg-[#2e8b57] px-3 py-1 text-xs font-black rounded uppercase shrink-0">Upgrade</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {/* Honeypot */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <input type="text" name="hp_field" tabIndex="-1" autoComplete="off" value={formData.hp_field} onChange={(e) => setFormData({ ...formData, hp_field: e.target.value })} />
                  </div>

                  <input required type="text" className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <input required type="tel"  className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Phone Number (017...)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  <input type="email"         className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Email (Optional)" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                  <select className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold focus:outline-none focus:border-[#2e8b57]" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}>
                    <option value="Dhaka">Inside Dhaka</option>
                    <option value="Outside Dhaka">Outside Dhaka</option>
                  </select>

                  <textarea required className="w-full bg-white border-2 border-[#1a3325] p-3 font-bold h-20 resize-none placeholder:text-gray-400 focus:outline-none focus:border-[#2e8b57]" placeholder="Detailed Address (include city name e.g. Dhaka / Chittagong)..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

                  {/* Coupon */}
                  <div className="flex gap-2 items-center">
                    <div className="relative w-full">
                      <Tag size={16} className="absolute left-3 top-3.5 opacity-50" />
                      <input type="text" className="w-full bg-white border-2 border-[#1a3325] p-2 pl-9 font-bold uppercase placeholder:normal-case focus:outline-none focus:border-[#2e8b57]" placeholder="Promo Code" value={formData.couponCode} onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })} />
                    </div>
                    <button type="button" onClick={checkCoupon} className="bg-[#1a3325] text-white font-bold px-4 py-2.5 border-2 border-transparent hover:bg-[#2e8b57] transition-colors">APPLY</button>
                  </div>
                  {couponMsg && <p className="text-xs font-bold text-right -mt-1 text-[#2e8b57]">{couponMsg}</p>}

                  {/* Total */}
                  <div className="border-t-2 border-[#1a3325] pt-4 mt-2">
                    <div className="flex justify-between text-sm opacity-80 font-bold"><span>Subtotal:</span><span>{subtotal}৳</span></div>
                    {totalDelivery > 0
                      ? <div className="flex justify-between text-sm opacity-80 font-bold"><span>Delivery:</span><span>{totalDelivery}৳</span></div>
                      : <div className="flex justify-between text-sm font-bold text-[#2e8b57]"><span>Delivery:</span><span>Included ✓</span></div>
                    }
                    {discount > 0 && <div className="flex justify-between text-sm font-black text-[#2e8b57]"><span>Discount:</span><span>-{discount}৳</span></div>}
                    <div className="flex justify-between font-black text-3xl mt-2 items-end"><span>TOTAL</span><span>{TOTAL}৳</span></div>
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
