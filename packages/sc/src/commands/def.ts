import { searchTag, parse } from '../utils/parse';

export function def(src: string) {
  const services = {} as any;
  const comments = parse(src);
  for (const c in comments) {
    const service = searchTag(comments[c], 'service');
    const method = searchTag(comments[c], 'method');
    const ret = searchTag(comments[c], 'return');
    if (!service) {
      continue;
    }
    if (method) {
      services[service].methods = {
        [method]: {
          asyncModel: ret.type.indexOf('Promise') === -1 ? 'requestStream' : 'requestResponse',
        },
      };
    } else {
      services[service] = {
        serviceName: service,
      };
    }
  }

  return services;
}
