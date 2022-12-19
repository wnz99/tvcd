import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import nodePolyfills from 'rollup-plugin-polyfill-node'

// this override is needed because Module format cjs does not support top-level await
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json')

const globals = {
  ...packageJson.devDependencies,
}

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
    commonjs({ transformMixedEsModules: true }),
    nodePolyfills(),
    typescript({
      objectHashIgnoreUnknownHack: true,
      abortOnError: false,
    }),
  ],
  external: Object.keys(globals),
}
