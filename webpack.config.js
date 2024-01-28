
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, "src", "app.ts"),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "public", "index.html")
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.(css|scss)$/, use: [
                    'style-loader',
                    'css-loader'
                ],
            },
            { 
                test:  /\.(js|mjs|jsx|ts|tsx)$/,
                use: 'source-map-loader', 
            },
            {
                test:/\.(ts|tsx)$/,
                use:'ts-loader'
            },
            {
                test: /\.(png|jpe?g|gif|txt|svg|mp3|wav|flac|ttf|hdr|env|gltf|wasm)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 8192,
                        },
                    },
                ],
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ],
    },
    mode: "development",
    devtool:"inline-source-map",
    optimization: {
        runtimeChunk: 'single',
    },
}