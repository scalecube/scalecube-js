import babel from 'rollup-plugin-babel';
import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify-es';

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'sc',
      file: pkg.unpkg,
      format: 'iife',
      sourcemap: 'inline',
    },
  ],
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    resolve({ jsnext: true, main: true }),
    commonjs({
      include: [/node_modules/],
      browser: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    visualizer({
      filename: 'report.iffe.html',
      title: 'ROLLUP - iife',
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),
    uglify(),
    filesize(),
  ],
};
