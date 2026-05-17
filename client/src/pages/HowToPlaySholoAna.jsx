import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import {
  ArrowLeft, ChevronDown, Users, Clock, Layers, BookOpen,
  CheckCircle, XCircle, ArrowRight, Eye, RefreshCw, Upload
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: <Users size={18} />, label: 'Players', value: '2 – 6' },
  { icon: <Clock size={18} />, label: 'Playtime', value: '20–30 min' },
  { icon: <Layers size={18} />, label: 'Cards', value: '48 Total' },
  { icon: '🧠', label: 'Style', value: 'Memory & Deduction' },
];

// The 6 uploaded card images act as the 6 different suit colors in the game
const SUIT_COLORS = ['#e63946', '#2672b0', '#2e8b57', '#c9a227', '#7c3aed', '#ea580c'];
const SUIT_IMGS = [
  '/cards/sholo-ana/front-1.webp',
  '/cards/sholo-ana/front-2.webp',
  '/cards/sholo-ana/front-3.webp',
  '/cards/sholo-ana/front-4.webp',
  '/cards/sholo-ana/front-5.webp',
  '/cards/sholo-ana/front-6.webp',
];

// ─── STYLED NUMBER CARD ───────────────────────────────────────────────────────
function NumberCard({ number, color, faceDown = false, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-9 h-[52px] text-lg',
    md: 'w-12 h-[68px] text-xl',
    lg: 'w-16 h-[90px] text-2xl',
  };
  if (faceDown) {
    return (
      <div className={`${sizes[size]} rounded-lg border-2 border-white/12 bg-white/4 flex items-center justify-center flex-shrink-0 ${className}`}>
        <span className="text-white/15 font-black text-lg select-none">?</span>
      </div>
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-lg border-2 flex items-center justify-center font-black shadow-lg flex-shrink-0 ${className}`}
      style={{ borderColor: color, backgroundColor: color + '25', color, boxShadow: `0 4px 12px ${color}30` }}
    >
      {number}
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-px flex-1 bg-white/8" />
      <span className="text-[#c9a227] font-black uppercase tracking-[0.25em] text-[11px] whitespace-nowrap">{children}</span>
      <div className="h-px flex-1 bg-white/8" />
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const cardRefs = useRef([]);
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRefs.current.filter(Boolean),
        { y: 80, opacity: 0, scale: 0.6 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 1, ease: 'back.out(1.6)', delay: 0.3 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const rotations = [-20, -12, -4, 4, 12, 20];
  const yShifts   = [18, 7, 1, 1, 7, 18];

  return (
    <div ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0a1225 0%, #04060e 75%)' }}>

      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full opacity-10 blur-[90px]" style={{ background: '#2672b0' }} />
        <div className="absolute bottom-1/4 right-1/3 w-60 h-60 rounded-full opacity-10 blur-[70px]" style={{ background: '#c9a227' }} />
      </div>

      <Link to="/" className="absolute top-5 left-5 flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest z-10">
        <ArrowLeft size={14} /> Home
      </Link>

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={14} className="text-[#c9a227]" />
          <span className="text-[#c9a227] font-black uppercase tracking-[0.3em] text-[11px]">How to Play</span>
        </div>

        <h1 className="text-5xl md:text-[80px] font-black text-white uppercase tracking-tighter leading-none text-center mb-2">
          শোলো আনা
        </h1>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-center mb-3" style={{ color: '#c9a227' }}>
          SHOLO ANA
        </h2>
        <p className="text-white/35 text-sm md:text-base font-medium text-center max-w-lg mb-14">
          An original number game. Claim three cards from the line — but they have to add up.
        </p>

        {/* Card fan using actual uploaded images */}
        <div className="flex justify-center items-end mb-14" style={{ perspective: '1000px', gap: '6px' }}>
          {SUIT_IMGS.map((img, i) => (
            <div
              key={i}
              ref={el => (cardRefs.current[i] = el)}
              style={{
                transform: `rotate(${rotations[i]}deg) translateY(${yShifts[i]}px)`,
                filter: `drop-shadow(0 6px 20px ${SUIT_COLORS[i]}50)`,
                border: `2px solid ${SUIT_COLORS[i]}40`,
              }}
              className="relative w-[70px] h-[98px] md:w-[105px] md:h-[147px] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 hover:-translate-y-3 hover:z-10 cursor-pointer"
            >
              <img src={img} alt={`Card ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
              <span className="text-[#c9a227]">{typeof s.icon === 'string' ? <span className="text-base">{s.icon}</span> : s.icon}</span>
              <span className="text-white/30 text-[9px] uppercase tracking-widest font-bold">{s.label}</span>
              <span className="text-white font-black text-sm">{s.value}</span>
            </div>
          ))}
        </div>

        <p className="text-[#c9a227]/60 text-xs font-bold uppercase tracking-widest border border-[#c9a227]/20 rounded-full px-4 py-1.5">
          Chokka's First Original Game
        </p>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-white/20 mt-10">
          <ChevronDown size={22} />
        </motion.div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function SetupSection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.setup-el', {
        y: 35, opacity: 0, stagger: 0.1, duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 78%', end: 'top 40%', scrub: 1 },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bg-[#060810]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Setup</SectionLabel>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-12 text-center">
          Before You Begin
        </h2>

        {/* THE LINE visual */}
        <div className="setup-el bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3 rounded-full bg-[#c9a227]" />
            <h3 className="font-black text-[#c9a227] text-sm uppercase tracking-widest">The Line (Center of Table)</h3>
          </div>
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            {[...Array(6)].map((_, i) => (
              <NumberCard key={i} faceDown size="lg" />
            ))}
          </div>
          <p className="text-white/40 text-xs text-center">6 cards placed face-down in a row in the center. Nobody knows what's in them — yet.</p>
        </div>

        <div className="setup-el grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* YOUR HAND */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#2672b0]" />
              <h3 className="font-black text-[#60a5fa] text-sm uppercase tracking-widest">Your Hand (Secret)</h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {[...Array(4)].map((_, i) => <NumberCard key={i} faceDown size="md" />)}
            </div>
            <p className="text-white/40 text-xs">Each player is dealt 4 cards face-down. Keep them secret — only you see your hand.</p>
          </div>

          {/* DRAW PILE */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#7c3aed]" />
              <h3 className="font-black text-[#a78bfa] text-sm uppercase tracking-widest">Draw Pile</h3>
            </div>
            <div className="relative w-14 mb-3">
              {[2, 1, 0].map(offset => (
                <div key={offset} className="absolute w-12 h-[68px] rounded-lg border border-white/10 bg-white/4"
                  style={{ top: `-${offset * 3}px`, left: `${offset * 2}px`, zIndex: offset }} />
              ))}
              <div className="w-12 h-[68px]" />
            </div>
            <p className="text-white/40 text-xs mt-2">Remaining cards go face-down to the side. Players can draw from this or discard into it.</p>
          </div>
        </div>

        <div className="setup-el bg-[#c9a227]/8 border border-[#c9a227]/25 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="font-black text-[#c9a227] text-sm uppercase mb-1">Goal</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Be the first player to collect <span className="text-white font-bold">9 cards</span> in your Score Pile — that's 3 successful Dabi (claim) actions. Each claim wins you 3 cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
function ActionsSection() {
  const [tab, setTab] = useState('badol');
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.act-head', {
        y: 30, opacity: 0, duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const actions = {
    badol: {
      label: 'বদল — Badol', sublabel: 'Swap', color: '#2672b0',
      icon: <RefreshCw size={20} />,
      desc: 'Place 1 card from your hand face-down into any position in The Line. Take the card that was there into your hand.',
      details: [
        'Everyone sees WHICH position moved — but not what either card is.',
        'Use this to put a card you know into The Line or retrieve one you need.',
        'Your opponents are watching your swap patterns — be subtle.',
      ],
      visual: (
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-white/30 font-bold uppercase">Your Hand</p>
              <div className="flex gap-1.5">
                <NumberCard number={7} color="#2672b0" size="md" className="ring-2 ring-[#2672b0]/60" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight size={16} className="text-[#2672b0]" />
              <p className="text-[9px] text-[#2672b0] font-bold">swap</p>
              <ArrowLeft size={16} className="text-[#2672b0]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-white/30 font-bold uppercase">The Line</p>
              <div className="flex gap-1.5">
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="md" className="ring-2 ring-[#2672b0]/60" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
              </div>
            </div>
          </div>
          <p className="text-white/30 text-[10px] text-center">Position 3 highlighted — everyone sees you swapped there</p>
        </div>
      ),
    },
    unki: {
      label: 'উঁকি — Unki', sublabel: 'Peek', color: '#c9a227',
      icon: <Eye size={20} />,
      desc: 'Place 1 card from your hand face-down under the Draw Pile. Secretly look at any 2 cards in The Line. Then draw 1 card from the top of the Draw Pile.',
      details: [
        'You see 2 Line cards — but tell nobody what you saw.',
        'This is your intelligence move — build up knowledge of The Line.',
        'You lose 1 hand card but gain 1 from the Draw Pile.',
      ],
      visual: (
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[10px] text-white/30 font-bold uppercase">Your Hand</p>
              <div className="flex gap-1.5">
                <NumberCard faceDown size="sm" className="opacity-30 line-through" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
              </div>
              <p className="text-[9px] text-[#f87171] font-bold">↓ discard 1</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[10px] text-white/30 font-bold uppercase">The Line</p>
              <div className="flex gap-1.5">
                <NumberCard number={3} color="#c9a227" size="sm" className="ring-2 ring-[#c9a227]/60" />
                <NumberCard faceDown size="sm" />
                <NumberCard number={8} color="#c9a227" size="sm" className="ring-2 ring-[#c9a227]/60" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
                <NumberCard faceDown size="sm" />
              </div>
              <p className="text-[9px] text-[#c9a227] font-bold">👁️ secretly peek 2</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[10px] text-white/30 font-bold uppercase">Draw Pile</p>
              <NumberCard faceDown size="sm" />
              <p className="text-[9px] text-[#4ade80] font-bold">↑ draw 1</p>
            </div>
          </div>
        </div>
      ),
    },
    dabi: {
      label: 'দাবি — Dabi', sublabel: 'Claim', color: '#e63946',
      icon: <CheckCircle size={20} />,
      desc: 'Choose any 3 ADJACENT cards in The Line. Flip them face-up. They must match one of the valid claim types. Correct → you win them. Wrong → penalty.',
      details: [
        'The 3 cards must be next to each other in the Line — no skipping.',
        'Flip all 3 at once. Everyone sees the result.',
        'This is your scoring move — use Badol and Unki to set it up.',
      ],
      visual: (
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="flex gap-2 items-center">
            <NumberCard faceDown size="sm" />
            <NumberCard number={2} color="#e63946" size="md" className="ring-2 ring-[#e63946]/70" />
            <NumberCard number={5} color="#e63946" size="md" className="ring-2 ring-[#e63946]/70" />
            <NumberCard number={9} color="#e63946" size="md" className="ring-2 ring-[#e63946]/70" />
            <NumberCard faceDown size="sm" />
            <NumberCard faceDown size="sm" />
          </div>
          <p className="text-white/35 text-xs text-center">Cards 2, 3, 4 chosen and flipped — 2 + 5 + 9 = 16 ✓</p>
        </div>
      ),
    },
  };

  const current = actions[tab];

  return (
    <div ref={ref} className="bg-[#04060e]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Your Turn</SectionLabel>
        <div className="act-head text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">3 Actions</h2>
          <p className="text-white/35 text-sm max-w-md mx-auto">Do exactly ONE action per turn. Choose wisely.</p>
        </div>

        {/* Action tabs */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {Object.entries(actions).map(([key, a]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex flex-col items-center px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border"
              style={{
                backgroundColor: tab === key ? a.color + '25' : 'transparent',
                borderColor: tab === key ? a.color : 'rgba(255,255,255,0.08)',
                color: tab === key ? a.color : 'rgba(255,255,255,0.35)',
                boxShadow: tab === key ? `0 0 20px ${a.color}25` : 'none',
              }}>
              <span className="mb-0.5">{a.sublabel}</span>
              <span className="text-[8px] opacity-60 normal-case font-medium">{a.label.split('—')[0].trim()}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: current.color + '35', background: `linear-gradient(135deg, ${current.color}10, rgba(4,6,14,0.9))` }}>
              <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg,transparent,${current.color},transparent)` }} />
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: current.color + '20', color: current.color }}>
                    {current.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xl uppercase tracking-tight">{current.sublabel}</h3>
                    <p className="text-white/30 text-xs font-medium">{current.label}</p>
                  </div>
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-5">{current.desc}</p>

                {/* Details */}
                <div className="space-y-2 mb-5">
                  {current.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/4 rounded-xl p-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: current.color }} />
                      <p className="text-white/50 text-xs leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>

                {/* Visual diagram */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest mb-3 text-center">Example</p>
                  {current.visual}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── CLAIM TYPES ──────────────────────────────────────────────────────────────
function ClaimTypesSection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.claim-card', {
        y: 40, opacity: 0, scale: 0.92, stagger: 0.15, duration: 0.9, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: ref.current, start: 'top 78%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const claims = [
    {
      bengali: 'চোরাই', name: 'CHORAI', sub: 'Ascending',
      color: '#2672b0', icon: '📈',
      rule: 'Numbers increase left to right. Color/suit doesn\'t matter.',
      example: [
        { n: 2, c: '#e63946' }, { n: 5, c: '#2e8b57' }, { n: 8, c: '#c9a227' }
      ],
      exampleNote: '2 < 5 < 8 ✓',
      tip: 'Easiest to set up — just track any 3 rising numbers.',
    },
    {
      bengali: 'একজাত', name: 'EKJAT', sub: 'Same Color',
      color: '#2e8b57', icon: '🎨',
      rule: 'All three cards are the same suit/color. Numbers don\'t matter.',
      example: [
        { n: 2, c: '#e63946' }, { n: 7, c: '#e63946' }, { n: 5, c: '#e63946' }
      ],
      exampleNote: 'All red — any numbers ✓',
      tip: 'Peek (Unki) is your best tool for tracking same-color clusters.',
    },
    {
      bengali: 'শোলো আনা', name: 'SHOLO ANA', sub: 'Sums to 16',
      color: '#c9a227', icon: '✨',
      rule: 'The three numbers add up to exactly 16. Suit doesn\'t matter.',
      example: [
        { n: 1, c: '#7c3aed' }, { n: 7, c: '#e63946' }, { n: 8, c: '#2672b0' }
      ],
      exampleNote: '1 + 7 + 8 = 16 ✓',
      tip: 'Hardest to pull off — and the most satisfying. The game\'s namesake.',
    },
  ];

  return (
    <div ref={ref} className="bg-[#060810]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Claim Types</SectionLabel>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 text-center">
          3 Ways to Win Cards
        </h2>
        <p className="text-white/35 text-sm text-center max-w-xl mx-auto mb-12">
          When you Dabi (claim), your 3 adjacent Line cards must match one of these patterns.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {claims.map((claim, i) => (
            <div key={i}
              className="claim-card relative rounded-2xl border overflow-hidden flex flex-col"
              style={{ borderColor: claim.color + '40', background: `linear-gradient(160deg,${claim.color}12,rgba(6,8,16,0.9))` }}
            >
              <div className="h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${claim.color},transparent)` }} />
              <div className="p-6 flex flex-col flex-1">
                <div className="text-3xl mb-3">{claim.icon}</div>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: claim.color + 'aa' }}>{claim.sub}</p>
                <h3 className="font-black text-xl uppercase tracking-tight mb-1" style={{ color: claim.color }}>{claim.name}</h3>
                <p className="text-white/30 text-[10px] mb-4">{claim.bengali}</p>

                <p className="text-white/55 text-xs leading-relaxed mb-5">{claim.rule}</p>

                {/* Example cards */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-4">
                  <p className="text-[9px] text-white/25 font-bold uppercase mb-2">Example</p>
                  <div className="flex items-center gap-2 mb-2">
                    {claim.example.map((card, j) => (
                      <NumberCard key={j} number={card.n} color={card.c} size="sm" />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: claim.color }}>{claim.exampleNote}</p>
                </div>

                <div className="mt-auto bg-white/4 rounded-xl p-3">
                  <p className="text-white/35 text-[10px] italic leading-relaxed">💡 {claim.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── OUTCOMES ─────────────────────────────────────────────────────────────────
function OutcomesSection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.outcome-card', {
        scale: 0.88, opacity: 0, y: 40, stagger: 0.2, duration: 0.9, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: ref.current, start: 'top 75%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative bg-[#04060e] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-56 h-56 rounded-full blur-[80px] opacity-12" style={{ background: '#4ade80' }} />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-56 h-56 rounded-full blur-[80px] opacity-12" style={{ background: '#f87171' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Claim Outcomes</SectionLabel>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 text-center">
          Correct or Wrong?
        </h2>
        <p className="text-white/35 text-sm text-center max-w-xl mx-auto mb-12">
          After you flip 3 Line cards for your Dabi, one of two things happens.
        </p>

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch mb-8">
          {/* Correct */}
          <div className="outcome-card bg-[#052010] border-2 border-[#4ade80]/35 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#4ade80]/15 border-2 border-[#4ade80]/40 flex items-center justify-center">
                <CheckCircle size={18} className="text-[#4ade80]" />
              </div>
              <div>
                <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">Result</p>
                <p className="font-black text-[#4ade80] text-xl uppercase">Correct</p>
              </div>
            </div>
            <p className="text-white/50 text-sm mb-5 leading-relaxed">The 3 cards match a valid claim type (Chorai, Ekjat, or Sholo Ana).</p>
            <div className="space-y-3 flex-1">
              {[
                { icon: '✅', text: 'The 3 cards go into your Score Pile' },
                { icon: '📉', text: 'The Line now has 3 fewer cards — it stays that way until others Badol or Unki' },
                { icon: '🎯', text: 'You\'re 1/3 of the way to winning' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#4ade80]/6 rounded-xl p-3">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <p className="text-white/55 text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            {/* Score tracker visual */}
            <div className="mt-5 border border-[#4ade80]/20 rounded-xl p-4">
              <p className="text-[9px] text-white/25 font-bold uppercase mb-2 text-center">Score Pile Progress</p>
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map(claimIdx => (
                  <div key={claimIdx} className="flex gap-0.5">
                    {[0, 1, 2].map(cardIdx => (
                      <div key={cardIdx}
                        className="w-5 h-7 rounded border"
                        style={{
                          borderColor: claimIdx === 0 ? '#4ade80' : 'rgba(255,255,255,0.1)',
                          backgroundColor: claimIdx === 0 ? '#4ade80' + '30' : 'transparent',
                        }} />
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-[#4ade80]/60 text-center mt-2">3 cards × 3 claims = 9 total to win</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center justify-center gap-3">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/12 to-transparent" />
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/12 flex items-center justify-center">
              <span className="text-white/40 font-black text-xs">VS</span>
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/12 to-transparent" />
          </div>
          <div className="md:hidden text-center text-white/25 font-black text-xs uppercase tracking-widest">— or —</div>

          {/* Wrong */}
          <div className="outcome-card bg-[#1a0505] border-2 border-[#f87171]/35 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#f87171]/15 border-2 border-[#f87171]/40 flex items-center justify-center">
                <XCircle size={18} className="text-[#f87171]" />
              </div>
              <div>
                <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">Result</p>
                <p className="font-black text-[#f87171] text-xl uppercase">Wrong</p>
              </div>
            </div>
            <p className="text-white/50 text-sm mb-5 leading-relaxed">The 3 cards don't match any valid claim type.</p>
            <div className="space-y-3 flex-1">
              {[
                { icon: '💀', text: 'One card from your hand is cancelled — removed from the game entirely' },
                { icon: '🔀', text: 'The 3 claimed Line cards are reshuffled back into The Line face-down' },
                { icon: '😬', text: 'You lose a hand card AND your turn — very costly' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f87171]/6 rounded-xl p-3">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <p className="text-white/55 text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-[#f87171]/8 border border-[#f87171]/20 rounded-xl p-4">
              <p className="text-[#f87171] font-bold text-xs text-center">Only Dabi when you're confident. A wrong claim is a major setback.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WIN ──────────────────────────────────────────────────────────────────────
function WinSection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.win-el', {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 78%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bg-[#060810]">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <SectionLabel>Win Condition</SectionLabel>
        <div className="win-el text-6xl mb-6">🏆</div>
        <h2 className="win-el text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
          First to 9 Cards Wins
        </h2>
        <p className="win-el text-white/40 text-base max-w-xl mx-auto mb-10 leading-relaxed">
          3 successful Dabi claims × 3 cards each = 9 cards in your Score Pile. Hit that first and you win.
        </p>

        {/* Score tracker visual */}
        <div className="win-el flex justify-center gap-4 mb-12">
          {[
            { label: '1st Claim', done: true },
            { label: '2nd Claim', done: true },
            { label: '3rd Claim — WIN!', done: false },
          ].map((claim, ci) => (
            <div key={ci} className="flex flex-col items-center gap-2">
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: claim.done ? '#c9a227' : 'rgba(255,255,255,0.2)' }}>
                {claim.label}
              </p>
              <div className="flex gap-1">
                {[0, 1, 2].map(j => (
                  <div key={j}
                    className="w-10 h-14 md:w-14 md:h-20 rounded-xl border-2 flex items-center justify-center"
                    style={{
                      borderColor: claim.done ? '#c9a227' + '70' : 'rgba(255,255,255,0.08)',
                      backgroundColor: claim.done ? '#c9a227' + '15' : 'rgba(255,255,255,0.02)',
                    }}>
                    {claim.done && <span className="text-[#c9a227] text-xs font-black">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="win-el bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-2xl p-6 max-w-lg mx-auto">
          <p className="text-[#c9a227] font-bold text-sm leading-relaxed">
            The শোলো আনা (sum to 16) is the hardest claim but the most satisfying to pull off — and it's the game's namesake.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div className="bg-[#04060e] border-t border-white/5 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white/20 text-xs uppercase tracking-widest font-bold mb-1">You've got the rules</p>
          <p className="text-white font-black text-xl">Ready to play Sholo Ana?</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/sholo-ana" className="text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors shadow-lg"
            style={{ backgroundColor: '#2672b0' }}>
            Buy Sholo Ana
          </Link>
          <Link to="/" className="bg-white/5 border border-white/10 text-white/50 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HowToPlaySholoAna() {
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#04060e' }}>
      <HeroSection />
      <SetupSection />
      <ActionsSection />
      <ClaimTypesSection />
      <OutcomesSection />
      <WinSection />
      <Footer />
    </div>
  );
}
