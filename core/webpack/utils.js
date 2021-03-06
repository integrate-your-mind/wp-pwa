const path = require('path');
const fs = require('fs');
const { pathExistsSync } = require('fs-extra');

const nodeModules = [
  path.resolve(__dirname, '../../node_modules'),
  ...fs
    .readdirSync('packages')
    .map(dir => path.resolve(__dirname, `../../packages/${dir}/node_modules`)),
].filter(folder => pathExistsSync(folder));

const babelrc = JSON.parse(fs.readFileSync('.babelrc', 'utf8')).env;

// if you're specifying externals to leave unbundled, you need to tell Webpack
// to still bundle `react-universal-component`, `webpack-flush-chunks` and
// `require-universal-module` so that they know they are running
// within Webpack and can properly make connections to client modules:
const externals = fs
  .readdirSync(path.resolve(__dirname, '../../node_modules'))
  .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
  .reduce((external, mod) => {
    external[mod] = `commonjs ${mod}`;
    return external;
  }, {});
externals['react-dom/server'] = 'commonjs react-dom/server';

module.exports = { nodeModules, babelrc, externals };
