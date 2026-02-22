import { gsap } from './gsapSetup';

export function flyToCart(sourceEl) {
  const cart = document.getElementById('cart-icon');
  if (!cart || !sourceEl) return;

  const from = sourceEl.getBoundingClientRect();
  const to = cart.getBoundingClientRect();

  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed;
    width: 32px;
    height: 44px;
    background: linear-gradient(135deg, #2e8b57, #1a3325);
    border: 2px solid #f8f5e6;
    border-radius: 6px;
    z-index: 10000;
    pointer-events: none;
    left: ${from.left + from.width / 2 - 16}px;
    top: ${from.top}px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  `;
  document.body.appendChild(el);

  gsap.to(el, {
    left: to.left + to.width / 2 - 16,
    top: to.top + to.height / 2 - 22,
    scale: 0.15,
    rotation: 540,
    opacity: 0,
    duration: 0.85,
    ease: 'power3.inOut',
    onComplete: () => el.remove()
  });
}
