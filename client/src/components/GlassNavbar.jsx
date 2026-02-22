import { ShoppingCart } from 'lucide-react';

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function GlassNavbar({ onCartClick }) {
  return (
    <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex justify-between items-center glass-navbar">
      <a href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
        <img src="/logo.png" alt="CHOKKA" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
        <span className="font-black text-lg md:text-xl tracking-widest uppercase text-[#f8f5e6]">
          CHOKKA
        </span>
      </a>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-6 text-[#f8f5e6]/70 text-sm font-bold uppercase tracking-widest">
          <button onClick={() => scrollTo('syndicate')} className="hover:text-[#2e8b57] transition-colors">Syndicate</button>
          <button onClick={() => scrollTo('tong')} className="hover:text-[#e63946] transition-colors">Tong</button>
          <button onClick={() => scrollTo('bundle')} className="hover:text-[#f8f5e6] transition-colors">Bundle</button>
        </div>

        <button
          id="cart-icon"
          onClick={onCartClick}
          className="relative p-2.5 text-[#f8f5e6]/80 hover:text-[#2e8b57] transition-colors rounded-full hover:bg-white/5"
        >
          <ShoppingCart size={22} />
        </button>
      </div>
    </nav>
  );
}
