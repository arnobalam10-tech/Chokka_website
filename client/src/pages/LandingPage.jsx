import { useState, useEffect, useRef } from 'react';
import CheckoutModal from '../components/CheckoutModal';
import CelebrityReviews from '../components/CelebrityReviews';
import { trackViewContent, trackInitiateCheckout, PRODUCT_NAMES } from '../utils/metaPixel';
import {
    ShoppingCart, CheckCircle, Truck, Award, Users, ChevronRight, Star, Zap, ShieldAlert, Coffee, Search, AlertTriangle, Package
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────────
const API_URL = 'https://chokka-server.onrender.com';

const SYNDICATE_CARDS = Array.from({ length: 5 }, (_, i) => `/cards/syndicate/front-${i + 1}.webp`);
const TONG_CARDS = Array.from({ length: 8 }, (_, i) => `/cards/tong/front-${i + 1}.webp`);

const REVIEWS = [
    { name: 'Rafi Islam', role: 'Game Night Organizer, Dhaka', quote: 'We played Syndicate for 3 hours straight. Someone literally threw the cards at their best friend. 10/10 would recommend.', rating: 5, initials: 'RI' },
    { name: 'Tasnia Ahmed', role: 'University Student, Chittagong', quote: 'Tong is CHAOTIC. I got caught bluffing 4 times in a row but kept laughing the whole time. Best game for adda.', rating: 5, initials: 'TA' },
    { name: 'Shahidul Kabir', role: 'Father of 3, Sylhet', quote: 'Got the bundle as a gift for Eid. My whole family is obsessed. The cards feel premium and the box is gorgeous.', rating: 5, initials: 'SK' },
];

// ─── MARQUEE ───────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
    'CHOKKA', '★', 'MADE IN BANGLADESH', '★', 'TRUST NO ONE', '★', 'GAME NIGHT ESSENTIAL',
    '★', '1000+ HAPPY CUSTOMERS', '★', 'FAST DELIVERY', '★', 'PREMIUM CARDS', '★',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Stars({ n = 5 }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={15}
                    fill={i < n ? '#e63946' : 'transparent'}
                    stroke={i < n ? '#e63946' : 'rgba(255,255,255,0.2)'}
                />
            ))}
        </div>
    );
}

function FanCards({ cards, side = 'center', accentColor = '#2e8b57', cardClass = '' }) {
    // Picks a subset and fans them
    const count = cards.length;
    return (
        <div className={`relative flex items-end justify-center ${cardClass}`} style={{ minHeight: 260 }}>
            {cards.map((src, i) => {
                const total = count;
                const mid = (total - 1) / 2;
                const angle = (i - mid) * (side === 'center' ? 7 : 5);
                const yOffset = Math.abs(i - mid) * 10;
                return (
                    <div
                        key={i}
                        className="absolute rounded-xl overflow-hidden shadow-2xl border-2"
                        style={{
                            width: 110,
                            height: 160,
                            left: `calc(50% + ${(i - mid) * 70}px - 55px)`,
                            bottom: yOffset,
                            transform: `rotate(${angle}deg)`,
                            borderColor: 'rgba(255,255,255,0.15)',
                            zIndex: i === Math.floor(mid) ? 10 : Math.abs(i - Math.floor(mid)) <= 1 ? 7 : 4,
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <img src={src} alt={`Card ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </div>
                );
            })}
        </div>
    );
}

function TongCardGrid({ cards }) {
    return (
        <div className="grid grid-cols-4 gap-2 md:gap-3">
            {cards.map((src, i) => (
                <div
                    key={i}
                    className="rounded-xl overflow-hidden shadow-xl border border-white/10 aspect-[2/3]"
                    style={{
                        transform: i % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)',
                        transition: 'transform 0.3s',
                    }}
                >
                    <img src={src} alt={`Tong card ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
            ))}
        </div>
    );
}

// ─── MAIN LANDING PAGE ─────────────────────────────────────────────────────────
export default function LandingPage() {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutProduct, setCheckoutProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [marqueeRef, setMarqueeRef] = useState(null);

    // Scroll refs
    const syndicateRef = useRef(null);
    const tongRef = useRef(null);

    // Fetch prices
    useEffect(() => {
        const fetchProducts = (retries = 3, delay = 3000) => {
            fetch(`${API_URL}/api/products`)
                .then(res => { if (!res.ok) throw new Error(); return res.json(); })
                .then(data => { if (Array.isArray(data)) setProducts(data); })
                .catch(() => { if (retries > 0) setTimeout(() => fetchProducts(retries - 1, delay), delay); });
        };
        fetchProducts();
    }, []);

    const syndicateProduct = products.find(p => p.id === 1) || { id: 1, title: 'The Syndicate', price: 0 };
    const tongProduct = products.find(p => p.id === 2) || { id: 2, title: 'Tong', price: 0 };
    const bundleProduct = products.find(p => p.id === 3) || { id: 3, title: 'Chokka Bundle', price: 0 };

    const buy = (product) => {
        // Fire Meta InitiateCheckout so Meta knows intent before cart opens
        trackInitiateCheckout({
            content_name: PRODUCT_NAMES[product.id] || product.title,
            content_ids: String(product.id),
            value: product.price,
        });
        setCheckoutProduct(product);
        setIsCheckoutOpen(true);
    };

    // Track page view as ViewContent — tells Meta this is a product landing page
    useEffect(() => {
        trackViewContent({
            content_name: 'Chokka Landing Page',
            content_ids: 'landing',
            content_type: 'product_group',
            value: 0,
        });
    }, []);

    const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

    const priceLabel = (price) => price > 0 ? `${price}৳` : '---৳';

    return (
        <div
            className="min-h-screen font-sans overflow-x-hidden"
            style={{ backgroundColor: '#1a3325', color: '#f8f5e6', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
        >
            {/* ────────────────────────────────── NAVBAR ── */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between"
                style={{
                    background: 'rgba(15,31,23,0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <a href="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="CHOKKA" className="w-10 h-10 object-contain" />
                    <span className="font-black text-lg tracking-widest uppercase hidden sm:block" style={{ color: '#f8f5e6' }}>
                        CHOKKA.CO
                    </span>
                </a>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => scrollTo(syndicateRef)}
                        className="hidden md:block font-bold text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Syndicate
                    </button>
                    <button
                        onClick={() => scrollTo(tongRef)}
                        className="hidden md:block font-bold text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Tong
                    </button>
                    <button
                        onClick={() => buy(bundleProduct)}
                        className="font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: '#2e8b57', color: '#f8f5e6', boxShadow: '0 0 20px rgba(46,139,87,0.4)' }}
                    >
                        <ShoppingCart size={14} />
                        Shop Now
                    </button>
                </div>
            </nav>

            {/* ────────────────────────────────── HERO ── */}
            <section
                className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden"
                style={{ background: 'linear-gradient(175deg, #0f1f17 0%, #1a3325 40%, #122219 100%)' }}
            >
                {/* Glow bg */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(46,139,87,0.18) 0%, transparent 70%)' }}
                />

                {/* Texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-mosaic.png')" }}
                />

                {/* Badge */}
                <div
                    className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mb-8"
                    style={{ background: 'rgba(46,139,87,0.2)', border: '1px solid rgba(46,139,87,0.4)', color: '#2e8b57' }}
                >
                    <span>🇧🇩</span> Bangladesh's #1 Strategy Card Games
                </div>

                {/* Hero cards — two game boxes side by side */}
                <div className="relative z-10 flex items-end justify-center gap-6 md:gap-12 mb-10" style={{ minHeight: 240 }}>
                    {/* Syndicate hero */}
                    <div
                        className="rounded-2xl overflow-hidden shadow-2xl border-2"
                        style={{
                            width: 130, height: 190,
                            borderColor: 'rgba(46,139,87,0.5)',
                            transform: 'rotate(-8deg) translateY(10px)',
                            boxShadow: '-6px 6px 40px rgba(46,139,87,0.3), 0 20px 60px rgba(0,0,0,0.6)',
                            animation: 'heroFloat1 3s ease-in-out infinite alternate',
                        }}
                    >
                        <img src="/cards/syndicate/hero.webp" alt="The Syndicate" className="w-full h-full object-contain bg-[#1a3325]" />
                    </div>

                    {/* Central glow dot */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                        style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(46,139,87,0.2) 0%, transparent 70%)' }}
                    />

                    {/* vs badge */}
                    <div
                        className="relative rounded-full font-black text-base flex items-center justify-center z-10"
                        style={{
                            width: 48, height: 48, marginBottom: 20,
                            background: '#f8f5e6', color: '#1a3325',
                            boxShadow: '0 0 30px rgba(248,245,230,0.5)',
                        }}
                    >
                        VS
                    </div>

                    {/* Tong hero */}
                    <div
                        className="rounded-2xl overflow-hidden shadow-2xl border-2"
                        style={{
                            width: 130, height: 190,
                            borderColor: 'rgba(230,57,70,0.5)',
                            transform: 'rotate(8deg) translateY(10px)',
                            boxShadow: '6px 6px 40px rgba(230,57,70,0.3), 0 20px 60px rgba(0,0,0,0.6)',
                            animation: 'heroFloat2 3.4s ease-in-out infinite alternate',
                        }}
                    >
                        <img src="/cards/tong/hero.webp" alt="Tong" className="w-full h-full object-contain bg-[#1a3325]" />
                    </div>
                </div>

                {/* Headline */}
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <h1
                        className="font-black uppercase leading-[0.88] tracking-tighter mb-5"
                        style={{
                            fontSize: 'clamp(3rem, 10vw, 7rem)',
                            textShadow: '0 4px 30px rgba(26,51,37,0.8)',
                        }}
                    >
                        Bangladesh's <br />
                        <span style={{ color: '#2e8b57' }}>Wildest</span> Card Games
                    </h1>

                    <p className="font-medium opacity-60 mb-8 max-w-xl mx-auto" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                        Trust no one. Keep a straight face. Two games, infinite drama. Perfect for game night with friends.
                    </p>

                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={18} fill="#e63946" stroke="none" />
                        ))}
                        <span className="font-bold text-sm opacity-60 ml-1">1000+ sold across Bangladesh</span>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => scrollTo(syndicateRef)}
                            className="font-black uppercase tracking-widest text-lg px-10 py-5 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                            style={{
                                backgroundColor: '#2e8b57', color: '#f8f5e6',
                                boxShadow: '0 0 40px rgba(46,139,87,0.5), 0 8px 24px rgba(0,0,0,0.4)',
                                animation: 'ctaPulse 2s ease-in-out infinite',
                            }}
                        >
                            <ShoppingCart size={22} /> Shop Now <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={() => buy(bundleProduct)}
                            className="font-black uppercase tracking-widest text-base px-8 py-5 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.15)', color: '#f8f5e6' }}
                        >
                            <Package size={18} /> Get the Bundle — Save Money
                        </button>
                    </div>
                </div>

                {/* Scroll nudge */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
                    <span className="text-xs font-bold uppercase tracking-widest">Scroll</span>
                    <div style={{ width: 2, height: 30, background: 'linear-gradient(to bottom, #f8f5e6, transparent)' }} />
                </div>

                <style>{`
          @keyframes heroFloat1 { 0% { transform: rotate(-8deg) translateY(10px); } 100% { transform: rotate(-6deg) translateY(-6px); } }
          @keyframes heroFloat2 { 0% { transform: rotate(8deg) translateY(10px); } 100% { transform: rotate(6deg) translateY(-8px); } }
          @keyframes ctaPulse { 0%,100% { box-shadow: 0 0 40px rgba(46,139,87,0.5), 0 8px 24px rgba(0,0,0,0.4); } 50% { box-shadow: 0 0 60px rgba(46,139,87,0.7), 0 8px 24px rgba(0,0,0,0.4); } }
          @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
            </section>

            {/* ────────────────────────────────── MARQUEE ── */}
            <div
                className="overflow-hidden py-4 relative"
                style={{ backgroundColor: '#0f1f17', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div
                    style={{ display: 'flex', gap: 40, animation: 'marqueeScroll 25s linear infinite', width: 'max-content' }}
                >
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                        <span key={i} className="font-black uppercase text-sm tracking-[0.2em] whitespace-nowrap" style={{ color: '#f8f5e6', opacity: item === '★' ? 0.3 : 0.7 }}>
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* ────────────────────────────────── SYNDICATE ── */}
            <section
                ref={syndicateRef}
                id="syndicate"
                className="relative py-16 md:py-28 overflow-hidden"
                style={{ backgroundColor: '#f8f5e6', color: '#1a3325' }}
            >
                {/* Decorative dot grid */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, #1a3325 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    {/* MOBILE: copy on top */}
                    <div className="md:hidden space-y-5 mb-8">
                        <span className="font-bold uppercase tracking-[0.25em] text-xs block" style={{ color: '#2e8b57' }}>Strategy &amp; Deception</span>
                        <h2 className="font-black uppercase tracking-tighter leading-[0.88] text-5xl" style={{ color: '#1a3325' }}>The Syndicate</h2>
                        <p className="text-base font-medium leading-relaxed opacity-70">Trust No One. Betray Everyone. Hidden identities, power moves and pure deception.</p>
                        <ul className="space-y-2.5">
                            {[
                                { icon: <ShieldAlert size={14} />, text: 'Bluff your friends with a straight face' },
                                { icon: <Zap size={14} />, text: 'Fast & intense — rounds last 15 mins' },
                                { icon: <Users size={14} />, text: '2–6 players, ruins friendships (in a good way)' },
                            ].map((f, i) => (
                                <li key={i} className="flex items-center gap-3 font-semibold text-sm">
                                    <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: '#2e8b57', color: '#f8f5e6' }}>{f.icon}</span>
                                    <span style={{ color: '#1a3325' }}>{f.text}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-3 pt-1">
                            <button onClick={() => buy(syndicateProduct)} className="flex-1 font-black uppercase tracking-widest px-5 py-4 rounded-xl flex items-center gap-2 justify-center text-sm" style={{ backgroundColor: '#1a3325', color: '#f8f5e6', boxShadow: '4px 4px 0 #2e8b57' }}>
                                <ShoppingCart size={16} /> Buy — {priceLabel(syndicateProduct.price)}
                            </button>
                            <a href="/#/syndicate" className="font-bold uppercase tracking-widest px-4 py-4 rounded-xl flex items-center gap-1 text-xs justify-center opacity-60" style={{ border: '2px solid #1a3325', color: '#1a3325' }}>View <ChevronRight size={14} /></a>
                        </div>
                    </div>

                    {/* MOBILE: horizontal scroll card strip */}
                    <div className="md:hidden -mx-4 px-4 pb-6">
                        <div
                            className="flex gap-3 overflow-x-auto pb-4"
                            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                        >
                            {SYNDICATE_CARDS.map((src, i) => (
                                <div
                                    key={i}
                                    className="flex-none rounded-2xl overflow-hidden shadow-xl border-2"
                                    style={{ width: 160, height: 230, borderColor: 'rgba(26,51,37,0.2)', scrollSnapAlign: 'start', transform: i % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1.5deg)' }}
                                >
                                    <img src={src} alt={`Syndicate card ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-30 text-center" style={{ color: '#1a3325' }}>← Swipe to see all cards →</p>
                    </div>

                    {/* DESKTOP: original side-by-side grid */}
                    <div className="hidden md:grid md:grid-cols-2 gap-16 items-center">
                        {/* Cards fan */}
                        <div className="relative flex items-center justify-center">
                            <div className="relative" style={{ height: 280, width: '100%' }}>
                                {SYNDICATE_CARDS.map((src, i) => {
                                    const total = SYNDICATE_CARDS.length;
                                    const mid = (total - 1) / 2;
                                    const angle = (i - mid) * 8;
                                    const xOffset = (i - mid) * 65;
                                    const yOffset = Math.abs(i - mid) * 12;
                                    return (
                                        <div
                                            key={i}
                                            className="absolute rounded-xl overflow-hidden shadow-2xl border-2 transition-transform hover:-translate-y-4 hover:z-30"
                                            style={{ width: 120, height: 175, left: `calc(50% + ${xOffset}px - 60px)`, bottom: yOffset, transform: `rotate(${angle}deg)`, borderColor: 'rgba(26,51,37,0.25)', zIndex: i === Math.floor(mid) ? 10 : 5, cursor: 'pointer' }}
                                        >
                                            <img src={src} alt={`Syndicate card ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Desktop copy */}
                        <div className="space-y-6">
                            <div>
                                <span className="font-bold uppercase tracking-[0.25em] text-sm" style={{ color: '#2e8b57' }}>Strategy &amp; Deception</span>
                                <h2 className="font-black uppercase tracking-tighter leading-[0.88] mt-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: '#1a3325' }}>The Syndicate</h2>
                            </div>
                            <p className="text-lg font-medium leading-relaxed opacity-70">Trust No One. Betray Everyone. The ultimate card game of hidden identities, power moves and pure deception.</p>
                            <ul className="space-y-3">
                                {[
                                    { icon: <ShieldAlert size={16} />, text: 'Bluff your friends with a straight face' },
                                    { icon: <Zap size={16} />, text: 'Fast & intense — rounds last 15 mins' },
                                    { icon: <Users size={16} />, text: '2–6 players, ruins friendships (in a good way)' },
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 font-semibold text-sm">
                                        <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 30, height: 30, backgroundColor: '#2e8b57', color: '#f8f5e6' }}>{f.icon}</span>
                                        <span style={{ color: '#1a3325' }}>{f.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => buy(syndicateProduct)} className="font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-base" style={{ backgroundColor: '#1a3325', color: '#f8f5e6', boxShadow: '6px 6px 0px 0px #2e8b57' }}>
                                    <ShoppingCart size={20} /> Buy Now — {priceLabel(syndicateProduct.price)}
                                </button>
                                <a href="/#/syndicate" className="font-bold uppercase tracking-widest px-6 py-4 rounded-xl flex items-center gap-2 text-sm opacity-70 hover:opacity-100" style={{ border: '2px solid #1a3325', color: '#1a3325' }}>View Full Page <ChevronRight size={16} /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────── TONG ── */}
            <section
                ref={tongRef}
                id="tong"
                className="relative py-16 md:py-28 overflow-hidden"
                style={{ backgroundColor: '#1a3325', color: '#f8f5e6' }}
            >
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
                />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    {/* MOBILE layout */}
                    <div className="md:hidden space-y-5">
                        <div>
                            <span className="font-bold uppercase tracking-[0.25em] text-xs block" style={{ color: '#e63946' }}>Bluffing &amp; Chaos</span>
                            <h2 className="font-black uppercase tracking-tighter leading-[0.88] text-6xl mt-1" style={{ color: '#f8f5e6' }}>Tong</h2>
                        </div>
                        <p className="text-base font-medium leading-relaxed opacity-70">Cha, Bon, Paan, Muri. Pass the cards, lie about what you're passing, and try not to get caught.</p>

                        <ul className="space-y-2.5">
                            {[
                                { icon: <Coffee size={14} />, text: '8 desi suits — Cha, Paan, Muri & more' },
                                { icon: <Search size={14} />, text: 'Call bluffs — look them in the eye' },
                                { icon: <AlertTriangle size={14} />, text: 'Collect 4 of any item and you LOSE' },
                            ].map((f, i) => (
                                <li key={i} className="flex items-center gap-3 font-semibold text-sm">
                                    <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: '#e63946', color: '#f8f5e6' }}>{f.icon}</span>
                                    <span>{f.text}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex gap-3">
                            <button onClick={() => buy(tongProduct)} className="flex-1 font-black uppercase tracking-widest px-5 py-4 rounded-xl flex items-center gap-2 justify-center text-sm" style={{ backgroundColor: '#e63946', color: '#f8f5e6', boxShadow: '4px 4px 0 rgba(230,57,70,0.4)' }}>
                                <ShoppingCart size={16} /> Buy — {priceLabel(tongProduct.price)}
                            </button>
                            <a href="/#/tong" className="font-bold uppercase tracking-widest px-4 py-4 rounded-xl flex items-center gap-1 text-xs justify-center opacity-50" style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#f8f5e6' }}>View <ChevronRight size={14} /></a>
                        </div>

                        {/* Mobile horizontal scroll strip — same as Syndicate */}
                        <div className="-mx-4 px-4 pb-2">
                            <div
                                className="flex gap-3 overflow-x-auto pb-4"
                                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                            >
                                {TONG_CARDS.map((src, i) => (
                                    <div
                                        key={i}
                                        className="flex-none rounded-2xl overflow-hidden shadow-xl border-2"
                                        style={{ width: 160, height: 230, borderColor: 'rgba(230,57,70,0.25)', scrollSnapAlign: 'start', transform: i % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1.5deg)' }}
                                    >
                                        <img src={src} alt={`Tong card ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-30 text-center" style={{ color: '#f8f5e6' }}>← Swipe to see all cards →</p>
                        </div>
                    </div>

                    {/* DESKTOP layout */}
                    <div className="hidden md:grid md:grid-cols-2 gap-16 items-center">
                        {/* Desktop copy */}
                        <div className="space-y-6">
                            <div>
                                <span className="font-bold uppercase tracking-[0.25em] text-sm" style={{ color: '#e63946' }}>Bluffing &amp; Chaos</span>
                                <h2 className="font-black uppercase tracking-tighter leading-[0.88] mt-2" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', color: '#f8f5e6' }}>Tong</h2>
                            </div>
                            <p className="text-lg font-medium leading-relaxed opacity-70">Cha, Bon, Paan, Muri. Pass the cards, lie about what you're passing, and try not to get caught. Bangladesh's most chaotic party game.</p>
                            <ul className="space-y-3">
                                {[
                                    { icon: <Coffee size={16} />, text: '8 desi suits — Cha, Paan, Muri & more' },
                                    { icon: <Search size={16} />, text: 'Call bluffs — look them in the eye' },
                                    { icon: <AlertTriangle size={16} />, text: 'Collect 4 of any item and you LOSE' },
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 font-semibold text-sm">
                                        <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 30, height: 30, backgroundColor: '#e63946', color: '#f8f5e6' }}>{f.icon}</span>
                                        <span>{f.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => buy(tongProduct)} className="font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-base" style={{ backgroundColor: '#e63946', color: '#f8f5e6', boxShadow: '6px 6px 0px 0px rgba(230,57,70,0.4)' }}>
                                    <ShoppingCart size={20} /> Buy Now — {priceLabel(tongProduct.price)}
                                </button>
                                <a href="/#/tong" className="font-bold uppercase tracking-widest px-6 py-4 rounded-xl flex items-center gap-2 text-sm opacity-50 hover:opacity-80" style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#f8f5e6' }}>View Full Page <ChevronRight size={16} /></a>
                            </div>
                        </div>
                        {/* Desktop 4-col card grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {TONG_CARDS.map((src, i) => (
                                <div key={i} className="rounded-xl overflow-hidden shadow-xl border border-white/10 transition-transform hover:-translate-y-2" style={{ aspectRatio: '2/3', transform: i % 2 === 0 ? 'rotate(-2.5deg)' : 'rotate(2.5deg)' }}>
                                    <img src={src} alt={`Tong card ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────── BUNDLE ── */}
            <section
                id="bundle"
                className="relative py-20 md:py-28 px-4 overflow-hidden"
                style={{ backgroundColor: '#f8f5e6', color: '#1a3325' }}
            >
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-14">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mb-4"
                            style={{ backgroundColor: '#e63946', color: '#fff' }}
                        >
                            🔥 Best Value Deal
                        </div>
                        <h2
                            className="font-black uppercase tracking-tighter leading-[0.88]"
                            style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', color: '#1a3325' }}
                        >
                            Wanna Get <span style={{ color: '#2e8b57' }}>Both?</span>
                        </h2>
                        <p className="text-lg font-medium opacity-60 mt-4 max-w-2xl mx-auto">
                            Why settle for one kind of chaos when you can have both? The Chokka Bundle gives you the complete experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Bundle Image */}
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 group"
                            style={{ aspectRatio: '16/10', borderColor: '#1a3325', boxShadow: '12px 12px 0px 0px #2e8b57' }}
                        >
                            <img
                                src="/cards/bundle/bundle.webp"
                                alt="Chokka Bundle"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                            <div
                                className="absolute top-4 right-4 px-4 py-2 font-black uppercase tracking-widest text-sm rounded-lg"
                                style={{ backgroundColor: '#e63946', color: '#fff', transform: 'rotate(3deg)', border: '2px solid #1a3325' }}
                            >
                                💰 Best Value
                            </div>
                        </div>

                        {/* Bundle copy */}
                        <div className="space-y-6">
                            <h3 className="font-black text-4xl uppercase tracking-tight" style={{ color: '#1a3325' }}>
                                The Chokka Bundle
                            </h3>
                            <p className="text-base font-medium opacity-70 leading-relaxed">
                                Strategic backstabbing + loud bluffing madness. One box, two complete games, infinite game nights.
                            </p>

                            <ul className="space-y-3">
                                {[
                                    'Save money on the combo',
                                    'Perfect for any group size (2–8 players)',
                                    'Double the fun, double the drama',
                                    'Premium packaging — makes a great gift',
                                ].map((text, i) => (
                                    <li key={i} className="flex items-center gap-3 font-semibold text-sm">
                                        <CheckCircle size={18} style={{ color: '#2e8b57', flexShrink: 0 }} />
                                        <span style={{ color: '#1a3325' }}>{text}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => buy(bundleProduct)}
                                className="w-full sm:w-auto font-black uppercase tracking-widest text-xl px-10 py-5 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 justify-center"
                                style={{
                                    backgroundColor: '#1a3325', color: '#f8f5e6',
                                    boxShadow: '8px 8px 0px 0px #2e8b57',
                                }}
                            >
                                <ShoppingCart size={24} /> Buy Bundle — {priceLabel(bundleProduct.price)}
                            </button>

                            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest opacity-40">
                                <span>✓ Fast Delivery</span>
                                <span>✓ Steadfast</span>
                                <span>✓ Dhaka 2–3 Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ────────────────────────────────── CELEBRITY REVIEWS (from existing component) ── */}
            <CelebrityReviews />

            {/* ────────────────────────────────── CUSTOMER REVIEWS ── */}
            <section
                className="py-20 px-4 relative overflow-hidden"
                style={{ backgroundColor: '#0a1510' }}
            >
                <div className="text-center mb-14">
                    <span className="font-bold uppercase tracking-[0.3em] text-sm block mb-3" style={{ color: '#2e8b57' }}>
                        Customer Reviews
                    </span>
                    <h2
                        className="font-black uppercase leading-tight"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#f8f5e6' }}
                    >
                        What Players <span style={{ color: '#2e8b57' }}>Are Saying</span>
                    </h2>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {REVIEWS.map((r, i) => (
                        <div
                            key={i}
                            className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(145deg, #122219 0%, #0b1a13 100%)',
                                border: '1px solid rgba(46,139,87,0.15)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                            }}
                        >
                            <span
                                className="absolute top-0 right-4 font-serif text-8xl leading-none pointer-events-none select-none"
                                style={{ color: 'rgba(46,139,87,0.1)' }}
                            >
                                &ldquo;
                            </span>

                            <div className="flex items-center gap-3">
                                <div
                                    className="rounded-full font-black text-sm flex items-center justify-center flex-shrink-0"
                                    style={{ width: 44, height: 44, backgroundColor: '#2e8b57', color: '#f8f5e6' }}
                                >
                                    {r.initials}
                                </div>
                                <div>
                                    <p className="font-black text-sm" style={{ color: '#f8f5e6' }}>{r.name}</p>
                                    <p className="text-xs opacity-40 mt-0.5" style={{ color: '#f8f5e6' }}>{r.role}</p>
                                </div>
                            </div>

                            <Stars n={r.rating} />

                            <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(248,245,230,0.65)' }}>
                                &ldquo;{r.quote}&rdquo;
                            </p>

                            <span
                                className="self-end inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: '#e63946', color: '#fff' }}
                            >
                                <CheckCircle size={11} /> Verified Purchase
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ────────────────────────────────── TRUST SIGNALS (moved after reviews) ── */}
            <section
                className="py-16 md:py-20 px-4 relative overflow-hidden"
                style={{ backgroundColor: '#0f1f17' }}
            >
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
                />
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center relative z-10">
                    {[
                        { icon: <Truck size={28} />, title: 'Fast Delivery', desc: 'Nationwide via Steadfast. 2–3 days to your doorstep.' },
                        { icon: <Award size={28} />, title: 'Premium Quality', desc: 'High-GSM cards, durable boxes, and art that stands out.' },
                        { icon: <Users size={28} />, title: 'Made in Bangladesh', desc: 'Proudly designed and crafted in Chittagong, BD.' },
                    ].map((t, i) => (
                        <div key={i} className="flex flex-col items-center gap-4">
                            <div
                                className="flex items-center justify-center rounded-full border-2"
                                style={{ width: 60, height: 60, backgroundColor: '#2e8b57', borderColor: 'rgba(255,255,255,0.1)', color: '#f8f5e6' }}
                            >
                                {t.icon}
                            </div>
                            <h3 className="font-black uppercase text-base tracking-wide" style={{ color: '#f8f5e6' }}>{t.title}</h3>
                            <p className="text-sm font-medium leading-relaxed max-w-xs" style={{ color: 'rgba(248,245,230,0.4)' }}>{t.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ────────────────────────────────── FOOTER CTA ── */}
            <section
                className="py-20 px-4 relative overflow-hidden text-center"
                style={{ backgroundColor: '#0a1510', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(46,139,87,0.12) 0%, transparent 70%)' }}
                />

                <div className="relative z-10 max-w-3xl mx-auto">
                    <img src="/logo.png" alt="CHOKKA" className="w-14 h-14 object-contain mx-auto mb-6 opacity-70" />

                    <h2
                        className="font-black uppercase tracking-tighter leading-tight mb-4"
                        style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', color: '#f8f5e6' }}
                    >
                        Game Night Won't <br />
                        <span style={{ color: '#2e8b57' }}>Plan Itself</span>
                    </h2>

                    <p className="font-medium opacity-50 mb-10 text-base max-w-lg mx-auto" style={{ color: '#f8f5e6' }}>
                        Order now and get your games delivered in 2–3 days across Bangladesh. Steadfast delivery, premium packaging.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button
                            onClick={() => buy(syndicateProduct)}
                            className="font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-base justify-center w-full sm:w-auto"
                            style={{ backgroundColor: '#2e8b57', color: '#f8f5e6', boxShadow: '0 0 30px rgba(46,139,87,0.4)' }}
                        >
                            <ShoppingCart size={18} /> Buy Syndicate — {priceLabel(syndicateProduct.price)}
                        </button>
                        <button
                            onClick={() => buy(tongProduct)}
                            className="font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-base justify-center w-full sm:w-auto"
                            style={{ backgroundColor: '#e63946', color: '#f8f5e6', boxShadow: '0 0 30px rgba(230,57,70,0.3)' }}
                        >
                            <ShoppingCart size={18} /> Buy Tong — {priceLabel(tongProduct.price)}
                        </button>
                        <button
                            onClick={() => buy(bundleProduct)}
                            className="font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-sm justify-center w-full sm:w-auto"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', color: '#f8f5e6' }}
                        >
                            <Package size={16} /> Bundle — {priceLabel(bundleProduct.price)}
                        </button>
                    </div>

                    {/* Social */}
                    <div className="flex justify-center gap-8 mb-8 font-bold uppercase tracking-widest text-sm opacity-40" style={{ color: '#f8f5e6' }}>
                        <a href="https://www.instagram.com/chokka.co/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" style={{ color: '#f8f5e6' }}>
                            Instagram
                        </a>
                        <a href="https://www.facebook.com/chobify" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" style={{ color: '#f8f5e6' }}>
                            Facebook
                        </a>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest opacity-20" style={{ color: '#f8f5e6' }}>
                        © 2026 Chokka Collectives BD · Designed in Chittagong
                    </p>
                </div>
            </section>

            {/* ────────────────────────────────── CHECKOUT ── */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                product={checkoutProduct}
            />
        </div>
    );
}
