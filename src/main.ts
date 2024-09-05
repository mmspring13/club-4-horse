import './css.ts';
import {activateBannerAnimation, shiftTopFigures} from './animations.ts';
import { SliderControl, Slider } from "./slider.ts";

const employeesSlider = new Slider(document.querySelector('.employees-slider') as HTMLElement);
new SliderControl(
  employeesSlider,
  document.querySelector('.employees-slider-control') as HTMLElement,
  20,
);

const stageSlider = new Slider(document.querySelector('.stage-slider') as HTMLElement);
new SliderControl(
  stageSlider,
  document.querySelector('.stage-slider-control') as HTMLElement,
);

activateBannerAnimation();
shiftTopFigures();
