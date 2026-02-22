import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScrollSmoother } from "gsap/ScrollSmoother";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTop(0);
    }
  }, [pathname]);

  return null;
}