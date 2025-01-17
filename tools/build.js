#! /usr/bin/env node
/* eslint-disable no-console */

const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');
const build = require('@nebula.js/cli-build');
const sense = require('@nebula.js/cli-sense');
const copyExt = require('./copy-ext');

const args = yargs(process.argv.slice(2)).argv;
const buildExt = args.ext;
const buildCore = args.core;
const mode = args.mode || 'production';
const watch = args.w;

const sourcemap = mode !== 'production';

// cleanup old build
fs.removeSync(path.resolve(process.cwd(), 'dist'));
fs.removeSync(path.resolve(process.cwd(), 'core/esm'));

const buildArgs = {};
if (buildCore) {
  buildArgs.core = 'core';
}

if (mode === 'production') {
  buildArgs.mode = 'production';
  buildArgs.sourcemap = false;
}

if (watch) {
  buildArgs.watch = true;
}

const buildExtension = async () => {
  console.log('---> BUILDING EXTENSION');
  await sense({ partial: true, output: 'sn-action-button-ext', sourcemap });
  console.log('---> COPYING EXTENSION');
  copyExt();
};

const main = async () => {
  console.log('---> BUILDING SUPERNOVA');
  const watcher = await build(buildArgs);
  if (buildExt) {
    buildExtension();
    if (watch) {
      watcher.on('event', (event) => {
        if (event.code === 'BUNDLE_END') {
          buildExtension();
        }
      });
    }
  }
};

main();
