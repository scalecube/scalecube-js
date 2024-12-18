import { exec as _exec } from 'child_process';
import fs from 'fs';

export function print(...args: any[]) {
  // tslint:disable-next-line:no-console
  console.log(...args);
}

export function exec(cmd: string) {
  return new Promise((resolve, reject) => {
    _exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}

export function execDelayed(cmd: string, delay: number) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve(await exec(cmd));
    }, delay);
  });
}

export function getConf(f = 'benchmark.json') {
  let file: any;
  try {
    file = fs.readFileSync(f, { encoding: 'utf8' });
  } catch (e) {
    print('file not found');
    return;
  }
  const conf = JSON.parse(file);
  const { name, benchmark, server } = conf;

  if (!name || !benchmark) {
    configHelp();
    return;
  }

  benchmark.forEach((variant: any) => {
    if (!variant?.name || !variant?.client?.command) {
      print('client must have name and command');
      configHelp();
      return;
    }
    variant.client.repeat = variant?.client?.repeat || 1;
    variant.client.delay = variant?.client?.delay || 1;
  });

  server.forEach((s: any) => {
    if (!s?.start) {
      print('server must have start');
      configHelp();
      return;
    }
  });

  return conf;
}

export function configHelp() {
  print(`{
    "name": "required benchmark name",
    "server": [{
        "start": "required docker ... | any cmd to start server",
        "warmup": "opt cmd to warm the server",
        "stop": "opt command to stop server"
    }],
    "benchmark": [{
        "name": "required variant 1",
        "client": {
            "command": "required docker --rm client:tag | any bash command",
            "repeat": 1000,
            "delay": 1
        }
    }]
}`);
}

export function showHelp() {
  print(`
Usage: benchmark [file.json=benchmark.json]
    Run server, run warm commands and generate traffic (you need to supply clients), collect data and create reports
    The client should return the data in buckets in json format:
    {
        "1": 5,
    }
    When the key is MS and value is count of how many request returned in 1 MS
`);
}
