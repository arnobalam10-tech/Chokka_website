import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trophy, Users, Clock, ShieldAlert, Zap, Menu, X, ArrowDown } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import ReviewMarquee from '../components/ReviewMarquee';

export default function HomePage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gallery, setGallery] = useState([]);
  
  // --- RESTORED: Reviews State ---
  const [reviews, setReviews] = useState([]); 
  
  // STATE: Product Info
  const [product, setProduct] = useState({
    id: 1,
    title: "The Syndicate",
    price: 360 // Default
  });

  // FETCH DATA
  useEffect(() => {
    const API_URL = 'https://chokka-server.onrender.com'; // Ensure this matches your live backend

    fetch(`${API_URL}/api/product`)
      .then(res => res.json())
      .then(data => { if (data?.price) setProduct(data); })
      .catch(err => console.error("API Error"));

    fetch(`${API_URL}/api/gallery`)
      .then(res => res.json())
      .then(data => setGallery(data || []))
      .catch(() => {});

    // --- RESTORED: Fetch Reviews ---
    fetch(`${API_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f5e6] font-sans text-[#1a3325] selection:bg-[#2e8b57] selection:text-white overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-40 px-6 py-3 flex justify-between items-center bg-[#f8f5e6]/95 backdrop-blur-md border-b-4 border-[#1a3325]">
        <div className="flex items-center gap-4 cursor-pointer">
           <motion.img 
             whileHover={{ rotate: -5, scale: 1.05 }} 
             src="/logo.png.jpeg" 
             alt="CHOKKA" 
             className="w-16 h-16 object-contain" 
           />
           <span className="font-black text-xl tracking-widest uppercase hidden md:block">The Syndicate</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest">
            <a href="#story" className="hover:text-[#2e8b57] transition-colors">The Story</a>
            <a href="#features" className="hover:text-[#2e8b57] transition-colors">Cards</a>
            <a href="#visuals" className="hover:text-[#2e8b57] transition-colors">Visuals</a>
            <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="bg-[#2e8b57] text-white px-6 py-2 border-2 border-[#1a3325] shadow-[4px_4px_0px_0px_rgba(26,51,37,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
            >
                BUY NOW <ShoppingCart size={18} />
            </button>
        </div>

        <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="md:hidden bg-[#2e8b57] text-white px-4 py-2 font-bold text-xs uppercase tracking-widest border-2 border-[#1a3325] shadow-[2px_2px_0px_0px_rgba(26,51,37,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2"
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
          <div className="inline-flex items-center gap-2 bg-[#1a3325] text-[#f8f5e6] px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest mb-8 rounded-full border-2 border-[#2e8b57]">
            <Trophy size={14} className="text-yellow-400"/>
            <span>#1 Strategy Card Game in Bangladesh</span>
          </div>

          <h1 className="font-black text-6xl md:text-8xl lg:text-[10rem] mb-4 leading-[0.85] tracking-tighter text-[#1a3325] drop-shadow-sm">
            THE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2e8b57] to-[#1a3325]">SYNDICATE</span>
          </h1>

          <p className="text-xl md:text-3xl font-bold text-[#1a3325]/80 mb-10 max-w-3xl mx-auto leading-tight mt-6">
            Trust No One. Betray Everyone. <br/>
            <span className="text-[#2e8b57]">The Ultimate Game of Power & Deception.</span>
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="bg-[#1a3325] text-white text-xl md:text-2xl px-12 py-5 border-4 border-transparent hover:border-[#2e8b57] hover:bg-black transition-all font-black tracking-widest uppercase shadow-2xl hover:-translate-y-1 w-full md:w-auto"
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
      <section id="story" className="py-24 px-6 bg-[#1a3325] text-[#f8f5e6] border-y-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase tracking-tight">
                Welcome to the <span className="text-[#2e8b57]">Underworld</span>
            </h2>
            <div className="space-y-6 text-lg md:text-2xl leading-relaxed font-medium opacity-90">
                <p>
                    In the shadows of Dhaka, five rival families fight for control. 
                    <span className="text-[#2e8b57]"> Corruption is currency</span>, and loyalty is just a word.
                </p>
                <p>
                    <strong>The Syndicate</strong> is a fast-paced game of hidden identities. 
                    Eliminate your rivals' influence and be the last boss standing. 
                    Will you play it safe, or lie straight to your best friend's face?
                </p>
            </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <span className="font-bold uppercase tracking-widest text-[#2e8b57]">Game Mechanics</span>
            <h2 className="text-4xl md:text-6xl font-black text-[#1a3325] mt-2">HOW TO WIN</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border-4 border-[#1a3325] shadow-[8px_8px_0px_0px_rgba(26,51,37,1)] hover:-translate-y-2 transition-transform group">
                <div className="w-20 h-20 bg-[#2e8b57] flex items-center justify-center rounded-full mb-6 border-4 border-[#1a3325] group-hover:rotate-12 transition-transform">
                    <ShieldAlert size={40} color="white"/>
                </div>
                <h3 className="text-2xl font-black uppercase mb-4">Bluff & Deceive</h3>
                <p className="font-medium opacity-80 text-lg">Don't have the cards? Lie! Claim you're the Police Commissioner. Just don't get caught.</p>
            </div>
            <div className="bg-white p-8 border-4 border-[#1a3325] shadow-[8px_8px_0px_0px_rgba(26,51,37,1)] hover:-translate-y-2 transition-transform group">
                <div className="w-20 h-20 bg-[#1a3325] flex items-center justify-center rounded-full mb-6 border-4 border-[#1a3325] group-hover:rotate-12 transition-transform">
                    <Zap size={40} color="white"/>
                </div>
                <h3 className="text-2xl font-black uppercase mb-4">Fast Paced</h3>
                <p className="font-medium opacity-80 text-lg">No boring setup. Rounds last 15 minutes. Perfect for quick breaks or long game nights.</p>
            </div>
            <div className="bg-white p-8 border-4 border-[#1a3325] shadow-[8px_8px_0px_0px_rgba(26,51,37,1)] hover:-translate-y-2 transition-transform group">
                <div className="w-20 h-20 bg-[#f4e4bc] flex items-center justify-center rounded-full mb-6 border-4 border-[#1a3325] group-hover:rotate-12 transition-transform">
                    <Users size={40} color="#1a3325"/>
                </div>
                <h3 className="text-2xl font-black uppercase mb-4">Ruins Friendships</h3>
                <p className="font-medium opacity-80 text-lg">Designed to create chaos. Backstab your friends and ruin relationships—all in good fun, of course.</p>
            </div>
        </div>
      </section>

      {/* --- PRODUCT VISUALS --- */}
      <section id="visuals" className="py-20 bg-[#e8e4d0]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <span className="font-bold uppercase tracking-widest text-[#2e8b57]">Inside the Box</span>
                    <h2 className="text-4xl md:text-5xl font-black text-[#1a3325] uppercase mt-2">
                        This is what you will get
                    </h2>
                </div>
                <span className="font-bold opacity-60 uppercase border-b-2 border-[#1a3325]">@TheSyndicateBD</span>
            </div>
            {gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-white border-4 border-[#1a3325] overflow-hidden group relative shadow-lg">
                            <img src={img.image_url} alt="Game Shot" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="aspect-square bg-gray-300 border-4 border-[#1a3325] flex items-center justify-center font-bold text-xl uppercase">Card Preview {i}</div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* --- RESTORED: Passing Reviews Data --- */}
      <ReviewMarquee reviews={reviews} />

      {/* --- FOOTER --- */}
      <footer className="bg-[#1a3325] text-[#f8f5e6] py-16 text-center border-t-4 border-[#2e8b57]">
        <h2 className="font-black text-3xl md:text-5xl mb-6 tracking-tighter">THE SYNDICATE</h2>
        <div className="flex justify-center gap-6 mb-8 font-bold uppercase tracking-widest text-sm">
            <a href="https://www.instagram.com/chokka.co/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2e8b57]">Instagram</a>
            <a href="https://www.facebook.com/chobify" target="_blank" rel="noopener noreferrer" className="hover:text-[#2e8b57]">Facebook</a>
        </div>
        <p className="opacity-50 text-xs md:text-sm mb-8">© 2026 Chokka Collectives BD</p>
        
        <button 
             onClick={() => setIsCheckoutOpen(true)}
             className="bg-[#2e8b57] text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-[#f8f5e6] hover:text-[#1a3325] transition-colors border-2 border-transparent hover:border-[#2e8b57]"
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