import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: false,
    },
  ],
  external: ['rxjs'],
  plugins: [
    commonjs({
      include: /node_modules/,
      browser: true,
      namedExports: {
        'rsocket-types': ['CONNECTION_STATUS'],
      },
    }),
    resolve(),
    babel({
      plugins: ['@babel/plugin-transform-arrow-functions', '@babel/plugin-transform-runtime'],
      babelrc: false,
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
    visualizer({
      filename: 'report.cjs.html',
      title: 'Browser - cjs',
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),
    // global(),
    filesize(),
  ],
};
