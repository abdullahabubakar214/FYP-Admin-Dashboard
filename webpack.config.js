// Example of a Webpack config file
module.exports = {
    // other configurations...
    devServer: {
      // Replace these deprecated options
      setupMiddlewares: (middlewares, devServer) => {
        // Your custom middleware logic here
        
        // Return the middlewares
        return middlewares;
      },
    },
  };
  