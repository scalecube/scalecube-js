import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
import global from 'rollup-plugin-node-globals';
import pkg from './package.json';

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
