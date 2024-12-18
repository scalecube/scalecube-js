#!/usr/bin/env node

const { run } = require('./lib/index');
run(process.argv[2]).then(() => console.log('done'));
