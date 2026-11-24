const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

// Development plugin loader for standalone builds (README.md, "Loading a plugin from
// a folder"). A plugin folder's imports of React, React Native and the contract
// resolve to this app's copies, so that no second React loads.
const devPluginFolders = (process.env.BBB_SDK_DEV_PLUGINS || '')
  .split(path.delimiter)
  .filter(Boolean)
  .map((folder) => path.resolve(folder));

if (devPluginFolders.length) {
  const placeholder = path.join(__dirname, 'src/plugins/dev-plugins.js');
  const generated = path.join(__dirname, 'node_modules/.cache/bbb-sdk/dev-plugins.js');
  const imports = devPluginFolders.map(
    (folder, i) => `import plugin${i} from ${JSON.stringify(folder)};`,
  );
  const list = devPluginFolders.map((_, i) => `plugin${i}`).join(', ');
  fs.mkdirSync(path.dirname(generated), { recursive: true });
  fs.writeFileSync(generated, `${imports.join('\n')}\nexport default [${list}];\n`);

  const shared = /^(react|react-native|@mconf\/bbb-mobile-plugin-api)(\/|$)/;
  const inDevPlugin = (file) => devPluginFolders.some(
    (folder) => file.startsWith(folder + path.sep),
  );
  const appEntry = path.join(__dirname, 'index.js');
  const upstream = config.resolver.resolveRequest;

  config.watchFolders = [...config.watchFolders, ...devPluginFolders];
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const resolve = upstream || context.resolveRequest;
    if (shared.test(moduleName) && inDevPlugin(context.originModulePath)) {
      return resolve({ ...context, originModulePath: appEntry }, moduleName, platform);
    }
    const result = resolve(context, moduleName, platform);
    if (result.type === 'sourceFile' && result.filePath === placeholder) {
      return { type: 'sourceFile', filePath: generated };
    }
    return result;
  };
  // eslint-disable-next-line no-console
  console.log(`Development plugins: ${devPluginFolders.join(', ')}`);
}

module.exports = config;
