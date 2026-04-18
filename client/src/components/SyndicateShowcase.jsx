import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flyToCart } from '../utils/cartAnimation';

const FALLBACK_GRADIENTS = [
  'linear-gradient(145deg, #2e8b57, #0a1a11)',
  'linear-gradient(145deg, #1a5035, #0a1a11)',
  'linear-gradient(145deg, #3ba86a, #0f2e1c)',
  'linear-gradient(145deg, #245a3a, #0a1a11)',
  'linear-gradient(145deg, #2e8b57, #1a3325)',
];

export default function SyndicateShowcase({ product, images, onBuyClick, onBuyNow }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        '(min-width: 768px)': function () {
          const leftCards = gsap.utils.toArray('.syn-card-left');
          const rightCards = gsap.utils.toArray('.syn-card-right');

          gsap.from(leftCards, {
            x: -300, opacity: 0, rotateY: 180, scale: 0.6, stagger: 0.06,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', end: 'center center', scrub: 1.2 },
          });
          gsap.from(rightCards, {
            x: 300, opacity: 0, rotateY: -180, scale: 0.6, stagger: 0.06,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', end: 'center center', scrub: 1.2 },
          });
          gsap.from('.syn-text', {
            y: 50, opacity: 0,
            scrollTrigger: { trigger: '.syn-text', start: 'top 88%', end: 'top 65%', scrub: 1 },
          });
          gsap.from('.syn-box-img', {
            y: 70, opacity: 0, scale: 0.88,
            ease: 'power3.out', duration: 0.9,
            scrollTrigger: { trigger: '.syn-box-img', start: 'top 88%', toggleActions: 'play none none reverse' },
          });
        },
        '(max-width: 767px)': function () {
          const leftCards = gsap.utils.toArray('.syn-card-left');
          const rightCards = gsap.utils.toArray('.syn-card-right');

          gsap.from(leftCards, {
            x: -150, opacity: 0, rotateY: 120, scale: 0.5, stagger: 0.08,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 40%', scrub: 1 },
          });
          gsap.from(rightCards, {
            x: 150, opacity: 0, rotateY: -120, scale: 0.5, stagger: 0.08,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 40%', scrub: 1 },
          });
          gsap.from('.syn-text', {
            y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: '.syn-text', start: 'top 92%' },
          });
          gsap.from('.syn-box-img', {
            y: 50, opacity: 0, scale: 0.9,
            ease: 'power3.out', duration: 0.7,
            scrollTrigger: { trigger: '.syn-box-img', start: 'top 90%', toggleActions: 'play none none reverse' },
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
    <section id="syndicate" ref={sectionRef} className="relative py-24 md:py-32 px-4 bg-[#f8f5e6] overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Card fan */}
        <div className="flex justify-center gap-1.5 md:gap-5 mb-14 md:mb-20" style={{ perspective: '900px' }}>
          {leftCards.map((card, i) => (
            <div key={`l-${i}`} className="syn-card syn-card-left w-[66px] h-[92px] md:w-[130px] md:h-[182px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
              style={{ background: card.image ? 'none' : card.gradient, transformStyle: 'preserve-3d' }}>
              {renderCard(card)}
            </div>
          ))}
          {rightCards.map((card, i) => (
            <div key={`r-${i}`} className="syn-card syn-card-right w-[66px] h-[92px] md:w-[130px] md:h-[182px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
              style={{ background: card.image ? 'none' : card.gradient, transformStyle: 'preserve-3d' }}>
              {renderCard(card)}
            </div>
          ))}
        </div>

        {/* Text + CTA */}
        <div className="syn-text text-center max-w-3xl mx-auto">
          <span className="text-[#2e8b57] font-bold uppercase tracking-widest text-xs md:text-sm">Strategy &amp; Deception</span>
          <h2 className="text-4xl md:text-7xl font-black text-[#1a3325] uppercase tracking-tighter leading-[0.85] mt-2 mb-4">The Syndicate</h2>
          <p className="text-base md:text-xl text-[#1a3325]/60 font-medium max-w-xl mx-auto mb-8">
            Trust No One. Betray Everyone. The Ultimate Game of Power &amp; Deception.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            <button onClick={handleAddToCart} className="bg-[#1a3325] text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#2e8b57] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]">
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button onClick={() => onBuyNow(product)} className="bg-[#2e8b57] text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#3ba86a] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]">
              Buy Now &bull; {product?.price || '---'}৳
            </button>
            <Link to="/syndicate" className="border-2 border-[#1a3325] text-[#1a3325] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#1a3325]/5 transition-colors flex items-center gap-3 active:scale-[0.97]">
              <Eye size={20} /> View Product
            </Link>
          </div>
        </div>

        {/* Box showcase */}
        <div className="mt-24 md:mt-32">
          {/* Divider */}
          <div className="flex items-center gap-5 mb-14">
            <div className="flex-1 h-px bg-[#1a3325]/12" />
            <span className="text-[#1a3325]/35 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">The Physical Game</span>
            <div className="flex-1 h-px bg-[#1a3325]/12" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">

            {/* Box image card */}
            <div className="syn-box-img flex-shrink-0 w-[280px] md:w-[380px] rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(160deg, #ffffff, #f0ede0)' }}>
              {/* Accent top bar */}
              <div className="h-[3px] bg-[#2e8b57]" />
              <div className="p-5 md:p-7">
                <img
                  src="/cards/syndicate/box.webp"
                  alt="The Syndicate Box"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <div className="px-5 md:px-7 pb-5 flex items-center justify-between">
                <span className="text-[#1a3325]/40 font-black uppercase tracking-widest text-[10px]">The Syndicate</span>
                <span className="text-[#2e8b57] font-black uppercase tracking-widest text-[10px]">360৳</span>
              </div>
            </div>

            {/* Info text beside the box */}
            <div className="max-w-xs text-center md:text-left">
              <p className="text-[#2e8b57] font-black uppercase tracking-widest text-xs mb-3">Premium Card Game</p>
              <h3 className="text-2xl md:text-3xl font-black text-[#1a3325] uppercase tracking-tight mb-4 leading-tight">
                Beautifully Packaged
              </h3>
              <p className="text-[#1a3325]/55 font-medium text-sm md:text-base leading-relaxed">
                High-quality card stock, bold artwork, and a box built to survive game nights. Makes the perfect gift.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                {['110+ Cards', 'Matte Finish', 'Gift Ready'].map(tag => (
                  <span key={tag} className="border border-[#1a3325]/20 text-[#1a3325]/60 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
