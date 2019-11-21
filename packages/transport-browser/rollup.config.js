import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
  ],
  external: ['@scalecube/api', '@scalecube/utils'],
  plugins: [
    typescript({
      typescript: require('typescript'),
      clean: true,
    }),
    visualizer({
      filename: 'report.html',
      title: 'transport-browser',
    }),
    filesize(),
  ],
};
