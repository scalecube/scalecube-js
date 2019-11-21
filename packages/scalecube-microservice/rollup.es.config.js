import visualizer from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: false,
    },
  ],
  external: ['rxjs'],
  plugins: [
    resolve(),
    visualizer({
      filename: 'report.es.html',
      title: 'Microservice - es',
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),
    // global(),
    filesize(),
  ],
};
