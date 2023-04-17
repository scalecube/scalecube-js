import { getConf, showHelp, exec, print, execDelayed } from './util';
import * as reporters from 'reporters';
import { collect } from './collect';

export interface Buckets {
  [ms: string]: number;
}
function report(data: any[], name: string) {
  reporters.json(data, name);
  reporters.html(data, name);
}

export async function run(path: string) {
  const conf = getConf(path);

  if (!conf) {
    showHelp();
    return;
  }
  const servers = conf.server || [];
  const benchmarks = conf.benchmark || [];
  const parallel = servers.length > 0 ? servers.length : 1;
  const runningServers = [];

  for (const server of servers) {
    runningServers.push(exec(server.start).then(() => print('server is closed')));
    if (server.warmup) {
      await exec(server.warmup);
    }
  }
  const result = [];
  const running = 0;
  while (benchmarks.length) {
    if (running === parallel) {
      await Promise.race(result);
    }
    const setting = benchmarks.pop();
    const p = [];
    for (let i = 0; i < setting.client.repeat; i++) {
      p.push(execDelayed(setting.client.command, i * setting.client.delay));
    }
    result.push(collect(Promise.all(p) as Promise<string[]>, setting.name));
  }

  report((await Promise.all(result)) as any, conf.name);

  // running_servers.forEach(p => p.c)
}
