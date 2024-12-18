import { run } from '../src';
import * as process from 'process';

describe('benchmark', () => {
  it('run', async () => {
    await run('benchmark.json');
  });
});
