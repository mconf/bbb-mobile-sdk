// The plugins a standalone development build loads: none. When BBB_SDK_DEV_PLUGINS
// names plugin folders, metro.config.js resolves this module to a generated one that
// imports them. Host apps run their own Metro, so they always get this empty list.
export default [];
