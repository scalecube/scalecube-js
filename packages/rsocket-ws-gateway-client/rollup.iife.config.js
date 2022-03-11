import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'sc',
      file: pkg.unpkg,
      format: 'iife',
      sourcemap: false,
    },
  ],
  plugins: [
    commonjs({
      include: /node_modules/,
      browser: true,
      namedExports: {
        'rsocket-types': ['CONNECTION_STATUS'],
        'rsocket-core': ['RSocketClient', 'JsonSerializers'],
      },
    }),
    resolve(),
    babel({
      plugins: ['@babel/plugin-transform-arrow-functions'],
      babelrc: true,
      runtimeHelpers: true,
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
            },
          },
        ],
      ],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    visualizer({
      filename: 'report.iffe.html',
      title: 'Microservice - iife',
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),
    terser(),
    filesize(),
  ],
};
