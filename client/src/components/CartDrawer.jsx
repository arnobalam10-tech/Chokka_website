import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';

const GAME_INFO = [
  { id: 1, name: 'The Syndicate', desc: 'Mafia Strategy & Bluffing', color: '#2e8b57' },
  { id: 2, name: 'Tong', desc: 'The Desi Bluffing Game', color: '#e63946' },
  { id: 3, name: 'Chokka Bundle', desc: 'Both Games — Best Value', color: '#d4a853' },
];

export default function CartDrawer({ isOpen, onClose, products, onBuyProduct }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0f1f17] border-l border-white/10 z-[90] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-black text-xl text-[#f8f5e6] uppercase tracking-widest">Our Games</h2>
              <button
                onClick={onClose}
                className="text-[#f8f5e6]/50 hover:text-[#f8f5e6] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {GAME_INFO.map((game) => {
                const productData = products.find((p) => p.id === game.id);
                const price = productData ? productData.price : '---';

                return (
                  <div
                    key={game.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-lg text-[#f8f5e6] uppercase">{game.name}</h3>
                        <p className="text-[#f8f5e6]/40 text-sm font-medium">{game.desc}</p>
                      </div>
                      <span className="font-black text-xl" style={{ color: game.color }}>
                        {price}৳
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onBuyProduct(productData || { id: game.id, title: game.name, price });
                        onClose();
                      }}
                      className="w-full mt-2 py-3 font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{ backgroundColor: game.color, color: '#f8f5e6' }}
                    >
                      <ShoppingCart size={16} /> Buy Now
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-white/10 text-center">
              <p className="text-[#f8f5e6]/30 text-xs font-bold uppercase tracking-wider">
                Cash on Delivery • Nationwide Shipping
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
