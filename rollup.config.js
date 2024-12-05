const { uglify } = require('rollup-plugin-uglify')

module.exports = {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
    plugins: [uglify()]
  }
}
