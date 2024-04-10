import { delayedLoadSection } from '../inc/theme-section-loader';

const selectors = {
  slider: '[data-it-slider]',
  pagination: '[data-it-slider-pagination]',
};

const sectionEvents = {
  async onLoad() {
    const mql = window.matchMedia(`(max-width: ${window.theme.breakpoints.lg}px)`);

    if (mql.matches) {
      this.loadSlider();
    }
  },

  loadSlider() {
    if (window.theme.Swiper) {
      this.initSlider();
    } else {
      document.addEventListener(
        'theme:inititialised',
        () => {
          this.initSlider();
        },
        { once: true }
      );
    }
  },

  initSlider() {
    const sliderElement = this.container.querySelector(selectors.slider);
    const pagination = sliderElement.querySelector(selectors.pagination);
    if (sliderElement) {
      new window.theme.Swiper(sliderElement, {
        slidesPerView: 1,
        loop: false,
        speed: 800,
        spaceBetween: 16,
        simulateTouch: true,
        autoplay: {
          delay: 6000,
        },
        pagination: {
          el: pagination,
          clickable: true,
        },
        breakpoints: {
          [theme.breakpoints.md]: {
            slidesPerView: 2,
          }
        },
      });
    }
  },
};

delayedLoadSection('section-image-text-slider', sectionEvents);
