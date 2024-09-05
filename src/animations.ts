import {throttle} from "./utils.ts";

export const bannerAnimation = () => {
  const handle = document.querySelector('.js_handle_banner') as HTMLElement;
  const knight = document.querySelector('.js_knight_banner') as HTMLElement;
  const flash = document.querySelector('.js_flash_banner') as HTMLElement;

  handle.classList.add('_active');
  handle.ontransitionend = () => {
    knight.classList.add('_active');
  };
  knight.ontransitionend = () => {
    flash.classList.add('_active');
  };
};

export const activateBannerAnimation = () => {
  const banner = document.querySelector('.js_game-banner');

  if (banner) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
          bannerAnimation();
          observer.unobserve(banner);
        }
      })
    }, { threshold: 1 });
    observer.observe(banner);
  }
};

export const shiftTopFigures = () => {
  const king = document.querySelector('.header_images_king') as HTMLElement;
  const queen = document.querySelector('.header_images_queen') as HTMLElement;

  const fn = throttle(() => {
    const y = window.scrollY / 4;
    king.style.transform = `translate(100px, -${180 - y}px) rotate(-6deg)`;
    queen.style.transform = `translate(450px, -${276 - y}px) rotate(-6deg)`;
  }, 10);

  window.addEventListener('scroll', () => fn());
};

export const shiftGameTicket = () => {
  const ticket = document.querySelector('.js_game_ticket') as HTMLElement;

  const fn = throttle(() => {
    const y = window.scrollY / 4;
    if (window.innerWidth < 640) {
      ticket.style.transform = `translate(0, ${200 - y}px) rotate(90deg) scale(.77)`;
    } else {
      ticket.style.transform = `translate(0, ${200 - y}px) rotate(90deg)`;
    }
  }, 10);

  window.addEventListener('scroll', () => fn());
};
