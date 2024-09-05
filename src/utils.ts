export const throttle = <T, R>(fn: (...args: T[]) => R, ms: number) => {
  let c = true;
  return (...args: T[]) => {
    if (c) {
      setTimeout(() => {
        c = true;
      }, ms);
      c = false;
      return fn(...args);
    }
  };
};