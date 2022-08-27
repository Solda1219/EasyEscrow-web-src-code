const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */
mix.setPublicPath("public_html/");
mix.webpackConfig({
    devtool: "inline-source-map",
    resolve: {
        fallback: {
            // fs: false,
            // tls: false,
            // net: false,
            // http: require.resolve("stream-http"),
            // https: false,
            // zlib: require.resolve("browserify-zlib"),
            // path: require.resolve("path-browserify"),
            // stream: require.resolve("stream-browserify"),
            // util: require.resolve("util/"),
            crypto: require.resolve("crypto-browserify"),
        },
    },
});
mix.js("resources/js/app.js", "public_html/js")
    .react()
    .sass("resources/sass/app.scss", "public_html/css")
    .sourceMaps();

mix.options({
    terser: {
        extractComments: false,
    },
});
