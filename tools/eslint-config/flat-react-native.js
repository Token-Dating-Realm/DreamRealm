const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  { ignores: ["node_modules/**", "dist/**", ".expo/**"] },
  ...compat.config(require("./react-native")).map((config) => ({ files: ["**/*.ts", "**/*.tsx"], ...config })),
];
