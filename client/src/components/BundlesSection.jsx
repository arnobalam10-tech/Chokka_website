import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShoppingCart, Package, Zap } from 'lucide-react';

// Each bundle card configuration
// Savings = what you'd pay buying individually (price + 80 delivery each) vs bundle (delivery included)
const BUNDLE_CONFIGS = [
  {
    productId: 3,
    label: 'Any 2',
    name: 'Syndicate + Tong',
    games: ['The Syndicate', 'Tong'],
    colors: ['#2e8b57', '#e63946'],
    imagePath: '/cards/bundle/syn-tong.webp',
    bundlePrice: 800,
    normalPrice: 940,  // 440 + 500
    savings: 140,
    badge: null,
  },
  {
    productId: 5,
    label: 'Any 2',
    name: 'Syndicate + Sholo Ana',
    games: ['The Syndicate', 'Sholo Ana'],
    colors: ['#2e8b57', '#c9a227'],
    imagePath: '/cards/bundle/syn-sholo.webp',
    bundlePrice: 800,
    normalPrice: 940, // 440 + 500
    savings: 140,
    badge: null,
  },
  {
    productId: 6,
    label: 'Any 2',
    name: 'Tong + Sholo Ana',
    games: ['Tong', 'Sholo Ana'],
    colors: ['#e63946', '#c9a227'],
    imagePath: '/cards/bundle/tong-sholo.webp',
    bundlePrice: 850,
    normalPrice: 1000, // 500 + 500
    savings: 150,
    badge: null,
  },
];

const HERO_BUNDLE = {
  productId: 7,
  label: 'All 3',
  name: 'The Complete Collection',
  games: ['The Syndicate', 'Tong', 'Sholo Ana'],
  colors: ['#2e8b57', '#e63946', '#c9a227'],
  imagePath: '/cards/bundle/all-three.webp',
  bundlePrice: 1099,
  normalPrice: 1440, // 440 + 500 + 500
  savings: 341,
  badge: 'BEST VALUE',
};

function BundleCard({ bundle, products, onBuyNow, index }) {
  const product = products.find((p) => p.id === bundle.productId) || {
    id: bundle.productId,
    title: bundle.name,
    price: bundle.bundlePrice,
    delivery_dhaka: 0,
    delivery_outside: 0,
  };

  const livePrice = product.price || bundle.bundlePrice;
  const liveNormal = bundle.normalPrice;
  const liveSavings = liveNormal - livePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white border-2 border-[#1a3325] rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#1a3325] hover:shadow-[2px_2px_0px_0px_#1a3325] hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col"
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-[#1a3325]">
        <img
          src={bundle.imagePath}
          alt={bundle.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />

        {/* Label pill */}
        <div className="absolute top-3 left-3 bg-[#1a3325] text-[#f8f5e6] text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
          {bundle.label}
        </div>

        {/* Savings badge */}
        {liveSavings > 0 && (
          <div className="absolute top-3 right-3 bg-[#e63946] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
            Save {liveSavings}৳
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-black text-lg text-[#1a3325] uppercase leading-tight">{bundle.name}</h3>
          <p className="text-sm text-[#1a3325]/50 font-medium mt-0.5">
            {bundle.games.join(' • ')}
          </p>
        </div>

        <div className="flex items-end gap-2 mt-auto">
          <span className="font-black text-2xl text-[#1a3325]">{livePrice}৳</span>
          <span className="text-sm text-[#1a3325]/40 font-bold line-through mb-0.5">
            {liveNormal}৳
          </span>
          <span className="text-xs text-[#2e8b57] font-bold mb-0.5">incl. delivery</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onBuyNow(product)}
          className="w-full bg-[#1a3325] text-[#f8f5e6] py-3 font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#2e8b57] transition-colors"
        >
          Buy Now
        </motion.button>
      </div>
    </motion.div>
  );
}

function HeroBundleCard({ bundle, products, onBuyNow }) {
  const product = products.find((p) => p.id === bundle.productId) || {
    id: bundle.productId,
    title: bundle.name,
    price: bundle.bundlePrice,
    delivery_dhaka: 0,
    delivery_outside: 0,
  };

  const livePrice = product.price || bundle.bundlePrice;
  const liveSavings = bundle.normalPrice - livePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="bg-[#1a3325] border-2 border-[#1a3325] rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#f8f5e6] hover:shadow-[3px_3px_0px_0px_#f8f5e6] hover:translate-x-1 hover:translate-y-1 transition-all"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/3] md:aspect-auto bg-[#0e1628]">
          <img
            src={bundle.imagePath}
            alt={bundle.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />

          {/* BEST VALUE badge */}
          <div className="absolute top-4 left-4 bg-[#2e8b57] text-[#f8f5e6] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            ✦ Best Value
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 flex flex-col justify-center gap-5">
          <div>
            <span className="text-[#2e8b57] font-bold uppercase tracking-widest text-xs">
              All 3 Games
            </span>
            <h3 className="font-black text-3xl md:text-4xl text-[#f8f5e6] uppercase leading-tight mt-1">
              The Complete<br />Collection
            </h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {bundle.games.map((g, i) => (
                <span
                  key={i}
                  className="text-xs font-bold border rounded-full px-3 py-1"
                  style={{ color: bundle.colors[i], borderColor: `${bundle.colors[i]}50` }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <ul className="space-y-2 text-sm text-[#f8f5e6]/60 font-medium">
            <li className="flex items-center gap-2">
              <Zap size={14} className="text-[#2e8b57] shrink-0" />
              Bluffing, deduction, and memory — all in one box
            </li>
            <li className="flex items-center gap-2">
              <Zap size={14} className="text-[#2e8b57] shrink-0" />
              Never run out of game night ideas
            </li>
            <li className="flex items-center gap-2">
              <Zap size={14} className="text-[#2e8b57] shrink-0" />
              Delivery included — save {liveSavings}৳ vs buying separately
            </li>
          </ul>

          <div className="flex items-end gap-3">
            <span className="font-black text-4xl text-[#f8f5e6]">{livePrice}৳</span>
            <div className="mb-1">
              <span className="text-[#f8f5e6]/30 font-bold line-through text-lg block">
                {bundle.normalPrice}৳
              </span>
              <span className="text-[#2e8b57] font-black text-sm">Save {liveSavings}৳</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onBuyNow(product)}
            className="bg-[#2e8b57] text-[#f8f5e6] py-4 font-black text-lg uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:bg-[#3ba86a] transition-colors shadow-lg shadow-[#2e8b57]/30"
          >
            Buy Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function BundlesSection({ products, onBuyNow }) {
  const headingRef = useRef(null);
  const isInView = useInView(headingRef, { once: true, margin: '-80px' });

  return (
    <section id="bundles" className="bg-[#f8f5e6] py-20 md:py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={headingRef} className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#1a3325]/8 border border-[#1a3325]/20 rounded-full px-4 py-1.5 mb-4">
              <Package size={14} className="text-[#1a3325]/60" />
              <span className="text-[#1a3325]/60 font-bold uppercase tracking-widest text-xs">
                Bundle Deals
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#1a3325] uppercase tracking-tighter leading-[0.9]">
              Save More,<br />
              <span className="text-[#2e8b57]">Play More</span>
            </h2>
            <p className="text-[#1a3325]/50 font-medium text-base md:text-lg mt-4 max-w-xl mx-auto">
              Bundle any 2 games and save — or go all in with the Complete Collection.
              Delivery always included.
            </p>
          </motion.div>
        </div>

        {/* Any 2 — 3 cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {BUNDLE_CONFIGS.map((bundle, i) => (
            <BundleCard
              key={bundle.productId}
              bundle={bundle}
              products={products}
              onBuyNow={onBuyNow}
              index={i}
            />
          ))}
        </div>

        {/* All 3 — hero card */}
        <HeroBundleCard
          bundle={HERO_BUNDLE}
          products={products}
          onBuyNow={onBuyNow}
        />
      </div>
    </section>
  );
}
