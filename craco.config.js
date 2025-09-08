const path = require('path');

// Suppress specific deprecation warnings from webpack dev server
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --no-deprecation';

module.exports = {
  devServer: (devServerConfig, { env, paths }) => {
    // Override the deprecated options with new equivalents
    
    // Remove deprecated options if they exist
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;
    delete devServerConfig.https;
    
    // Use the new 'setupMiddlewares' instead of deprecated middleware options
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      
      // Add any custom middleware if needed
      return middlewares;
    };
    
    // Use the new 'server' option instead of deprecated 'https'
    devServerConfig.server = {
      type: 'https', // Change to 'https' if you need SSL
    };
    
    // Proxy configuration to handle CORS and authentication
    devServerConfig.proxy = {
      '/arcgis': {
        target: 'https://publicgis.petronas.com',
        changeOrigin: true,
        secure: false, // Disable SSL verification for development
        pathRewrite: {
          '^/arcgis': '/arcgis'
        },
        onProxyReq: function(proxyReq, req, res) {
          console.log('Proxying ArcGIS request to:', proxyReq.path);
        },
        onError: function(err, req, res) {
          console.error('ArcGIS Proxy error:', err);
        }
      },
      '/gisserver': {
        target: 'https://publicgis.petronas.com',
        changeOrigin: true,
        secure: false, // Disable SSL verification for development
        pathRewrite: {
          '^/gisserver': '/gisserver'
        },
        onProxyReq: function(proxyReq, req, res) {
          console.log('Proxying GIS Server request to:', proxyReq.path);
        },
        onError: function(err, req, res) {
          console.error('GIS Server Proxy error:', err);
        }
      }
    };

    // Other dev server options
    devServerConfig.port = process.env.PORT || 3000;
    devServerConfig.host = 'template.local'; // Use template.local domain
    devServerConfig.hot = true;
    devServerConfig.liveReload = true;
    
    return devServerConfig;
  },
  
  // Override webpack configuration if needed
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'development') {
        // Suppress deprecation warnings at the webpack level
        webpackConfig.ignoreWarnings = [
          /deprecated/i,
          /DEP_WEBPACK_DEV_SERVER/,
        ];
      }
      
      return webpackConfig;
    },
  },
};