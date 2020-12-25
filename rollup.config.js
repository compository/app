import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import html from '@open-wc/rollup-plugin-html';

const pkg = require('./package.json');

export default {
  input: `index.html`,
  output: [{ dir: 'dist', format: 'es', sourcemap: true }],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash-es')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    html(),
    replace({
      'window.customElements.define': '',
      'customElements.define': '',
      delimiters: ['', ''],
    }),
    typescript(),
    resolve(),
    commonjs({
      include: [
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
