import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Uses the same Supabase project as Admin
const supabase = createClient(
  'https://efijepzbnhnslljvpakc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaWplcHpibmhuc2xsanZwYWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzY4OTEsImV4cCI6MjA4NzE1Mjg5MX0.c6YEmjWZgPp2xifpAFYibtyaMkXHHYfULCsAvS5DpAA'
);

// Shown while Supabase loads / if the table is empty
const FALLBACK = [
  {
    id: 'f1',
    name: 'Nafis Rafsan',
    role: 'Influencer | Content Creator',
    company: '',
    rating: 5,
    quote: "Cool game! Very relatable to our country. Can't wait to try it out this weekend.",
    image_url: '/celebrities/nafis-rafsan.webp',
    initials: 'NR',
  },
];

// ─── Desktop carousel config (keyed by offset string) ────────────────────────
const D_CFG = {
  '0':  { xFactor: 0,    scale: 1.00, opacity: 1.00, blur: 0,   zIndex: 10 },
  '1':  { xFactor: 230,  scale: 0.79, opacity: 0.55, blur: 2,   zIndex: 5  },
  '-1': { xFactor: -230, scale: 0.79, opacity: 0.55, blur: 2,   zIndex: 5  },
  '2':  { xFactor: 385,  scale: 0.60, opacity: 0.25, blur: 4,   zIndex: 2  },
  '-2': { xFactor: -385, scale: 0.60, opacity: 0.25, blur: 4,   zIndex: 2  },
};

// ─── Mobile carousel config — center card full, ±1 peek from edges ───────────
const M_CFG = {
  '0':  { xFactor: 0,    scale: 1.00, opacity: 1.00, blur: 0,   zIndex: 10 },
  '1':  { xFactor: 220,  scale: 0.80, opacity: 0.40, blur: 2,   zIndex: 4  },
  '-1': { xFactor: -220, scale: 0.80, opacity: 0.40, blur: 2,   zIndex: 4  },
  '2':  { xFactor: 0,    scale: 0.60, opacity: 0,    blur: 0,   zIndex: 1  },
  '-2': { xFactor: 0,    scale: 0.60, opacity: 0,    blur: 0,   zIndex: 1  },
};

function getOffset(index, active, total) {
  let d = index - active;
  const half = Math.floor(total / 2);
  if (d > half) d -= total;
  if (d < -half) d += total;
  return d;
}

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// ─── Shared micro-SVGs ────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StarIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? '#e63946' : 'transparent'}
      stroke={filled ? '#e63946' : 'rgba(255,255,255,0.15)'}
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ─── Single card ─────────────────────────────────────────────────────────────
function ReviewCard({ review, isActive }) {
  const initials = review.initials || getInitials(review.name);
  return (
    <div
      className="rounded-2xl p-6 border h-[370px] flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #122219 0%, #0b1a13 55%, #060e09 100%)',
        borderColor: isActive ? 'rgba(46,139,87,0.25)' : 'rgba(46,139,87,0.1)',
        boxShadow: isActive
          ? '0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(46,139,87,0.15)'
          : 'none',
      }}
    >
      {/* Decorative quote */}
      <span
        className="absolute top-1 right-5 text-[96px] font-serif leading-none pointer-events-none select-none"
        style={{ color: 'rgba(46, 139, 87, 0.13)' }}
      >
        "
      </span>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="relative flex-shrink-0">
          <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-[#2e8b57]/40 bg-gradient-to-br from-[#2e8b57] to-[#1a3325] relative flex items-center justify-center">
            <span className="text-[#f8f5e6] font-black text-sm z-0 select-none">{initials}</span>
            <img
              src={review.image_url}
              alt={review.name}
              className="absolute inset-0 w-full h-full object-cover z-10"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-[#2e8b57] rounded-full flex items-center justify-center border-2 border-[#060e09]">
            <CheckIcon />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[#f8f5e6] font-black text-[15px] leading-tight">{review.name}</p>
          <p className="text-[#f8f5e6]/40 text-[11px] leading-tight mt-0.5 truncate">{review.role}</p>
          {review.company && (
            <p className="text-[#2e8b57] text-[11px] font-bold mt-1">{review.company}</p>
          )}
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4 relative z-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < review.rating} />
        ))}
      </div>

      {/* Quote */}
      <div className="border-l-2 border-[#2e8b57]/40 pl-3 flex-1 relative z-10 overflow-hidden">
        <p className="text-[#f8f5e6]/70 text-[13.5px] leading-relaxed line-clamp-4">
          "{review.quote}"
        </p>
      </div>

      {/* Verified pill */}
      <div className="flex justify-end mt-5 relative z-10">
        <span className="bg-[#e63946] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <CheckIcon />
          Verified Review
        </span>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function CelebrityReviews() {
  const [reviews, setReviews] = useState([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [halfWidth, setHalfWidth] = useState(175);

  // Fetch live data from Supabase; fall back to hardcoded if empty/unavailable
  useEffect(() => {
    supabase
      .from('celebrity_reviews')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(FALLBACK);
        }
      })
      .catch(() => setReviews(FALLBACK));
  }, []);

  // Responsive card half-width
  useEffect(() => {
    const update = () => setHalfWidth(window.innerWidth < 768 ? 145 : 175);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const isMobile = halfWidth === 145;
  const total = reviews.length;

  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);
  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);

  // Auto-advance every 2 seconds
  useEffect(() => {
    if (paused || total < 2) return;
    const id = setInterval(next, 2000);
    return () => clearInterval(id);
  }, [paused, next, total]);

  if (reviews.length === 0) return null;

  return (
    <section
      className="bg-[#0a1510] py-20 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Section header */}
      <div className="text-center mb-14 px-4">
        <span className="inline-block text-[#2e8b57] font-bold tracking-[0.3em] uppercase text-sm mb-3">
          Trusted By Leaders
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-[#f8f5e6] uppercase leading-tight">
          What the <span className="text-[#2e8b57]">Famous</span> Say
        </h2>
      </div>

      {/* Carousel */}
      <div className="relative h-[395px] md:h-[415px]">
        {reviews.map((review, index) => {
          const offset = getOffset(index, active, total);
          const cfg = isMobile
            ? (M_CFG[String(offset)] ?? { xFactor: 0, scale: 0.5, opacity: 0, blur: 0, zIndex: 0 })
            : (D_CFG[String(offset)] ?? { xFactor: (offset > 0 ? 500 : -500), scale: 0.4, opacity: 0, blur: 6, zIndex: 0 });

          const x = cfg.xFactor - halfWidth;

          return (
            <motion.div
              key={review.id}
              className="absolute top-0 w-[290px] md:w-[350px]"
              style={{ left: '50%', zIndex: cfg.zIndex }}
              animate={{ x, scale: cfg.scale, opacity: cfg.opacity, filter: `blur(${cfg.blur}px)` }}
              transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
            >
              <ReviewCard review={review} isActive={offset === 0} />
            </motion.div>
          );
        })}

        {/* Arrows */}
        <button onClick={prev} aria-label="Previous"
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-white/8 hover:bg-[#2e8b57]/20 border border-[#2e8b57]/20 backdrop-blur-sm transition-colors">
          <ChevronLeft className="text-[#f8f5e6]" size={18} />
        </button>
        <button onClick={next} aria-label="Next"
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-white/8 hover:bg-[#2e8b57]/20 border border-[#2e8b57]/20 backdrop-blur-sm transition-colors">
          <ChevronRight className="text-[#f8f5e6]" size={18} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {reviews.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} aria-label={`Review ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? 'bg-[#2e8b57] w-7' : 'bg-[#f8f5e6]/15 w-2 hover:bg-[#f8f5e6]/30'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
