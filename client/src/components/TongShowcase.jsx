import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flyToCart } from '../utils/cartAnimation';

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

export default function TongShowcase({ product, images, onBuyClick, onBuyNow }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        '(min-width: 768px)': function () {
          const leftCards = gsap.utils.toArray('.tong-card-left');
          const rightCards = gsap.utils.toArray('.tong-card-right');

          gsap.from(leftCards, {
            x: -300, opacity: 0, rotateY: 180, scale: 0.6, stagger: 0.06,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', end: 'center center', scrub: 1.2 },
          });
          gsap.from(rightCards, {
            x: 300, opacity: 0, rotateY: -180, scale: 0.6, stagger: 0.06,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', end: 'center center', scrub: 1.2 },
          });
          gsap.from('.tong-text', {
            y: 50, opacity: 0,
            scrollTrigger: { trigger: '.tong-text', start: 'top 88%', end: 'top 65%', scrub: 1 },
          });
          gsap.from('.tong-box-img', {
            y: 70, opacity: 0, scale: 0.88,
            ease: 'power3.out', duration: 0.9,
            scrollTrigger: { trigger: '.tong-box-img', start: 'top 88%', toggleActions: 'play none none reverse' },
          });
        },
        '(max-width: 767px)': function () {
          const leftCards = gsap.utils.toArray('.tong-card-left');
          const rightCards = gsap.utils.toArray('.tong-card-right');

          gsap.from(leftCards, {
            x: -150, opacity: 0, rotateY: 120, scale: 0.5, stagger: 0.08,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 40%', scrub: 1 },
          });
          gsap.from(rightCards, {
            x: 150, opacity: 0, rotateY: -120, scale: 0.5, stagger: 0.08,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 40%', scrub: 1 },
          });
          gsap.from('.tong-text', {
            y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: '.tong-text', start: 'top 92%' },
          });
          gsap.from('.tong-box-img', {
            y: 50, opacity: 0, scale: 0.9,
            ease: 'power3.out', duration: 0.7,
            scrollTrigger: { trigger: '.tong-box-img', start: 'top 90%', toggleActions: 'play none none reverse' },
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
    <section id="tong" ref={sectionRef} className="relative py-24 md:py-32 px-4 bg-[#1a3325] overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Card fan */}
        <div className="flex justify-center gap-1.5 md:gap-4 mb-14 md:mb-20 flex-wrap" style={{ perspective: '900px' }}>
          {leftCards.map((card, i) => (
            <div key={`l-${i}`} className="tong-card tong-card-left w-[72px] h-[115px] md:w-[110px] md:h-[176px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
              style={{ background: card.image ? 'none' : card.gradient, transformStyle: 'preserve-3d' }}>
              {renderCard(card)}
            </div>
          ))}
          {rightCards.map((card, i) => (
            <div key={`r-${i}`} className="tong-card tong-card-right w-[72px] h-[115px] md:w-[110px] md:h-[176px] rounded-lg md:rounded-xl shadow-xl overflow-hidden"
              style={{ background: card.image ? 'none' : card.gradient, transformStyle: 'preserve-3d' }}>
              {renderCard(card)}
            </div>
          ))}
        </div>

        {/* Text + CTA */}
        <div className="tong-text text-center max-w-3xl mx-auto">
          <span className="text-[#e63946] font-bold uppercase tracking-widest text-xs md:text-sm">Bluffing &amp; Chaos</span>
          <h2 className="text-4xl md:text-7xl font-black text-[#f8f5e6] uppercase tracking-tighter leading-[0.85] mt-2 mb-4">Tong</h2>
          <p className="text-base md:text-xl text-[#f8f5e6]/50 font-medium max-w-xl mx-auto mb-8">
            Cha, Bon, Paan, Muri. Pass the cards, keep a straight face.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            <button onClick={handleAddToCart} className="bg-[#1a3325] text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#e63946] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]">
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button onClick={() => onBuyNow(product)} className="bg-[#e63946] text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#ff4d5a] transition-colors flex items-center gap-3 shadow-lg active:scale-[0.97]">
              Buy Now &bull; {product?.price || '---'}৳
            </button>
            <Link to="/tong" className="bg-[#f8f5e6]/15 border border-[#f8f5e6]/30 text-[#f8f5e6] px-8 py-4 md:px-10 font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-[#f8f5e6]/20 transition-colors flex items-center gap-3 active:scale-[0.97]">
              <Eye size={20} /> View Product
            </Link>
          </div>
        </div>

        {/* Box showcase — info left, image right (mirrored from Syndicate) */}
        <div className="mt-24 md:mt-32">
          <div className="flex items-center gap-5 mb-14">
            <div className="flex-1 h-px bg-[#f8f5e6]/10" />
            <span className="text-[#f8f5e6]/25 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">The Physical Game</span>
            <div className="flex-1 h-px bg-[#f8f5e6]/10" />
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-10 md:gap-20">

            {/* Box image card */}
            <div className="tong-box-img flex-shrink-0 w-[280px] md:w-[380px] rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(160deg, #243d2e, #1a2e22)' }}>
              {/* Accent top bar */}
              <div className="h-[3px] bg-[#e63946]" />
              <div className="p-5 md:p-7">
                <img
                  src="/cards/tong/box.webp"
                  alt="Tong Box"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <div className="px-5 md:px-7 pb-5 flex items-center justify-between">
                <span className="text-[#f8f5e6]/40 font-black uppercase tracking-widest text-[10px]">Tong</span>
                <span className="text-[#e63946] font-black uppercase tracking-widest text-[10px]">500৳</span>
              </div>
            </div>

            {/* Info */}
            <div className="max-w-xs text-center md:text-left">
              <p className="text-[#e63946] font-black uppercase tracking-widest text-xs mb-3">Premium Card Game</p>
              <h3 className="text-2xl md:text-3xl font-black text-[#f8f5e6] uppercase tracking-tight mb-4 leading-tight">
                Beautifully Packaged
              </h3>
              <p className="text-[#f8f5e6]/45 font-medium text-sm md:text-base leading-relaxed">
                High-quality card stock, bold artwork, and a box built to survive game nights. Makes the perfect gift.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                {['110+ Cards', 'Matte Finish', 'Gift Ready'].map(tag => (
                  <span key={tag} className="border border-[#f8f5e6]/15 text-[#f8f5e6]/45 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
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
