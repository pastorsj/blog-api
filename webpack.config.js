'use strict';
/* global __dirname, require, module */

const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');

let libraryName = 'blog';

let plugins = []
let outputFile;

if (env === 'build') {
    plugins.push(new UglifyJsPlugin({ minimize: true }));
    outputFile = libraryName + '.min.js';
} else {
    outputFile = libraryName + '.js';
}

const config = {
    entry: path.join(__dirname, 'src', 'server.js'),
    devtool: 'eval-source-map',
    target: 'node',
    node: {
        __dirname: true
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /(\.js)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /(\.js)$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        modules: [
            path.join(__dirname, 'src')
        ],
        extensions: [
            '.js', '.json'
        ]
    },
    plugins: plugins,
    externals: [
        nodeExternals()
    ]
};

module.exports = config;