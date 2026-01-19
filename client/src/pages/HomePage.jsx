import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight, Zap, ShieldAlert, Package, Truck, Award, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';

const QUIRKY_TAGLINES = [
  "Ready for the next game night?",
  "I guess your hangouts are boring without us.",
  "Cheaper than therapy, but causes more trauma.",
  "Warning: May cause extreme trust issues.",
  "Trust no one. Not even your best friend.",
  "Because Ludo is for kids.",
  "The only time lying to your friends is okay.",
  "Making friendships awkward since 2026.",
  "Who is the real snake in your group?",
  "Don't hate the player, hate the cards.",
  "Your tea breaks just got dangerous.",
  "Better than scrolling TikTok together.",
  "Guaranteed to ruin at least one friendship.",
  "Add some masala to your hangout.",
  "Are you brave enough to play?",
  "Keep your friends close, and your cards closer.",
  "100% Desi. 100% Chaotic.",
  "Did you really think they were telling the truth?",
  "Bluff your way to the top.",
  "Spice level: Naga Chili."
];

export default function HomePage() {
  const [isBundleCheckoutOpen, setIsBundleCheckoutOpen] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [randomTagline, setRandomTagline] = useState("");
  
  // Image Cycling State
  const [synIndex, setSynIndex] = useState(0);
  const [tongIndex, setTongIndex] = useState(0);

  // State for the Bundle Product (ID: 3)
  const [bundleProduct, setBundleProduct] = useState({
    id: 3,
    title: "Chokka Bundle",
    price: 600 
  });

  // 1. Fetch Data & Set Random Tagline
  useEffect(() => {
    // Set random tagline on mount
    setRandomTagline(QUIRKY_TAGLINES[Math.floor(Math.random() * QUIRKY_TAGLINES.length)]);

    const API_URL = 'https://chokka-server.onrender.com'; 

    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const bundle = data.find(p => p.id === 3);
            if (bundle) setBundleProduct(bundle);
        }
      })
      .catch(err => console.error("Error fetching bundle"));

    fetch(`${API_URL}/api/gallery`)
      .then(res => res.json())
      .then(data => setGallery(data || []))
      .catch(err => console.error("Error fetching images"));
  }, []);

  // 2. Filter Images
  const syndicateImages = gallery.filter(img => (img.product_id || 1) === 1);
  const tongImages = gallery.filter(img => (img.product_id || 1) === 2);
  const bundleImages = gallery.filter(img => (img.product_id || 1) === 3); // NEW: Get Bundle Images

  // 3. Cycle Timers
  useEffect(() => {
    if (syndicateImages.length > 1) {
        const interval = setInterval(() => setSynIndex(prev => (prev + 1) % syndicateImages.length), 5000);
        return () => clearInterval(interval);
    }
  }, [syndicateImages.length]);

  useEffect(() => {
    if (tongImages.length > 1) {
        const interval = setInterval(() => setTongIndex(prev => (prev + 1) % tongImages.length), 5000);
        return () => clearInterval(interval);
    }
  }, [tongImages.length]);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#f8f5e6] font-sans text-[#1a3325] selection:bg-[#1a3325] selection:text-[#f8f5e6] flex flex-col overflow-x-hidden">
      
      {/* --- 1. BRAND NAVBAR (Mobile Fixed) --- */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center backdrop-blur-md border-b-4 border-[#1a3325] bg-[#f8f5e6]/95">
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
           <img src="/logo.png" alt="CHOKKA" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
           <span className="font-black text-lg md:text-2xl tracking-widest uppercase">CHOKKA.CO</span>
        </div>
        
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBundleCheckoutOpen(true)}
            className="bg-[#1a3325] text-[#f8f5e6] px-4 py-2 md:px-6 md:py-2.5 font-bold text-[10px] md:text-sm uppercase tracking-widest border-2 border-transparent hover:border-[#2e8b57] transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
        >
            <Package size={16} className="md:w-5 md:h-5"/> 
            <span>Get Bundle</span>
        </motion.button>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <div className="pt-32 pb-10 px-4 max-w-7xl mx-auto flex-grow w-full flex flex-col justify-center relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-12 md:mb-16 relative z-10"
        >
            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] mb-4 text-[#1a3325] uppercase tracking-tighter">
                Choose Your <br/>
                <span className="text-[#2e8b57]">Battle</span>
            </h1>
            <p className="text-lg md:text-2xl font-bold opacity-80 max-w-2xl mx-auto leading-tight italic">
                "{randomTagline}"
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 px-0 md:px-8 relative z-10">
            
            {/* GAME 1: THE SYNDICATE */}
            <Link to="/syndicate" className="group relative block h-full">
                <div className="absolute inset-0 bg-[#2e8b57] translate-x-3 translate-y-3 rounded-xl"></div>
                <div className="relative bg-[#f8f5e6] border-4 border-[#1a3325] rounded-xl p-6 md:p-8 h-full flex flex-col justify-between hover:-translate-y-1 hover:-translate-x-1 transition-transform cursor-pointer overflow-hidden">
                    <div className="mb-6 z-10 relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-[#1a3325] text-white px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full">Bestseller</span>
                            <ShieldAlert size={28} className="text-[#2e8b57]"/>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-1 leading-none">The Syndicate</h2>
                        <p className="font-bold opacity-70 text-sm md:text-base">Mafia Strategy & Bluffing.</p>
                    </div>

                    <div className="mt-auto relative w-full h-56 md:h-64 border-2 border-[#1a3325] bg-gray-200 mb-6 overflow-hidden rounded-lg shadow-inner">
                        <AnimatePresence mode='wait'>
                            {syndicateImages.length > 0 ? (
                                <motion.img 
                                    key={synIndex}
                                    initial={{ opacity: 0, scale: 1.1 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.7 }}
                                    src={syndicateImages[synIndex].image_url} 
                                    alt="Syndicate" 
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase text-xs">No Visuals</div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="w-full py-3 md:py-4 bg-[#1a3325] text-[#f8f5e6] font-black uppercase tracking-widest text-sm md:text-base flex items-center justify-center gap-2 group-hover:bg-[#2e8b57] transition-colors rounded-lg">
                        Enter the Underworld <ArrowRight size={18}/>
                    </button>
                </div>
            </Link>

            {/* GAME 2: TONG */}
            <Link to="/tong" className="group relative block h-full">
                <div className="absolute inset-0 bg-[#e63946] translate-x-3 translate-y-3 rounded-xl"></div>
                <div className="relative bg-[#f8f5e6] border-4 border-[#1a3325] rounded-xl p-6 md:p-8 h-full flex flex-col justify-between hover:-translate-y-1 hover:-translate-x-1 transition-transform cursor-pointer overflow-hidden">
                    <div className="mb-6 z-10 relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-[#e63946] text-white px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full">New Release</span>
                            <Zap size={28} className="text-[#e63946]"/>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-1 leading-none">Tong</h2>
                        <p className="font-bold opacity-70 text-sm md:text-base mb-1">The Desi Bluffing Game.</p>
                        <p className="text-xs font-bold opacity-50 uppercase tracking-wide">
                            Cha • Bon • Paan • Muri
                        </p>
                    </div>

                    <div className="mt-auto relative w-full h-56 md:h-64 border-2 border-[#1a3325] bg-gray-200 mb-6 overflow-hidden rounded-lg shadow-inner">
                        <AnimatePresence mode='wait'>
                            {tongImages.length > 0 ? (
                                <motion.img 
                                    key={tongIndex}
                                    initial={{ opacity: 0, scale: 1.1 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.7 }}
                                    src={tongImages[tongIndex].image_url} 
                                    alt="Tong" 
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase text-xs">No Visuals</div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="w-full py-3 md:py-4 bg-[#1a3325] text-[#f8f5e6] font-black uppercase tracking-widest text-sm md:text-base flex items-center justify-center gap-2 group-hover:bg-[#e63946] transition-colors rounded-lg">
                        Pass the Paan <ArrowRight size={18}/>
                    </button>
                </div>
            </Link>

        </div>
      </div>

      {/* --- 3. BUNDLE BANNER (ENLARGED & REDESIGNED) --- */}
      <section className="bg-[#f8f5e6] border-y-4 border-[#1a3325] py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left: Persuasive Text */}
            <div className="text-center md:text-left space-y-6">
                <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-[#1a3325]">
                    Wanna get <br/> <span className="text-[#2e8b57]">both?</span>
                </h3>
                
                <div className="space-y-4 text-lg font-medium opacity-80 leading-relaxed max-w-xl mx-auto md:mx-0">
                    <p>Why settle for one kind of chaos when you can have both?</p>
                    <p>The <strong>Chokka Bundle</strong> gives you the complete experience: The strategic backstabbing of <span className="font-bold">The Syndicate</span> and the loud, bluffing madness of <span className="font-bold">Tong</span>.</p>
                    <ul className="flex flex-col gap-2 mt-4 text-sm font-bold uppercase tracking-wider text-[#1a3325]/70">
                        <li className="flex items-center gap-2 justify-center md:justify-start"><CheckCircle size={16} className="text-[#2e8b57]"/> Save Money on the Combo</li>
                        <li className="flex items-center gap-2 justify-center md:justify-start"><CheckCircle size={16} className="text-[#2e8b57]"/> Perfect for any group size</li>
                        <li className="flex items-center gap-2 justify-center md:justify-start"><CheckCircle size={16} className="text-[#2e8b57]"/> Double the fun, double the drama</li>
                    </ul>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsBundleCheckoutOpen(true)}
                    className="bg-[#1a3325] text-[#f8f5e6] px-12 py-6 text-xl md:text-2xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#2e8b57] hover:shadow-none transition-all flex items-center gap-3 rounded-lg mx-auto md:mx-0 mt-8"
                >
                    Buy Bundle • {bundleProduct.price}৳ <ShoppingCart size={28}/>
                </motion.button>
            </div>

            {/* Right: 16:9 Cinematic Image (Fetched from Admin) */}
            <div className="w-full aspect-video bg-gray-200 border-4 border-[#1a3325] shadow-[12px_12px_0px_0px_#1a3325] rounded-xl overflow-hidden relative group">
                {bundleImages.length > 0 ? (
                    <img 
                        src={bundleImages[0].image_url} 
                        alt="Chokka Bundle" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#1a3325]/40 font-black uppercase tracking-widest p-8 text-center">
                        <Package size={64} className="mb-4 opacity-50"/>
                        <span>Upload a Bundle Image<br/>in Admin Panel (Tab 3)</span>
                    </div>
                )}
                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 bg-[#e63946] text-white px-4 py-2 font-black uppercase tracking-widest text-sm border-2 border-[#1a3325] shadow-md rotate-3">
                    Best Value
                </div>
            </div>

        </div>
      </section>

      {/* --- 4. WHY CHOKKA? (Moved Down) --- */}
      <section className="bg-[#1a3325] text-[#f8f5e6] py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative z-10">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                <div className="bg-[#2e8b57] p-4 rounded-full border-4 border-[#f8f5e6] mb-4 shadow-lg"><Truck size={32} className="text-[#f8f5e6]"/></div>
                <h3 className="font-black text-xl uppercase mb-2">Fast Delivery</h3>
                <p className="opacity-70 text-sm max-w-xs">Nationwide shipping via Steadfast. 2-3 days to your doorstep.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                <div className="bg-[#2e8b57] p-4 rounded-full border-4 border-[#f8f5e6] mb-4 shadow-lg"><Award size={32} className="text-[#f8f5e6]"/></div>
                <h3 className="font-black text-xl uppercase mb-2">Premium Quality</h3>
                <p className="opacity-70 text-sm max-w-xs">High-GSM cards, durable boxes, and art that stands out.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
                <div className="bg-[#2e8b57] p-4 rounded-full border-4 border-[#f8f5e6] mb-4 shadow-lg"><Users size={32} className="text-[#f8f5e6]"/></div>
                <h3 className="font-black text-xl uppercase mb-2">Community First</h3>
                <p className="opacity-70 text-sm max-w-xs">Join thousands of players in the growing Chokka community.</p>
            </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#112218] text-[#f8f5e6] py-8 text-center text-xs font-bold uppercase tracking-widest opacity-80">
        © 2026 Chokka Collectives BD • Designed in Chittagong
      </footer>

      {/* --- CHECKOUT MODAL --- */}
      <CheckoutModal 
        isOpen={isBundleCheckoutOpen} 
        onClose={() => setIsBundleCheckoutOpen(false)} 
        product={bundleProduct}
      />

    </div>
  );
}