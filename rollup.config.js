import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { babel } from '@rollup/plugin-babel';

// this override is needed because Module format cjs does not support top-level await
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json');

const globals = {
  ...packageJson.devDependencies,
};

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'tvcd',
    sourcemap: false,
    exports: 'named',
  },
  plugins: [
    peerDepsExternal(),
    commonjs({ transformMixedEsModules: true }),
    nodePolyfills(),
    resolve({ browser: true, preferBuiltins: true }),
    typescript({
      objectHashIgnoreUnknownHack: true,
      abortOnError: false,
    }),
  ],
  external: Object.keys(globals),
};
