const path = require('path');

const webpackConfig = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    target: 'node'
};

module.exports = webpackConfig;