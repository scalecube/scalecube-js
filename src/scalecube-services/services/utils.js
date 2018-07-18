// @flow


export const getServiceInterface = (o: Object) => {
  // we`ll have to think about this one... right new just a name
  return o.constructor.name;
};
export const getServiceName = (o: Object) => {
  return o.meta && o.meta.serviceName || o.constructor.meta && o.constructor.meta.serviceName || o.constructor.name;
};
export const isLoader = (inst: Object | null) => {
  return inst && inst.service && inst.service.meta && inst.service.meta.type === 'Loader';
}
export const makeLoader = (loadFunction: Promise<any>, Class: any) => {
  return {
    promise: loadFunction,
    meta: Object.assign(Class.meta, {
      type: 'Loader',
      serviceName: Class.meta && Class.meta.serviceName || Class.name
    })
  };
};

const symbolObservablePonyfill = (root) => {
    let result;
    let Symbol = root.Symbol || null;

    if (typeof Symbol === 'function') {
        if (Symbol.observable) {
            result = Symbol.observable;
        } else {
            result = Symbol('observable');
            Symbol.observable = result;
        }
    } else {
        result = '@@observable';
    }

    return result;
};

export const isObservable = (obs:any) => {
    let root;

    if (typeof self !== 'undefined') {
        root = self;
    } else if (typeof window !== 'undefined') {
        root = window;
    } else if (typeof global !== 'undefined') {
        root = global;
    } else if (typeof module !== 'undefined') {
        root = module;
    } else {
        root = {};
    }

    const _observable = symbolObservablePonyfill(root);

    return Boolean(obs && obs[_observable] && obs === obs[_observable]())
};
