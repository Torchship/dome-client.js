export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrCopy: any[] = [];
    for (const item of obj) {
      arrCopy.push(deepClone(item));
    }
    return arrCopy as unknown as T;
  }

  const objCopy: { [key: string]: any } = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = deepClone((obj as { [key: string]: any })[key]);
    }
  }
  return objCopy as T;
}

export const measureMonospaceCharacterWidth = (font: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    return context.measureText('M').width; // Measure width of a single character
  }
  return 0;
};