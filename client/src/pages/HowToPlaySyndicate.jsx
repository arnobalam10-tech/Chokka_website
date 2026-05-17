import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import {
  ArrowLeft, ChevronDown, Users, Clock, Layers, Target,
  CheckCircle, XCircle, ArrowRight, Zap, Shield, Eye as EyeIcon,
  BookOpen, Crown
} from 'lucide-react';

// ─── COIN VISUAL ─────────────────────────────────────────────────────────────
function Coins({ count, color = '#c9a227', minus = false }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {minus && <span className="text-[#f87171] font-black text-sm mr-1">−</span>}
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <div
          key={i}
          className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black shadow-md"
          style={{ backgroundColor: color + '25', borderColor: color, color }}
        >
          ৳
        </div>
      ))}
      {count > 8 && <span className="text-xs font-black ml-1" style={{ color }}>×{count}</span>}
    </div>
  );
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: <Users size={18} />, label: 'Players', value: '2 – 6' },
  { icon: <Clock size={18} />, label: 'Playtime', value: '15–30 min' },
  { icon: <Layers size={18} />, label: 'Difficulty', value: 'Medium' },
  { icon: <Target size={18} />, label: 'Theme', value: 'Corporate Conspiracy' },
];

// FIXED: correct card→character mapping from front-1..5
const CHARACTERS = [
  {
    name: 'CEO',
    role: 'The Power Broker',
    action: 'Tax',
    actionDesc: 'Take 3 coins from the Treasury.',
    blocks: 'Fund Raise',
    blocksDesc: "Anyone trying to Fund Raise gets nothing.",
    coinGain: 3,
    coinCost: 0,
    color: '#c9a227',
    glow: 'rgba(201,162,39,0.35)',
    img: '/cards/syndicate/front-1.webp',
  },
  {
    name: 'Hacker',
    role: 'The Thief',
    action: 'Steal',
    actionDesc: 'Take 2 coins from another player.',
    blocks: 'Nothing',
    blocksDesc: 'Hacker has no defensive ability.',
    coinGain: 2,
    coinCost: 0,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.35)',
    img: '/cards/syndicate/front-2.webp',
  },
  {
    name: 'Journalist',
    role: 'The Watchdog',
    action: 'None',
    actionDesc: 'No active action — pure defense.',
    blocks: 'Audit',
    blocksDesc: "If Minister tries to Audit you, you can block it.",
    coinGain: 0,
    coinCost: 0,
    color: '#ea580c',
    glow: 'rgba(234,88,12,0.35)',
    img: '/cards/syndicate/front-3.webp',
  },
  {
    name: 'Spy',
    role: 'The Ghost',
    action: 'Exchange',
    actionDesc: 'Swap one or both of your cards with the deck.',
    blocks: 'Steal',
    blocksDesc: "Block the Hacker from stealing your coins.",
    coinGain: 0,
    coinCost: 0,
    color: '#dc2626',
    glow: 'rgba(220,38,38,0.35)',
    img: '/cards/syndicate/front-4.webp',
  },
  {
    name: 'Minister',
    role: 'The Enforcer',
    action: 'Audit',
    actionDesc: 'Pay 3 coins — target loses 1 card.',
    blocks: 'Nothing',
    blocksDesc: 'Minister has no defensive ability.',
    coinGain: 0,
    coinCost: 3,
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
    img: '/cards/syndicate/front-5.webp',
  },
];

const GENERAL_ACTIONS = [
  {
    name: 'Income',
    desc: 'Take 1 coin from the Treasury.',
    note: 'Cannot be blocked or challenged — it always works.',
    coinGain: 1, coinCost: 0,
    color: '#4ade80',
    icon: <ArrowRight size={14} />,
  },
  {
    name: 'Fund Raise',
    desc: 'Take 2 coins from the Treasury.',
    note: 'Can be blocked by CEO (claiming Tax overrides this).',
    coinGain: 2, coinCost: 0,
    color: '#facc15',
    icon: <Zap size={14} />,
  },
  {
    name: 'Eliminate',
    desc: 'Pay 7 coins. Target loses 1 card immediately.',
    note: 'Unblockable and unchallengeable. Spend 7, remove a life.',
    coinGain: 0, coinCost: 7,
    color: '#f87171',
    icon: <XCircle size={14} />,
  },
];

// ─── AMBIENT ORBS ─────────────────────────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[100px]" style={{ background: '#2e8b57' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-8 blur-[80px]" style={{ background: '#c9a227' }} />
    </div>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[#2e8b57] font-black uppercase tracking-[0.25em] text-[11px] whitespace-nowrap">{children}</span>
      <div className="h-px flex-1 bg-white/10" />
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
        { y: 80, opacity: 0, rotateZ: 0, scale: 0.6 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.09, duration: 1, ease: 'back.out(1.6)', delay: 0.3 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const rotations = [-20, -10, 0, 10, 20];
  const yShifts = [18, 6, 0, 6, 18];

  return (
    <div ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d2018 0%, #050a07 70%)' }}>
      <AmbientOrbs />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <Link to="/" className="absolute top-5 left-5 flex items-center gap-2 text-white/35 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest z-10">
        <ArrowLeft size={14} /> Home
      </Link>

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={14} className="text-[#2e8b57]" />
          <span className="text-[#2e8b57] font-black uppercase tracking-[0.3em] text-[11px]">How to Play</span>
        </div>

        <h1 className="text-5xl md:text-[90px] font-black text-white uppercase tracking-tighter leading-none text-center mb-3">
          The <span className="text-[#2e8b57]">Syndicate</span>
        </h1>
        <p className="text-white/40 text-sm md:text-lg font-medium text-center max-w-lg mb-14">
          A corporate power game of bluffing, betrayal, and elimination.
        </p>

        {/* Cards fan */}
        <div className="flex justify-center items-end mb-14" style={{ perspective: '1000px', gap: '8px' }}>
          {CHARACTERS.map((char, i) => (
            <div
              key={char.name}
              ref={el => (cardRefs.current[i] = el)}
              style={{
                transform: `rotate(${rotations[i]}deg) translateY(${yShifts[i]}px)`,
                filter: `drop-shadow(0 8px 24px ${char.glow})`,
              }}
              className="relative w-[72px] h-[100px] md:w-[116px] md:h-[162px] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 hover:-translate-y-3 hover:z-20 cursor-pointer group"
            >
              <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
              {/* Name tooltip on hover */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-white font-black text-[10px] md:text-xs uppercase text-center">{char.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stat tiles */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
              <span className="text-[#2e8b57]">{s.icon}</span>
              <span className="text-white/35 text-[9px] uppercase tracking-widest font-bold">{s.label}</span>
              <span className="text-white font-black text-sm">{s.value}</span>
            </div>
          ))}
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-white/20">
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
      gsap.from('.setup-item', {
        y: 40, opacity: 0, stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: 'top 78%', end: 'top 45%', scrub: 1 },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative bg-[#080e0b]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Setup</SectionLabel>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-12 text-center">
          Before You Begin
        </h2>

        {/* Visual setup diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Step 1 */}
          <div className="setup-item relative bg-gradient-to-b from-white/6 to-transparent border border-white/10 rounded-2xl p-6 hover:border-[#2e8b57]/40 transition-colors">
            <div className="absolute -top-3 left-5 bg-[#2e8b57] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Step 1</div>
            <div className="flex gap-1.5 mb-4 mt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-11 rounded bg-white/10 border border-white/15 flex items-center justify-center text-white/20 text-[10px] font-black">?</div>
              ))}
            </div>
            <h3 className="text-white font-black text-base uppercase mb-1">Deal 2 Cards</h3>
            <p className="text-white/40 text-xs leading-relaxed">Each player gets 2 cards face-down. These are their <span className="text-white/70 font-bold">Lives</span> — keep them secret.</p>
          </div>

          {/* Step 2 */}
          <div className="setup-item relative bg-gradient-to-b from-white/6 to-transparent border border-white/10 rounded-2xl p-6 hover:border-[#c9a227]/40 transition-colors">
            <div className="absolute -top-3 left-5 bg-[#c9a227] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Step 2</div>
            <div className="flex gap-1.5 mb-4 mt-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#c9a227]/20 border-2 border-[#c9a227] flex items-center justify-center text-[#c9a227] text-[10px] font-black">৳</div>
              ))}
            </div>
            <h3 className="text-white font-black text-base uppercase mb-1">2 Coins Each</h3>
            <p className="text-white/40 text-xs leading-relaxed">Every player starts with 2 coins. Leftover coins form <span className="text-white/70 font-bold">the Treasury</span>.</p>
          </div>

          {/* Step 3 */}
          <div className="setup-item relative bg-gradient-to-b from-white/6 to-transparent border border-white/10 rounded-2xl p-6 hover:border-[#f87171]/40 transition-colors">
            <div className="absolute -top-3 left-5 bg-[#f87171] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Goal</div>
            <div className="text-4xl mb-3 mt-2">👑</div>
            <h3 className="text-white font-black text-base uppercase mb-1">Last One Standing</h3>
            <p className="text-white/40 text-xs leading-relaxed">Eliminate everyone else. Keep at least 1 card in front of you to survive.</p>
          </div>
        </div>

        <div className="setup-item bg-[#2e8b57]/8 border border-[#2e8b57]/25 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-[#2e8b57]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <EyeIcon size={14} className="text-[#2e8b57]" />
          </div>
          <p className="text-white/55 text-sm leading-relaxed">
            <span className="text-[#4ade80] font-bold">Remember:</span> Your 2 hidden cards are your identity AND your hit points. You can bluff any character — you don't need to hold it. But once both cards are gone, you're eliminated.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
function ActionsSection() {
  const [tab, setTab] = useState('general');
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.actions-head', {
        y: 30, opacity: 0, duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bg-[#050a07]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Actions</SectionLabel>
        <div className="actions-head text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">What Can You Do?</h2>
          <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto">
            On your turn pick exactly one action. You can claim any character — bluff freely.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {[
            { key: 'general', label: 'General Actions', sub: 'Always available' },
            { key: 'character', label: 'Character Actions', sub: 'Claim or bluff' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
                tab === t.key
                  ? 'bg-[#2e8b57] text-white border-[#2e8b57] shadow-lg shadow-[#2e8b57]/20'
                  : 'bg-transparent text-white/40 border-white/10 hover:border-white/25 hover:text-white/70'
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[9px] mt-0.5 font-bold normal-case ${tab === t.key ? 'text-white/70' : 'text-white/25'}`}>{t.sub}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'general' ? (
            <motion.div key="gen" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
              {GENERAL_ACTIONS.map(a => (
                <div key={a.name} className="grid grid-cols-[4px_1fr_auto] gap-4 bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/18 transition-colors items-start">
                  <div className="h-full rounded-full self-stretch" style={{ backgroundColor: a.color, minHeight: '48px' }} />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-black text-white text-base uppercase tracking-tight">{a.name}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color: a.color, borderColor: a.color + '50' }}>
                        {a.icon} Always
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">{a.desc}</p>
                    <p className="text-white/30 text-xs italic">{a.note}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {a.coinGain > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] text-[#4ade80] font-bold uppercase mb-1">Gain</p>
                        <Coins count={a.coinGain} color="#4ade80" />
                      </div>
                    )}
                    {a.coinCost > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] text-[#f87171] font-bold uppercase mb-1">Pay</p>
                        <Coins count={a.coinCost} color="#f87171" minus />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="bg-white/4 border border-white/8 rounded-xl p-4 text-center">
                <p className="text-white/35 text-xs">General actions <span className="text-white/60 font-bold">cannot be challenged</span> — they happen unless blocked by a character ability.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="char" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {/* Big character profile cards */}
              <div className="space-y-4">
                {CHARACTERS.map(char => (
                  <div
                    key={char.name}
                    className="relative rounded-2xl border overflow-hidden transition-all hover:scale-[1.01]"
                    style={{ borderColor: char.color + '35', background: `linear-gradient(135deg, ${char.color}10 0%, rgba(5,10,7,0.8) 60%)` }}
                  >
                    {/* Glow accent top bar */}
                    <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${char.color}, transparent)` }} />

                    <div className="flex gap-4 md:gap-6 p-5">
                      {/* Card image - larger */}
                      <div className="relative flex-shrink-0">
                        <div className="w-[70px] h-[98px] md:w-[88px] md:h-[123px] rounded-xl overflow-hidden border-2" style={{ borderColor: char.color + '50', boxShadow: `0 0 20px ${char.glow}` }}>
                          <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Bluff badge */}
                        <div className="absolute -bottom-2 -right-2 bg-[#1a1a1a] border border-white/20 rounded-full px-2 py-0.5">
                          <span className="text-[8px] font-black text-white/50 uppercase">BLUFF</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                          <div>
                            <span className="font-black text-lg md:text-xl uppercase tracking-tight" style={{ color: char.color }}>{char.name}</span>
                            <span className="text-white/30 text-xs ml-2 font-medium">{char.role}</span>
                          </div>
                        </div>

                        {/* Action row */}
                        <div className="mb-3">
                          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 mb-2" style={{ backgroundColor: char.color + '20' }}>
                            <Zap size={12} style={{ color: char.color }} />
                            <span className="font-black text-xs uppercase tracking-wide" style={{ color: char.color }}>Action: {char.action}</span>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed">{char.actionDesc}</p>
                        </div>

                        {/* Coin cost/gain */}
                        <div className="flex flex-wrap gap-4 mb-3">
                          {char.coinGain > 0 && (
                            <div>
                              <p className="text-[9px] text-[#4ade80] font-bold uppercase mb-1">Gain</p>
                              <Coins count={char.coinGain} color="#4ade80" />
                            </div>
                          )}
                          {char.coinCost > 0 && (
                            <div>
                              <p className="text-[9px] text-[#f87171] font-bold uppercase mb-1">Pay</p>
                              <Coins count={char.coinCost} color="#f87171" minus />
                            </div>
                          )}
                          {char.coinGain === 0 && char.coinCost === 0 && char.action !== 'None' && (
                            <div className="bg-white/5 rounded-lg px-3 py-1.5">
                              <p className="text-white/30 text-[10px] font-bold">No coin exchange</p>
                            </div>
                          )}
                        </div>

                        {/* Blocks row */}
                        <div className="flex items-start gap-2">
                          <Shield size={12} className="text-white/30 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/30">Blocks: </span>
                            <span className="text-[10px] font-bold" style={{ color: char.blocks === 'Nothing' ? 'rgba(255,255,255,0.2)' : char.color }}>
                              {char.blocks}
                            </span>
                            <p className="text-white/30 text-[10px] mt-0.5">{char.blocksDesc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 bg-[#c9a227]/8 border border-[#c9a227]/25 rounded-2xl p-4 flex items-center gap-3">
                <Crown size={16} className="text-[#c9a227] flex-shrink-0" />
                <p className="text-white/50 text-sm">
                  <span className="text-[#c9a227] font-bold">The golden rule:</span> You can claim ANY character — you don't need to hold that card. Lie freely. But get caught and lose a life.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── YOUR TURN ────────────────────────────────────────────────────────────────
function TurnSection() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.turn-head', {
        y: 30, opacity: 0, duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: 1,
      label: 'Choose Action',
      icon: '🎯',
      color: '#2e8b57',
      short: 'Pick one action — General or Character.',
      detail: "Pick any action you want. You don't need to hold the card you're claiming — bluffing is core to the game. Choose Income, Fund Raise, Eliminate, or declare any character action like Tax, Steal, Audit, Exchange.",
      visual: (
        <div className="flex flex-wrap gap-2 mt-3">
          {['Income', 'Fund Raise', 'Eliminate', 'Tax (CEO)', 'Steal (Hacker)', 'Audit (Minister)', 'Exchange (Spy)'].map(a => (
            <span key={a} className="bg-[#2e8b57]/15 border border-[#2e8b57]/30 text-[#4ade80] text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg">{a}</span>
          ))}
        </div>
      ),
    },
    {
      num: 2,
      label: 'Others Respond',
      icon: '👁️',
      color: '#c9a227',
      short: 'Opponents can do nothing, Block, or Challenge.',
      detail: 'Going around the table each opponent decides: (a) Do nothing — let the action slide. (b) Block — claim a counter-character (e.g. CEO to block Fund Raise). (c) Challenge — call out a potential bluff on your action or on their block.',
      visual: (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: 'Do Nothing', sub: 'Action proceeds', color: '#4ade80', icon: '✓' },
            { label: 'Block', sub: 'Claim a counter', color: '#facc15', icon: '🛡️' },
            { label: 'Challenge', sub: 'Call the bluff', color: '#f87171', icon: '⚔️' },
          ].map(o => (
            <div key={o.label} className="rounded-xl p-3 border text-center" style={{ borderColor: o.color + '35', backgroundColor: o.color + '10' }}>
              <div className="text-xl mb-1">{o.icon}</div>
              <p className="font-black text-xs uppercase" style={{ color: o.color }}>{o.label}</p>
              <p className="text-white/30 text-[9px] mt-0.5">{o.sub}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: 3,
      label: 'Resolution',
      icon: '⚡',
      color: '#dc2626',
      short: 'Action resolves — or someone loses a life.',
      detail: 'No challenge → action happens normally. Challenged + TRUTHFUL → challenger loses a life, you secretly swap your proven card for a fresh deck card, action still resolves. Challenged + LYING → you lose a life, action fails completely.',
      visual: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          {[
            { label: 'No Challenge', result: 'Action happens', color: '#4ade80', icon: '✓' },
            { label: 'Truthful', result: 'Challenger loses 1 life', color: '#facc15', icon: '🔄' },
            { label: 'Lying', result: 'You lose 1 life', color: '#f87171', icon: '💀' },
          ].map(o => (
            <div key={o.label} className="rounded-xl p-3 border" style={{ borderColor: o.color + '35', backgroundColor: o.color + '08' }}>
              <p className="font-black text-xs uppercase mb-1" style={{ color: o.color }}>{o.label}</p>
              <p className="text-white/55 text-xs">{o.result}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div ref={ref} className="bg-[#080e0b]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Your Turn</SectionLabel>
        <div className="turn-head text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">How a Turn Works</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">Three phases every turn — no exceptions.</p>
        </div>

        {/* Visual flow line */}
        <div className="hidden md:flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => setActiveStep(i)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-300"
                  style={{
                    borderColor: activeStep === i ? s.color : 'rgba(255,255,255,0.12)',
                    backgroundColor: activeStep === i ? s.color + '25' : 'transparent',
                    boxShadow: activeStep === i ? `0 0 20px ${s.color}40` : 'none',
                  }}
                >
                  {s.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: activeStep === i ? s.color : 'rgba(255,255,255,0.3)' }}>
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className="w-16 h-px mx-3" style={{ background: `linear-gradient(90deg, ${steps[i].color}50, ${steps[i + 1].color}50)` }} />
              )}
            </div>
          ))}
        </div>

        {/* Steps (accordion on mobile, animated panel on desktop) */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const isOpen = activeStep === i;
            return (
              <motion.div
                key={i}
                layout
                className="rounded-2xl border overflow-hidden cursor-pointer"
                style={{
                  borderColor: isOpen ? step.color + '50' : 'rgba(255,255,255,0.07)',
                  background: isOpen ? `linear-gradient(135deg, ${step.color}10, rgba(8,14,11,0.8))` : 'rgba(255,255,255,0.02)',
                }}
                onClick={() => setActiveStep(isOpen ? -1 : i)}
              >
                <div className="flex items-center gap-4 p-5">
                  {/* Number */}
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm flex-shrink-0 transition-all"
                    style={{
                      borderColor: isOpen ? step.color : 'rgba(255,255,255,0.15)',
                      color: isOpen ? step.color : 'rgba(255,255,255,0.3)',
                      backgroundColor: isOpen ? step.color + '20' : 'transparent',
                    }}
                  >
                    {step.num}
                  </div>
                  <div className="text-xl flex-shrink-0">{step.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-white text-base md:text-lg uppercase tracking-tight">{step.label}</h3>
                    <p className="text-white/40 text-xs mt-0.5">{step.short}</p>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/25 flex-shrink-0">
                    <ChevronDown size={18} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pl-[72px]">
                        <p className="text-white/60 text-sm leading-relaxed">{step.detail}</p>
                        {step.visual}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CHALLENGE ────────────────────────────────────────────────────────────────
function ChallengeSection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ch-card', {
        scale: 0.88, opacity: 0, y: 40, stagger: 0.2, duration: 0.9, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: ref.current, start: 'top 75%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative bg-[#050a07] overflow-hidden">
      {/* Dramatic ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-15" style={{ background: '#4ade80' }} />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-15" style={{ background: '#f87171' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Challenge System</SectionLabel>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 text-center">Call the Bluff</h2>
        <p className="text-white/40 text-sm md:text-base text-center max-w-xl mx-auto mb-12">
          Anyone can challenge any character action or block at any time — even a block on your own action.
        </p>

        {/* VS split */}
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch mb-8">
          {/* Truthful */}
          <div className="ch-card bg-[#052010] border-2 border-[#4ade80]/35 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#4ade80]/15 border-2 border-[#4ade80]/40 flex items-center justify-center">
                <CheckCircle size={18} className="text-[#4ade80]" />
              </div>
              <div>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Result</p>
                <p className="font-black text-[#4ade80] text-xl uppercase tracking-tight">Truthful</p>
              </div>
            </div>
            <p className="text-white/55 text-sm mb-5 leading-relaxed">The challenged player reveals their card — it matches the claim.</p>
            <div className="space-y-3 flex-1">
              {[
                { icon: '💀', text: 'Challenger loses 1 life (discards a card)' },
                { icon: '🔄', text: 'You secretly swap your proven card for a fresh one from the deck' },
                { icon: '✅', text: 'The original action still happens normally' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#4ade80]/6 rounded-xl p-3">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <p className="text-white/60 text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-[#4ade80] font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/25">
                Action Succeeds
              </span>
            </div>
          </div>

          {/* VS divider */}
          <div className="hidden md:flex flex-col items-center justify-center gap-3">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
            <div className="w-10 h-10 rounded-full bg-white/8 border border-white/15 flex items-center justify-center">
              <span className="text-white/50 font-black text-xs">VS</span>
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          </div>
          <div className="md:hidden text-center text-white/30 font-black text-xs uppercase tracking-widest py-1">— or —</div>

          {/* Lying */}
          <div className="ch-card bg-[#1a0505] border-2 border-[#f87171]/35 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#f87171]/15 border-2 border-[#f87171]/40 flex items-center justify-center">
                <XCircle size={18} className="text-[#f87171]" />
              </div>
              <div>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Result</p>
                <p className="font-black text-[#f87171] text-xl uppercase tracking-tight">Lying</p>
              </div>
            </div>
            <p className="text-white/55 text-sm mb-5 leading-relaxed">The challenged player reveals — the card does NOT match the claim.</p>
            <div className="space-y-3 flex-1">
              {[
                { icon: '💀', text: 'The liar loses 1 life (discards a card face-up)' },
                { icon: '❌', text: 'The action fails completely — nothing happens' },
                { icon: '🚫', text: 'No card swap occurs' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f87171]/6 rounded-xl p-3">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <p className="text-white/60 text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-[#f87171] font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#f87171]/10 border border-[#f87171]/25">
                Action Fails
              </span>
            </div>
          </div>
        </div>

        {/* "Losing a life" explainer */}
        <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">🃏</div>
            <div>
              <p className="font-black text-white text-sm uppercase tracking-tight mb-1">What "Losing a Life" Means</p>
              <p className="text-white/45 text-sm leading-relaxed">
                You discard one of your 2 hidden cards face-up for all to see. Everyone now knows one of your true identities. Lose both cards and you're <span className="text-[#f87171] font-bold">eliminated</span> from the game.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WIN CONDITION ────────────────────────────────────────────────────────────
function WinSection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.win-item', {
        y: 35, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative bg-[#080e0b] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[120px] opacity-8" style={{ background: '#2e8b57' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
        <SectionLabel>Win Condition</SectionLabel>
        <div className="win-item text-7xl mb-6">👑</div>
        <h2 className="win-item text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Last Boss Standing</h2>
        <p className="win-item text-white/45 text-base max-w-xl mx-auto mb-12 leading-relaxed">
          Eliminate all opponents by making them lose both hidden cards. Hold at least one card at the end — and you win.
        </p>

        <div className="win-item grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          <div className="bg-gradient-to-b from-[#f87171]/10 to-transparent border border-[#f87171]/25 rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f87171]/15 flex items-center justify-center text-base">💸</div>
              <span className="font-black text-[#f87171] text-sm uppercase tracking-tight">Eliminate (7 coins)</span>
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-3">Pay 7 coins from your supply. Target immediately discards 1 card face-up. Unblockable and unchallengeable.</p>
            <Coins count={7} color="#f87171" minus />
          </div>
          <div className="bg-gradient-to-b from-[#facc15]/10 to-transparent border border-[#facc15]/25 rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#facc15]/15 flex items-center justify-center text-base">⚔️</div>
              <span className="font-black text-[#facc15] text-sm uppercase tracking-tight">Catch a Lie</span>
            </div>
            <p className="text-white/45 text-sm leading-relaxed">Successfully challenge a bluff — the liar loses a life for free. No coins needed. Read your opponents well.</p>
          </div>
        </div>

        <div className="win-item bg-[#2e8b57]/10 border border-[#2e8b57]/30 rounded-2xl p-6 max-w-lg mx-auto">
          <p className="text-[#4ade80] font-bold text-sm leading-relaxed">
            The best players mix both — hoard coins when needed, call bluffs when confident. Trust no one.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div className="bg-[#050a07] border-t border-white/5 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white/20 text-xs uppercase tracking-widest font-bold mb-1">You've got the rules</p>
          <p className="text-white font-black text-xl">Ready to play?</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/syndicate" className="bg-[#2e8b57] text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#3ba86a] transition-colors shadow-lg shadow-[#2e8b57]/20">
            Buy The Syndicate
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
export default function HowToPlaySyndicate() {
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="bg-[#050a07] min-h-screen">
      <HeroSection />
      <SetupSection />
      <ActionsSection />
      <TurnSection />
      <ChallengeSection />
      <WinSection />
      <Footer />
    </div>
  );
}
