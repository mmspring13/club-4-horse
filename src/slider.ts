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

    el.addEventListener('scrollend', this._handleScrollEnd.bind(this));
  }

  _handleResize() {
    this.slideWidth = this.slides?.[0].getBoundingClientRect().width;
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
      }, { root: target, threshold: 1.0 });
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
  segmentsCount: number;

  constructor(slider: Slider, el: HTMLElement) {
    this.ctrl = el;

    this.slider = slider;
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
    // @todo fix gap = 50
    const segmentsCount = Math.ceil(((this.slider.slides.length * this.slider.slideWidth + 50) - this.slider.el.getBoundingClientRect().width + this.slider.slideWidth) / this.slider.slideWidth);
    this.segmentsCount = segmentsCount;
    for (let i = 0; i < segmentsCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-control__dot');
      if (this.slider.currentSlide.idx === i) {
        dot.classList.add('_active');
      }
      dots.appendChild(dot);
    }
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
    arrow.src = 'assets/images/arrow-right.svg';
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
