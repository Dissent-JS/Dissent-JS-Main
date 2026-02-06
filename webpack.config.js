const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const useTypeScript = fs.existsSync(path.join(__dirname, 'tsconfig.json'));

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: useTypeScript ? ['./src/index.ts'] : ['./src/index.js'],
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
        historyApiFallback: true,
    },
    externals: {
        'jest-fetch-mock': 'fetchMock'
    },
    resolve: {
        fallback: {
            process: require.resolve('process/browser'),
        },
        extensions: useTypeScript ? ['.ts', '.js'] : ['.js'],
    },
    module: {
        rules: [
            {
                test: useTypeScript ? /\.([jt]s)$/ : /\.js$/,
                exclude: /(__tests__|node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            useTypeScript && {
                test: /\.ts$/,
                exclude: /(__tests__|node_modules)/,
                use: 'ts-loader',
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
        ].filter(Boolean),
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'main.min.css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                // Copy HTML files
                { from: 'src/index.html', to: '.' },
                { from: 'src/404.html', to: '.' },

                // Copy component files
                {
                    from: 'src/components/**/*.html', to: ({ context, absoluteFilename }) => {
                        return `components/${absoluteFilename.substring(context.length + 13)}`;
                    }
                },
                {
                    from: 'src/components/**/*.js', to: ({ context, absoluteFilename }) => {
                        return `components/${absoluteFilename.substring(context.length + 13)}`;
                    }
                },

                // Copy view HTML files
                {
                    from: 'src/views/**/*.html', to: ({ context, absoluteFilename }) => {
                        return `views/${absoluteFilename.substring(context.length + 10)}`;
                    }
                },

                // Copy layout files
                {
                    from: 'src/layout/**/*.html', to: ({ context, absoluteFilename }) => {
                        return `layout/${absoluteFilename.substring(context.length + 11)}`;
                    }
                },

                // Copy images
                { from: 'src/images', to: 'images' },

                // Copy security headers file
                { from: '_headers', to: '.' },
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
