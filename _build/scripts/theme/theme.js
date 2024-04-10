import Swiper, { Navigation, Autoplay, Scrollbar, FreeMode, Mousewheel, Pagination, Thumbs, EffectFade } from "swiper";

document.addEventListener("DOMContentLoaded", () => {
  window.theme.Swiper = Swiper;
  window.theme.Swiper.use([Navigation, Autoplay, Scrollbar, FreeMode, Mousewheel, Pagination, Thumbs, EffectFade]);

  let currentScreenSize = window.innerWidth;
  window.addEventListener("resize", () => {
    currentScreenSize = breakpointCheck(currentScreenSize);
  });

  // gsap.registerPlugin(PixiPlugin, MotionPathPlugin);

  document.dispatchEvent(new Event("theme:inititialised"));

  console.log("Theme: Initialised!!", theme);

  const themeReady = new Event("themeReady");
  document.dispatchEvent(themeReady);
});

const breakpointCheck = (previousWindowSize) => {
  const newWindowSize = window.innerWidth;

  for (const [key, breakpoint] of Object.entries(theme.breakpoints)) {
    let breakpointEvent;

    if (previousWindowSize < breakpoint && newWindowSize >= breakpoint) {
      breakpointEvent = new Event(`breakpoint-up:${key}`);
    } else if (newWindowSize < breakpoint && previousWindowSize >= breakpoint) {
      breakpointEvent = new Event(`breakpoint-down:${key}`);
    }

    if (breakpointEvent) {
      window.dispatchEvent(breakpointEvent);
    }
  }
  return newWindowSize;
};

