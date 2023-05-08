/** @type { import('@storybook/nextjs').StorybookConfig } */

const path = require("path");

module.exports = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "storybook-dark-mode",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      "~scss-ui-kit": path.resolve(__dirname, "../src/scss/index.scss"),
    };
    return config;
  },
};
