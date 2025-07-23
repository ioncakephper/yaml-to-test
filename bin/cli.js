#!/usr/bin/env node

const { run } = require('../src/index');

function show() {
  run(process.argv);
}

show();
