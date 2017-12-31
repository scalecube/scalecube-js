/**
 * Created by idan on 12/31/2017.
 */

export function Service(constructor) {
  constructor.meta = constructor.meta || {};
  constructor.meta.type = 'class';
}
