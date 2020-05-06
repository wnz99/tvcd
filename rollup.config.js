import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
  input: 'src/tvcd.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'tvcd',
  },
  plugins: [
    resolve({ browser: true, preferBuiltins: true }),
    commonjs(),
    globals(),
    builtins(),
  ],
};
