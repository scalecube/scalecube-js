import { searchTag, parse, md } from '../utils/parse';

export function doc(src: string) {
  const services = {} as any;
  const comments = parse(src);
  for (const c in comments) {
    const service = searchTag(comments[c], 'service');
    const method = searchTag(comments[c], 'method');
    const version = searchTag(comments[c], 'version');
    const params = searchTag(comments[c], 'param');
    const ret = searchTag(comments[c], 'return');
    if (!service) {
      continue;
    }
    if (method) {
      services[service].methods = {
        [method]: {
          params,
          ret,
          description: comments[c].description,
        },
      };
    } else {
      services[service] = {
        version,
        description: comments[c].description,
      };
    }
  }

  return md(services);
}
