const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
    // 配置入口
    entry: {
        '/css/index':__dirname +'/src/css.js'
    },
    // 编译后的文件路径
    output: {

        path: __dirname +'/src', // 文件路径
        filename: '[name].js' // 文件名称
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: extractSass.extract({
                use: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                // use style-loader in development
                fallback: "style-loader"
            })
        }]
    },
    // 辅助的插件
    plugins:[
        new BrowserSyncPlugin({
            host:'localhost', // 实时监听，webpack -w 可以实时更新硬盘中的文件js，css
            port:8000,
            file:'',
            server:{
                baseDir: __dirname +'/src'
            }
        }),
        extractSass
    ]
};