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
      file: pkg.main,
      format: 'cjs',
      sourcemap: false,
    },
  ],
  external: ['rxjs'],
  plugins: [
    commonjs({
      include: /node_modules/,
      namedExports: {
        'rsocket-types': ['CONNECTION_STATUS'],
      },
    }),
    visualizer({
      filename: 'report.cjs.html',
      title: 'Node - cjs',
    }),
    typescript({
      typescript: tscompile,
      clean: true,
    }),
    filesize(),
  ],
};
