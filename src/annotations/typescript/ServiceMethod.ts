/**
 * Created by idan on 12/31/2017.
 */
export function ServiceMethod(type: 'Promise' | 'Observable') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    target.constructor.meta = target.constructor.meta || { methods: {} };
    target.constructor.meta.methods[propertyKey] = {
      type
    };
  };
}

