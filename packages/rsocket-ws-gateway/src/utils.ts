export const packError = (e) => {
  try {
    const message = JSON.stringify(e);
    return new Error(message);
  } catch (err) {
    return e;
  }
};

export class AppServiceError extends Error {
  constructor(obj) {
    super(obj.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'AppServiceError';
    Object.keys(obj).forEach((key) => {
      this[key] = obj[key];
    });
  }
}

export const unpackError = (e) => {
  // rsocket error {source: {code: 513, explanation: "APPLICATION_ERROR", message: "packed app error here"}}
  if (e && e.source && e.source.code === 513) {
    try {
      const eObj = JSON.parse(e.source.message);
      return new AppServiceError(eObj);
    } catch (err) {
      return e;
    }
  } else {
    return e;
  }
};
