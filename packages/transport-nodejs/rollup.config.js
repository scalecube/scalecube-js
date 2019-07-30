import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import global from 'rollup-plugin-node-globals';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    resolve(),
    commonjs({ include: 'node_modules/**' }),
    typescript({
      typescript: require('typescript'),
      clean: true,
    }),
    visualizer({
      filename: 'report.html',
    }),
    global(),
    filesize(),
  ],
};
