import babel from 'rollup-plugin-babel';
import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'gateway',
      file: pkg.main,
      format: 'cjs',
    },
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    commonjs({ include: 'node_modules/**' }),
    visualizer({
      filename: 'report.html',
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),

    filesize(),
  ],
};
