import { Buckets } from './index';

export async function collect(buckets: Promise<string[]>, name: string) {
  const data = await buckets;
  const merged: any = {};
  let total = 0;
  let mean = 0;
  let sum = 0;
  let stdev = 0;
  data.forEach((str) => {
    const obj: Buckets = JSON.parse(str);
    Object.keys(obj).forEach((c) => {
      const ms = Number(c);
      merged[c] = { x: ms, value: (merged?.[c]?.value || 0) + obj[c] };
      for (let i = 0; i < obj[c]; i++) {
        total += 1;
        const delta = ms - mean;
        mean += delta / total;
        const delta2 = ms - mean;
        sum += delta * delta2;
      }
    });
  });
  if (total > 1) {
    stdev = sum / total;
  }

  return {
    name,
    total,
    mean,
    stdev,
    data: Object.values(merged),
  };
}
