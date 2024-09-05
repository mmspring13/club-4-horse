import arrowRight from './img/arrow-right.svg';
import {throttle} from "./utils.ts";

export class Slider {
  el: HTMLElement;
  currentSlide: { el: HTMLElement; idx: number };
  slideWidth: number;
  slides: HTMLCollection;
  onChange?: (ctx: Slider) => void;

  constructor(el: HTMLElement, onChange?: (ctx: Slider) => void) {
    this.el = el;
    this.currentSlide = { el: el.children[0] as HTMLElement, idx: 0 };
    this.slides = el.children;
    this.onChange = onChange;
    this.slideWidth = 0;
    if (this.slides.length) {
      this.slideWidth = this.slides[0].getBoundingClientRect().width;
    }
    window.addEventListener('resize', this._handleResize.bind(this));

    el.addEventListener('scroll', (e) => throttle(this._handleScrollEnd.bind(this), 40)(e));
  }

  _handleResize() {
    this.slideWidth = this.slides?.[0].getBoundingClientRect().width;
    this.el.scrollLeft = 0;
  }

  _handleScrollEnd(event: Event) {
    const target = event.target as HTMLElement;
    let nextSlide: { el: HTMLElement; x: number; idx: number } | null = null;
    for (let i = 0; i < target.children.length; i++) {
      const el = target.children[i];

      const obs = new IntersectionObserver((entries, obs) => {
        const entry = entries[0];
        const x = entry.target.getBoundingClientRect().x;
        if (
          entry.isIntersecting
          && entry.intersectionRatio > 0.8
          && (!nextSlide || nextSlide.x > x)
        ) {
          nextSlide = { el: entry.target as HTMLElement, idx: i, x };
        }
        obs.unobserve(target);
        obs.disconnect();
        if (nextSlide) {
          this.currentSlide = { el: nextSlide.el, idx: nextSlide.idx };
          this.onChange?.(this);
        }
      }, { root: target });
      obs.observe(el);
    }
  }

  next() {
    this.el.scrollLeft += this.slideWidth;
  }

  prev() {
    this.el.scrollLeft -= this.slideWidth;
  }

  destroy() {
    window.removeEventListener('resize', this._handleResize);
    this.el.removeEventListener('scrollend', this._handleScrollEnd);
  }
}

export class SliderControl {
  slider: Slider;
  ctrl: HTMLElement;
  gapBetweenSlides: number;
  segmentsCount: number;

  constructor(slider: Slider, el: HTMLElement, gapBetweenSlides = 20) {
    this.ctrl = el;

    this.slider = slider;
    this.gapBetweenSlides = gapBetweenSlides;
    this.segmentsCount = 0;
    const sChange = this.slider.onChange;
    this.slider.onChange = () => {
      sChange?.(slider);
      this.updateActiveDot();
      this.updateStateOfButtons();
    };

    window.addEventListener('resize', () => this.createDots());

    this.createDots();
    this.createButtons();
  }

  createDots() {
    const dots = this.ctrl.querySelector('[data-dots]') as HTMLElement;
    dots.classList.add('slider-control__dots');
    dots.innerHTML = '';
    const sliderWidth = this.slider.slideWidth
      * this.slider.slides.length + (this.gapBetweenSlides * this.slider.slides.length - 1);

    const sliderRect = this.slider.el.getBoundingClientRect();
    const totalShifts = Math.floor(sliderWidth / this.slider.slideWidth);
    let perScreen = sliderRect.width / this.slider.slideWidth;
    const segmentsCount = Math.ceil(totalShifts - perScreen + 1);
    this.segmentsCount = segmentsCount;
    for (let i = 0; i < segmentsCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-control__dot');
      if (this.slider.currentSlide.idx === i) {
        dot.classList.add('_active');
      }
      dots.appendChild(dot);
    }
    this.updateActiveDot();
  }

  updateActiveDot() {
    const dots = this.ctrl.querySelector('[data-dots]') as HTMLElement;
    for (let i = 0; i < dots.children.length; i++) {
      const dot = dots.children[i];
      dot.classList.remove('_active');
      if (this.slider.currentSlide.idx === i) {
        dot.classList.add('_active');
      }
    }
  }

  createButtons() {
    const prev = this.ctrl.querySelector('[data-prev]') as HTMLButtonElement;
    const next = this.ctrl.querySelector('[data-next]') as HTMLButtonElement;
    const arrow = document.createElement('img');
    arrow.src = arrowRight;
    arrow.alt = 'arrow';
    prev.classList.add('slider-control__btn', 'button', '_prev');
    next.classList.add('slider-control__btn', 'button', '_next');
    next.appendChild(arrow);
    prev.appendChild(arrow.cloneNode(true));
    prev.onclick = () => this.slider.prev();
    next.onclick = () => this.slider.next();
    this.updateStateOfButtons();
  }

  updateStateOfButtons() {
    const prev = this.ctrl.querySelector('[data-prev]') as HTMLButtonElement;
    const next = this.ctrl.querySelector('[data-next]') as HTMLButtonElement;
    prev.disabled = this.slider.currentSlide.idx === 0;
    next.disabled = this.slider.currentSlide.idx === this.segmentsCount - 1;
  }
}
