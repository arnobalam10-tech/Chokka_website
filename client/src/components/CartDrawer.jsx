import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, ArrowRight, Package, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Upsell: if these product IDs are all in cart (as individual items), suggest the bundle
const UPSELL_RULES = [
  { cartIds: [1, 2, 4], bundleId: 7, message: 'You have all 3 games! Get the Complete Collection.', savings: 341 },
  { cartIds: [1, 2],    bundleId: 3, message: 'Syndicate + Tong → grab the bundle instead!',         savings: 140 },
  { cartIds: [1, 4],    bundleId: 5, message: 'Syndicate + Sholo Ana → grab the bundle instead!',    savings: 140 },
  { cartIds: [2, 4],    bundleId: 6, message: 'Tong + Sholo Ana → grab the bundle instead!',         savings: 150 },
];

const GAME_COLORS = {
  1: '#2e8b57', 2: '#e63946', 3: '#d4a017',
  4: '#2672b0', 5: '#8b6914', 6: '#b85a3a', 7: '#1a3a6c',
};

export default function CartDrawer({ isOpen, onClose, products, onCheckout }) {
  const { cartItems, removeFromCart, addToCart, updateQuantity, clearCart } = useCart();

  // Delivery is charged per DISTINCT product (not per unit).
  // Bundles (delivery_dhaka === 0) contribute 0 each.
  const deliveryPerItem = cartItems.map((i) => i.delivery_dhaka ?? 80);
  const totalDelivery   = deliveryPerItem.reduce((s, d) => s + d, 0);
  const subtotal        = cartItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);

  const cartIds = cartItems.map((i) => i.id).sort((a, b) => a - b);

  // Find best upsell — check from most specific (all 3) down
  const activeUpsell = UPSELL_RULES.find((rule) =>
    rule.cartIds.every((id) => cartIds.includes(id)) && !cartIds.includes(rule.bundleId)
  );

  const handleUpsell = () => {
    if (!activeUpsell || !products) return;
    const bundleProduct = products.find((p) => p.id === activeUpsell.bundleId);
    if (!bundleProduct) return;
    activeUpsell.cartIds.forEach((id) => removeFromCart(id));
    addToCart({ ...bundleProduct, quantity: 1 });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0f1f17] border-l border-white/10 z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#f8f5e6]" />
                <h2 className="font-black text-xl text-[#f8f5e6] uppercase tracking-widest">Your Cart</h2>
                {cartItems.length > 0 && (
                  <span className="bg-[#e63946] text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ml-1">
                    {cartItems.reduce((s, i) => s + (i.quantity || 1), 0)}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-[#f8f5e6]/50 hover:text-[#f8f5e6] transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Package size={28} className="text-[#f8f5e6]/20" />
                  </div>
                  <p className="text-[#f8f5e6]/30 font-bold uppercase tracking-widest text-sm">Your cart is empty</p>
                  <p className="text-[#f8f5e6]/20 text-xs">Add a game or bundle to get started</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Cart items */}
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => {
                      const color    = GAME_COLORS[item.id] || '#2e8b57';
                      const delivery = item.delivery_dhaka ?? 80;
                      const qty      = item.quantity || 1;

                      return (
                        <motion.div
                          key={item.id} layout
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                          className="bg-white/5 border border-white/10 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-12 rounded-lg shrink-0 border border-white/10"
                              style={{ background: `linear-gradient(145deg, ${color}, ${color}66)` }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[#f8f5e6] uppercase text-sm leading-tight truncate">{item.title}</p>
                              <p className="text-[#f8f5e6]/40 text-xs font-medium mt-0.5">
                                {item.price}৳ each
                                {delivery === 0
                                  ? <span className="ml-1 text-[#2e8b57]">· delivery incl.</span>
                                  : <span className="ml-1">· +{delivery}৳ delivery</span>
                                }
                              </p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-[#f8f5e6]/30 hover:text-[#e63946] transition-colors shrink-0">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Quantity selector + line total */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => qty > 1 ? updateQuantity(item.id, qty - 1) : removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                              >
                                <Minus size={12} className="text-[#f8f5e6]" />
                              </button>
                              <span className="font-black text-[#f8f5e6] w-5 text-center text-sm">{qty}</span>
                              <button
                                onClick={() => updateQuantity(item.id, qty + 1)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                disabled={qty >= 10}
                              >
                                <Plus size={12} className="text-[#f8f5e6]" />
                              </button>
                            </div>
                            <span className="font-black text-[#f8f5e6] text-base">
                              {(item.price * qty).toLocaleString()}৳
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Bundle upsell nudge */}
                  <AnimatePresence>
                    {activeUpsell && (
                      <motion.button
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        onClick={handleUpsell}
                        className="w-full bg-[#c9a227]/10 border border-[#c9a227]/40 rounded-xl p-4 text-left hover:bg-[#c9a227]/15 transition-colors"
                      >
                        <p className="text-[#c9a227] font-black text-xs uppercase tracking-wider mb-1">Bundle Deal</p>
                        <p className="text-[#f8f5e6]/70 text-xs font-medium">{activeUpsell.message}</p>
                        <p className="text-[#c9a227] font-black text-sm mt-2">Switch & save {activeUpsell.savings}৳ →</p>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {cartItems.length > 1 && (
                    <button onClick={clearCart} className="text-[#f8f5e6]/20 hover:text-[#e63946] text-xs font-bold uppercase tracking-widest transition-colors w-full text-center pt-1">
                      Clear Cart
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-3">
                <div className="space-y-1.5 text-sm font-bold text-[#f8f5e6]/50">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()}৳</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{totalDelivery > 0 ? `${totalDelivery}৳` : <span className="text-[#2e8b57]">Included</span>}</span>
                  </div>
                  <div className="flex justify-between text-[#f8f5e6] font-black text-base pt-1 border-t border-white/10">
                    <span>Total</span>
                    <span>{(subtotal + totalDelivery).toLocaleString()}৳</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); onCheckout(); }}
                  className="w-full bg-[#2e8b57] text-[#f8f5e6] py-4 font-black text-lg uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:bg-[#3ba86a] transition-colors shadow-lg"
                >
                  Checkout <ArrowRight size={20} />
                </motion.button>
                <p className="text-[#f8f5e6]/20 text-xs font-bold uppercase tracking-wider text-center">
                  Cash on Delivery • Nationwide Shipping
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
