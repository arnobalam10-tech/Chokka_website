import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flyToCart } from '../utils/cartAnimation';

// 6 suits — blue palette drawn from the Sholo Ana logo
const SUIT_GRADIENTS = [
  'linear-gradient(145deg, #1a3a6c, #0d1f40)',
  'linear-gradient(145deg, #2672b0, #1a3a6c)',
  'linear-gradient(145deg, #4a9fbc, #1a5070)',
  'linear-gradient(145deg, #1e7eb5, #0d3a5c)',
  'linear-gradient(145deg, #3a8fc4, #1a3a6c)',
  'linear-gradient(145deg, #5cb8d4, #2060a0)',
];

// Suits shown on fallback face-up card
const SUIT_LABELS = ['১', '২', '৩', '৪', '৫', '৬'];

// Slight rotation for each card when laid out in The Line
const CARD_ROTATIONS = [-4, -2, -1, 1, 2, 4];

export default function SholoAnaShowcase({ product, images, onBuyClick, onBuyNow }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        // DESKTOP — cards drop from above and land in a row (The Line mechanic)
        '(min-width: 768px)': function () {
          const cards = gsap.utils.toArray('.sholo-card');

          gsap.from(cards, {
            y: -280,
            opacity: 0,
            rotateZ: (i) => (i % 2 === 0 ? -25 : 25),
            scale: 0.5,
            stagger: 0.08,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              end: 'center center',
              scrub: 1.2,
            },
          });

          gsap.from('.sholo-text', {
            y: 50,
            opacity: 0,
            scrollTrigger: {
              trigger: '.sholo-text',
              start: 'top 88%',
              end: 'top 65%',
              scrub: 1,
            },
          });
        },

        // MOBILE
        '(max-width: 767px)': function () {
          const cards = gsap.utils.toArray('.sholo-card');

          gsap.from(cards, {
            y: -150,
            opacity: 0,
            rotateZ: (i) => (i % 2 === 0 ? -20 : 20),
            scale: 0.4,
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              end: 'top 40%',
              scrub: 1,
            },
          });

          gsap.from('.sholo-text', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.sholo-text',
              start: 'top 92%',
            },
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleAddToCart = (e) => {
    flyToCart(e.currentTarget);
    setTimeout(() => onBuyClick(product), 900);
  };

  // 6 cards = 6 suits, laid out as The Line
  const cards = Array.from({ length: 6 }, (_, i) => ({
    image: images && images[i] ? images[i].image_url : null,
    gradient: SUIT_GRADIENTS[i],
    label: SUIT_LABELS[i],
    rotate: CARD_ROTATIONS[i],
  }));

  const renderCard = (card) =>
    card.image ? (
      <img
        src={card.image}
        alt="Sholo Ana Card"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
        <span className="text-white/60 font-black text-2xl md:text-4xl select-none leading-none">
          {card.label}
        </span>
      </div>
    );

  return (
    <section
      id="sholo-ana"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 bg-[#daeef9] overflow-hidden"
    >
      {/* Subtle watercolour wash overlay matching the logo */}
      <div className="absolute inset-0 opacity-[0.25]"
        style={{ background: 'radial-gradient(ellipse at 20% 30%, #b8d9f0 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, #c8e8f5 0%, transparent 60%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* THE LINE — 6 cards laid flat in a row */}
        <div
          className="flex justify-center gap-2 md:gap-4 mb-14 md:mb-20"
          style={{ perspective: '900px' }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="sholo-card w-[52px] h-[84px] md:w-[100px] md:h-[160px] rounded-lg md:rounded-xl shadow-2xl overflow-hidden"
              style={{
                background: card.image ? 'none' : card.gradient,
                transform: `rotate(${card.rotate}deg)`,
                transformStyle: 'preserve-3d',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px rgba(201,162,39,0.15)',
              }}
            >
              {renderCard(card)}
            </div>
          ))}
        </div>

        {/* Text + CTA */}
        <div className="sholo-text text-center max-w-3xl mx-auto">
          {/* FIRST ORIGINAL badge */}
          <div className="inline-flex items-center gap-2 bg-[#1a3a6c]/10 border border-[#1a3a6c]/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#2672b0] animate-pulse" />
            <span className="text-[#1a3a6c] font-bold uppercase tracking-widest text-xs">
              Chokka's First Original Game
            </span>
          </div>

          <h2 className="text-4xl md:text-7xl font-black text-[#1a3a6c] uppercase tracking-tighter leading-[0.85] mt-2 mb-4">
            Sholo Ana
          </h2>
          <p className="text-base md:text-xl text-[#1a3a6c]/60 font-medium max-w-xl mx-auto mb-8">
            Memory. Deduction. The perfect play. 48 cards, 6 suits, one unbreakable line.
          </p>

          {/* Three mechanic pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {['বদল — Swap', 'উঁকি — Peek', 'দাবি — Claim'].map((m) => (
              <span
                key={m}
                className="bg-[#2672b0]/10 border border-[#2672b0]/30 text-[#1a3a6c] font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full"
              >
                {m}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleAddToCart}
              className="bg-[#1a3a6c] text-white px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#2672b0] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button
              onClick={() => onBuyNow(product)}
              className="bg-[#2672b0] text-white px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#1a3a6c] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]"
            >
              Buy Now &bull; {product?.price || '---'}৳
            </button>
            <Link
              to="/sholo-ana"
              className="bg-[#1a3a6c]/10 border border-[#1a3a6c]/30 text-[#1a3a6c] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#1a3a6c]/15 transition-colors flex items-center gap-3 shadow-sm active:scale-[0.97]"
            >
              <Eye size={20} /> View Product
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
