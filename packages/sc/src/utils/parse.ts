import { parse } from 'comment-parser';

export { parse };

export function normalize<T = any>(arr: T[]) {
  if (arr.length === 0) {
    return undefined;
  }
  const item = arr[0] as any;
  switch (item.tag.toLowerCase()) {
    case 'version':
    case 'service':
    case 'method':
      return item.name;
    case 'return':
      return {
        type: item.type,
        description: `${item.name} ${item.description}`,
      };
    case 'param':
      return arr.map((i: any) => ({
        type: i.type,
        name: i.name,
        optional: i.optional === true ? 'yes' : 'no',
        default: i.default,
        description: i.description,
      }));
    default:
      return undefined;
  }
}

export function searchTag(c: any, tag: string) {
  return normalize(c.tags.filter((i: any) => i.tag.toLowerCase() === tag));
}

export function col(value: string = '', size: number, pad = ' ') {
  return `${value.padEnd(size, pad)}`;
}

export function md(meta: any) {
  let output = '';
  for (const s in meta) {
    output += `# ${s}\n`;
    output += meta[s].version ? `> Version ${meta[s].version}\n\n` : '';
    output += meta[s].description ? `${meta[s].description}\n` : '';
    for (const m in meta[s].methods) {
      const method = meta[s].methods[m];
      output += `## ${m}\n`;
      output += method.description ? `${method.description}\n\n` : '';
      if (method.params) {
        output += `| ${col('name', 10)} | ${col('opt', 3)} | ${col('type', 10)} | ${col('default', 10)} | ${col(
          'description',
          50
        )} |\n`;
        output += `| ${col('', 10, '-')} | ${col('', 3, '-')} | ${col('--', 10, '-')} | ${col('--', 10, '-')} | ${col(
          '--',
          50,
          '-'
        )} |\n`;
        method.params.forEach((v: any) => {
          output += `| ${col(v.name, 10)} | ${col(v.optional, 3)} | ${col(v.type, 10)} | ${col(v.default, 10)} | ${col(
            v.description,
            50
          )} |\n`;
        });
      }
      output += method.ret ? `\n**return \`${method.ret.type}\`**\n${method.ret.description}\n` : '';
    }
  }
  return output;
}
