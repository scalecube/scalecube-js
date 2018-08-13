const babel = require('babel-core');
const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const micromatch = require('micromatch');
const mkdirp = require('mkdirp');
const path = require('path');

const BUILD_DIR = 'build';
const SRC_DIR = 'src';
const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages');
const JS_FILES_PATTERN = path.resolve(PACKAGES_DIR, '**/*.js');
const IGNORE_PATTERN = '**/__(mocks|snapshots|tests)__/**';
const FLOW_EXTENSION = '.flow';

function getBabelOptions() {
  return {
    babelrc: false,
    presets: ["es2015", "flow"],
    env: {
      "commonjs": {
        "plugins": [
          [
            "transform-es2015-modules-commonjs",
            {
              "loose": true
            }
          ],
          [
            "module-resolver",
            {
              "root": [
                "./"
              ],
              "alias": {
                "src": "./src"
              }
            }
          ]
        ]
      },
      jest: {
        "plugins": ["dynamic-import-node"]
      }
    },
    retainLines: true,
  };
}

const packages = fs
  .readdirSync(PACKAGES_DIR)
  .map(file => path.resolve(PACKAGES_DIR, file))
  .filter(f => fs.lstatSync(path.resolve(f)).isDirectory());

function buildPackage(pkg) {
  const srcDir = path.resolve(pkg, SRC_DIR);
  const pattern = path.resolve(srcDir, '**/*');
  const files = glob.sync(pattern, {nodir: true});

  files.forEach(file => buildFile(file, true));
  process.stdout.write(`${chalk.green('=>')} ${path.basename(pkg)} (npm)\n`);
}

function buildFile(file, silent) {
  const packageName = path.relative(PACKAGES_DIR, file).split(path.sep)[0];
  const packageSrcPath = path.resolve(PACKAGES_DIR, packageName, SRC_DIR);
  const packageBuildPath = path.resolve(PACKAGES_DIR, packageName, BUILD_DIR);
  const relativeToSrcPath = path.relative(packageSrcPath, file);
  const destPath = path.resolve(packageBuildPath, relativeToSrcPath);

  mkdirp.sync(path.dirname(destPath));
  if (micromatch.isMatch(file, IGNORE_PATTERN)) {
    silent ||
      process.stdout.write(
        chalk.dim('  \u2022 ') +
          path.relative(PACKAGES_DIR, file) +
          ' (ignore)\n'
      );
  } else if (!micromatch.isMatch(file, JS_FILES_PATTERN)) {
    fs.createReadStream(file).pipe(fs.createWriteStream(destPath));
    silent ||
      process.stdout.write(
        chalk.red('  \u2022 ') +
          path.relative(PACKAGES_DIR, file) +
          chalk.red(' \u21D2 ') +
          path.relative(PACKAGES_DIR, destPath) +
          ' (copy)' +
          '\n'
      );
  } else {
    let code = babel.transformFileSync(
      file,
      getBabelOptions({modules: true})
    ).code;
    fs.writeFileSync(destPath, code);
    fs
      .createReadStream(file)
      .pipe(fs.createWriteStream(destPath + FLOW_EXTENSION));
    silent ||
      process.stdout.write(
        chalk.green('  \u2022 ') +
          path.relative(PACKAGES_DIR, file) +
          chalk.green(' \u21D2 ') +
          path.relative(PACKAGES_DIR, destPath) +
          '\n'
      );
  }
}

function main(files) {
  if (files && files.length) {
    files.forEach(buildFile);
    return Promise.resolve();
  } else {
    process.stdout.write(chalk.bold.inverse('Building packages\n'));
    return Promise.all(
      packages.map(buildPackage)
    ).catch(error => {
      process.stderr.write((error.stack || error.message) + '\n');
      throw error;
    });
  }
}

if (require.main === module) {
  const files = process.argv.slice(2);
  main(files).then(() => process.exit(0), () => process.exit(1));
}

module.exports = main;
