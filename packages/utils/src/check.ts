type Collection<T> = T[] | { [key: string]: T };

export const assert = (predicate: boolean, msg: string): void | never => {
  if (!predicate) {
    throw new Error(msg);
  }
};

export const isDefined = (val: any): boolean => typeof val !== 'undefined';

export const assertDefined = (val: any, msg = 'Expect to be defined') => {
  assert(isDefined(val), msg);
};

export const isString = (val: any): boolean => typeof val === 'string' || val instanceof String;

export const assertString = (val: any, msg = 'Expected to be a string') => {
  assert(isDefined(val) && isString(val), msg);
};

export const assertNonEmptyString = (val: any, msg = 'Expected to be non empty string') => {
  assertString(val, msg);
  assert(val.length > 0, msg);
};

export const isArray = (val: any) => Array.isArray(val);

export const isNonEmptyArray = (val: any) => isArray(val) && val.length > 0;

export const assertArray = (val: any, msg = 'Expected to be an array') => {
  assert(isArray(val), msg);
};

export const isObject = (val: any): boolean => Object.prototype.toString.call(val) === '[object Object]';

export const assertObject = (val: any, msg = 'Expected to be an object') => {
  assert(isObject(val), msg);
};

export const assertNonEmptyObject = (val: any, msg = 'Expected to be non empty object') => {
  assertObject(val, msg);
  assert(Object.keys(val).length > 0, msg);
};

export const isOneOf = (collection: Collection<any>, val: any): boolean => {
  if (isArray(collection)) {
    return collection.includes(val);
  }
  if (isObject(collection)) {
    return Object.values(collection).includes(val);
  }
  return false;
};

export const assertOneOf = (
  collection: Collection<any>,
  val: any,
  msg = 'Expected to be one of the collection elements'
) => {
  assert(isOneOf(collection, val), msg);
};

export const isFunction = (val: any) =>
  typeof val === 'function' && !/^class\s/.test(Function.prototype.toString.call(val));

export const isFunctionConstructor = (val: any) =>
  typeof val === 'function' && /^class\s/.test(Function.prototype.toString.call(val));

export const assertFunction = (val: any, msg = 'Expected to be a function') => {
  assert(isFunction(val), msg);
};

export const assertClass = (val: any, msg = 'Expected to be a class') => {
  assert(isFunctionConstructor(val), msg);
};

export const isNumber = (val: any) => typeof val === 'number' && !isNaN(val);

export const assertNumber = (val: any, msg = 'Expected to be a number') => {
  assert(isNumber(val), msg);
};
