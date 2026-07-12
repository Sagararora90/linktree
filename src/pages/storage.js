// Small utilities shared by Editor and Preview.
// Centralizing these fixes two real bugs from the original version:
// 1. localStorage.setItem can throw (quota exceeded / private browsing) and
//    was previously uncaught, which would silently break the app.
// 2. Uploaded images were stored as full-resolution base64, which can blow
//    past localStorage's ~5-10MB limit from a single photo.

const PREFIX = 'linktree_';

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadString(key, fallback = '') {
  try {
    return localStorage.getItem(PREFIX + key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveValue(key, value) {
  try {
    if (value === '' || value === null || value === undefined) {
      localStorage.removeItem(PREFIX + key);
      return true;
    }
    const toStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(PREFIX + key, toStore);
    return true;
  } catch (err) {
    console.error(`Failed to save "${key}" to localStorage:`, err);
    return false;
  }
}

export function removeValue(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* no-op */
  }
}

/**
 * Reads an image file and returns a resized/compressed JPEG data URL,
 * keeping it well under localStorage limits even for large phone photos.
 */
export function fileToCompressedDataURL(file, maxDimension = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Normalizes a URL the user typed so links actually work when clicked. */
export function normalizeUrl(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('#')) return trimmed;
  return `https://${trimmed}`;
}
