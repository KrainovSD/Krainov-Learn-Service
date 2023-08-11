import { defineConfig } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import pkg from './package.json' assert { type: 'json' }
import { uglify } from 'rollup-plugin-uglify'

const extensions = ['.ts', '.js']

const options = defineConfig({
  input: './src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
      generatedCode: 'es2015',
      sourcemap: true,
    },
    {
      file: pkg.main,
      format: 'cjs',
      generatedCode: 'es2015',
      sourcemap: true,
    },
  ],
  plugins: [
    babel({
      babelHelpers: 'runtime',
      extensions,
      shouldPrintComment: (comment) => false,
    }),
    nodeResolve({ extensions }),
    commonjs(),
    uglify(),
  ],
})

export default options
