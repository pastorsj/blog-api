'use strict';
/* global __dirname, require, module */

const webpack = require('webpack');
const path = require('path');
const env = require('yargs').argv.env;
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');

let libraryName = 'blog';

let plugins = []
let outputFile;

if (env === 'build') {
    outputFile = libraryName + '.min.js';
} else {
    outputFile = libraryName + '.js';
}

const config = {
    entry: path.join(__dirname, 'src', 'server.js'),
    devtool: 'source-map',
    target: 'node',
    node: {
        __dirname: true
    },
    output: {
        path: path.join(__dirname, 'server-dist'),
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
            }
        ]
    },
    resolve: {
        modules: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'node_modules')
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
