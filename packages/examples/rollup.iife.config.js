import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import uglify from 'rollup-plugin-uglify-es';
import babel from 'rollup-plugin-babel';
import global from 'rollup-plugin-node-globals';

export default {
  input: './bundles/src/index.ts',
  output: [
    {
      name: 'sdk',
      file: pkg.dist,
      format: 'iife',
      sourcemap: false,
    },
  ],
  plugins: [
    resolve({ jsnext: true, main: true }),
    commonjs({
      browser: true,
    }),
    babel({
      plugins: ['@babel/plugin-transform-arrow-functions', '@babel/plugin-transform-async-to-generator'],
      babelrc: false,
      runtimeHelpers: false,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            spec: true,
            forceAllTransforms: true,
            targets: {
              chrome: '29',
              ie: '11',
              firefox: '40',
            },
          },
        ],
      ],
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),
    global(),
    filesize(),
  ],
};
