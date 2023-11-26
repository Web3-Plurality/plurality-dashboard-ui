const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        'stream': require.resolve('stream-browserify'),
        'buffer': require.resolve('buffer/'),
        'util': require.resolve('util/'),
        'assert': require.resolve('assert/'),
        'http': require.resolve('stream-http/'),
        'url': require.resolve('url/'),
        'https': require.resolve('https-browserify/'),
        'os': require.resolve('os-browserify/'),
        'crypto': require.resolve("crypto-browserify"),
        'path': require.resolve("path-browserify")
    })
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    config.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // disable the behavior
        },
      });
    return config;
}