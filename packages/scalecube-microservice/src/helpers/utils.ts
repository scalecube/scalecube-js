export const generateIdentifier = () => `_${(Math.random() * Date.now()).toString(36).substr(2, 9)}`;

export const isObject = (obj) => obj && typeof obj === 'object' && obj.constructor === Object;
