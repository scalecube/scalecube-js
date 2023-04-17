import fs from 'fs';
import { Buckets } from '../index';
export function json(data: any[], name: string) {
  const report = {
    name,
    series: data,
  };
  fs.writeFileSync(name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json', JSON.stringify(report), {
    encoding: 'utf8',
  });
}
