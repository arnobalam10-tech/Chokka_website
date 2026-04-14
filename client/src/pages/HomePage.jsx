import { useState, useEffect, useMemo } from 'react';
import { Truck, Award, Users } from 'lucide-react';

import GlassNavbar from '../components/GlassNavbar';
import CartDrawer from '../components/CartDrawer';
import HeroSection from '../components/HeroSection';
import SyndicateShowcase from '../components/SyndicateShowcase';
import TongShowcase from '../components/TongShowcase';
import SholoAnaShowcase from '../components/SholoAnaShowcase';
import BundlesSection from '../components/BundlesSection';
import TextMarquee from '../components/TextMarquee';
import CheckoutModal from '../components/CheckoutModal';
import CelebrityReviews from '../components/CelebrityReviews';
import { useCart } from '../context/CartContext';

// 15 min cache to cut Supabase egress
const productsCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 15 * 60 * 1000;

export default function HomePage() {
  const { cartItems, addToCart } = useCart();

  const [isCartOpen,     setIsCartOpen]     = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null); // null = cart mode
  const [products, setProducts] = useState(productsCache.data || []);

  // Fetch products
  useEffect(() => {
    const API_URL = 'https://chokka-server.onrender.com';
    const now = Date.now();

    const fetchProducts = (retries = 3, delay = 3000) => {
      fetch(`${API_URL}/api/products`)
        .then((res) => { if (!res.ok) throw new Error('Server starting...'); return res.json(); })
        .then((data) => {
          if (Array.isArray(data)) {
            productsCache.data = data;
            productsCache.timestamp = Date.now();
            setProducts(data);
          }
        })
        .catch(() => { if (retries > 0) setTimeout(() => fetchProducts(retries - 1, delay), delay); });
    };

    if (productsCache.data && now - productsCache.timestamp < CACHE_DURATION) {
      setProducts(productsCache.data);
    } else {
      fetchProducts();
    }
  }, []);

  const syndicateProduct = products.find((p) => p.id === 1) || { id: 1, title: 'The Syndicate', price: 0, delivery_dhaka: 80, delivery_outside: 80 };
  const tongProduct      = products.find((p) => p.id === 2) || { id: 2, title: 'Tong',          price: 0, delivery_dhaka: 80, delivery_outside: 80 };
  const sholoAnaProduct  = products.find((p) => p.id === 4) || { id: 4, title: 'Sholo Ana',     price: 0, delivery_dhaka: 80, delivery_outside: 80 };

  const syndicateImages = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ image_url: `/cards/syndicate/front-${i + 1}.webp` })), []);
  const tongImages      = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ image_url: `/cards/tong/front-${i + 1}.webp`      })), []);
  const sholoAnaImages  = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ image_url: `/cards/sholo-ana/front-${i + 1}.webp` })), []);

  const heroImages = useMemo(() => ({
    syndicate: '/cards/syndicate/hero.webp',
    tong:      '/cards/tong/hero.webp',
    sholoana:  '/cards/sholo-ana/hero.webp',
  }), []);

  // Add to cart → open cart drawer
  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  // Buy Now → open checkout modal directly with that single product
  const handleBuyNow = (product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Open checkout from cart drawer (no single product — cart mode)
  const handleCartCheckout = () => {
    setCheckoutProduct(null);
    setIsCartOpen(false);
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
        onCheckout={handleCartCheckout}
      />

      <HeroSection onShopClick={scrollToGames} heroImages={heroImages} />

      <TextMarquee
        items={['CHOKKA', 'CARD GAMES', 'MADE IN BANGLADESH', 'TRUST NO ONE', 'GAME NIGHT']}
        bgColor="#0f1f17" textColor="#f8f5e6"
      />

      <SyndicateShowcase
        product={syndicateProduct}
        images={syndicateImages}
        onBuyClick={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <TextMarquee
        items={['MASTER THE BLUFF', 'RULE THE TEA STALL', 'BETRAY EVERYONE', 'KEEP A STRAIGHT FACE']}
        bgColor="#2e8b57" textColor="#f8f5e6"
      />

      <TongShowcase
        product={tongProduct}
        images={tongImages}
        onBuyClick={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <TextMarquee
        items={['MEMORY', 'DEDUCTION', 'শোলো আনা', 'THE LINE', 'CLAIM IT', 'বদল', 'উঁকি', 'দাবি']}
        bgColor="#daeef9" textColor="#1a3a6c"
      />

      <SholoAnaShowcase
        product={sholoAnaProduct}
        images={sholoAnaImages}
        onBuyClick={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <BundlesSection
        products={products}
        onBuyNow={handleBuyNow}
      />

      <CelebrityReviews />

      {/* WHY CHOKKA */}
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

      {/* Checkout modal — Buy Now (product) OR Cart checkout (cartItems) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => { setIsCheckoutOpen(false); setCheckoutProduct(null); }}
        product={checkoutProduct}
        cartItems={checkoutProduct ? null : cartItems}
      />
    </div>
  );
}
