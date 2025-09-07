const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Resolve multiple Lit versions issue by ensuring all packages use the same version
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'lit': path.resolve(__dirname, 'node_modules/lit/index.js'),
        '@lit/reactive-element': path.resolve(__dirname, 'node_modules/@lit/reactive-element/reactive-element.js'),
        'lit-element': path.resolve(__dirname, 'node_modules/lit-element/index.js'),
        'lit-html': path.resolve(__dirname, 'node_modules/lit-html/lit-html.js'),
        'lit/decorators.js': path.resolve(__dirname, 'node_modules/lit/decorators.js'),
        'lit/decorators': path.resolve(__dirname, 'node_modules/lit/decorators.js'),
        'lit/directives/class-map.js': path.resolve(__dirname, 'node_modules/lit/directives/class-map.js'),
        'lit/directives/style-map.js': path.resolve(__dirname, 'node_modules/lit/directives/style-map.js'),
        'lit-html/directives/class-map.js': path.resolve(__dirname, 'node_modules/lit/directives/class-map.js'),
        'lit-html/directives/style-map.js': path.resolve(__dirname, 'node_modules/lit/directives/style-map.js'),
        'lit-html/directives/ref.js': path.resolve(__dirname, 'node_modules/lit/directives/ref.js'),
        'lit-html/directives/keyed.js': path.resolve(__dirname, 'node_modules/lit/directives/keyed.js'),
        'lit-html/directives/live.js': path.resolve(__dirname, 'node_modules/lit/directives/live.js'),
        'lit-html/directive.js': path.resolve(__dirname, 'node_modules/lit/directive.js'),
        'lit-html/static.js': path.resolve(__dirname, 'node_modules/lit-html/static.js'),
        'lit-html/is-server.js': path.resolve(__dirname, 'node_modules/lit-html/is-server.js'),
        '@lit/reactive-element/decorators/state.js': path.resolve(__dirname, 'node_modules/lit/decorators/state.js'),
        '@lit/reactive-element/decorators/property.js': path.resolve(__dirname, 'node_modules/lit/decorators/property.js'),
        '@lit/reactive-element/css-tag.js': path.resolve(__dirname, 'node_modules/@lit/reactive-element/css-tag.js')
      };

      return webpackConfig;
    }
  }
};