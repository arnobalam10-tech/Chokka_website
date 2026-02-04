import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trophy, Clock, Menu, X, ArrowDown } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import ReviewMarquee from '../components/ReviewMarquee';
import { trackViewContent, PRODUCT_NAMES } from '../utils/metaPixel';

// --- THIS LINE IS CRITICAL: 'export default' ---
export default function GameTemplate({ 
  gameId, 
  title, 
  subtitle, 
  tagline, 
  storyTitle, 
  storyText, 
  features, 
  colors, 
  heroImage 
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]); 
  
  // STATE: Product Info
  const [product, setProduct] = useState({
    id: gameId,
    title: title || "Loading...",
    price: 0 
  });

  // FETCH DATA
  useEffect(() => {
    const API_URL = 'https://chokka-server.onrender.com'; 

    // 1. Fetch Product Price
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const myGame = data.find(p => p.id === gameId);
            if (myGame) {
              setProduct(myGame);
              // Track ViewContent when product data is loaded
              trackViewContent({
                content_name: PRODUCT_NAMES[gameId] || myGame.title,
                content_ids: String(gameId),
                value: myGame.price
              });
            }
        }
      })
      .catch(err => console.error("API Error"));

    // 2. Fetch Gallery
    fetch(`${API_URL}/api/gallery`)
      .then(res => res.json())
      .then(data => {
        const myImages = data.filter(img => (img.product_id || 1) === gameId);
        setGallery(myImages);
      })
      .catch(() => {});

    // 3. Fetch Reviews
    fetch(`${API_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => {
        const myReviews = data.filter(r => (r.product_id || 1) === gameId);
        setReviews(myReviews);
      })
      .catch(() => {});
  }, [gameId]); 

  // Dynamic Styles
  const styleBg = { backgroundColor: colors.bg, color: colors.text };
  const stylePrimary = { backgroundColor: colors.primary, color: colors.bg, borderColor: colors.text };
  const styleTextPrimary = { color: colors.primary };

  return (
    <div className="min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden" style={styleBg}>
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-40 px-6 py-3 flex justify-between items-center backdrop-blur-md border-b-4" style={{ backgroundColor: `${colors.bg}E6`, borderColor: colors.text }}>
        <div className="flex items-center gap-4 cursor-pointer">
           <a href="/">
             <motion.img 
               whileHover={{ rotate: -5, scale: 1.05 }} 
               src="/logo.png" 
               alt="CHOKKA" 
               className="w-16 h-16 object-contain" 
             />
           </a>
           <a href="/" className="font-black text-xl tracking-widest uppercase hidden md:block">CHOKKA.CO</a>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest">
            <a href="#story" className="hover:opacity-60 transition-opacity">The Story</a>
            <a href="#features" className="hover:opacity-60 transition-opacity">Cards</a>
            <a href="#visuals" className="hover:opacity-60 transition-opacity">Visuals</a>
            <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="px-6 py-2 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                style={stylePrimary}
            >
                BUY NOW <ShoppingCart size={18} />
            </button>
        </div>

        <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="md:hidden px-4 py-2 font-bold text-xs uppercase tracking-widest border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2"
            style={stylePrimary}
        >
            BUY <ShoppingCart size={16} />
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 px-4 min-h-screen flex flex-col items-center justify-center max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest mb-8 rounded-full border-2" style={{ backgroundColor: colors.text, color: colors.bg, borderColor: colors.primary }}>
            <Trophy size={14} className="text-yellow-400"/>
            <span>{tagline}</span>
          </div>

          <h1 className="font-black text-6xl md:text-8xl lg:text-[9rem] mb-4 leading-[0.85] tracking-tighter drop-shadow-sm uppercase">
            {title}
          </h1>

          <p className="text-xl md:text-3xl font-bold opacity-80 mb-10 max-w-3xl mx-auto leading-tight mt-6">
            {subtitle}
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="text-xl md:text-2xl px-12 py-5 border-4 border-transparent transition-all font-black tracking-widest uppercase shadow-2xl hover:-translate-y-1 w-full md:w-auto"
                style={{ backgroundColor: colors.text, color: 'white' }}
            >
              Order Now • {product.price}৳
            </button>
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest opacity-70">
                <Clock className="w-5 h-5"/> 
                <span>2-6 Players • 15 Mins</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* --- THE STORY --- */}
      <section id="story" className="py-24 px-6 border-y-4 border-black relative overflow-hidden" style={{ backgroundColor: colors.text, color: colors.bg }}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase tracking-tight">
                {storyTitle}
            </h2>
            <div className="space-y-6 text-lg md:text-2xl leading-relaxed font-medium opacity-90">
                {storyText}
            </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <span className="font-bold uppercase tracking-widest" style={styleTextPrimary}>Game Mechanics</span>
            <h2 className="text-4xl md:text-6xl font-black mt-2">HOW TO WIN</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
                <div key={idx} className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform group">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full mb-6 border-4 border-black group-hover:rotate-12 transition-transform" style={{ backgroundColor: idx === 1 ? colors.text : idx === 2 ? colors.secondary : colors.primary }}>
                        {feature.icon}
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-4">{feature.title}</h3>
                    <p className="font-medium opacity-80 text-lg">{feature.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* --- PRODUCT VISUALS --- */}
      <section id="visuals" className="py-20" style={{ backgroundColor: colors.secondary }}>
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <span className="font-bold uppercase tracking-widest" style={styleTextPrimary}>Inside the Box</span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase mt-2">
                        Visuals & Cards
                    </h2>
                </div>
                <span className="font-bold opacity-60 uppercase border-b-2 border-black">@Chokka.Co</span>
            </div>
            {gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-white border-4 border-black overflow-hidden group relative shadow-lg">
                            <img src={img.image_url} alt="Game Shot" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="aspect-square bg-gray-300 border-4 border-black flex items-center justify-center font-bold text-xl uppercase">No Images Yet</div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* --- REVIEWS --- */}
      <ReviewMarquee reviews={reviews} />

      {/* --- FOOTER --- */}
      <footer className="py-16 text-center border-t-4" style={{ backgroundColor: colors.text, color: colors.bg, borderColor: colors.primary }}>
        <h2 className="font-black text-3xl md:text-5xl mb-6 tracking-tighter uppercase">{title}</h2>
        <div className="flex justify-center gap-6 mb-8 font-bold uppercase tracking-widest text-sm">
            <a href="https://www.instagram.com/chokka.co/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">Instagram</a>
            <a href="https://www.facebook.com/chobify" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">Facebook</a>
        </div>
        <p className="opacity-50 text-xs md:text-sm mb-8">© 2026 Chokka Collectives BD </p>
        
        <button 
             onClick={() => setIsCheckoutOpen(true)}
             className="px-8 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-transparent"
             style={{ backgroundColor: colors.primary, color: 'white' }}
        >
            Get the Game Now
        </button>
      </footer>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={product}
      />
    </div>
  );
}