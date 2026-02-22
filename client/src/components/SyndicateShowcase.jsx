import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flyToCart } from '../utils/cartAnimation';

// 5 gradient fallbacks for when images aren't uploaded yet
const FALLBACK_GRADIENTS = [
  'linear-gradient(145deg, #2e8b57, #0a1a11)',
  'linear-gradient(145deg, #1a5035, #0a1a11)',
  'linear-gradient(145deg, #3ba86a, #0f2e1c)',
  'linear-gradient(145deg, #245a3a, #0a1a11)',
  'linear-gradient(145deg, #2e8b57, #1a3325)',
];

export default function SyndicateShowcase({ product, images, onBuyClick }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        // DESKTOP
        '(min-width: 768px)': function () {
          const leftCards = gsap.utils.toArray('.syn-card-left');
          const rightCards = gsap.utils.toArray('.syn-card-right');

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

          gsap.from('.syn-text', {
            y: 50,
            opacity: 0,
            scrollTrigger: {
              trigger: '.syn-text',
              start: 'top 88%',
              end: 'top 65%',
              scrub: 1,
            },
          });
        },

        // MOBILE — same slide + flip animation, adjusted for smaller screens
        '(max-width: 767px)': function () {
          const leftCards = gsap.utils.toArray('.syn-card-left');
          const rightCards = gsap.utils.toArray('.syn-card-right');

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

          gsap.from('.syn-text', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.syn-text',
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

  // Build 5 cards — use images when available, gradient fallback otherwise
  const cards = Array.from({ length: 5 }, (_, i) => ({
    image: images && images[i] ? images[i].image_url : null,
    gradient: FALLBACK_GRADIENTS[i],
  }));

  const leftCards = cards.slice(0, 3);
  const rightCards = cards.slice(3, 5);

  const renderCard = (card) =>
    card.image ? (
      <img src={card.image} alt="Syndicate Card" loading="lazy" decoding="async" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-white/15 font-black text-xl md:text-3xl select-none">S</span>
      </div>
    );

  return (
    <section
      id="syndicate"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 bg-[#f8f5e6] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Cards Display — responsive sizes */}
        <div
          className="flex justify-center gap-1.5 md:gap-5 mb-14 md:mb-20"
          style={{ perspective: '900px' }}
        >
          {leftCards.map((card, i) => (
            <div
              key={`l-${i}`}
              className="syn-card syn-card-left w-[66px] h-[92px] md:w-[130px] md:h-[182px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
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
              className="syn-card syn-card-right w-[66px] h-[92px] md:w-[130px] md:h-[182px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
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
        <div className="syn-text text-center max-w-3xl mx-auto">
          <span className="text-[#2e8b57] font-bold uppercase tracking-widest text-xs md:text-sm">
            Strategy &amp; Deception
          </span>
          <h2 className="text-4xl md:text-7xl font-black text-[#1a3325] uppercase tracking-tighter leading-[0.85] mt-2 mb-4">
            The Syndicate
          </h2>
          <p className="text-base md:text-xl text-[#1a3325]/60 font-medium max-w-xl mx-auto mb-8">
            Trust No One. Betray Everyone. The Ultimate Game of Power &amp; Deception.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleBuy}
              className="bg-[#1a3325] text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#2e8b57] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]"
            >
              <ShoppingCart size={20} /> Buy Now &bull; {product?.price || '---'}৳
            </button>
            <Link
              to="/syndicate"
              className="bg-[#2e8b57] text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#3ba86a] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]"
            >
              <Eye size={20} /> View Product
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
