module.exports = {
    mode : 'development',
    entry : __dirname + '/index.js',
    output : {
        path : __dirname + '/debug',
        filename : 'index.bundle.js',
        publicPath : '/debug/'
    },
    module : {
        rules : [
            { test : /\.js$/, loader : 'babel-loader' }
        ]
    }
};
