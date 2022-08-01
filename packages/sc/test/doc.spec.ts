import { doc } from '../src/commands/doc';
const fs = require('fs');
const path = require('path');

describe('document', () => {
  test('Create document', () => {
    const api = fs.readFileSync(path.join(__dirname, 'fixture/GreetingServiceAPI.ts'), { encoding: 'utf8', flag: 'r' });
    const md = fs.readFileSync(path.join(__dirname, 'fixture/GreetingService.md'), { encoding: 'utf8', flag: 'r' });

    expect(doc(api)).toBe(md);
  });
});
