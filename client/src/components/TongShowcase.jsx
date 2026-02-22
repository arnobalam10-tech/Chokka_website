import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flyToCart } from '../utils/cartAnimation';

// 8 gradient fallbacks matching Tong's red/warm theme
const FALLBACK_GRADIENTS = [
  'linear-gradient(145deg, #e63946, #5c0f15)',
  'linear-gradient(145deg, #b82d3a, #3a0a10)',
  'linear-gradient(145deg, #ff4d5a, #8b1a25)',
  'linear-gradient(145deg, #c44536, #3a0a10)',
  'linear-gradient(145deg, #e63946, #7a1a24)',
  'linear-gradient(145deg, #a52a2a, #3a0a10)',
  'linear-gradient(145deg, #d44, #5c0f15)',
  'linear-gradient(145deg, #c0392b, #3a0a10)',
];

export default function TongShowcase({ product, images, onBuyClick }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        // DESKTOP — cards slide from sides and flip
        '(min-width: 768px)': function () {
          const leftCards = gsap.utils.toArray('.tong-card-left');
          const rightCards = gsap.utils.toArray('.tong-card-right');

          gsap.from(leftCards, {
            x: -300,
            opacity: 0,
            rotateY: 180,
            scale: 0.6,
            stagger: 0.06,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              end: 'center center',
              scrub: 1.2,
            },
          });

          gsap.from(rightCards, {
            x: 300,
            opacity: 0,
            rotateY: -180,
            scale: 0.6,
            stagger: 0.06,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              end: 'center center',
              scrub: 1.2,
            },
          });

          gsap.from('.tong-text', {
            y: 50,
            opacity: 0,
            scrollTrigger: {
              trigger: '.tong-text',
              start: 'top 88%',
              end: 'top 65%',
              scrub: 1,
            },
          });
        },

        // MOBILE — same slide + flip animation, adjusted for smaller screens
        '(max-width: 767px)': function () {
          const leftCards = gsap.utils.toArray('.tong-card-left');
          const rightCards = gsap.utils.toArray('.tong-card-right');

          gsap.from(leftCards, {
            x: -150,
            opacity: 0,
            rotateY: 120,
            scale: 0.5,
            stagger: 0.08,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              end: 'top 40%',
              scrub: 1,
            },
          });

          gsap.from(rightCards, {
            x: 150,
            opacity: 0,
            rotateY: -120,
            scale: 0.5,
            stagger: 0.08,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              end: 'top 40%',
              scrub: 1,
            },
          });

          gsap.from('.tong-text', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.tong-text',
              start: 'top 92%',
            },
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleBuy = (e) => {
    flyToCart(e.currentTarget);
    setTimeout(() => onBuyClick(product), 900);
  };

  // Build 8 cards — use images when available, gradient fallback otherwise
  const cards = Array.from({ length: 8 }, (_, i) => ({
    image: images && images[i] ? images[i].image_url : null,
    gradient: FALLBACK_GRADIENTS[i],
  }));

  const leftCards = cards.slice(0, 4);
  const rightCards = cards.slice(4, 8);

  const renderCard = (card) =>
    card.image ? (
      <img src={card.image} alt="Tong Card" loading="lazy" decoding="async" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-white/15 font-black text-xl md:text-3xl select-none">T</span>
      </div>
    );

  return (
    <section
      id="tong"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 bg-[#1a3325] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Cards Display — elongated, responsive sizes */}
        <div
          className="flex justify-center gap-1.5 md:gap-4 mb-14 md:mb-20 flex-wrap"
          style={{ perspective: '900px' }}
        >
          {leftCards.map((card, i) => (
            <div
              key={`l-${i}`}
              className="tong-card tong-card-left w-[72px] h-[115px] md:w-[110px] md:h-[176px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
              style={{
                background: card.image ? 'none' : card.gradient,
                transformStyle: 'preserve-3d',
              }}
            >
              {renderCard(card)}
            </div>
          ))}

          {rightCards.map((card, i) => (
            <div
              key={`r-${i}`}
              className="tong-card tong-card-right w-[72px] h-[115px] md:w-[110px] md:h-[176px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
              style={{
                background: card.image ? 'none' : card.gradient,
                transformStyle: 'preserve-3d',
              }}
            >
              {renderCard(card)}
            </div>
          ))}
        </div>

        {/* Text + CTA */}
        <div className="tong-text text-center max-w-3xl mx-auto">
          <span className="text-[#e63946] font-bold uppercase tracking-widest text-xs md:text-sm">
            Bluffing &amp; Chaos
          </span>
          <h2 className="text-4xl md:text-7xl font-black text-[#f8f5e6] uppercase tracking-tighter leading-[0.85] mt-2 mb-4">
            Tong
          </h2>
          <p className="text-base md:text-xl text-[#f8f5e6]/50 font-medium max-w-xl mx-auto mb-8">
            Cha, Bon, Paan, Muri. Pass the cards, keep a straight face.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleBuy}
              className="bg-[#e63946] text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#ff4d5a] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]"
            >
              <ShoppingCart size={20} /> Buy Now &bull; {product?.price || '---'}৳
            </button>
            <Link
              to="/tong"
              className="bg-[#f8f5e6] text-[#1a3325] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-white transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]"
            >
              <Eye size={20} /> View Product
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
