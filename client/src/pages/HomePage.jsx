import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CheckCircle, Package, Truck, Award, Users } from 'lucide-react';

import GlassNavbar from '../components/GlassNavbar';
import CartDrawer from '../components/CartDrawer';
import HeroSection from '../components/HeroSection';
import SyndicateShowcase from '../components/SyndicateShowcase';
import TongShowcase from '../components/TongShowcase';
import TextMarquee from '../components/TextMarquee';
import CheckoutModal from '../components/CheckoutModal';

// Aggressive cache — 15 min TTL to cut Supabase egress
const productsCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 15 * 60 * 1000;

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [products, setProducts] = useState(productsCache.data || []);

  // Fetch data — with aggressive caching
  useEffect(() => {
    const API_URL = 'https://chokka-server.onrender.com';
    const now = Date.now();

    // Products
    if (productsCache.data && now - productsCache.timestamp < CACHE_DURATION) {
      setProducts(productsCache.data);
    } else {
      fetch(`${API_URL}/api/products`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            productsCache.data = data;
            productsCache.timestamp = Date.now();
            setProducts(data);
          }
        })
        .catch(() => console.error('Error fetching products'));
    }
  }, []);

  // Derived data
  const syndicateProduct = products.find((p) => p.id === 1) || { id: 1, title: 'The Syndicate', price: 0 };
  const tongProduct = products.find((p) => p.id === 2) || { id: 2, title: 'Tong', price: 0 };
  const bundleProduct = products.find((p) => p.id === 3) || { id: 3, title: 'Chokka Bundle', price: 0 };

  // Card images for homepage showcases
  // Hardcoded local WebP images for maximum speed
  const syndicateImages = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({ image_url: `/cards/syndicate/front-${i + 1}.webp` }));
  }, []);

  const tongImages = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({ image_url: `/cards/tong/front-${i + 1}.webp` }));
  }, []);

  const bundleImages = useMemo(
    () => [{ image_url: '/cards/bundle/hero.webp' }],
    []
  );

  // Hero card images — local WebP
  const heroImages = useMemo(() => {
    return {
      syndicate: '/cards/syndicate/hero.webp',
      tong: '/cards/tong/hero.webp',
    };
  }, []);

  const handleBuy = (product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  const scrollToGames = () => {
    document.getElementById('syndicate')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#1a3325] text-[#f8f5e6] font-sans selection:bg-[#2e8b57] selection:text-white overflow-x-hidden">
      <GlassNavbar onCartClick={() => setIsCartOpen(true)} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        products={products}
        onBuyProduct={handleBuy}
      />

      <HeroSection onShopClick={scrollToGames} heroImages={heroImages} />

      <TextMarquee
        items={['CHOKKA', 'CARD GAMES', 'MADE IN BANGLADESH', 'TRUST NO ONE', 'GAME NIGHT']}
        bgColor="#0f1f17"
        textColor="#f8f5e6"
      />

      <SyndicateShowcase
        product={syndicateProduct}
        images={syndicateImages}
        onBuyClick={handleBuy}
      />

      <TextMarquee
        items={['MASTER THE BLUFF', 'RULE THE TEA STALL', 'BETRAY EVERYONE', 'KEEP A STRAIGHT FACE']}
        bgColor="#2e8b57"
        textColor="#f8f5e6"
      />

      <TongShowcase
        product={tongProduct}
        images={tongImages}
        onBuyClick={handleBuy}
      />

      {/* --- BUNDLE SECTION --- */}
      <section id="bundle" className="bg-[#f8f5e6] py-20 md:py-28 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="text-center md:text-left space-y-6">
            <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-[#1a3325]">
              Wanna get <br />
              <span className="text-[#2e8b57]">both?</span>
            </h3>
            <div className="space-y-3 text-base md:text-lg font-medium text-[#1a3325]/70 leading-relaxed max-w-xl mx-auto md:mx-0">
              <p>Why settle for one kind of chaos when you can have both?</p>
              <p>
                The <strong className="text-[#1a3325]">Chokka Bundle</strong> gives you the complete
                experience: strategic backstabbing + loud bluffing madness.
              </p>
              <ul className="flex flex-col gap-2 mt-4 text-sm font-bold uppercase tracking-wider text-[#1a3325]/50">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle size={16} className="text-[#2e8b57]" /> Save Money on the Combo
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle size={16} className="text-[#2e8b57]" /> Perfect for any group size
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle size={16} className="text-[#2e8b57]" /> Double the fun, double the drama
                </li>
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleBuy(bundleProduct)}
              className="bg-[#1a3325] text-[#f8f5e6] px-10 py-5 md:px-12 md:py-6 text-lg md:text-2xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#2e8b57] hover:shadow-[4px_4px_0px_0px_#2e8b57] transition-all flex items-center gap-3 rounded-xl mx-auto md:mx-0 mt-6"
            >
              Buy Bundle &bull; {bundleProduct.price}৳ <ShoppingCart size={24} />
            </motion.button>
          </div>

          <div className="w-full aspect-video bg-[#e8e4d0] border-4 border-[#1a3325] shadow-[12px_12px_0px_0px_#1a3325] rounded-xl overflow-hidden relative group">
            {bundleImages.length > 0 ? (
              <img
                src={bundleImages[0].image_url}
                alt="Chokka Bundle"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#1a3325]/30 font-black uppercase tracking-widest p-8 text-center">
                <Package size={64} className="mb-4 opacity-50" />
                <span>Upload a Bundle Image<br />in Admin Panel</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-[#e63946] text-white px-4 py-2 font-black uppercase tracking-widest text-xs md:text-sm border-2 border-[#1a3325] shadow-md rotate-3 rounded-lg">
              Best Value
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOKKA --- */}
      <section className="bg-[#0f1f17] text-[#f8f5e6] py-16 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative z-10">
          <div className="flex flex-col items-center">
            <div className="bg-[#2e8b57] p-4 rounded-full border-2 border-white/10 mb-4 shadow-lg"><Truck size={28} className="text-[#f8f5e6]" /></div>
            <h3 className="font-black text-lg uppercase mb-2">Fast Delivery</h3>
            <p className="opacity-40 text-sm max-w-xs">Nationwide shipping via Steadfast. 2-3 days to your doorstep.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#2e8b57] p-4 rounded-full border-2 border-white/10 mb-4 shadow-lg"><Award size={28} className="text-[#f8f5e6]" /></div>
            <h3 className="font-black text-lg uppercase mb-2">Premium Quality</h3>
            <p className="opacity-40 text-sm max-w-xs">High-GSM cards, durable boxes, and art that stands out.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#2e8b57] p-4 rounded-full border-2 border-white/10 mb-4 shadow-lg"><Users size={28} className="text-[#f8f5e6]" /></div>
            <h3 className="font-black text-lg uppercase mb-2">Community First</h3>
            <p className="opacity-40 text-sm max-w-xs">Join thousands of players in the growing Chokka community.</p>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a1510] text-[#f8f5e6] py-12 text-center border-t border-white/5">
        <img src="/logo.png" alt="CHOKKA" className="w-12 h-12 object-contain mx-auto mb-4 opacity-60" />
        <div className="flex justify-center gap-6 mb-6 font-bold uppercase tracking-widest text-sm text-[#f8f5e6]/40">
          <a href="https://www.instagram.com/chokka.co/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2e8b57] transition-colors">Instagram</a>
          <a href="https://www.facebook.com/chobify" target="_blank" rel="noopener noreferrer" className="hover:text-[#2e8b57] transition-colors">Facebook</a>
        </div>
        <p className="opacity-20 text-xs font-bold uppercase tracking-widest">&copy; 2026 Chokka Collectives BD &bull; Designed in Chittagong</p>
      </footer>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
      />
    </div>
  );
}
