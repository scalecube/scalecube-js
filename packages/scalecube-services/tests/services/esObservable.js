// main repo: https://github.com/tc39/proposal-observable
// file link: https://github.com/tc39/proposal-observable/blob/master/src/Observable.js

// === Symbol Polyfills ===

function polyfillSymbol(name) {

  if (!Symbol[name])
    Object.defineProperty(Symbol, name, { value: Symbol(name) });
}

polyfillSymbol("observable");

// === Abstract Operations ===

function nonEnum(obj) {

  Object.getOwnPropertyNames(obj).forEach((k) => {
    Object.defineProperty(obj, k, { enumerable: false });
  });

  return obj;
}

function getMethod(obj, key) {

  const value = obj[key];

  if (!value)
    return undefined;

  if (typeof value !== "function")
    throw new TypeError(`${value } is not a function`);

  return value;
}

function cleanupSubscription(subscription) {

  // Assert:  observer._observer is undefined

  const cleanup = subscription._cleanup;

  if (!cleanup)
    return;

  // Drop the reference to the cleanup function so that we won't call it
  // more than once
  subscription._cleanup = undefined;

  // Call the cleanup function
  try {
    cleanup();
  }
  catch(e) {
    // HostReportErrors(e);
  }
}

function subscriptionClosed(subscription) {

  return subscription._observer === undefined;
}

function closeSubscription(subscription) {

  if (subscriptionClosed(subscription))
    return;

  subscription._observer = undefined;
  cleanupSubscription(subscription);
}

function cleanupFromSubscription(subscription) {
  return ()=> { subscription.unsubscribe(); };
}

function Subscription(observer, subscriber) {
  // Assert: subscriber is callable
  // The observer must be an object
  this._cleanup = undefined;
  this._observer = observer;

  // If the observer has a start method, call it with the subscription object
  try {
    const start = getMethod(observer, "start");

    if (start) {
      start.call(observer, this);
    }
  }
  catch(e) {
    // HostReportErrors(e);
  }

  // If the observer has unsubscribed from the start method, exit
  if (subscriptionClosed(this))
    return;

  // eslint-disable-next-line no-param-reassign
  observer = new SubscriptionObserver(this);

  try {

    // Call the subscriber function
    let cleanup = subscriber.call(undefined, observer);

    // The return value must be undefined, null, a subscription object, or a function
    if (!!cleanup) {
      if (typeof cleanup.unsubscribe === "function")
        cleanup = cleanupFromSubscription(cleanup);
      else if (typeof cleanup !== "function")
        throw new TypeError(`${cleanup } is not a function`);

      this._cleanup = cleanup;
    }

  } catch (e) {

    // If an error occurs during startup, then send the error
    // to the observer.
    observer.error(e);
    return;
  }

  // If the stream is already finished, then perform cleanup
  if (subscriptionClosed(this)) {
    cleanupSubscription(this);
  }
}

Subscription.prototype = nonEnum({
  get closed() { return subscriptionClosed(this); },
  unsubscribe() { closeSubscription(this); },
});

function SubscriptionObserver(subscription) {
  this._subscription = subscription;
}

SubscriptionObserver.prototype = nonEnum({

  get closed() {

    return subscriptionClosed(this._subscription);
  },

  next(value) {

    const subscription = this._subscription;

    // If the stream if closed, then return undefined
    if (subscriptionClosed(subscription))
      return undefined;

    const observer = subscription._observer;

    try {
      const m = getMethod(observer, "next");

      // If the observer doesn't support "next", then return undefined
      if (!m)
        return undefined;

      // Send the next value to the sink
      m.call(observer, value);
    }
    catch(e) {
      // HostReportErrors(e);
    }
    return undefined;
  },

  error(value) {

    const subscription = this._subscription;

    // If the stream is closed, throw the error to the caller
    if (subscriptionClosed(subscription)) {
      return undefined;
    }

    const observer = subscription._observer;
    subscription._observer = undefined;

    try {

      const m = getMethod(observer, "error");

      // If the sink does not support "complete", then return undefined
      if (m) {
        m.call(observer, value);
      }
      else {
        // HostReportErrors(e);
      }
    } catch (e) {
      // HostReportErrors(e);
    }

    cleanupSubscription(subscription);

    return undefined;
  },

  complete() {

    const subscription = this._subscription;

    // If the stream is closed, then return undefined
    if (subscriptionClosed(subscription))
      return undefined;

    const observer = subscription._observer;
    subscription._observer = undefined;

    try {

      const m = getMethod(observer, "complete");

      // If the sink does not support "complete", then return undefined
      if (m) {
        m.call(observer);
      }
    } catch (e) {
      // HostReportErrors(e);
    }

    cleanupSubscription(subscription);

    return undefined;
  },

});

export class Observable {

  // == Fundamental ==

  constructor(subscriber) {

    // The stream subscriber must be a function
    if (typeof subscriber !== "function")
      throw new
      TypeError("Observable initializer must be a function");

    this._subscriber = subscriber;
  }

  subscribe(observer, ...args) {
    if (typeof observer === "function") {
      // eslint-disable-next-line no-param-reassign
      observer = {
        next: observer,
        error: args[0],
        complete: args[1]
      };
    }
    else if (typeof observer !== "object") {
      // eslint-disable-next-line no-param-reassign
      observer = {};
    }

    return new Subscription(observer, this._subscriber);
  }

  [Symbol.observable]() { return this; }

  // == Derived ==

  static from(x) {

    const C = typeof this === "function" ? this : Observable;

    if (!x)
      throw new TypeError(`${x } is not an object`);

    let method = getMethod(x, Symbol.observable);

    if (method) {

      const observable = method.call(x);

      if (Object(observable) !== observable)
        throw new TypeError(`${observable } is not an object`);

      if (observable.constructor === C)
        return observable;

      return new C(observer => observable.subscribe(observer));
    }

    method = getMethod(x, Symbol.iterator);

    if (!method)
      throw new TypeError(`${x } is not observable`);

    return new C((observer) => {

      for (const item of method.call(x)) {

        observer.next(item);

        if (observer.closed)
          return;
      }

      observer.complete();
    });
  }

  static of(...items) {

    const C = typeof this === "function" ? this : Observable;

    return new C((observer) => {

      for (let i = 0; i < items.length; ++i) {

        observer.next(items[i]);

        if (observer.closed)
          return;
      }

      observer.complete();
    });
  }

}
