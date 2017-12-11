// @flow
/**
 * first and very ugly impl, jest regex, need to do something like babel
 * You must have strict ; policy in order it to work
 */

const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const output = path.join(process.cwd(),process.argv[3]);

function addClass(file) {
  return `
  declare class Class<T> {};
  ${file}
  `;
}
function addMapClass(file) {
  return `
  declare class Map<K,V>{};
  ${file}
  `;
}
function removeImports(file) {
  return file.replace(/\bimport\b[^;]*;/g, '');
}
function fixClasses(file) {
  return file
    .replace(/\bdeclare\b interface\b/g, 'interface')
    .replace(/\bdeclare\b class\b/g, 'interface')
    .replace(/\bdeclare\b \bexport\b class\b/g, 'export class');
}
function declearExportVar(file) {
  return file.replace(/\bdeclare\b \bexport\b var\b/g, 'declare var');
}
function removeConstructorReturnType(file) {
  return file.replace(/(\bconstructor\b.*)\):[^;]*/g, '$1)');
}
function fixMaybeTypes(file) {
  return file.replace(/(\b[a-zA-Z0-9]+\s*\b)\:+\s*\?(\s*\b[a-zA-Z0-9]+\b)/g, '$1?:$2');
}

let file = fs.readFileSync(path.join(process.cwd(),input), "utf8");
file = fixClasses(file);
file = addClass(file);
file = addMapClass(file);
file = removeImports(file);
file = declearExportVar(file);
file = removeConstructorReturnType(file);
file = fixMaybeTypes(file);



fs.writeFileSync(output, file, "utf8");