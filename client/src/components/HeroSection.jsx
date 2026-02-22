import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';

export default function HeroSection({ onShopClick, heroImages }) {
  const HERO_CARDS = [
    { image: heroImages?.syndicate || '/cards/syndicate/hero.webp', alt: 'The Syndicate' },
    { image: heroImages?.tong || '/cards/tong/hero.webp', alt: 'Tong' },
  ];
  const heroRef = useRef(null);
  const cardsWrapRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.hero-card');

      ScrollTrigger.matchMedia({
        // ===== DESKTOP =====
        '(min-width: 768px)': function () {
          const tl = gsap.timeline({ delay: 0.3 });

          cards.forEach((card, i) => {
            const mid = (cards.length - 1) / 2;
            const angle = (i - mid) * 12;
            const xSpread = (i - mid) * 200;

            tl.from(
              card,
              {
                y: -700,
                rotation: gsap.utils.random(-60, 60),
                opacity: 0,
                scale: 0.3,
                duration: 0.7,
                ease: 'power3.out',
              },
              i * 0.15
            );

            tl.to(
              card,
              {
                rotation: angle,
                x: xSpread,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: 'back.out(1.7)',
              },
              `>-0.3`
            );
          });

          // Subtle float after landing
          cards.forEach((card, i) => {
            gsap.to(card, {
              y: -10,
              rotation: `+=${i === 0 ? -2 : 2}`,
              repeat: -1,
              yoyo: true,
              duration: 2.5 + i * 0.3,
              ease: 'sine.inOut',
              delay: 1.5,
            });
          });
        },

        // ===== MOBILE — scroll-triggered =====
        '(max-width: 767px)': function () {
          gsap.set(cards, { opacity: 0, y: 100, scale: 0.5, rotation: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top 80%',
              end: 'center center',
              scrub: 1,
            },
          });

          cards.forEach((card, i) => {
            const mid = (cards.length - 1) / 2;
            const angle = (i - mid) * 10;
            const xSpread = (i - mid) * 100;

            tl.to(
              card,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotation: angle,
                x: xSpread,
                duration: 1,
                ease: 'power2.out',
              },
              i * 0.3
            );
          });

          // Float after scroll
          ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'center center',
            onEnter: () => {
              cards.forEach((card, i) => {
                gsap.to(card, {
                  y: -6,
                  rotation: `+=${i === 0 ? -3 : 3}`,
                  repeat: -1,
                  yoyo: true,
                  duration: 2 + i * 0.4,
                  ease: 'sine.inOut',
                });
              });
            },
            once: true,
          });
        },
      });

      // Pulsing CTA glow
      gsap.to('.hero-cta', {
        boxShadow: '0 0 50px rgba(46, 139, 87, 0.5)',
        repeat: -1,
        yoyo: true,
        duration: 1.8,
        ease: 'sine.inOut',
      });
    }, heroRef);

    // Mouse parallax (desktop only)
    const hero = heroRef.current;
    const cardsWrap = cardsWrapRef.current;

    const handleMouseMove = (e) => {
      if (window.innerWidth < 768 || !cardsWrap) return;
      const rect = hero.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const mx = e.clientX - rect.left - cx;
      const my = e.clientY - rect.top - cy;

      gsap.to(cardsWrap, {
        rotateY: (mx / cx) * 12,
        rotateX: (my / cy) * -8,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    hero?.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      hero?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center bg-[#1a3325] overflow-hidden pt-16"
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')]" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(46,139,87,0.12)_0%,transparent_65%)]" />

      {/* Cards container */}
      <div
        className="relative z-[1] h-[270px] md:h-[380px] lg:h-[400px]"
        style={{ perspective: '1200px' }}
      >
        <div
          ref={cardsWrapRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {HERO_CARDS.map((card, i) => (
            <div
              key={i}
              className="hero-card absolute w-[180px] h-[270px] md:w-[260px] md:h-[380px] lg:w-[280px] lg:h-[400px] rounded-2xl shadow-2xl overflow-hidden"
              style={{ transformOrigin: 'center 160%' }}
            >
              <img
                src={card.image}
                alt={card.alt}
                className="w-full h-full object-contain bg-[#1a3325]"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Text + CTA — slightly overlaps card bottom */}
      <div
        className="relative z-10 text-center px-4 -mt-8 md:-mt-14"
        style={{ textShadow: '0 2px 20px rgba(26,51,37,0.9), 0 0 40px rgba(26,51,37,0.5)' }}
      >
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-[#f8f5e6] uppercase tracking-tighter leading-[0.85] mb-4">
          Choose Your
          <br />
          <span className="text-[#2e8b57]">Battle</span>
        </h1>
        <p className="text-[#f8f5e6]/60 text-base md:text-xl font-medium max-w-lg mx-auto mb-10">
          The #1 Strategy Card Games in Bangladesh. Trust no one.
        </p>

        <button
          onClick={onShopClick}
          className="hero-cta bg-[#2e8b57] text-[#f8f5e6] px-10 py-4 md:px-14 md:py-5 font-black text-lg md:text-xl uppercase tracking-widest rounded-xl hover:bg-[#3ba86a] transition-colors shadow-[0_0_25px_rgba(46,139,87,0.25)] active:scale-[0.97]"
          style={{ textShadow: 'none' }}
        >
          Shop Now
        </button>
      </div>
    </section>
  );
}
