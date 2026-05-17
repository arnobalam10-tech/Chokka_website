import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import {
  ArrowLeft, ChevronDown, Users, Clock, Layers, BookOpen,
  AlertTriangle, CheckCircle, XCircle, ArrowRight, RefreshCw
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: <Users size={18} />, label: 'Players', value: '3 – 6' },
  { icon: <Clock size={18} />, label: 'Playtime', value: '15–25 min' },
  { icon: <Layers size={18} />, label: 'Cards', value: '64 Total' },
  { icon: '🎭', label: 'Vibe', value: 'Bluffing & Chaos' },
];

const FOODS = [
  { name: 'Cha', bengali: 'চা', img: '/cards/tong/front-1.webp', color: '#92400e', bg: '#78350f' },
  { name: 'Sosa', bengali: 'সোসা', img: '/cards/tong/front-2.webp', color: '#15803d', bg: '#14532d' },
  { name: 'Paan', bengali: 'পান', img: '/cards/tong/front-3.webp', color: '#16a34a', bg: '#14532d' },
  { name: 'Toast', bengali: 'টোস্ট', img: '/cards/tong/front-4.webp', color: '#b45309', bg: '#78350f' },
  { name: 'Kola', bengali: 'কলা', img: '/cards/tong/front-5.webp', color: '#ca8a04', bg: '#713f12' },
  { name: 'Shorshe Ilish', bengali: 'সরষে ইলিশ', img: '/cards/tong/front-6.webp', color: '#0e7490', bg: '#164e63' },
  { name: 'Dry Cake', bengali: 'ড্রাই কেক', img: '/cards/tong/front-7.webp', color: '#c2410c', bg: '#7c2d12' },
  { name: 'Muri', bengali: 'মুড়ি', img: '/cards/tong/front-8.webp', color: '#a16207', bg: '#713f12' },
];

const ELIMINATION_RULES = [
  {
    icon: '🃏', color: '#f87171',
    title: '4 of the Same',
    desc: 'You collect 4 cards showing the same food item. Example: 4 Cha cards in front of you.',
    example: '🍵 🍵 🍵 🍵',
  },
  {
    icon: '🌈', color: '#fb923c',
    title: '8 Different Items',
    desc: 'You have 1 card of every food type in front of you — all 8 different items.',
    example: '🍵 🥤 🌿 🍞 🍌 🐟 🎂 🍚',
  },
  {
    icon: '✋', color: '#fbbf24',
    title: 'Empty Hand',
    desc: 'You have no cards left in your hand to pass. You must accept — and if that eliminates you, you\'re out.',
    example: '∅ Hand',
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-px flex-1 bg-white/8" />
      <span className="text-[#e63946] font-black uppercase tracking-[0.25em] text-[11px] whitespace-nowrap">{children}</span>
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
        { y: 90, opacity: 0, scale: 0.55 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.07, duration: 0.9, ease: 'back.out(1.5)', delay: 0.25 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const rotations = [-28, -20, -12, -4, 4, 12, 20, 28];
  const yShifts   = [30, 16, 7, 2, 2, 7, 16, 30];

  return (
    <div ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0608 0%, #070204 75%)' }}>

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full opacity-10 blur-[90px]" style={{ background: '#e63946' }} />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full opacity-8 blur-[70px]" style={{ background: '#fb923c' }} />
      </div>

      <Link to="/" className="absolute top-5 left-5 flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest z-10">
        <ArrowLeft size={14} /> Home
      </Link>

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={14} className="text-[#e63946]" />
          <span className="text-[#e63946] font-black uppercase tracking-[0.3em] text-[11px]">How to Play</span>
        </div>

        <h1 className="text-6xl md:text-[100px] font-black text-white uppercase tracking-tighter leading-none text-center mb-3">
          T<span className="text-[#e63946]">ONG</span>
        </h1>
        <p className="text-white/40 text-sm md:text-lg font-medium text-center max-w-lg mb-14">
          Pass cards. Make claims. Don't get caught with the food.
        </p>

        {/* 8-card fan */}
        <div className="flex justify-center items-end mb-14" style={{ perspective: '1000px', gap: '4px' }}>
          {FOODS.map((food, i) => (
            <div
              key={food.name}
              ref={el => (cardRefs.current[i] = el)}
              style={{
                transform: `rotate(${rotations[i]}deg) translateY(${yShifts[i]}px)`,
                filter: `drop-shadow(0 6px 18px ${food.color}60)`,
              }}
              className="relative w-[50px] h-[70px] md:w-[85px] md:h-[119px] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 hover:-translate-y-4 hover:z-20 cursor-pointer group border border-white/10"
            >
              <img src={food.img} alt={food.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-white font-black text-[8px] md:text-[10px] uppercase text-center leading-tight">{food.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
              <span className="text-[#e63946]">{typeof s.icon === 'string' ? <span className="text-base">{s.icon}</span> : s.icon}</span>
              <span className="text-white/30 text-[9px] uppercase tracking-widest font-bold">{s.label}</span>
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
      gsap.from('.setup-food', {
        y: 30, opacity: 0, scale: 0.85, stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 78%', end: 'top 30%', scrub: 1 },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bg-[#060103]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Setup</SectionLabel>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4 text-center">
          The 8 Food Types
        </h2>
        <p className="text-white/35 text-sm text-center max-w-md mx-auto mb-12">
          64 cards total — 8 cards of each food type. Shuffle all and deal roughly equally among players.
        </p>

        {/* Food grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-10">
          {FOODS.map((food, i) => (
            <div key={food.name} className="setup-food flex flex-col items-center gap-2">
              <div
                className="w-full aspect-[2/3] rounded-xl overflow-hidden border-2 shadow-lg transition-all hover:scale-105"
                style={{ borderColor: food.color + '60', boxShadow: `0 4px 16px ${food.color}30` }}
              >
                <img src={food.img} alt={food.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <p className="text-white font-black text-[10px] md:text-xs uppercase leading-tight">{food.name}</p>
                <p className="text-white/30 text-[9px]">{food.bengali}</p>
                <p className="text-white/20 text-[9px] font-bold">×8 cards</p>
              </div>
            </div>
          ))}
        </div>

        {/* Setup steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', color: '#e63946', icon: '🔀', title: 'Shuffle All 64', desc: 'Shuffle the full deck. All 8 food types mixed together.' },
            { step: '2', color: '#fb923c', icon: '🤲', title: 'Deal to Players', desc: "Distribute cards among players roughly equally. You don't need even hands." },
            { step: '3', color: '#fbbf24', icon: '🤫', title: 'Keep Secret', desc: 'Hold your hand face-down. Nobody knows what anyone else has.' },
          ].map(s => (
            <div key={s.step} className="relative bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
              <div className="absolute -top-3 left-4 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full" style={{ backgroundColor: s.color, color: '#fff' }}>Step {s.step}</div>
              <div className="text-3xl mb-3 mt-2">{s.icon}</div>
              <h3 className="font-black text-white text-sm uppercase mb-1">{s.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
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
      num: 1, icon: '👤', color: '#e63946',
      label: 'Choose Your Target',
      short: 'Pick any other player to send a card to.',
      detail: 'Select any opponent at the table. Slide 1 card face-down across to them — nobody else can see what it is, not even the receiver yet.',
      visual: (
        <div className="flex items-center gap-3 mt-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-14 rounded-lg bg-[#e63946]/20 border-2 border-[#e63946]/40 flex items-center justify-center">
              <span className="text-[#e63946] font-black text-xs">YOU</span>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="h-px flex-1 border-t-2 border-dashed border-[#e63946]/40" />
            <ArrowRight size={14} className="text-[#e63946]" />
          </div>
          <div className="w-10 h-14 rounded-lg bg-white/8 border-2 border-white/20 flex items-center justify-center">
            <span className="text-white/40 font-black text-[10px]">?</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-14 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center">
              <span className="text-white/25 font-black text-[10px]">TARGET</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 2, icon: '🗣️', color: '#fb923c',
      label: 'Make Your Claim',
      short: 'Say out loud what food item the card is.',
      detail: "You announce what the face-down card is — but you can TRUTH or LIE. Say 'This is a Cha' whether it's actually a Cha or a Muri. Bluff wisely — your opponents are watching your face.",
      visual: (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#4ade80]/8 border border-[#4ade80]/25 rounded-xl p-3 text-center">
            <p className="text-[#4ade80] font-black text-xs uppercase mb-1">Truth</p>
            <p className="text-white/40 text-[10px]">Card IS what you claim. Safe if accepted honestly.</p>
          </div>
          <div className="bg-[#f87171]/8 border border-[#f87171]/25 rounded-xl p-3 text-center">
            <p className="text-[#f87171] font-black text-xs uppercase mb-1">Lie</p>
            <p className="text-white/40 text-[10px]">Card is NOT what you claim. Risky — get caught and it backfires.</p>
          </div>
        </div>
      ),
    },
    {
      num: 3, icon: '🤔', color: '#fbbf24',
      label: 'Target Decides',
      short: 'The receiver chooses: Accept or Reject.',
      detail: "The target player must now decide: Accept the card (take it and then guess truth/lie), or Reject it (look secretly and pass it to someone else). They can't do nothing — they must choose.",
      visual: (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#2672b0]/10 border border-[#2672b0]/30 rounded-xl p-3 text-center">
            <p className="text-[#60a5fa] font-black text-xs uppercase mb-1">✋ Accept</p>
            <p className="text-white/40 text-[10px]">Take the card. Then guess: truth or lie?</p>
          </div>
          <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded-xl p-3 text-center">
            <p className="text-[#a78bfa] font-black text-xs uppercase mb-1">❌ Reject</p>
            <p className="text-white/40 text-[10px]">Look secretly and pass it on to someone else.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div ref={ref} className="bg-[#080205]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Your Turn</SectionLabel>
        <div className="turn-head text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">How a Turn Works</h2>
          <p className="text-white/35 text-sm max-w-md mx-auto">Three steps every turn — pass, claim, decide.</p>
        </div>

        {/* Visual flow (desktop) */}
        <div className="hidden md:flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <button onClick={() => setActiveStep(i)} className="flex flex-col items-center gap-2 cursor-pointer">
                <div
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-300"
                  style={{
                    borderColor: activeStep === i ? s.color : 'rgba(255,255,255,0.1)',
                    backgroundColor: activeStep === i ? s.color + '25' : 'transparent',
                    boxShadow: activeStep === i ? `0 0 20px ${s.color}40` : 'none',
                  }}
                >
                  {s.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: activeStep === i ? s.color : 'rgba(255,255,255,0.25)' }}>
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className="w-16 h-px mx-3" style={{ background: `linear-gradient(90deg,${steps[i].color}50,${steps[i + 1].color}50)` }} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => {
            const isOpen = activeStep === i;
            return (
              <motion.div key={i} layout
                className="rounded-2xl border overflow-hidden cursor-pointer"
                style={{ borderColor: isOpen ? step.color + '50' : 'rgba(255,255,255,0.06)', background: isOpen ? `linear-gradient(135deg,${step.color}10,rgba(8,2,5,0.8))` : 'rgba(255,255,255,0.02)' }}
                onClick={() => setActiveStep(isOpen ? -1 : i)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm flex-shrink-0 transition-all"
                    style={{ borderColor: isOpen ? step.color : 'rgba(255,255,255,0.12)', color: isOpen ? step.color : 'rgba(255,255,255,0.25)', backgroundColor: isOpen ? step.color + '18' : 'transparent' }}>
                    {step.num}
                  </div>
                  <div className="text-xl flex-shrink-0">{step.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-white text-base md:text-lg uppercase tracking-tight">{step.label}</h3>
                    <p className="text-white/35 text-xs mt-0.5">{step.short}</p>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/20 flex-shrink-0">
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-5 pb-5 pl-[72px]">
                        <p className="text-white/55 text-sm leading-relaxed">{step.detail}</p>
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

// ─── RECEIVING ────────────────────────────────────────────────────────────────
function ReceivingSection() {
  const [mode, setMode] = useState('accept');
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.recv-head', {
        y: 30, opacity: 0, duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bg-[#060103]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Receiving a Card</SectionLabel>
        <div className="recv-head text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">Accept or Reject?</h2>
          <p className="text-white/35 text-sm max-w-lg mx-auto">When someone passes you a card, you must decide immediately.</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { key: 'accept', label: '✋ Accept', color: '#e63946' },
            { key: 'reject', label: '❌ Reject', color: '#7c3aed' },
          ].map(o => (
            <button key={o.key} onClick={() => setMode(o.key)}
              className="px-7 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all border"
              style={{
                backgroundColor: mode === o.key ? o.color + '25' : 'transparent',
                borderColor: mode === o.key ? o.color : 'rgba(255,255,255,0.1)',
                color: mode === o.key ? o.color : 'rgba(255,255,255,0.35)',
                boxShadow: mode === o.key ? `0 0 20px ${o.color}30` : 'none',
              }}>
              {o.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'accept' ? (
            <motion.div key="accept" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <div className="bg-[#e63946]/8 border border-[#e63946]/25 rounded-2xl overflow-hidden">
                <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg,transparent,#e63946,transparent)' }} />
                <div className="p-6">
                  <p className="text-white/55 text-sm leading-relaxed mb-6">
                    You take the card. Now you must guess whether the sender told the truth or lied. Announce your guess out loud, then flip the card to reveal.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#4ade80]/8 border border-[#4ade80]/25 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={16} className="text-[#4ade80]" />
                        <span className="font-black text-[#4ade80] text-sm uppercase">Guess Correct</span>
                      </div>
                      <p className="text-white/45 text-xs leading-relaxed">
                        You guessed right about whether they were lying or telling the truth.
                      </p>
                      <div className="mt-3 bg-[#4ade80]/10 rounded-lg p-2.5">
                        <p className="text-[#4ade80] font-bold text-xs">→ Sender keeps the card (bad for them)</p>
                      </div>
                    </div>
                    <div className="bg-[#f87171]/8 border border-[#f87171]/25 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle size={16} className="text-[#f87171]" />
                        <span className="font-black text-[#f87171] text-sm uppercase">Guess Wrong</span>
                      </div>
                      <p className="text-white/45 text-xs leading-relaxed">
                        You called it wrong — got fooled either way.
                      </p>
                      <div className="mt-3 bg-[#f87171]/10 rounded-lg p-2.5">
                        <p className="text-[#f87171] font-bold text-xs">→ You keep the card (bad for you)</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 bg-white/4 border border-white/8 rounded-xl p-4">
                    <p className="text-white/35 text-xs text-center">
                      Cards kept go face-up in front of you. Anyone can see what you've collected.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="reject" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <div className="bg-[#7c3aed]/8 border border-[#7c3aed]/25 rounded-2xl overflow-hidden">
                <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg,transparent,#7c3aed,transparent)' }} />
                <div className="p-6">
                  <p className="text-white/55 text-sm leading-relaxed mb-6">
                    You don't want to accept the risk. Peek at the card secretly — then pass it to someone else with your own claim (truth or lie).
                  </p>

                  {/* Reject flow diagram */}
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                    {[
                      { icon: '👁️', label: 'Peek secretly', desc: "Look at the card. Don't show anyone." },
                      { arrow: true },
                      { icon: '🎯', label: 'Choose new target', desc: 'NOT the sender. NOT anyone who already rejected this card in this round.' },
                      { arrow: true },
                      { icon: '🗣️', label: 'Make your claim', desc: 'Pass it face-down with your own announcement. Truth or lie — your choice.' },
                    ].map((item, i) =>
                      item.arrow ? (
                        <ArrowRight key={i} size={18} className="text-white/20 flex-shrink-0 rotate-90 md:rotate-0" />
                      ) : (
                        <div key={i} className="flex-1 bg-white/4 border border-white/8 rounded-xl p-4 text-center min-w-0">
                          <div className="text-2xl mb-1">{item.icon}</div>
                          <p className="font-black text-white text-xs uppercase mb-1">{item.label}</p>
                          <p className="text-white/30 text-[10px] leading-relaxed">{item.desc}</p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="bg-[#fbbf24]/8 border border-[#fbbf24]/25 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={14} className="text-[#fbbf24] mt-0.5 flex-shrink-0" />
                      <p className="text-white/50 text-xs leading-relaxed">
                        <span className="text-[#fbbf24] font-bold">Important:</span> If everyone else has already rejected this card in this round, the last remaining player <span className="font-bold text-white/70">must accept</span> — no choice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── ELIMINATION ──────────────────────────────────────────────────────────────
function EliminationSection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.elim-card', {
        y: 40, opacity: 0, scale: 0.9, stagger: 0.12, duration: 0.8, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: ref.current, start: 'top 78%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative bg-[#080205] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full blur-[100px] opacity-12" style={{ background: '#f87171' }} />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 py-20">
        <SectionLabel>Elimination</SectionLabel>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-[#f87171]/10 border border-[#f87171]/30 rounded-full px-5 py-2 mb-4">
            <AlertTriangle size={16} className="text-[#f87171]" />
            <span className="text-[#f87171] font-black text-sm uppercase tracking-widest">Warning</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">How You Get Eliminated</h2>
          <p className="text-white/35 text-sm max-w-md mx-auto">Cards you keep (face-up) pile up. Hit any of these conditions and you're out.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {ELIMINATION_RULES.map((rule, i) => (
            <div key={i} className="elim-card relative bg-[#0a0106] border-2 rounded-2xl p-6 text-center overflow-hidden"
              style={{ borderColor: rule.color + '40' }}>
              {/* Top glow line */}
              <div className="h-[2px] w-full absolute top-0 left-0" style={{ background: `linear-gradient(90deg,transparent,${rule.color},transparent)` }} />
              <div className="text-4xl mb-3">{rule.icon}</div>
              <h3 className="font-black uppercase tracking-tight mb-2" style={{ color: rule.color }}>{rule.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed mb-4">{rule.desc}</p>
              <div className="bg-white/4 border border-white/8 rounded-xl p-3">
                <p className="text-sm">{rule.example}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#f87171]/8 border border-[#f87171]/25 rounded-2xl p-5 flex items-start gap-4">
          <AlertTriangle size={20} className="text-[#f87171] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#f87171] font-black text-sm uppercase mb-1">Important</p>
            <p className="text-white/45 text-sm leading-relaxed">
              The cards you collect go face-up in front of you — everyone can see them. Your opponents will use this to decide which food to send your way.
            </p>
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
        y: 35, opacity: 0, stagger: 0.1, duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 78%', toggleActions: 'play none none reverse' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bg-[#060103]">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <SectionLabel>Win Condition</SectionLabel>
        <div className="win-el text-7xl mb-6">🏆</div>
        <h2 className="win-el text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Last One Alive</h2>
        <p className="win-el text-white/40 text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Don't be the loser. Everyone else gets eliminated one by one. The last player still in the game wins.
        </p>

        <div className="win-el grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6 text-left">
            <p className="text-[#e63946] font-black text-sm uppercase mb-2">✅ Survive by</p>
            <ul className="space-y-2">
              {['Sending dangerous food to others', "Bluffing well so they can't guess your card", 'Rejecting cards that would eliminate you'].map((t, i) => (
                <li key={i} className="text-white/45 text-xs flex items-start gap-2"><span className="text-[#e63946] mt-0.5">→</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6 text-left">
            <p className="text-[#f87171] font-black text-sm uppercase mb-2">❌ Lose by</p>
            <ul className="space-y-2">
              {['Collecting 4 of the same food', 'Collecting all 8 different foods', 'Running out of hand cards'].map((t, i) => (
                <li key={i} className="text-white/45 text-xs flex items-start gap-2"><span className="text-[#f87171] mt-0.5">✗</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="win-el bg-[#e63946]/10 border border-[#e63946]/25 rounded-2xl p-5 max-w-lg mx-auto">
          <p className="text-[#ff6b6b] font-bold text-sm leading-relaxed">
            Strategy tip: Sometimes rejecting is safer than accepting — but you can't reject forever.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div className="bg-[#040102] border-t border-white/5 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white/20 text-xs uppercase tracking-widest font-bold mb-1">You've got the rules</p>
          <p className="text-white font-black text-xl">Ready to play Tong?</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/tong" className="text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors shadow-lg"
            style={{ backgroundColor: '#e63946' }}>
            Buy Tong
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
export default function HowToPlayTong() {
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#070204' }}>
      <HeroSection />
      <SetupSection />
      <TurnSection />
      <ReceivingSection />
      <EliminationSection />
      <WinSection />
      <Footer />
    </div>
  );
}
