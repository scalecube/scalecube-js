export const isObject = (obj) => {
  return obj && typeof obj === 'object' && obj.constructor === Object;
};

export const isArray = (arr) => {
  return arr && typeof arr === 'object' && arr.constructor === Array;
};
