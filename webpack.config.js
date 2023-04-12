const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const glob = require('glob');
const path = require('path');


const htmlFiles = glob.sync('dist/**/*.html');

const plugins = [
    new MiniCssExtractPlugin({
        filename: 'main.min.css',
    }),
    new CopyWebpackPlugin({
        patterns: [
            { from: 'src/index.html', to: '.' },
        ],
    })
];

for (const file of htmlFiles) {
    plugins.push(
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, file),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            }
        })
    );
}

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

    plugins,
    optimization: {
        minimizer: [
            new TerserWebpackPlugin({
                extractComments: false,
            }),
        ],
    },
};
