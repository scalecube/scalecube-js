import babel from 'rollup-plugin-babel';
import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    resolve(),
    commonjs({ include: 'node_modules/**' }),
    visualizer({
      filename: 'report.es.html',
      title: 'Discovery - es',
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),

    filesize(),
  ],
};
