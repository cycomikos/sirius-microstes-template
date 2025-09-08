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