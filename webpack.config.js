const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');


module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: ['./src/index.js'],
    output: {
        library: 'Dissent-JS',
        libraryTarget: 'umd',
        filename: 'main.min.js',
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'src'),
        },
        compress: true,
        port: 3600,
        open: true,
    },
    externals: {
        'jest-fetch-mock': 'fetchMock'
    },
    resolve: {
        fallback: {
            process: require.resolve('process/browser'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(__tests__|node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.scss$/,
                exclude: /(__tests__|node_modules)/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ],
            },
            // process HTML files
            {
                test: /\.html$/,
                exclude: /(__tests__|node_modules)/,
                use: 'html-loader',
            },
        ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'main.min.css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/index.html', to: '.' },
            ],
        }),
    ],
    optimization: {
        minimizer: [
            new TerserWebpackPlugin({
                extractComments: false,
            }),
        ],
    },
};

