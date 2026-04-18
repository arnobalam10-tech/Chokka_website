import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';

const BOXES = [
  {
    name: 'The Syndicate',
    label: 'Strategy & Deception',
    image: '/cards/bundle/syn-tong.webp',
    accent: '#2e8b57',
    rotate: '-4deg',
  },
  {
    name: 'Tong',
    label: 'Bluffing & Chaos',
    image: '/cards/bundle/tong-sholo.webp',
    accent: '#e63946',
    rotate: '0deg',
  },
  {
    name: 'Sholo Ana',
    label: "Chokka's Original",
    image: '/cards/bundle/syn-sholo.webp',
    accent: '#2672b0',
    rotate: '4deg',
  },
];

export default function GameBoxesSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const boxes = gsap.utils.toArray('.game-box-item');
      const labels = gsap.utils.toArray('.game-box-label');

      gsap.from(boxes, {
        y: -180,
        opacity: 0,
        rotation: (i) => (i === 0 ? -20 : i === 2 ? 20 : 0),
        scale: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          end: 'top 30%',
          scrub: false,
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from(labels, {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        delay: 0.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 px-4 bg-[#0d1a0f] overflow-hidden"
    >
      {/* Subtle vignette */}
      <div className="absolute inset-0 opacity-40"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #000 100%)' }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-[#2e8b57] font-bold uppercase tracking-widest text-xs md:text-sm">
            The Games
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mt-2">
            Three Worlds. One Table.
          </h2>
        </div>

        {/* Three boxes */}
        <div className="flex flex-col sm:flex-row items-end justify-center gap-8 md:gap-16">
          {BOXES.map((box, i) => (
            <div key={box.name} className="flex flex-col items-center gap-5">
              <div className="game-box-item">
                <img
                  src={box.image}
                  alt={box.name}
                  className="w-[160px] md:w-[220px] object-contain select-none"
                  style={{
                    transform: `rotate(${box.rotate})`,
                    filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.7))',
                  }}
                  draggable={false}
                />
              </div>

              <div className="game-box-label text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: box.accent }}>
                  {box.label}
                </div>
                <div className="text-white font-black text-lg md:text-xl uppercase tracking-tight">
                  {box.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
