//const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require("@craco/craco");
const { addBeforeLoader, loaderByName } = require("@craco/craco");

// module.exports = {
//   module: {
//     rules: [
//       {
//         test: /zcv\.wasm$/,
//         type: "javascript/auto",
//         loader: "file-loade"
//       }
//     ]
//   }
// };

module.exports = {
  webpack: {
    configure: webpackConfig => {
      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push(".wasm");

      webpackConfig.module.rules.forEach(rule => {
        (rule.oneOf || []).forEach(oneOf => {
          if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });

      const wasmLoader = {
        test: /zcv\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader"
      };

      addBeforeLoader(webpackConfig, loaderByName("file-loader"), wasmLoader);

      return webpackConfig;
    }
  }
};

// module.exports = {
//
//   module.exports = function override(config, env) {
//   /**
//    * Add WASM support
//    */
//
//   // Make file-loader ignore WASM files
//
//   const wasmRule = {
//     test: /zcv\.wasm$/,
//     type: "javascript/auto",
//     loader: "file-loader"
//   };
//   config.module.rules.push(wasmRule);
//   // config.module.experiments = {
//   //   asyncWebAssembly: true,
//   //   buildHttp: true,
//   //   layers: true,
//   //   lazyCompilation: true,
//   //   outputModule: true,
//   //   syncWebAssembly: true,
//   //   topLevelAwait: true
//   // };
//
//   //config.module.push(experiments);
//   //  const wasmExtensionRegExp = /\.wasm$/;
//   //  config.resolve.extensions.push(".wasm");
//   // config.module.rules.forEach(rule => {
//   //   (rule.oneOf || []).forEach(oneOf => {
//   //     if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
//   //       oneOf.exclude.push(wasmExtensionRegExp);
//   //     }
//   //   });
//   // });
//   //
//   // // Add a dedicated loader for WASM
//   // config.module.rules.push({
//   //   test: wasmExtensionRegExp,
//   //   include: path.resolve(__dirname, "src"),
//   //   use: [{ loader: require.resolve("wasm-loader"), options: {} }]
//   // });
//
//   return config;
// };
