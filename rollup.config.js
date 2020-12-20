import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const pkg = require('./package.json');

export default {
  input: `src/index.ts`,
  output: [{ dir: 'dist', format: 'es', sourcemap: true }],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash-es')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    replace({
      'window.customElements.define(tagName, clazz);': '',
      delimiters: ['', ''],
    }),
    typescript(),
    resolve(),
    commonjs({
      include: [
        'node_modules/fast-json-stable-stringify/**/*',
        'node_modules/zen-observable/**/*',
        'node_modules/graphql-tag/**/*',
        'node_modules/ieee754/**/*',
        'node_modules/base64-js/**/*',
        'node_modules/isomorphic-ws/**/*',
        'node_modules/buffer/**/*',
        'node_modules/@msgpack/**/*',
        'node_modules/@holochain/conductor-api/**/*',
      ],
    }),
  ],
};
