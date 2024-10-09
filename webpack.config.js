const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: path.resolve(__dirname, './src/index.js'),
    mode: 'development',
    devServer: {
        static: path.resolve(__dirname, './public'),
        hot: true,
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
        clean: true,
    },
    plugins: [
        new Dotenv()
    ]
};
