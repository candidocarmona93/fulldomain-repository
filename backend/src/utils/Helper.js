export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const isObject = (value) => typeof value === "object" && typeof value !== null;

export const isHTMLElement = (value) => value instanceof Element;

export const isIDSelector = (value) => typeof value === 'string' && /^#[a-zA-Z_][\w-]*$/.test(value);

export const isClassSelector = (value) => typeof value === 'string' && /^\.[a-zA-Z_][\w-]*$/.test(value);

export function throttle(func, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      func.apply(this, args);
      lastCall = now;
    }
  };
}

export function adjustColor(color, amount) {
  let [r, g, b] = color.match(/\d+/g).map(Number);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export function deepEqual(a, b) {
  // 1. Same reference?
  if (a === b) return true;

  // 2. Both null/undefined?
  if (a == null || b == null) return a === b;

  // 3. Different types?
  if (typeof a !== typeof b) return false;

  var type = Object.prototype.toString.call(a);

  // 4. Handle Date
  if (type === '[object Date]') {
    return a.getTime() === b.getTime();
  }

  // 5. Handle Array
  if (type === '[object Array]') {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // 6. Handle RegExp (optional – compare source + flags)
  if (type === '[object RegExp]') {
    return a.toString() === b.toString();
  }

  // 7. Handle plain objects only from here
  if (type !== '[object Object]') {
    return false; // Functions, Map, Set, etc. → not supported safely
  }

  var keysA = Object.keys(a);
  var keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  // Test keys from A are in B and values match
  for (var i = 0; i < keysA.length; i++) {
    var key = keysA[i];
    if (!b.hasOwnProperty(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}