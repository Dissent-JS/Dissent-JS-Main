const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


module.exports = {
    mode: 'production',
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

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    // Extract CSS into separate file
                    MiniCssExtractPlugin.loader,
                    // Convert CSS to JS
                    'css-loader',
                    // Compile Sass to CSS
                    'sass-loader'
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
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

