import { loadSection } from "../inc/theme-section-loader";
import { lockScrolling, unlockScrolling } from "../theme/helpers";

const selectors = {
  modalOpenAttribute: "data-modal-open",
  modalContainer: "[data-modal-container]",
  modalContainerAttribute: "data-modal-container",
  modalCloseAttribute: "data-modal-close",
  swiperSelectors: "[data-slider]",
  pagination: "[data-pagination]",
  sliderPrev: "[data-prev]",
  sliderNext: "[data-next]",
  autoplayAttribute: "data-autoplay",
  verticalAttribute: "data-vertical",
  loopAttribute: "data-loop",
  slidesVisibleAttribute: "data-slides-visible",
  videoControl: "[data-ci-video-control]",
};

const classes = {
  active: "is-active",
  visible: "is-visible",
};

const breakpointChange = "lg";

const sectionEvents = {
  onLoad() {
    this.initVideoControls();
    this.activeSliders = [];
    this.initAllSliders();
    this.addBreakpointEventListeners();
    console.log('Section "Inspiration Features": Loaded!', this);
  },

  addBreakpointEventListeners() {
    window.addEventListener(`breakpoint-down:${breakpointChange}`, this.resetSliders.bind(this));
    window.addEventListener(`breakpoint-up:${breakpointChange}`, this.resetSliders.bind(this));
  },

  initAllSliders() {
    this.sliders = this.container.querySelectorAll(selectors.swiperSelectors);
    this.sliders.forEach((slider) => {
      this.initSlider(slider);
    });
  },

  initVideoControls() {
    const videoControlElements = this.container.querySelectorAll(selectors.videoControl);
    videoControlElements.forEach((videoControlElement) => {
      let videoParentElement = videoControlElement.parentNode;
      let videoElement = videoParentElement.querySelector("video");

      videoControlElement.addEventListener("click", function () {
        if (videoElement.paused) {
          videoElement.play();
          videoControlElement.classList.add("playing");
        } else {
          videoElement.pause();
          videoControlElement.classList.remove("playing");
        }
      });
    });
  },

  initSlider(sliderEl) {
    const pagination = sliderEl.querySelector(selectors.pagination);
    const next = sliderEl.querySelector(selectors.sliderNext);
    const prev = sliderEl.querySelector(selectors.sliderPrev);
    const mql = window.matchMedia(`(max-width: ${window.theme.breakpoints[breakpointChange]}px)`);
    // slidesVisible attribute should be structured as 3/4 where 3 is the number of desktop slides and 4 the number of device slides
    const [desktopSlides, deviceSlides, mobileSlides] = sliderEl.hasAttribute(selectors.slidesVisibleAttribute) ? sliderEl.getAttribute(selectors.slidesVisibleAttribute).split("/") : ["auto", "auto", "auto"];

    if (sliderEl) {
      const swiperAutoplay = sliderEl.getAttribute(selectors.autoplayAttribute);
      this.direction = this.direction === false ? true : false;
      var letsPlay = false;
      if (swiperAutoplay === "true") {
        var letsPlay = true;
      }

      const newSwiper = new window.theme.Swiper(sliderEl, {
        slidesPerView: mobileSlides ? mobileSlides : deviceSlides,
        spaceBetween: 16,
        loop: sliderEl.getAttribute(selectors.loopAttribute) === "true" && mql ? true : false,
        slidesOffsetBefore: this.direction ? 50 : 0,
        simulateTouch: true,
        speed: letsPlay ? 8000 : 500,
        breakpoints: {
          [theme.breakpoints.lg]: {
            slidesPerView: desktopSlides,
            direction: sliderEl.getAttribute(selectors.verticalAttribute) === "true" ? "vertical" : "horizontal",
          },
          [theme.breakpoints.md]: {
            slidesPerView: deviceSlides,
          },
        },
        pagination: pagination
          ? {
              el: pagination,
              clickable: true,
            }
          : false,
        navigation:
          prev && next
            ? {
                prevEl: prev,
                nextEl: next,
              }
            : false,
      });
      letsPlay = false;
    }
  },

  resetSliders() {
    this.activeSliders.forEach((slider) => {
      slider.destroy();
    });
    this.initAllSliders();
  },
};

loadSection("section-inspiration", sectionEvents);
